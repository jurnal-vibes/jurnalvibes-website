'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Send,
} from 'lucide-react'

export default function DaftarPage() {
  const router = useRouter()

  // Step state: 1 = Form Pendaftaran, 2 = Verifikasi OTP Email, 3 = Sukses
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [kelurahan, setKelurahan] = useState('')
  const [rtRw, setRtRw] = useState('')
  const [detailAlamat, setDetailAlamat] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [otpError, setOtpError] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Handle Submit Form Pendaftaran (Pindah ke Step 2 OTP)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) return setError('Mohon masukkan Nama Lengkap sesuai KTP.')
    if (!phone.trim()) return setError('Mohon masukkan Nomor WhatsApp aktif.')
    if (!email.trim() || !email.includes('@')) return setError('Mohon masukkan Alamat Email aktif yang valid.')
    if (!kecamatan.trim()) return setError('Mohon masukkan Kecamatan domisili.')
    if (!kelurahan.trim()) return setError('Mohon masukkan Kelurahan / Desa domisili.')
    if (!rtRw.trim()) return setError('Mohon masukkan nomor RT / RW.')
    if (!detailAlamat.trim()) return setError('Mohon masukkan detail jalan atau patokan alamat domisili.')
    if (!password || password.length < 8) return setError('Kata sandi minimal 8 karakter.')
    if (password !== confirmPassword) return setError('Konfirmasi kata sandi tidak cocok.')
    if (!agreed) return setError('Anda wajib menyetujui ketentuan layanan dan privasi data.')

    // Format nomor HP (pastikan standar Indonesia)
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 14) {
      return setError('Format nomor WhatsApp tidak valid. Masukkan 10-14 digit angka (contoh: 081234567890).')
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(2)
      setTimer(60)
      setCanResend(false)
      setOtpError('')
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 150)
    }, 500)
  }

  // Handle OTP Input Change (Auto-focus ke kotak berikutnya)
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1)
    const nextOtp = [...otpCode]
    nextOtp[index] = digit
    setOtpCode(nextOtp)
    setOtpError('')

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  // Handle OTP Keydown (Backspace navigation)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return
    setTimer(60)
    setCanResend(false)
    setOtpCode(['', '', '', '', '', ''])
    setOtpError('')
    otpInputRefs.current[0]?.focus()
  }

  // Handle Verify OTP & Finish Registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    const entered = otpCode.join('')

    if (entered.length < 6) {
      return setOtpError('Mohon lengkapi 6 digit kode OTP verifikasi.')
    }

    setLoading(true)
    const fullDomisili = `${detailAlamat.trim()}, RT/RW ${rtRw.trim()}, Kel. ${kelurahan.trim()}, Kec. ${kecamatan.trim()}, Sukabumi`

    // Simpan akun ke database Neon DB via API
    fetch('/api/auth/citizen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        domisili: fullDomisili,
        password,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.warn('Gagal sinkron akun warga ke DB:', err))
      .finally(() => {
        setLoading(false)

        const newUserSession = {
          id: 'warga-' + Date.now(),
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          name: fullName.trim(),
          phone: phone.trim(),
          phone_number: phone.trim(),
          kecamatan: kecamatan.trim(),
          kelurahan: kelurahan.trim(),
          rt_rw: rtRw.trim(),
          detail_alamat: detailAlamat.trim(),
          alamat_domisili: fullDomisili,
          user_metadata: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            alamat_domisili: fullDomisili,
            is_verified: true,
          },
          role: 'warga',
          is_verified: true,
          otp_verified_at: new Date().toISOString(),
        }

        if (typeof window !== 'undefined') {
          try {
            const registeredUsersRaw = localStorage.getItem('halo_jurnal_registered_users')
            const list = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : []
            list.push(newUserSession)
            localStorage.setItem('halo_jurnal_registered_users', JSON.stringify(list))
          } catch {}

          localStorage.setItem('halo_jurnal_current_user', JSON.stringify(newUserSession))
          window.dispatchEvent(new Event('storage'))
        }

        setStep(3)
      })

  }

  return (
    <div className="w-full min-h-screen bg-surface text-on-surface flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10">
      {/* Navigasi Kembali ke Beranda di Atas Card - Selaras dengan Login */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-start">
        <Link
          href="/halo-jurnal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Kartu Utama Berperbandingan Proporsional - Selaras dengan Login */}
      <div className="w-full max-w-5xl bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle Background Glow Khas Halo Jurnal */}
        <div className="absolute -left-12 -top-12 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* SISI KIRI: GAMBAR MASKOT PRESENTER (SELARAS 100% DENGAN HALAMAN MASUK) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center pointer-events-none self-stretch pt-2 pb-4">
            <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] md:min-h-[460px] max-h-[500px] flex flex-col items-center justify-start md:sticky md:top-8">
              {/* Soft glow podium */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-primary/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hallo-jurnal-presenter.webp"
                alt="Hallo Jurnal Presenter"
                className="w-full h-full max-h-[440px] md:max-h-[480px] object-contain object-top drop-shadow-xl select-none transition-transform duration-300"
              />
              {/* Bayangan halus di bawah kaki */}
              <div className="w-24 sm:w-32 h-2.5 bg-black/10 blur-xs rounded-full -mt-1.5 pointer-events-none" />
            </div>
          </div>

          {/* SISI KANAN: KONTEN STEP 1, 2, ATAU 3 */}
          <div className="md:col-span-7 flex flex-col justify-center py-2">
            
            {/* Logo Badge Resmi Halo Jurnal */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/halo-jurnal-icon.webp"
                  alt="Halo Jurnal Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm text-on-surface tracking-tight leading-none">
                  Halo Jurnal
                </span>
                <span className="text-[10px] text-secondary font-medium tracking-tight mt-0.5">
                  Aspirasi &amp; Aduan Sukabumi
                </span>
              </div>
            </div>

            {/* STEP 1: FORMULIR PENDAFTARAN LENGKAP */}
            {step === 1 && (
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-2">
                  Daftar Akun Baru
                </h1>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-4">
                  Sampurasun! Daftarkan identitas Anda untuk menyampaikan aspirasi dan laporan pelayanan publik Sukabumi secara sah dan terpercaya.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Nama Lengkap */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-on-surface">
                        Nama Lengkap <span className="text-primary">*</span>
                      </label>
                      <span className="text-[11px] text-secondary">Wajib sesuai KTP</span>
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Rian Pratama"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* No WhatsApp & Email (2 Kolom) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">
                        No. WhatsApp Aktif <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="081234567890"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">
                        Alamat Email Aktif <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alamat Domisili */}
                  <div className="pt-2 border-t border-outline-variant/50 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Alamat Domisili Saat Ini</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-secondary mb-1">
                          Kecamatan <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={kecamatan}
                          onChange={(e) => setKecamatan(e.target.value)}
                          placeholder="Cisaat"
                          required
                          className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-secondary mb-1">
                          Kelurahan / Desa <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={kelurahan}
                          onChange={(e) => setKelurahan(e.target.value)}
                          placeholder="Cibatu"
                          required
                          className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-secondary mb-1">
                          RT / RW <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={rtRw}
                          onChange={(e) => setRtRw(e.target.value)}
                          placeholder="RT 02 / RW 05"
                          required
                          className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-secondary mb-1">
                        Detail Jalan &amp; Patokan Rumah <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={detailAlamat}
                        onChange={(e) => setDetailAlamat(e.target.value)}
                        placeholder="Contoh: Jl. Raya Cisaat No. 120, seberang Indomaret"
                        required
                        className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Kata Sandi & Konfirmasi (2 Kolom) */}
                  <div className="pt-2 border-t border-outline-variant/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">
                        Kata Sandi <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          required
                          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">
                        Ulangi Kata Sandi <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Ketentuan */}
                  <label className="flex items-start gap-2.5 text-xs text-secondary cursor-pointer pt-1 select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary shrink-0"
                      required
                    />
                    <span>
                      Saya menyatakan data identitas di atas adalah benar dan menyetujui{' '}
                      <Link href="/halo-jurnal/syarat-ketentuan" className="font-semibold text-primary hover:underline">
                        Ketentuan Layanan
                      </Link>{' '}
                      serta perlindungan privasi data Halo Jurnal.
                    </span>
                  </label>

                  {/* Tombol Lanjut ke OTP */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyiapkan Kode OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Lanjut Verifikasi OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-5 text-center sm:text-left">
                  <p className="text-xs text-secondary">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-bold text-primary hover:underline">
                      Masuk Sekarang
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFIKASI KODE OTP EMAIL */}
            {step === 2 && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary mb-3 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-primary" />
                  <span>Ubah Data / Kembali</span>
                </button>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-2">
                  Verifikasi Kode OTP
                </h1>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-2">
                  Kami telah mengirimkan 6 digit kode OTP verifikasi akun warga ke alamat email Anda:
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  {email}
                </div>

                {/* Development Mock Notice */}
                <div className="p-3 mb-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <span className="text-base leading-none">💡</span>
                  <div className="leading-relaxed">
                    <strong>Mode Simulasi Development:</strong> Masukkan kode{' '}
                    <span className="font-mono font-bold tracking-widest bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">
                      123456
                    </span>{' '}
                    untuk verifikasi instan.
                  </div>
                </div>

                {otpError && (
                  <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{otpError}</div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* 6 Box OTP Inputs */}
                  <div className="flex items-center justify-start gap-2 sm:gap-2.5">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 sm:w-12 sm:h-13 text-center font-mono font-bold text-lg sm:text-xl rounded-lg bg-surface-container-low border border-outline-variant/80 focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary text-on-surface focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Countdown & Resend */}
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    {timer > 0 ? (
                      <span>
                        Kirim ulang kode dalam <strong className="font-mono text-primary">{timer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kirim Ulang Kode OTP</span>
                      </button>
                    )}
                  </div>

                  {/* Tombol Verifikasi */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memvalidasi Kode...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verifikasi &amp; Masuk</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: SUKSES REGISTRASI */}
            {step === 3 && (
              <div className="py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-600 tracking-tight mb-2">
                  Pendaftaran Berhasil!
                </h1>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
                  Selamat datang, <strong className="text-on-surface">{fullName}</strong>! Akun warga Anda telah terverifikasi resmi. Anda dapat langsung menyampaikan laporan atau aspirasi warga sekarang.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/halo-jurnal/lapor"
                    className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Mulai Buat Laporan Pengaduan</span>
                  </Link>

                  <Link
                    href="/halo-jurnal/beranda"
                    className="w-full py-3 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-heading font-semibold text-xs sm:text-sm tracking-tight transition-all border border-outline-variant/60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-secondary" />
                    <span>Buka Beranda Warga</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
