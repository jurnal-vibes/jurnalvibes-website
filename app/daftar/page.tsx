'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
  Phone,
  Mail,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react'

export default function DaftarPage() {
  const router = useRouter()

  // Step state: 'form' -> 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form')

  // Form State (Nama, No WhatsApp, Email, Kata Sandi, Konfirmasi)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // OTP State
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Countdown timer untuk kirim ulang OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  // Validasi form awal sebelum kirim OTP
  const validateForm = () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Mohon masukkan Nama Lengkap Anda (minimal 2 karakter).')
      return false
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 14) {
      setError('Format nomor WhatsApp tidak valid. Masukkan 10-14 digit angka (contoh: 081234567890).')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Mohon masukkan Alamat Email aktif yang valid.')
      return false
    }
    if (!password || password.length < 8) {
      setError('Kata sandi minimal 8 karakter demi keamanan akun Anda.')
      return false
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.')
      return false
    }
    if (!agreed) {
      setError('Anda wajib menyetujui Ketentuan Layanan & Kebijakan Privasi.')
      return false
    }
    return true
  }

  // Langkah 1: Kirim Permintaan OTP ke Email Warga
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    if (!validateForm()) return

    const cleanPhone = phone.replace(/[^0-9]/g, '')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-register-otp',
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mengirim kode verifikasi OTP. Silakan periksa kembali.')
        return
      }

      setStep('otp')
      setCountdown(60)
      setCanResend(false)
      setOtpCode('')
      setInfoMessage(`Kode OTP 6 digit telah dikirimkan ke kotak masuk ${email.trim().toLowerCase()}`)
    } catch {
      setError('Gagal menghubungi server. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  // Kirim Ulang OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return
    setError('')
    setInfoMessage('')
    setResending(true)

    const cleanPhone = phone.replace(/[^0-9]/g, '')

    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-register-otp',
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mengirim ulang kode OTP.')
        return
      }

      setCountdown(60)
      setCanResend(false)
      setInfoMessage('Kode OTP baru berhasil dikirim ulang ke email Anda.')
    } catch {
      setError('Gagal mengirim ulang kode OTP. Periksa koneksi Anda.')
    } finally {
      setResending(false)
    }
  }

  // Langkah 2: Verifikasi Kode OTP & Selesaikan Registrasi
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    const cleanOtp = otpCode.replace(/[^0-9]/g, '').trim()
    if (cleanOtp.length !== 6) {
      setError('Masukkan 6 digit angka kode verifikasi yang ada di email Anda.')
      return
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-register-otp',
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim().toLowerCase(),
          password,
          otpCode: cleanOtp,
          domisili: 'Sukabumi',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Kode OTP verifikasi tidak valid atau telah kedaluwarsa.')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('halo_jurnal_current_user', JSON.stringify(data.user))
        window.dispatchEvent(new Event('storage'))
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/halo-jurnal/beranda')
        router.refresh()
      }, 1200)
    } catch {
      setError('Gagal memverifikasi pendaftaran. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-surface text-on-surface flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10">
      {/* Navigasi Kembali ke Beranda di Atas Card */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-start">
        <Link
          href="/halo-jurnal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Kartu Utama Berperbandingan Proporsional */}
      <div className="w-full max-w-5xl bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle Background Glow Khas Hallo Jurnal */}
        <div className="absolute -left-12 -top-12 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* SISI KIRI: MASKOT (Proporsional di semua layar) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center pointer-events-none self-stretch">
            <div className="relative w-full flex flex-col items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hallo-jurnal-presenter.webp"
                alt="Hallo Jurnal Presenter"
                className="relative w-1/2 max-w-[160px] md:w-3/4 md:max-w-[240px] object-contain drop-shadow-xl select-none"
              />
              <div className="w-16 md:w-20 h-2 bg-black/8 blur-sm rounded-full -mt-1 pointer-events-none" />
            </div>
          </div>

          {/* SISI KANAN: KONTEN PENDAFTARAN */}
          <div className="md:col-span-7 flex flex-col justify-center py-2">
            
            {/* Logo Badge Resmi Hallo Jurnal */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/halo-jurnal-icon.webp?v=original"
                  alt="Hallo Jurnal Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base text-on-surface tracking-tight leading-none">
                  Hallo Jurnal
                </span>
                <span className="text-[10px] text-secondary font-medium tracking-tight mt-0.5">
                  Aspirasi &amp; Aduan Sukabumi
                </span>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="font-heading font-bold text-xl text-on-surface">Pendaftaran Berhasil!</h2>
                <p className="text-xs text-secondary max-w-sm mx-auto">
                  Akun warga Anda telah aktif dan terverifikasi secara resmi. Mengalihkan Anda langsung ke portal beranda...
                </p>
                <div className="flex justify-center pt-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            ) : step === 'otp' ? (
              /* ========================================================= */
              /* TAMPILAN LANGKAH 2: INPUT KODE VERIFIKASI OTP EMAIL       */
              /* ========================================================= */
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verifikasi Akun Warga</span>
                </div>

                <h1 className="font-heading font-extrabold text-2xl text-on-surface tracking-tight mb-2">
                  Masukkan Kode OTP
                </h1>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-4">
                  Kami telah mengirimkan 6 digit kode verifikasi ke alamat email:
                  <br />
                  <strong className="text-on-surface font-semibold">{email}</strong>
                </p>

                {infoMessage && (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-2">
                      Kode Verifikasi (6 Digit)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-2xl sm:text-3xl font-mono font-bold py-3 px-4 bg-surface-container-low border border-outline-variant/80 rounded-xl text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <p className="text-[11px] text-secondary mt-1.5 text-center">
                      Masa berlaku kode: 10 menit. Cek juga folder Spam/Junk jika belum muncul.
                    </p>
                  </div>

                  {/* Countdown & Kirim Ulang OTP */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-secondary">Tidak menerima email?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                        <span>{resending ? 'Mengirim...' : 'Kirim Ulang Kode'}</span>
                      </button>
                    ) : (
                      <span className="text-secondary font-medium">
                        Kirim ulang dalam <strong className="text-on-surface">{countdown}s</strong>
                      </span>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memverifikasi Akun...</span>
                        </>
                      ) : (
                        <span>Verifikasi &amp; Selesaikan Pendaftaran</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('form')
                        setError('')
                        setInfoMessage('')
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      ← Kembali &amp; Ubah Data / Email
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ========================================================= */
              /* TAMPILAN LANGKAH 1: FORMULIR INPUT DATA WARGA             */
              /* ========================================================= */
              <div className="animate-in fade-in duration-200">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-2">
                  Daftar Akun Baru
                </h1>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-5">
                  Sampurasun! Daftarkan identitas Anda untuk menyampaikan aspirasi dan laporan pelayanan publik Sukabumi secara sah dan terpercaya.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                {/* FORMULIR PENDAFTARAN MANUAL: NAMA, NO HP, EMAIL, PASSWORD, ULANGI PASSWORD */}
                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">
                      Nama Lengkap <span className="text-primary">*</span>
                    </label>
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
                        Nomor WhatsApp Aktif <span className="text-primary">*</span>
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

                  {/* Kata Sandi & Konfirmasi Kata Sandi (2 Kolom) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                          placeholder="Min. 8 karakter"
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

                  {/* Persetujuan Layanan */}
                  <label className="flex items-start gap-2.5 text-xs text-secondary cursor-pointer pt-1 select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary shrink-0"
                      required
                    />
                    <span>
                      Saya menyetujui{' '}
                      <Link href="/halo-jurnal/syarat-ketentuan" className="font-semibold text-primary hover:underline">
                        Ketentuan Layanan
                      </Link>{' '}
                      serta perlindungan privasi data Hallo Jurnal.
                    </span>
                  </label>

                  {/* Tombol Submit Pendaftaran */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim Kode OTP ke Email...</span>
                      </>
                    ) : (
                      <span>Daftar &amp; Kirim Kode OTP</span>
                    )}
                  </button>
                </form>

                {/* Footer Link ke Halaman Masuk */}
                <div className="mt-6 pt-4 border-t border-outline-variant/60 text-center">
                  <p className="text-xs text-secondary">
                    Sudah memiliki akun warga?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                      Masuk ke Akun Anda
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
