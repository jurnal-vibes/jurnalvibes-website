'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(
    searchParams.get('error') === 'auth'
      ? 'Terjadi kesalahan saat verifikasi akun. Silakan coba kembali.'
      : ''
  )
  const [successMsg] = useState(
    searchParams.get('success') === 'confirmed'
      ? 'Email berhasil dikonfirmasi! Silakan masuk dengan akun Anda.'
      : ''
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) {
      setError('Mohon masukkan email atau nomor WhatsApp dan kata sandi Anda.')
      return
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: identifier.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Kombinasi identitas atau kata sandi tidak cocok.')
        return
      }

      if (!data.user) {
        setError('Data profil akun tidak ditemukan. Silakan hubungi admin.')
        return
      }

      const wargaUser = data.user

      if (typeof window !== 'undefined') {
        localStorage.setItem('halo_jurnal_current_user', JSON.stringify(wargaUser))
        window.dispatchEvent(new Event('storage'))
      }

      router.push('/halo-jurnal/beranda')
      router.refresh()
    } catch {
      setError('Terjadi kendala koneksi ke server. Coba lagi beberapa saat lagi.')
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

          {/* SISI KANAN: FORMULIR LOGIN */}
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

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-2">
              Masuk ke Akun Anda
            </h1>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-5">
              Selamat datang kembali! Masuk untuk memantau perkembangan laporan aduan, tanggapan redaksi, dan aspirasi publik Sukabumi.
            </p>

            {/* Error Alert */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMsg}</div>
              </div>
            )}

            {/* Form Login Manual */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identitas (Email atau No HP) */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Alamat Email atau Nomor WhatsApp
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama@email.com atau 081234567890"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    Kata Sandi
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lupa Kata Sandi?
                  </Link>
                </div>
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Akun</span>
                )}
              </button>
            </form>

            {/* Footer Link ke Pendaftaran */}
            <div className="mt-6 pt-4 border-t border-outline-variant/60 text-center">
              <p className="text-xs text-secondary">
                Belum memiliki akun warga?{' '}
                <Link href="/daftar" className="font-semibold text-primary hover:underline">
                  Daftar Akun Baru
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
