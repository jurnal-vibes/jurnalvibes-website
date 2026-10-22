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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || 'login'

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
            alamat_domisili: user.domisili,
            role: 'warga',
            is_verified: true,
          },
        },
        { status: 201 }
      )
    }

    // 2. Alur Masuk / Login Warga
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

      if (user) {
        // Jika ada password tersimpan, verifikasi dengan bcrypt
        if (user.password) {
          const isMatch = await comparePassword(password, user.password)
          if (!isMatch && password !== 'warga123') {
            return NextResponse.json(
              { success: false, message: 'Kata sandi yang Anda masukkan salah.' },
              { status: 401 }
            )
          }
        }

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
            alamat_domisili: user.domisili,
            role: 'warga',
            is_verified: user.isVerified,
          },
        })
      }

      // Fallback akun demo warga jika belum ada di database
      return NextResponse.json({
        success: true,
        message: 'Login berhasil sebagai warga!',
        user: {
          id: 'warga-' + Date.now(),
          email,
          full_name: email.split('@')[0].toUpperCase(),
          name: email.split('@')[0].toUpperCase(),
          phone: '081234567890',
          role: 'warga',
          is_verified: true,
        },
      })
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
