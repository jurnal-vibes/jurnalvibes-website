import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketNumber, email } = body

    if (!ticketNumber || !email) {
      return NextResponse.json(
        { success: false, message: 'Nomor tiket dan identitas akun wajib disertakan.' },
        { status: 400 }
      )
    }

    const cleanTicket = String(ticketNumber).trim()
    const cleanEmail = String(email).toLowerCase().trim()

    // 1. Cek apakah warga ini sudah pernah memberi dukungan pada laporan ini
    const existing = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "id" FROM "report_supports" WHERE "ticketNumber" = $1 AND "citizenEmail" = $2 LIMIT 1`,
      cleanTicket,
      cleanEmail
    )

    let isSupported = false

    if (existing && existing.length > 0) {
      // Warga klik lagi -> Batalkan dukungan (Un-vote)
      await prisma.$executeRawUnsafe(
        `DELETE FROM "report_supports" WHERE "ticketNumber" = $1 AND "citizenEmail" = $2`,
        cleanTicket,
        cleanEmail
      )
      isSupported = false
    } else {
      // Warga memberi dukungan baru (1 Akun = 1 Suara)
      const supportId = `sup-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO "report_supports" ("id", "ticketNumber", "citizenEmail", "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT ("ticketNumber", "citizenEmail") DO NOTHING`,
        supportId,
        cleanTicket,
        cleanEmail
      )
      isSupported = true
    }

    // 2. Ambil total dukungan terkini untuk laporan ini
    const countResult = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*)::int as count FROM "report_supports" WHERE "ticketNumber" = $1`,
      cleanTicket
    )
    const totalCount = Number(countResult?.[0]?.count) || 0

    return NextResponse.json({
      success: true,
      ticketNumber: cleanTicket,
      isSupported,
      dukunganCount: totalCount,
      message: isSupported
        ? 'Dukungan berhasil ditambahkan.'
        : 'Dukungan berhasil dibatalkan.',
    })
  } catch (error: any) {
    console.error('API Support POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memproses dukungan.', error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.toLowerCase().trim()
    const ticket = searchParams.get('ticket')?.trim()

    // Ambil semua counts per tiket
    let counts: Record<string, number> = {}
    try {
      const countRows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "ticketNumber", COUNT(*)::int as count FROM "report_supports" GROUP BY "ticketNumber"`
      )
      countRows.forEach((r) => {
        if (r.ticketNumber) {
          counts[r.ticketNumber] = Number(r.count) || 0
        }
      })
    } catch {}

    // Jika email diberikan, ambil daftar tiket yang sudah didukung oleh email ini
    let userSupportedTickets: string[] = []
    if (email) {
      try {
        const supportedRows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT "ticketNumber" FROM "report_supports" WHERE "citizenEmail" = $1`,
          email
        )
        userSupportedTickets = supportedRows.map((r) => r.ticketNumber)
      } catch {}
    }

    if (ticket) {
      return NextResponse.json({
        success: true,
        ticketNumber: ticket,
        count: counts[ticket] || 0,
        isSupported: userSupportedTickets.includes(ticket),
      })
    }

    return NextResponse.json({
      success: true,
      counts,
      supportedTickets: userSupportedTickets,
    })
  } catch (error: any) {
    console.error('API Support GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
