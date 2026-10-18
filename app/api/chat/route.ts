import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1. GET: Ambil riwayat chat berdasarkan nomor tiket
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketNumber = searchParams.get('ticketNumber')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (ticketNumber) {
      where.ticketNumber = ticketNumber
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      source: 'mysql',
      data: messages.map((m) => ({
        id: m.id,
        ticketNumber: m.ticketNumber,
        sender_id: m.senderId,
        sender_name: m.senderName,
        role: m.role,
        message: m.message,
        created_at: m.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('API Chat GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil chat: ' + error.message },
      { status: 500 }
    )
  }
}

// 2. POST: Kirim pesan chat baru ke MySQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.ticketNumber || !body.message) {
      return NextResponse.json(
        { success: false, message: 'Nomor tiket dan pesan wajib diisi' },
        { status: 400 }
      )
    }

    const created = await prisma.chatMessage.create({
      data: {
        ticketNumber: body.ticketNumber,
        senderId: body.senderId || body.sender_id || 'warga',
        senderName: body.senderName || body.sender_name || 'Warga Sukabumi',
        role: body.role || 'warga',
        message: body.message.trim(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Pesan berhasil disimpan ke database MySQL XAMPP!',
        data: {
          id: created.id,
          ticketNumber: created.ticketNumber,
          sender_id: created.senderId,
          sender_name: created.senderName,
          role: created.role,
          message: created.message,
          created_at: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('API Chat POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim pesan chat: ' + error.message },
      { status: 500 }
    )
  }
}
