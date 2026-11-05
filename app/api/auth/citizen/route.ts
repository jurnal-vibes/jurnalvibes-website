import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword } from '@/lib/auth'
import { sendRegisterOtp } from '@/lib/mail'

// In-Memory store untuk ketahanan OTP pendaftaran warga
declare global {
  // eslint-disable-next-line no-var
  var __haloJurnalRegisterOtpStore: Map<string, { otp: string; expiresAt: number }> | undefined
}

if (!globalThis.__haloJurnalRegisterOtpStore) {
  globalThis.__haloJurnalRegisterOtpStore = new Map()
}

const registerOtpStore = globalThis.__haloJurnalRegisterOtpStore

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

    // 0. Cek Ketersediaan Nomor HP / Email Sebelum Pendaftaran
    if (action === 'check-phone' || action === 'check-email') {
      const phone = (body.phone || '').trim().replace(/[^0-9]/g, '')
      const email = (body.email || '').trim().toLowerCase()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orConditions: any[] = []
      if (phone) {
        orConditions.push({ phone })
        orConditions.push({ email: `${phone}@warga.jurnalwave.id` })
      }
      if (email && email.includes('@')) {
        orConditions.push({ email })
      }

      if (orConditions.length === 0) {
        return NextResponse.json({ success: false, message: 'Nomor HP atau email diperlukan.' }, { status: 400 })
      }

      const existing = await prisma.citizenUser.findFirst({
        where: { OR: orConditions },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Nomor HP / akun ini sudah terdaftar. Silakan langsung masuk (login).' },
          { status: 409 }
        )
      }
      return NextResponse.json({ success: true, message: 'Nomor HP / email tersedia.' })
    }

    // 0.5. Alur Masuk / Registrasi Cepat Akun Google
    if (action === 'google-auth') {
      const email = (body.email || '').trim().toLowerCase()
      const fullName = (body.fullName || body.name || email.split('@')[0] || 'Warga Sukabumi').trim()

      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Alamat email Google tidak valid.' }, { status: 400 })
      }

      let user = await prisma.citizenUser.findUnique({ where: { email } })

      if (!user) {
        user = await prisma.citizenUser.create({
          data: {
            email,
            fullName,
            phone: body.phone || '',
            domisili: 'Sukabumi',
            password: null, // Akun Google SSO
            isVerified: true,
          },
        })
      }

      const parsedDom = parseDomisili(user.domisili)

      return NextResponse.json({
        success: true,
        message: 'Berhasil terhubung dengan akun Google!',
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

    // 0.8. Permintaan Kirim OTP Verifikasi Pendaftaran ke Email Warga
    if (action === 'request-register-otp') {
      const fullName = (body.fullName || body.name || '').trim()
      const phone = (body.phone || body.phone_number || '').trim()
      const email = (body.email || '').trim().toLowerCase()
      const password = body.password || ''

      if (!fullName || fullName.length < 2) {
        return NextResponse.json({ success: false, message: 'Nama lengkap minimal 2 karakter.' }, { status: 400 })
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 14) {
        return NextResponse.json(
          { success: false, message: 'Format nomor WhatsApp tidak valid. Masukkan 10-14 digit angka (contoh: 081234567890).' },
          { status: 400 }
        )
      }

      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Format alamat email tidak valid.' }, { status: 400 })
      }

      if (!password || password.length < 8) {
        return NextResponse.json({ success: false, message: 'Kata sandi minimal 8 karakter.' }, { status: 400 })
      }

      // Pastikan email atau nomor WhatsApp belum terdaftar
      const existing = await prisma.citizenUser.findFirst({
        where: {
          OR: [
            { email },
            { phone: cleanPhone },
            { phone: phone },
          ],
        },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Nomor WhatsApp atau alamat email ini sudah terdaftar. Silakan langsung masuk (login).' },
          { status: 409 }
        )
      }

      // Generate 6 digit angka OTP acak
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAtMs = Date.now() + 10 * 60 * 1000 // 10 menit
      registerOtpStore.set(email, { otp: otpCode, expiresAt: expiresAtMs })

      // Kirim email OTP resmi
      try {
        await sendRegisterOtp(email, otpCode, fullName)
      } catch (mailErr: any) {
        console.error('Gagal mengirim email OTP pendaftaran:', mailErr)
        return NextResponse.json(
          {
            success: false,
            message: 'Gagal mengirim email kode verifikasi ke ' + email + '. Mohon pastikan alamat email Anda aktif.',
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Kode verifikasi OTP 6 digit berhasil dikirimkan ke kotak masuk email ${email}.`,
      })
    }

    // 0.9. Verifikasi OTP & Finalisasi Pendaftaran Akun Warga
    if (action === 'verify-register-otp') {
      const fullName = (body.fullName || body.name || '').trim()
      const phone = (body.phone || body.phone_number || '').trim()
      const email = (body.email || '').trim().toLowerCase()
      const password = body.password || ''
      const otpCode = (body.otpCode || '').trim()
      const domisili = body.domisili || 'Sukabumi'

      if (!email || !otpCode) {
        return NextResponse.json({ success: false, message: 'Email dan kode OTP verifikasi wajib diisi.' }, { status: 400 })
      }

      // Validasi OTP dari store
      const cached = registerOtpStore.get(email)
      if (!cached || cached.otp !== otpCode || cached.expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Kode OTP salah atau telah kadaluarsa (berlaku 10 menit).' },
          { status: 400 }
        )
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 14) {
        return NextResponse.json(
          { success: false, message: 'Format nomor WhatsApp tidak valid. Masukkan 10-14 digit angka.' },
          { status: 400 }
        )
      }

      if (!password || password.length < 8) {
        return NextResponse.json({ success: false, message: 'Kata sandi minimal 8 karakter.' }, { status: 400 })
      }

      // Pastikan email atau nomor belum dipakai user lain
      const existing = await prisma.citizenUser.findFirst({
        where: {
          OR: [
            { email },
            { phone: cleanPhone },
          ],
        },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Akun dengan email atau nomor WhatsApp ini sudah terdaftar. Silakan login.' },
          { status: 409 }
        )
      }

      // Enkripsi kata sandi
      const hashedPassword = await hashPassword(password)

      const user = await prisma.citizenUser.create({
        data: {
          email,
          fullName,
          phone: cleanPhone,
          domisili,
          password: hashedPassword,
          isVerified: true,
        },
      })

      // Hapus sesi OTP yang berhasil
      registerOtpStore.delete(email)

      const parsedDom = parseDomisili(user.domisili)

      return NextResponse.json(
        {
          success: true,
          message: 'Pendaftaran dan verifikasi akun berhasil!',
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

    // 1. Alur Pendaftaran Warga Langsung (Fallback jika tanpa OTP)
    if (action === 'register') {
      const fullName = (body.fullName || body.name || '').trim()
      const phone = (body.phone || body.phone_number || '').trim()
      const password = body.password || ''
      const domisili = body.domisili || 'Sukabumi'

      if (!fullName || fullName.length < 2) {
        return NextResponse.json({ success: false, message: 'Nama lengkap minimal 2 karakter.' }, { status: 400 })
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 14) {
        return NextResponse.json(
          { success: false, message: 'Format nomor WhatsApp tidak valid. Masukkan 10-14 digit angka (contoh: 081234567890).' },
          { status: 400 }
        )
      }

      if (!password || password.length < 8) {
        return NextResponse.json({ success: false, message: 'Kata sandi minimal 8 karakter.' }, { status: 400 })
      }

      const finalEmail = (body.email && body.email.includes('@'))
        ? body.email.trim().toLowerCase()
        : `${cleanPhone}@warga.jurnalwave.id`

      // Periksa apakah nomor HP atau email sudah terdaftar
      const existing = await prisma.citizenUser.findFirst({
        where: {
          OR: [
            { email: finalEmail },
            { phone: cleanPhone },
            { phone: phone },
          ],
        },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Nomor WhatsApp / akun ini sudah terdaftar. Silakan langsung masuk (login).' },
          { status: 409 }
        )
      }

      // Enkripsi password menggunakan bcrypt
      const hashedPassword = await hashPassword(password)

      const user = await prisma.citizenUser.create({
        data: {
          email: finalEmail,
          fullName,
          phone: cleanPhone,
          domisili,
          password: hashedPassword,
          isVerified: true,
        },
      })

      const parsedDom = parseDomisili(user.domisili)

      return NextResponse.json(
        {
          success: true,
          message: 'Pendaftaran akun berhasil!',
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

    // 2. Alur Masuk / Login Warga (Mendukung Email ATAU Nomor WhatsApp)
    if (action === 'login') {
      const identifier = (body.email || body.phone || body.identifier || '').trim().toLowerCase()
      const password = body.password

      if (!identifier || !password) {
        return NextResponse.json(
          { success: false, message: 'Mohon masukkan email / nomor WhatsApp dan kata sandi Anda.' },
          { status: 400 }
        )
      }

      const cleanPhone = identifier.replace(/[^0-9]/g, '')

      const user = await prisma.citizenUser.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier },
            ...(cleanPhone ? [{ phone: cleanPhone }, { email: `${cleanPhone}@warga.jurnalwave.id` }] : []),
          ],
        },
      })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'Akun belum terdaftar. Silakan lakukan pendaftaran akun terlebih dahulu.',
          },
          { status: 404 }
        )
      }

      // Jika akun dibuat via Google tanpa kata sandi
      if (!user.password) {
        return NextResponse.json(
          { success: false, message: 'Akun ini terdaftar via Akun Google. Silakan masuk menggunakan tombol Akun Google.' },
          { status: 400 }
        )
      }

      const isMatch = await comparePassword(password, user.password)
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi yang Anda masukkan salah.' },
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
        return NextResponse.json({ success: false, message: 'Alamat email atau identitas diperlukan' }, { status: 400 })
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
