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
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

export default function DaftarPage() {
  const router = useRouter()

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // Pola 2: Inline WhatsApp OTP State
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Global UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Countdown timer untuk kirim ulang kode OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // Helper validasi nomor WhatsApp
  const cleanPhone = phone.replace(/[^0-9]/g, '')

  // 1. Aksi Kirim Kode OTP Inline ke WhatsApp
  const handleSendOtp = async () => {
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 14) {
      setOtpMessage({
        type: 'error',
        text: 'Masukkan nomor WhatsApp yang valid (10-14 digit angka).',
      })
      return
    }

    try {
      setSendingOtp(true)
      setOtpMessage(null)

      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-wa-otp', phone: cleanPhone }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setOtpMessage({
          type: 'error',
          text: data.message || 'Gagal mengirim kode OTP ke nomor ini.',
        })
        return
      }

      setIsOtpSent(true)
      setCountdown(60)
      setOtpMessage({
        type: 'success',
        text: data.message || 'Kode verifikasi telah dikirimkan ke WhatsApp Anda.',
      })
    } catch {
      setOtpMessage({
        type: 'error',
        text: 'Kendala jaringan saat mengirim OTP. Silakan coba lagi.',
      })
    } finally {
      setSendingOtp(false)
    }
  }

  // 2. Aksi Verifikasi Kode OTP Inline
  const handleVerifyOtp = async () => {
    const cleanOtp = otpCode.trim()
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpMessage({
        type: 'error',
        text: 'Masukkan 6 digit kode OTP verifikasi.',
      })
      return
    }

    try {
      setVerifyingOtp(true)
      setOtpMessage(null)

      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-wa-otp',
          phone: cleanPhone,
          otpCode: cleanOtp,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setOtpMessage({
          type: 'error',
          text: data.message || 'Kode OTP salah atau telah kedaluwarsa.',
        })
        return
      }

      setIsPhoneVerified(true)
      setOtpMessage({
        type: 'success',
        text: 'Nomor WhatsApp berhasil diverifikasi!',
      })
    } catch {
      setOtpMessage({
        type: 'error',
        text: 'Gagal memverifikasi kode OTP. Silakan coba lagi.',
      })
    } finally {
      setVerifyingOtp(false)
    }
  }

  // 3. Aksi Batal / Ubah Nomor WhatsApp
  const handleResetPhone = () => {
    setIsPhoneVerified(false)
    setIsOtpSent(false)
    setOtpCode('')
    setOtpMessage(null)
    setCountdown(0)
  }

  // 4. Submit Pendaftaran Akun Warga
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Mohon masukkan nama lengkap Anda (minimal 2 karakter).')
      return
    }

    if (!isPhoneVerified) {
      setError('Mohon verifikasi nomor WhatsApp Anda terlebih dahulu.')
      return
    }

    if (!password || password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.')
      return
    }

    if (!agreed) {
      setError('Anda wajib menyetujui Ketentuan Layanan & Kebijakan Privasi.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-wa',
          fullName: fullName.trim(),
          phone: cleanPhone,
          password,
          domisili: 'Sukabumi',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mendaftarkan akun. Silakan coba kembali.')
        return
      }

      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('halo_jurnal_current_user', JSON.stringify(data.user))
        window.dispatchEvent(new Event('storage'))
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/halo-jurnal/beranda')
        router.refresh()
      }, 1000)
    } catch {
      setError('Terjadi kendala koneksi ke server saat pendaftaran. Coba lagi.')
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
          
          {/* SISI KIRI: MASKOT (& Logo pada Mobile) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center self-stretch">
            {/* Logo Badge Resmi Hallo Jurnal - Hanya di Mobile (di Atas Maskot, Rata Kiri) */}
            <div className="self-start flex md:hidden items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/halo-jurnal-icon.webp?v=original"
                  alt="Hallo Jurnal Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-black text-base text-on-surface tracking-tight leading-none">
                  Hallo Jurnal
                </span>
                <span className="text-[10px] text-secondary font-medium tracking-tight mt-0.5">
                  Aspirasi &amp; Aduan Sukabumi
                </span>
              </div>
            </div>

            <div className="relative w-full flex flex-col items-center justify-center pointer-events-none">
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
            
            {/* Logo Badge Resmi Hallo Jurnal - Hanya di Desktop/Tablet (Seperti Semula) */}
            <div className="hidden md:flex items-center gap-2.5 mb-3">
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
            ) : (
              <div className="animate-in fade-in duration-200">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-primary tracking-tight mb-1">
                  Daftar Akun
                </h1>
                <p className="text-xs sm:text-sm text-secondary font-medium tracking-tight mb-5">
                  Silakan lengkapi data diri Anda untuk membuat akun baru.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                {/* FORMULIR PENDAFTARAN DENGAN VERIFIKASI WHATSAPP INLINE (POLA 2) */}
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Kolom 1: Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Kolom 2: Nomor WhatsApp dengan Verifikasi Inline */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-on-surface">
                        Nomor WhatsApp
                      </label>
                      {isPhoneVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      )}
                    </div>
                    
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          if (isPhoneVerified) handleResetPhone()
                        }}
                        placeholder="08xxxxxxxxxx"
                        disabled={isPhoneVerified}
                        required
                        className={`w-full pl-10 pr-28 py-2.5 text-xs sm:text-sm border rounded-lg text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 transition-colors ${
                          isPhoneVerified
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-surface-container-low border-outline-variant/80 focus:bg-surface-container-lowest focus:border-primary focus:ring-primary'
                        }`}
                      />
                      
                      {/* Tombol Aksi di Kanan Input */}
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                        {isPhoneVerified ? (
                          <button
                            type="button"
                            onClick={handleResetPhone}
                            className="px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-on-surface transition-colors cursor-pointer"
                          >
                            Ubah Nomor
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp || countdown > 0 || cleanPhone.length < 10}
                            className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-dark disabled:bg-surface-container-highest disabled:text-secondary/70 text-white text-xs font-semibold tracking-tight transition-all active:scale-95 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                          >
                            {sendingOtp ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mx-2" />
                            ) : countdown > 0 ? (
                              `Kirim Ulang (${countdown}s)`
                            ) : isOtpSent ? (
                              'Kirim Ulang'
                            ) : (
                              'Kirim Kode'
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* SUB-KOTAK INLINE OTP (Muncul saat OTP dikirim & belum terverifikasi) */}
                    {isOtpSent && !isPhoneVerified && (
                      <div className="mt-2.5 p-3.5 bg-surface-container-low border border-primary/25 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-on-surface flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-primary" />
                            Masukkan 6 digit kode OTP:
                          </span>
                          <span className="text-[11px] text-secondary">
                            OTP Uji Coba: <strong className="text-primary font-mono">123456</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Contoh: 123456"
                            className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono tracking-widest bg-surface-container-lowest border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otpCode.length !== 6}
                            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-2xs shrink-0 flex items-center gap-1.5"
                          >
                            {verifyingOtp ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>Verifikasi</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpCode('123456')}
                            className="hidden sm:inline-flex px-2.5 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-secondary text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            title="Otomatis isi kode demo"
                          >
                            Isi 123456
                          </button>
                        </div>

                        {/* Pesan status OTP */}
                        {otpMessage && (
                          <div
                            className={`text-[11px] font-medium flex items-center gap-1.5 ${
                              otpMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {otpMessage.type === 'success' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>{otpMessage.text}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Kolom 3 & 4: Kata Sandi & Konfirmasi Kata Sandi (2 Kolom Seimbang) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">
                        Kata Sandi
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
                          title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">
                        Konfirmasi Kata Sandi
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          required
                          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer p-1"
                          title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
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

                  {/* Tombol Utama: Murni DAFTAR AKUN */}
                  <button
                    type="submit"
                    disabled={loading || !isPhoneVerified}
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan Akun...</span>
                      </>
                    ) : (
                      <span>Daftar Akun</span>
                    )}
                  </button>
                  
                  {!isPhoneVerified && cleanPhone.length >= 10 && (
                    <p className="text-[11px] text-center text-secondary">
                      *Klik tombol <strong>Kirim Kode</strong> di samping nomor WhatsApp untuk memverifikasi nomor sebelum mendaftar.
                    </p>
                  )}
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
