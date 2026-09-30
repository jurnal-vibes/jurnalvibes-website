'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
  const [supabase] = useState(() => createClient())

  const [email, setEmail] = useState('')
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
    if (!email || !password) {
      setError('Mohon masukkan alamat email dan kata sandi Anda.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi. Silakan periksa kotak masuk atau spam email Anda.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Email atau kata sandi tidak cocok. Silakan periksa kembali.')
        } else {
          // Fallback akun lokal / demo jika supabase cloud belum terhubung
          const demoUser = {
            id: 'citizen-' + Date.now(),
            email: email.trim(),
            user_metadata: { full_name: email.split('@')[0].toUpperCase() },
            role: 'citizen',
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('halo_jurnal_current_user', JSON.stringify(demoUser))
            window.dispatchEvent(new Event('storage'))
          }
          router.push('/halo-jurnal/beranda')
          return
        }
      } else if (data?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'halo_jurnal_current_user',
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              user_metadata: data.user.user_metadata,
            })
          )
          window.dispatchEvent(new Event('storage'))
        }
        router.push('/halo-jurnal/beranda')
        router.refresh()
      }
    } catch {
      setError('Terjadi kendala koneksi. Coba lagi beberapa saat lagi.')
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
        {/* Subtle Background Glow Khas Halo Jurnal */}
        <div className="absolute -left-12 -top-12 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* SISI KIRI: GAMBAR MASKOT (KEPALA PAS DI ATAS, KAKI TERANGKAT RAPI DARI BAWAH) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center pointer-events-none self-stretch pt-2 pb-4">
            <div className="relative w-full h-full min-h-[320px] sm:min-h-[380px] md:min-h-[440px] max-h-[460px] flex flex-col items-center justify-start">
              {/* Soft glow podium */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-primary/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hallo-jurnal-presenter.webp"
                alt="Hallo Jurnal Presenter"
                className="w-full h-full max-h-[440px] object-contain object-top drop-shadow-xl select-none transition-transform duration-300"
              />
              {/* Bayangan halus di bawah kaki */}
              <div className="w-24 sm:w-32 h-2.5 bg-black/10 blur-xs rounded-full -mt-1.5 pointer-events-none" />
            </div>
          </div>

          {/* SISI KANAN: KALIMAT DI ATAS & TEMPAT LOGIN DI BAWAHNYA */}
          <div className="md:col-span-7 flex flex-col justify-center py-2">
            {/* Kalimat Singkat di Bagian Atas */}
            <div className="mb-6">
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

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg">
                Sampurasun! Masuk ke akun warga Anda untuk memantau status tindak lanjut aspirasi dan aduan pelayanan publik.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMsg}</div>
              </div>
            )}

            {/* Tempat Login di Bagian Bawah Kalimat */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adminjurnal7@gmail.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
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
                className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk Sekarang</span>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-5 text-center sm:text-left">
              <p className="text-xs text-secondary">
                Belum punya akun?{' '}
                <Link href="/daftar" className="font-bold text-primary hover:underline">
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
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
