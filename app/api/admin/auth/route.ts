import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  ADMIN_COOKIE_NAME,
  signAdminToken,
  getAdminSession,
  comparePassword,
} from '@/lib/auth'
import { z } from 'zod'

// Skema validasi input form login admin
const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid').trim().toLowerCase(),
  password: z.string().min(1, 'Kata sandi wajib diisi').trim(),
})

// 1. POST: Login Admin & Terbitkan HTTP-Only Cookie JWT
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    const parseResult = LoginSchema.safeParse(rawBody)

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Input tidak valid'
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
    }

    const { email, password } = parseResult.data

    // 1. Verifikasi kredensial master redaksi
    const isMasterAdmin =
      (email === 'admin@jurnalwave.com' || email === 'redaksi@jurnalwave.com') &&
      (password === 'admin123' || password === 'jurnalwave2026')

    // 2. Verifikasi staf admin di tabel PostgreSQL (Neon DB)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbUser: any = null
    try {
      dbUser = await prisma.adminUser.findUnique({
        where: { email },
      })
    } catch (err) {
      console.warn('Neon DB admin lookup notice:', err)
    }

    let isValid = isMasterAdmin
    if (!isValid && dbUser) {
      // Jika di DB ada kolom password terenkripsi atau verifikasi fallback
      isValid = password === 'admin123' || password === 'jurnalwave2026'
    }

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kombinasi email atau kata sandi admin salah. Silakan coba kembali.',
        },
        { status: 401 }
      )
    }

    const userPayload = {
      id: dbUser?.id || 'admin-master',
      name: dbUser?.name || 'Super Admin Jurnal Wave',
      email: dbUser?.email || email,
      role: dbUser?.role || 'superadmin',
    }

    // Buat JWT Token aman berumur 7 hari
    const token = await signAdminToken(userPayload)

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil! Mengalihkan ke Dashboard Admin...',
      user: userPayload,
    })

    // Set HTTP-Only Cookie (tidak bisa dicuri oleh JavaScript/Inspect Element)
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    return response
  } catch (error: any) {
    console.error('API Admin Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

// 2. GET: Cek Status Sesi Login Berdasarkan Token JWT
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession(request)

    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
        },
      })
    }

    return NextResponse.json({
      authenticated: false,
    })
  } catch {
    return NextResponse.json({
      authenticated: false,
    })
  }
}

// 3. DELETE: Logout / Keluar
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar dari akun admin.',
  })

  // Hapus cookie sesi resmi
  response.cookies.delete(ADMIN_COOKIE_NAME)

  return response
}
