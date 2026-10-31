import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { sendResetPasswordOtp } from '@/lib/mail'
import { z } from 'zod'

// In-Memory fallback store untuk ketahanan ganda (resilience)
declare global {
  // eslint-disable-next-line no-var
  var __haloJurnalOtpStore: Map<string, { otp: string; expiresAt: number }> | undefined
}

if (!globalThis.__haloJurnalOtpStore) {
  globalThis.__haloJurnalOtpStore = new Map()
}

const otpStore = globalThis.__haloJurnalOtpStore

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || 'request-otp'

    // ==========================================
    // 1. REQUEST OTP (Kirim OTP ke Gmail Warga)
    // ==========================================
    if (action === 'request-otp') {
      const email = (body.email || '').trim().toLowerCase()
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { success: false, message: 'Format alamat email tidak valid.' },
          { status: 400 }
        )
      }

      // Pastikan email terdaftar di database
      const user = await prisma.citizenUser.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'Alamat email ini belum terdaftar di sistem Hallo Jurnal.',
          },
          { status: 404 }
        )
      }

      // Generate 6 digit angka acak
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAtMs = Date.now() + 10 * 60 * 1000 // 10 menit
      const expiresAtDate = new Date(expiresAtMs)

      // Simpan ke in-memory cache
      otpStore.set(email, { otp: otpCode, expiresAt: expiresAtMs })

      // Simpan ke tabel PostgreSQL
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM password_reset_otps WHERE email = $1`,
          email
        )
        const id = 'otp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
        await prisma.$executeRawUnsafe(
          `INSERT INTO password_reset_otps (id, email, "otpCode", "expiresAt", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
          id,
          email,
          otpCode,
          expiresAtDate
        )
      } catch (dbErr) {
        console.warn('Pemberitahuan simpan OTP ke DB:', dbErr)
      }

      // Kirim email riil via Gmail SMTP
      try {
        await sendResetPasswordOtp(email, otpCode, user.fullName)
      } catch (mailErr: any) {
        console.error('Gagal mengirim email OTP:', mailErr)
        return NextResponse.json(
          {
            success: false,
            message: 'Gagal mengirim email verifikasi ke Gmail Anda. Mohon coba sesaat lagi.',
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Kode OTP 6 digit berhasil dikirimkan ke kotak masuk Gmail Anda.',
      })
    }

    // ==========================================
    // 2. VERIFIKASI KODE OTP
    // ==========================================
    if (action === 'verify-otp') {
      const email = (body.email || '').trim().toLowerCase()
      const otpCode = (body.otpCode || '').trim()

      if (!email || !otpCode) {
        return NextResponse.json(
          { success: false, message: 'Email dan kode OTP wajib diisi.' },
          { status: 400 }
        )
      }

      let isValid = false

      // Cek in-memory store
      const cached = otpStore.get(email)
      if (cached && cached.otp === otpCode && cached.expiresAt > Date.now()) {
        isValid = true
      }

      // Cek database PostgreSQL jika di cache belum valid
      if (!isValid) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: any = await prisma.$queryRawUnsafe(
            `SELECT * FROM password_reset_otps WHERE email = $1 AND "otpCode" = $2 AND "expiresAt" > NOW() LIMIT 1`,
            email,
            otpCode
          )
          if (Array.isArray(rows) && rows.length > 0) {
            isValid = true
          }
        } catch (err) {
          console.warn('DB OTP lookup notice:', err)
        }
      }

      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            message: 'Kode OTP salah atau telah kadaluarsa (melewati 10 menit).',
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Kode OTP valid! Silakan masukkan kata sandi baru Anda.',
      })
    }

    // ==========================================
    // 3. RESET KATA SANDI BARU
    // ==========================================
    if (action === 'reset-password') {
      const email = (body.email || '').trim().toLowerCase()
      const otpCode = (body.otpCode || '').trim()
      const newPassword = body.newPassword || ''

      if (!email || !otpCode || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Seluruh data wajib diisi.' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi baru minimal 6 karakter.' },
          { status: 400 }
        )
      }

      let isValid = false

      // Validasi OTP
      const cached = otpStore.get(email)
      if (cached && cached.otp === otpCode && cached.expiresAt > Date.now()) {
        isValid = true
      }

      if (!isValid) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: any = await prisma.$queryRawUnsafe(
            `SELECT * FROM password_reset_otps WHERE email = $1 AND "otpCode" = $2 AND "expiresAt" > NOW() LIMIT 1`,
            email,
            otpCode
          )
          if (Array.isArray(rows) && rows.length > 0) {
            isValid = true
          }
        } catch (err) {
          console.warn('DB OTP lookup notice:', err)
        }
      }

      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            message: 'Sesi OTP tidak valid atau telah kedaluwarsa. Ulangi proses lupa sandi.',
          },
          { status: 400 }
        )
      }

      // Enkripsi kata sandi baru dengan bcrypt
      const hashedPassword = await hashPassword(newPassword)

      // Update password di tabel citizen_users
      await prisma.citizenUser.update({
        where: { email },
        data: { password: hashedPassword },
      })

      // Hapus OTP yang sudah dipakai
      otpStore.delete(email)
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM password_reset_otps WHERE email = $1`,
          email
        )
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru Anda.',
      })
    }

    return NextResponse.json(
      { success: false, message: 'Aksi tidak dikenali.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('API Reset Password error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem: ' + (error?.message || 'Error') },
      { status: 500 }
    )
  }
}
