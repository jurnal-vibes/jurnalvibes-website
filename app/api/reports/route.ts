import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DUMMY_REPORTS } from '@/data/dummyReports'

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

// 1. GET: Ambil semua laporan warga dari MySQL
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
      where.ticketNumber = ticket
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

    if (dbReports.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'mysql',
        data: dbReports.map(mapReportFromDb),
      })
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: DUMMY_REPORTS,
    })
  } catch (error: any) {
    console.error('API Reports GET error:', error)
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: DUMMY_REPORTS,
      warning: 'Menggunakan data cadangan: ' + error.message,
    })
  }
}

// 2. POST: Kirim pengaduan baru warga ke MySQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const title = body.title || body.judul
    const description = body.description || body.deskripsi

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Judul laporan wajib diisi' }, { status: 400 })
    }

    // Nomor tiket unik
    const ticketNumber =
      body.ticketNumber ||
      body.ticket_number ||
      body.nomor_tiket ||
      `TKT-SKB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Lampiran foto jika ada
    const attachmentUrls: string[] = []
    if (body.previewUrl) attachmentUrls.push(body.previewUrl)
    if (body.imageUrl) attachmentUrls.push(body.imageUrl)
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
        title: title.trim(),
        description: description?.trim() || title.trim(),
        reportType: body.reportType || body.jenis || body.kategori || 'infrastruktur',
        address: body.address || body.lokasi || 'Sukabumi',
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        pelaporName: body.pelaporName || body.nama_pelapor || body.citizenName || body.nama || 'Warga Sukabumi',
        pelaporPhone: body.pelaporPhone || body.citizenPhone || body.telepon || null,
        pelaporEmail: body.pelaporEmail || body.citizenEmail || body.email || null,
        status: 'diterima',
        isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
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
              note: 'Laporan baru diterima oleh sistem Halo Jurnal',
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
        message: 'Laporan berhasil disimpan ke database MySQL XAMPP!',
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

// 3. PUT: Update status laporan warga di MySQL (Diterima -> Diproses -> Selesai / Ditolak)
export async function PUT(request: NextRequest) {
  try {
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
