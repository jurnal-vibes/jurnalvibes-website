import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

// Skema validasi masukan laporan aduan warga
const ReportInputSchema = z.object({
  title: z.string().min(3, 'Judul laporan minimal 3 karakter').max(200, 'Judul laporan maksimal 200 karakter'),
  description: z.string().optional(),
  reportType: z.string().optional(),
  address: z.string().optional(),
  latitude: z.union([z.number(), z.string(), z.null()]).optional(),
  longitude: z.union([z.number(), z.string(), z.null()]).optional(),
  pelaporName: z.string().optional(),
  pelaporPhone: z.string().optional(),
  pelaporEmail: z.string().optional(),
  ticketNumber: z.string().optional(),
  previewUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  isPublic: z.boolean().optional(),
})

// Helper format laporan dari database ke format kompatibel frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReportFromDb(item: any) {
  return {
    id: item.id,
    nomor_tiket: item.ticketNumber,
    ticket_number: item.ticketNumber,
    ticketNumber: item.ticketNumber,
    judul: item.title,
    title: item.title,
    deskripsi: item.description,
    description: item.description,
    jenis: item.reportType,
    reportType: item.reportType,
    kategori: item.reportType,
    lokasi: item.address || 'Sukabumi',
    address: item.address || 'Sukabumi',
    latitude: item.latitude,
    longitude: item.longitude,
    nama_pelapor: (item as any).pelaporName || (item as any).citizenName || 'Warga Sukabumi',
    pelaporName: (item as any).pelaporName || 'Warga Sukabumi',
    telepon: (item as any).pelaporPhone || (item as any).citizenPhone || '',
    pelaporPhone: (item as any).pelaporPhone || '',
    email: (item as any).pelaporEmail || (item as any).citizenEmail || '',
    status: item.status || 'diterima',
    is_public: Boolean(item.isPublic),
    dukungan_count: 0,
    komentar_count: 0,
    created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    createdAt: item.createdAt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    laporan_lampiran: (item.attachments || []).map((att: any) => ({
      id: att.id,
      file_url: att.fileUrl,
      file_type: att.fileType,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status_log: (item.statusLogs || []).map((log: any) => ({
      id: log.id,
      status: log.status,
      catatan: log.note || `Status diubah menjadi ${log.status}`,
      created_at: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
    })),
  }
}

// 1. GET: Ambil semua laporan warga dari database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const ticket = searchParams.get('ticket')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (status && status !== 'semua') {
      where.status = status
    }
    if (ticket) {
      where.OR = [
        { ticketNumber: ticket },
        { id: ticket },
      ]
    }

    const dbReports = await prisma.report.findMany({
      where,
      include: {
        attachments: true,
        statusLogs: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      source: 'database',
      data: dbReports.map(mapReportFromDb),
    })
  } catch (error: any) {
    console.error('API Reports GET error:', error)
    return NextResponse.json({
      success: false,
      data: [],
      error: error.message,
    }, { status: 500 })
  }
}

// 2. POST: Kirim pengaduan baru warga ke database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Normalisasi input untuk Zod
    const normalizedData = {
      ...body,
      title: (body.title || body.judul || '').trim(),
      description: (body.description || body.deskripsi || '').trim(),
      reportType: body.reportType || body.jenis || body.kategori || 'infrastruktur',
      address: body.address || body.lokasi || 'Sukabumi',
      pelaporName: body.pelaporName || body.nama_pelapor || body.citizenName || body.nama || 'Warga Sukabumi',
      pelaporPhone: body.pelaporPhone || body.citizenPhone || body.telepon || undefined,
      pelaporEmail: body.pelaporEmail || body.citizenEmail || body.email || undefined,
    }

    const validation = ReportInputSchema.safeParse(normalizedData)
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Data laporan tidak valid'
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
    }

    const data = validation.data
    const title = data.title
    const description = data.description || title

    // Nomor tiket unik
    const ticketNumber =
      data.ticketNumber ||
      body.ticket_number ||
      body.nomor_tiket ||
      `TKT-SKB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Lampiran foto jika ada
    const attachmentUrls: string[] = []
    if (data.previewUrl) attachmentUrls.push(data.previewUrl)
    if (data.imageUrl) attachmentUrls.push(data.imageUrl)
    if (Array.isArray(body.attachments)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body.attachments.forEach((a: any) => {
        const url = typeof a === 'string' ? a : a.file_url || a.fileUrl || a.url
        if (url) attachmentUrls.push(url)
      })
    }

    const created = await prisma.report.create({
      data: {
        ticketNumber,
        title,
        description,
        reportType: data.reportType || 'infrastruktur',
        address: data.address || 'Sukabumi',
        latitude: data.latitude ? parseFloat(String(data.latitude)) : null,
        longitude: data.longitude ? parseFloat(String(data.longitude)) : null,
        pelaporName: data.pelaporName || 'Warga Sukabumi',
        pelaporPhone: data.pelaporPhone || null,
        pelaporEmail: data.pelaporEmail || null,
        status: 'diterima',
        isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : false,
        attachments: {
          create: attachmentUrls.map((url) => ({
            fileUrl: url,
            fileType: 'image/jpeg',
          })),
        },
        statusLogs: {
          create: [
            {
              status: 'diterima',
              note: 'Laporan baru diterima oleh sistem Halo Jurnal (Menunggu Review Redaksi)',
            },
          ],
        },
      },
      include: {
        attachments: true,
        statusLogs: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Laporan berhasil disimpan ke database!',
        ticketNumber: created.ticketNumber,
        data: mapReportFromDb(created),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('API Reports POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan laporan: ' + error.message },
      { status: 500 }
    )
  }
}

// 3. PUT: Update status laporan warga (Diterima -> Diproses -> Selesai / Ditolak)
export async function PUT(request: NextRequest) {
  try {
    // Verifikasi hak akses admin sebelum mengubah status laporan
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak: Anda harus login sebagai admin untuk memperbarui laporan warga.',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const id = body.id || body.ticketNumber || body.nomor_tiket

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID atau nomor tiket laporan diperlukan' }, { status: 400 })
    }

    // Cari report berdasarkan ID atau ticketNumber
    const existing = await prisma.report.findFirst({
      where: {
        OR: [{ id: String(id) }, { ticketNumber: String(id) }],
      },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Laporan tidak ditemukan' }, { status: 404 })
    }

    const newStatus = body.status || existing.status
    const note = body.catatan || body.note || `Status laporan diubah menjadi ${newStatus}`

    // Update status report dan tambahkan log riwayat
    const updated = await prisma.report.update({
      where: { id: existing.id },
      data: {
        status: newStatus,
        isPublic: body.is_public !== undefined ? Boolean(body.is_public) : existing.isPublic,
        statusLogs: {
          create: {
            status: newStatus,
            note,
          },
        },
      },
      include: {
        attachments: true,
        statusLogs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Status laporan berhasil diubah menjadi ${newStatus}!`,
      data: mapReportFromDb(updated),
    })
  } catch (error: any) {
    console.error('API Reports PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui laporan: ' + error.message },
      { status: 500 }
    )
  }
}
