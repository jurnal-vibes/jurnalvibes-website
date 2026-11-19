'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Phone,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()

  // Step: 1 = Input WhatsApp, 2 = Input OTP, 3 = Input Sandi Baru, 4 = Sukses
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Form Fields
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // OTP Countdown Timer
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const cleanPhone = phone.replace(/[^0-9]/g, '')

  // Timer Countdown Effect
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

  // ==========================================
  // STEP 1: KIRIM KODE OTP KE WHATSAPP
  // ==========================================
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 14) {
      setError('Masukkan nomor WhatsApp yang valid (10-14 digit angka).')
      return
    }

    setLoading(true)
    setError('')
    setInfoMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-otp', phone: cleanPhone }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mengirim kode OTP. Periksa kembali nomor WhatsApp Anda.')
        return
      }

      setStep(2)
      setTimer(60)
      setCanResend(false)
      setOtpCode(['', '', '', '', '', ''])
      if (data.otpDemo) {
        setInfoMessage(`(Mode Demo: Gunakan kode verifikasi ${data.otpDemo})`)
      }
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 200)
    } catch {
      setError('Terjadi kendala jaringan saat menghubungi server. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // STEP 2: VERIFIKASI KODE OTP
  // ==========================================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const entered = otpCode.join('')

    if (entered.length < 6) {
      setError('Mohon lengkapi 6 digit kode OTP verifikasi.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          phone: cleanPhone,
          otpCode: entered,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Kode OTP tidak cocok atau sudah kedaluwarsa.')
        return
      }

      setStep(3)
    } catch {
      setError('Terjadi kendala saat memverifikasi kode OTP. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Kirim Ulang OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return
    setLoading(true)
    setError('')
    setInfoMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-otp', phone: cleanPhone }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mengirim ulang kode OTP.')
        return
      }

      setTimer(60)
      setCanResend(false)
      setOtpCode(['', '', '', '', '', ''])
      if (data.otpDemo) {
        setInfoMessage(`(Mode Demo: Gunakan kode verifikasi ${data.otpDemo})`)
      }
      otpInputRefs.current[0]?.focus()
    } catch {
      setError('Gagal mengirim ulang kode OTP. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Input OTP per-kotak
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1)
    const next = [...otpCode]
    next[index] = digit
    setOtpCode(next)
    setError('')

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // ==========================================
  // STEP 3: SIMPAN KATA SANDI BARU
  // ==========================================
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setError('Kata sandi baru minimal 8 karakter demi keamanan akun Anda.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          phone: cleanPhone,
          otpCode: otpCode.join(''),
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal menyimpan kata sandi baru.')
        return
      }

      setSuccessMsg('Kata sandi akun Anda berhasil diperbarui!')
      setStep(4)
    } catch {
      setError('Terjadi kendala saat memperbarui kata sandi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-surface text-on-surface flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10">
      {/* Navigasi Kembali ke Halaman Masuk */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-start">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Halaman Masuk</span>
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

          {/* SISI KANAN: FORMULIR RESET MULTI-STEP */}
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

            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-primary tracking-tight mb-1">
              {step === 1 && 'Reset Kata Sandi'}
              {step === 2 && 'Verifikasi Kode OTP'}
              {step === 3 && 'Buat Kata Sandi Baru'}
              {step === 4 && 'Kata Sandi Berhasil Diubah'}
            </h1>

            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-5">
              {step === 1 &&
                'Masukkan nomor WhatsApp akun warga Anda untuk menerima 6 digit kode OTP verifikasi pemulihan kata sandi.'}
              {step === 2 && (
                <>
                  Kode verifikasi 6 digit telah dikirimkan ke nomor WhatsApp{' '}
                  <strong className="text-on-surface font-semibold">{cleanPhone}</strong>. Masukkan kode untuk melanjutkan.
                </>
              )}
              {step === 3 && 'Silakan buat kata sandi baru minimal 8 karakter yang aman dan mudah Anda ingat.'}
              {step === 4 && 'Kata sandi akun Anda telah diperbarui. Silakan masuk kembali.'}
            </p>

            {/* Alert Error */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Info Message Demo / Testing */}
            {infoMessage && (
              <div className="p-3 mb-4 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-medium flex items-start gap-2">
                <div className="flex-1 leading-relaxed">{infoMessage}</div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 1: FORM INPUT NOMOR WHATSAPP                    */}
            {/* ==================================================== */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Nomor WhatsApp Terdaftar
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-secondary mt-1">
                    Pastikan nomor WhatsApp Anda aktif untuk menerima 6 digit kode OTP.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <span>Kirim Kode OTP via WhatsApp</span>
                  )}
                </button>
              </form>
            )}

            {/* ==================================================== */}
            {/* STEP 2: FORM INPUT 6 DIGIT OTP                       */}
            {/* ==================================================== */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-on-surface">
                      Masukkan 6 Digit Kode OTP
                    </label>
                    <span className="text-[11px] text-secondary">
                      {timer > 0 ? (
                        <span className="text-primary font-semibold">Tersisa {timer} detik</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">Kode kedaluwarsa</span>
                      )}
                    </span>
                  </div>

                  {/* 6 Kotak OTP Input */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
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
                        className="w-11 h-12 sm:w-13 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-xl bg-surface-container-low border border-outline-variant/80 text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.join('').length < 6}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Kode...</span>
                    </>
                  ) : (
                    <span>Verifikasi Kode OTP</span>
                  )}
                </button>

                {/* Kirim Ulang & Ganti Nomor */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setError('')
                      setInfoMessage('')
                    }}
                    className="text-secondary hover:text-on-surface transition-colors cursor-pointer"
                  >
                    ← Ganti Nomor WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    className="text-primary hover:underline font-semibold disabled:opacity-40 disabled:hover:no-underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Kirim Ulang OTP {timer > 0 ? `(${timer}s)` : ''}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ==================================================== */}
            {/* STEP 3: BUAT KATA SANDI BARU                         */}
            {/* ==================================================== */}
            {step === 3 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Sandi Baru...</span>
                    </>
                  ) : (
                    <span>Simpan Kata Sandi Baru</span>
                  )}
                </button>
              </form>
            )}

            {/* ==================================================== */}
            {/* STEP 4: KARTU SUKSES BERSIH & PROFESIONAL            */}
            {/* ==================================================== */}
            {step === 4 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                      Kata Sandi Berhasil Diubah
                    </h3>
                    <p className="text-xs text-slate-500">
                      Akun warga Anda siap digunakan kembali.
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Silakan masuk menggunakan nomor WhatsApp{' '}
                  <strong className="text-slate-900 font-semibold">{cleanPhone}</strong> dan kata sandi baru yang telah Anda buat.
                </p>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-primary hover:bg-[#a00012] text-white font-heading font-bold text-xs sm:text-sm text-center transition-all shadow-xs cursor-pointer"
                >
                  Masuk ke Akun
                </Link>
              </div>
            )}

            {/* Footer Kembali ke Login */}
            {step !== 4 && (
              <div className="mt-5 text-center sm:text-left">
                <p className="text-xs text-secondary">
                  Ingat kata sandi Anda?{' '}
                  <Link href="/login" className="font-bold text-primary hover:underline">
                    Masuk Sekarang
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
