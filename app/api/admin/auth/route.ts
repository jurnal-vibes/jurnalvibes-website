import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'admin_session_token'
const SESSION_SECRET = 'jurnalwave_secure_admin_session_2026'

// 1. POST: Login Admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()
    const password = body.password?.trim()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      )
    }

    // Kredensial Master Redaksi Jurnal Wave
    const isMasterAdmin =
      (email === 'admin@jurnalwave.com' ||
        email === 'redaksi@jurnalwave.com') &&
      (password === 'admin123' || password === 'jurnalwave2026')

    // Periksa juga di tabel PostgreSQL admin_users jika ada staf lain
    let dbUser: any = null
    try {
      dbUser = await prisma.adminUser.findUnique({
        where: { email },
      })
    } catch (err) {
      console.warn('PostgreSQL lookup notice:', err)
    }

    // Jika password benar (master) atau user terdaftar di tabel admin_users
    if (isMasterAdmin || (dbUser && password === 'admin123')) {
      const userPayload = {
        id: dbUser?.id || 'admin-master',
        name: dbUser?.name || 'Super Admin Jurnal Wave',
        email: dbUser?.email || email,
        role: dbUser?.role || 'superadmin',
      }

      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil! Mengalihkan ke Dashboard Admin...',
        user: userPayload,
      })

      // Simpan cookie sesi aman (7 hari)
      response.cookies.set({
        name: COOKIE_NAME,
        value: SESSION_SECRET,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 hari
      })

      return response
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Kombinasi email atau kata sandi admin salah. Silakan coba kembali.',
      },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('API Admin Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem: ' + error.message },
      { status: 500 }
    )
  }
}

// 2. GET: Cek Status Sesi Login
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (token === SESSION_SECRET) {
    return NextResponse.json({
      authenticated: true,
      user: {
        name: 'Super Admin Jurnal Wave',
        email: 'admin@jurnalwave.com',
        role: 'superadmin',
      },
    })
  }

  return NextResponse.json({
    authenticated: false,
  })
}

// 3. DELETE: Logout / Keluar
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar dari akun admin.',
  })

  // Hapus cookie sesi
  response.cookies.delete(COOKIE_NAME)

  return response
}
