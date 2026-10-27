import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// 1. GET: Ambil daftar seluruh warga terdaftar beserta jumlah laporannya
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase().trim() || ''

    // Ambil semua akun warga terdaftar
    const citizens = await prisma.citizenUser.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Ambil ringkasan laporan untuk menghitung total laporan per warga
    const allReports = await prisma.report.findMany({
      select: {
        id: true,
        pelaporEmail: true,
        pelaporPhone: true,
        ticketNumber: true,
      },
    })

    // Map laporan berdasarkan email dan nomor WA yang dibersihkan
    const reportsByEmail = new Map<string, number>()
    const reportsByPhone = new Map<string, number>()

    allReports.forEach((r) => {
      if (r.pelaporEmail) {
        const em = r.pelaporEmail.toLowerCase().trim()
        reportsByEmail.set(em, (reportsByEmail.get(em) || 0) + 1)
      }
      if (r.pelaporPhone) {
        const ph = r.pelaporPhone.replace(/[^0-9]/g, '')
        if (ph) {
          reportsByPhone.set(ph, (reportsByPhone.get(ph) || 0) + 1)
        }
      }
    })

    // Gabungkan data
    let mapped = citizens.map((c) => {
      const emailKey = (c.email || '').toLowerCase().trim()
      const phoneKey = (c.phone || '').replace(/[^0-9]/g, '')

      const countFromEmail = reportsByEmail.get(emailKey) || 0
      const countFromPhone = phoneKey ? reportsByPhone.get(phoneKey) || 0 : 0
      const totalReports = Math.max(countFromEmail, countFromPhone)

      return {
        id: c.id,
        email: c.email,
        fullName: c.fullName || 'Warga Sukabumi',
        phone: c.phone || '-',
        domisili: c.domisili || 'Sukabumi',
        isVerified: c.isVerified,
        createdAt: c.createdAt.toISOString(),
        totalReports,
      }
    })

    // Filter pencarian
    if (search) {
      mapped = mapped.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          c.domisili.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({
      success: true,
      data: mapped,
      total: mapped.length,
    })
  } catch (error) {
    console.error('Error fetching citizens for admin:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data warga terdaftar' },
      { status: 500 }
    )
  }
}

// 2. PUT: Kendali Akun Warga oleh Admin (Reset Password, Ubah Status, Edit Data)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { citizenId, action } = body

    if (!citizenId) {
      return NextResponse.json(
        { success: false, message: 'ID akun warga wajib disertakan' },
        { status: 400 }
      )
    }

    const citizen = await prisma.citizenUser.findUnique({
      where: { id: citizenId },
    })

    if (!citizen) {
      return NextResponse.json(
        { success: false, message: 'Akun warga tidak ditemukan' },
        { status: 404 }
      )
    }

    // A. Reset Kata Sandi Baru
    if (action === 'reset_password') {
      const newPassword = body.newPassword?.trim()
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi baru minimal 6 karakter' },
          { status: 400 }
        )
      }

      const hashedPassword = await hashPassword(newPassword)
      await prisma.citizenUser.update({
        where: { id: citizenId },
        data: { password: hashedPassword },
      })

      return NextResponse.json({
        success: true,
        message: `Kata sandi untuk ${citizen.fullName} berhasil diperbarui.`,
      })
    }

    // B. Ubah Status Verifikasi / Blokir
    if (action === 'toggle_status') {
      const updated = await prisma.citizenUser.update({
        where: { id: citizenId },
        data: { isVerified: !citizen.isVerified },
      })

      return NextResponse.json({
        success: true,
        message: `Status akun warga berhasil diubah menjadi ${updated.isVerified ? 'Aktif' : 'Ditangguhkan'}.`,
        isVerified: updated.isVerified,
      })
    }

    // C. Edit Informasi Kontak Warga
    if (action === 'update_info') {
      const { fullName, phone, domisili } = body
      await prisma.citizenUser.update({
        where: { id: citizenId },
        data: {
          fullName: fullName?.trim() || citizen.fullName,
          phone: phone?.trim() || citizen.phone,
          domisili: domisili?.trim() || citizen.domisili,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Data profil warga berhasil diperbarui oleh admin.',
      })
    }

    return NextResponse.json(
      { success: false, message: 'Aksi kendali tidak dikenali' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating citizen by admin:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui data akun warga' },
      { status: 500 }
    )
  }
}

// 3. DELETE: Hapus akun warga jika diperlukan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citizenId = searchParams.get('id')

    if (!citizenId) {
      return NextResponse.json(
        { success: false, message: 'ID akun warga wajib disertakan' },
        { status: 400 }
      )
    }

    await prisma.citizenUser.delete({
      where: { id: citizenId },
    })

    return NextResponse.json({
      success: true,
      message: 'Akun warga berhasil dihapus dari sistem.',
    })
  } catch (error) {
    console.error('Error deleting citizen by admin:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus akun warga' },
      { status: 500 }
    )
  }
}
