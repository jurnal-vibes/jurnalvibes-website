import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

// Skema validasi pesan chat obrolan warga & redaksi
const ChatMessageSchema = z.object({
  ticketNumber: z.string().min(1, 'Nomor tiket wajib diisi').trim(),
  message: z.string().min(1, 'Pesan obrolan tidak boleh kosong').max(2000, 'Pesan maksimal 2000 karakter').trim(),
  role: z.enum(['warga', 'admin', 'redaksi']).optional(),
  senderName: z.string().optional(),
  senderId: z.string().optional(),
})

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
      source: 'database',
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

// 2. POST: Kirim pesan chat baru ke database (Warga / Redaksi)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = ChatMessageSchema.safeParse({
      ...body,
      ticketNumber: body.ticketNumber || body.ticket_number,
      senderName: body.senderName || body.sender_name,
      senderId: body.senderId || body.sender_id,
    })

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Data pesan tidak valid'
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
    }

    const { ticketNumber, message } = validation.data
    const requestedRole = validation.data.role || 'warga'

    let role = 'warga'
    let senderName = validation.data.senderName || 'Warga Sukabumi'
    let senderId = validation.data.senderId || 'warga'

    // Jika pesan dikirim atas nama Redaksi / Admin, wajib diverifikasi sesinya
    if (requestedRole === 'admin' || requestedRole === 'redaksi') {
      const session = await getAdminSession(request)
      if (!session) {
        return NextResponse.json(
          {
            success: false,
            message: 'Akses ditolak: Anda harus login sebagai admin untuk mengirim pesan atas nama redaksi.',
          },
          { status: 401 }
        )
      }
      role = 'redaksi'
      senderName = session.name || 'Tim Redaksi Halo Jurnal'
      senderId = session.id || 'admin'
    }

    const created = await prisma.chatMessage.create({
      data: {
        ticketNumber,
        senderId,
        senderName,
        role,
        message,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Pesan berhasil dikirim!',
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
