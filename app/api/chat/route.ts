import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

// Skema validasi pesan chat obrolan warga & redaksi
const ChatMessageSchema = z.object({
  ticketNumber: z.string().min(1, 'Nomor tiket wajib diisi').trim(),
  message: z.string().min(1, 'Pesan obrolan tidak boleh kosong').max(50000000).trim(),
  role: z.enum(['warga', 'admin', 'redaksi']).optional(),
  senderName: z.string().optional(),
  senderId: z.string().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
})

// Helper ekstraksi lampiran dari string pesan
function parseAttachment(rawMessage: string) {
  const match = rawMessage.match(/\[ATTACHMENT:([\s\S]*?)\|([\s\S]*?)\]$/)
  if (match) {
    const file_url = match[1]
    const file_type = match[2]
    let message = rawMessage.replace(/\[ATTACHMENT:([\s\S]*?)\|([\s\S]*?)\]$/, '').trim()
    if (!message) {
      message = file_type.startsWith('video/') ? '🎥 Mengirim video bukti' : '📷 Mengirim foto bukti'
    }
    return { message, file_url, file_type }
  }
  return { message: rawMessage, file_url: null, file_type: null }
}

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
      data: messages.map((m) => {
        const parsed = parseAttachment(m.message)
        return {
          id: m.id,
          ticketNumber: m.ticketNumber,
          sender_id: m.senderId,
          sender_name: m.senderName,
          role: m.role,
          message: parsed.message,
          raw_message: m.message,
          file_url: parsed.file_url,
          file_type: parsed.file_type,
          created_at: m.createdAt.toISOString(),
        }
      }),
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
      fileUrl: body.fileUrl || body.file_url,
      fileType: body.fileType || body.file_type,
    })

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Data pesan tidak valid'
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
    }

    const { ticketNumber, fileUrl, fileType } = validation.data
    let rawMessage = validation.data.message
    const requestedRole = validation.data.role || 'warga'

    // Jika ada lampiran berkas fisik (foto/video) dan belum tertanam di teks pesan, sematkan token
    if (fileUrl && !rawMessage.includes('[ATTACHMENT:')) {
      const type = fileType || (fileUrl.startsWith('data:video/') ? 'video/mp4' : 'image/jpeg')
      rawMessage = `${rawMessage}\n[ATTACHMENT:${fileUrl}|${type}]`
    }

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
      senderName = session.name || 'Tim Redaksi Hallo Jurnal'
      senderId = session.id || 'admin'
    }

    const created = await prisma.chatMessage.create({
      data: {
        ticketNumber,
        senderId,
        senderName,
        role,
        message: rawMessage,
      },
    })

    const parsed = parseAttachment(created.message)

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
          message: parsed.message,
          raw_message: created.message,
          file_url: parsed.file_url,
          file_type: parsed.file_type,
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
