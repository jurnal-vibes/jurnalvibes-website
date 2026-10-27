import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword } from '@/lib/auth'
import { z } from 'zod'

const RegisterCitizenSchema = z.object({
  action: z.literal('register'),
  email: z.string().email('Format email tidak valid').trim().toLowerCase(),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').trim(),
  phone: z.string().min(8, 'Nomor HP minimal 8 digit').trim(),
  domisili: z.string().optional(),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})

const LoginCitizenSchema = z.object({
  action: z.literal('login'),
  email: z.string().email('Format email tidak valid').trim().toLowerCase(),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

function parseDomisili(domisiliStr: string | null | undefined) {
  if (!domisiliStr || typeof domisiliStr !== 'string') {
    return { detailAlamat: '', rtRw: '', kelurahan: '', kecamatan: '' }
  }

  const raw = domisiliStr.trim()
  const kecMatch = raw.match(/Kec\.?\s*([^,]+)/i)
  const kelMatch = raw.match(/Kel\.?\s*([^,]+)/i)
  const rtRwMatch = raw.match(/RT\/?RW\s*([^,]+)/i)

  const kecamatan = kecMatch ? kecMatch[1].trim() : ''
  const kelurahan = kelMatch ? kelMatch[1].trim() : ''
  const rtRw = rtRwMatch ? rtRwMatch[1].trim() : ''

  let detailAlamat = raw
  const splitIdx = raw.search(/,\s*RT\/?RW/i)
  if (splitIdx !== -1) {
    detailAlamat = raw.substring(0, splitIdx).trim()
  } else {
    const splitKel = raw.search(/,\s*Kel\.?/i)
    if (splitKel !== -1) {
      detailAlamat = raw.substring(0, splitKel).trim()
    } else {
      const splitKec = raw.search(/,\s*Kec\.?/i)
      if (splitKec !== -1) {
        detailAlamat = raw.substring(0, splitKec).trim()
      }
    }
  }

  return { detailAlamat, rtRw, kelurahan, kecamatan }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || 'login'

    // 0. Cek Ketersediaan Email Sebelum OTP
    if (action === 'check-email') {
      const email = (body.email || '').trim().toLowerCase()
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Format email tidak valid.' }, { status: 400 })
      }
      const existing = await prisma.citizenUser.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Alamat email ini sudah terdaftar. Silakan langsung masuk (login).' },
          { status: 409 }
        )
      }
      return NextResponse.json({ success: true, message: 'Email tersedia.' })
    }

    // 1. Alur Pendaftaran Warga Baru
    if (action === 'register') {
      const parsed = RegisterCitizenSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0]?.message || 'Data pendaftaran tidak valid' },
          { status: 400 }
        )
      }

      const { email, fullName, phone, domisili, password } = parsed.data

      // Periksa apakah email sudah terdaftar
      const existing = await prisma.citizenUser.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Alamat email ini sudah terdaftar. Silakan masuk.' },
          { status: 409 }
        )
      }

      // Enkripsi password menggunakan bcrypt
      const hashedPassword = await hashPassword(password)

      const user = await prisma.citizenUser.create({
        data: {
          email,
          fullName,
          phone,
          domisili: domisili || 'Sukabumi',
          password: hashedPassword,
          isVerified: true,
        },
      })

      const parsedDom = parseDomisili(user.domisili)

      return NextResponse.json(
        {
          success: true,
          message: 'Pendaftaran berhasil!',
          user: {
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            name: user.fullName,
            phone: user.phone,
            phone_number: user.phone,
            kecamatan: parsedDom.kecamatan,
            kelurahan: parsedDom.kelurahan,
            rt_rw: parsedDom.rtRw,
            detail_alamat: parsedDom.detailAlamat,
            alamat_domisili: user.domisili,
            domisili: user.domisili,
            role: 'warga',
            is_verified: true,
          },
        },
        { status: 201 }
      )
    }

    // 2. Alur Masuk / Login Warga (REAL DB AUTH ONLY, NO DEMO FALLBACK)
    if (action === 'login') {
      const parsed = LoginCitizenSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0]?.message || 'Data login tidak valid' },
          { status: 400 }
        )
      }

      const { email, password } = parsed.data

      // Cari di tabel citizen_users
      const user = await prisma.citizenUser.findUnique({ where: { email } })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'Alamat email belum terdaftar di sistem. Silakan lakukan pendaftaran akun terlebih dahulu.',
          },
          { status: 404 }
        )
      }

      // Jika ada password tersimpan, verifikasi dengan bcrypt secara ketat
      if (user.password) {
        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
          return NextResponse.json(
            { success: false, message: 'Kata sandi yang Anda masukkan salah.' },
            { status: 401 }
          )
        }
      } else {
        return NextResponse.json(
          { success: false, message: 'Kata sandi belum disetel untuk akun ini. Silakan buat akun baru.' },
          { status: 401 }
        )
      }

      const parsedDom = parseDomisili(user.domisili)

      return NextResponse.json({
        success: true,
        message: 'Login berhasil!',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          name: user.fullName,
          phone: user.phone,
          phone_number: user.phone,
          kecamatan: parsedDom.kecamatan,
          kelurahan: parsedDom.kelurahan,
          rt_rw: parsedDom.rtRw,
          detail_alamat: parsedDom.detailAlamat,
          alamat_domisili: user.domisili,
          domisili: user.domisili,
          role: 'warga',
          is_verified: user.isVerified,
        },
      })
    }

    // 3. Perbarui Profil Warga
    if (action === 'update-profile') {
      const { email, fullName, phone, domisili } = body
      if (!email) {
        return NextResponse.json({ success: false, message: 'Alamat email diperlukan' }, { status: 400 })
      }

      try {
        const updatedUser = await prisma.citizenUser.update({
          where: { email },
          data: {
            ...(fullName ? { fullName: String(fullName).trim() } : {}),
            ...(phone ? { phone: String(phone).trim() } : {}),
            ...(domisili ? { domisili: String(domisili).trim() } : {}),
          },
        })

        const parsedDom = parseDomisili(updatedUser.domisili)

        return NextResponse.json({
          success: true,
          message: 'Profil berhasil diperbarui di database!',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            full_name: updatedUser.fullName,
            name: updatedUser.fullName,
            phone: updatedUser.phone,
            phone_number: updatedUser.phone,
            kecamatan: parsedDom.kecamatan,
            kelurahan: parsedDom.kelurahan,
            rt_rw: parsedDom.rtRw,
            detail_alamat: parsedDom.detailAlamat,
            alamat_domisili: updatedUser.domisili,
            domisili: updatedUser.domisili,
            role: 'warga',
            is_verified: updatedUser.isVerified,
          },
        })
      } catch (err: any) {
        return NextResponse.json(
          { success: false, message: 'Gagal memperbarui profil: ' + (err?.message || 'Error') },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenali' }, { status: 400 })
  } catch (error: any) {
    console.error('API Citizen Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem: ' + (error?.message || 'Error') },
      { status: 500 }
    )
  }
}
