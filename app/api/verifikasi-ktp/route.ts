import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1. GET: Ambil daftar verifikasi KTP dari MySQL
export async function GET() {
  try {
    const list = await prisma.ktpVerification.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      source: 'mysql',
      data: list.map((item) => ({
        id: item.id,
        nik: item.nik,
        name: item.name,
        resident_name: item.name,
        phone: item.phone,
        email: item.email,
        ktp_url: item.photoUrl,
        ktp_image_url: item.photoUrl,
        ai_detected_name: item.detectedName || item.name,
        ai_detected_nik: item.detectedNik || item.nik,
        ai_confidence: item.aiConfidence,
        ai_notes: item.aiNotes,
        status: item.status,
        created_at: item.createdAt.toISOString(),
        submitted_at: item.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('API Verifikasi KTP GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil verifikasi KTP: ' + error.message },
      { status: 500 }
    )
  }
}

// 2. PUT: Update status verifikasi KTP (verified / rejected)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID dan status wajib disertakan' },
        { status: 400 }
      )
    }

    const updated = await prisma.ktpVerification.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      message: `Status verifikasi KTP berhasil diperbarui ke ${status}!`,
      data: updated,
    })
  } catch (error: any) {
    console.error('API Verifikasi KTP PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui verifikasi KTP: ' + error.message },
      { status: 500 }
    )
  }
}
