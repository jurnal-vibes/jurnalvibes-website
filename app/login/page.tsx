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
  ShieldCheck,
  ArrowUpRight,
  Landmark,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import HaloJurnalHeader from '@/components/halo-jurnal/HaloJurnalHeader'

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
    <div className="w-full min-h-screen flex flex-col bg-surface text-on-surface">
      {/* 1. HEADER RESMI WEBSITE (Warna Asli Website: Surface #fbf9f9 & Border #e7bdb8) */}
      <HaloJurnalHeader />

      {/* 2. TATA LETAK SPLIT 50/50 UTAMA */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
        {/* KOLOM KIRI: BACKGROUND FOTO RESMI BERANDA (/hero-banner.webp) */}
        <div className="relative overflow-hidden bg-black text-white p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between">
          {/* Foto Resmi yang Sama Persis dengan Halaman Beranda */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-banner.webp"
              alt="Halo Jurnal Sukabumi Banner"
              className="w-full h-full object-cover object-bottom scale-100"
            />
            {/* Gradient Overlay Gelap Khas Beranda agar gambar terlihat jelas dan teks terbaca kontras */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/55 z-10" />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
          </div>

          {/* Konten Atas */}
          <div className="relative z-20">

            {/* Ikon Landmark */}
            <div className="mb-4">
              <Landmark className="w-8 h-8 text-white drop-shadow-sm stroke-[2.2px]" />
            </div>

            {/* Judul Utama */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] text-white mb-4 tracking-tight drop-shadow-md">
              Membangun Kepercayaan<br />
              Lewat Transparansi.
            </h1>

            {/* Sub-judul */}
            <p className="text-white/95 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mb-8 font-normal drop-shadow-xs">
              Halo Jurnal adalah portal aspirasi resmi yang menjamin setiap laporan masyarakat didengar, dicatat, dan ditindaklanjuti secara profesional.
            </p>

            {/* 2 Kartu Frosted Glass */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* Kartu 1: Data Terenkripsi */}
              <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-sm hover:bg-black/45 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">
                  Data Terenkripsi
                </h3>
                <p className="text-white/85 text-xs leading-relaxed">
                  Keamanan identitas pelapor adalah prioritas utama kami.
                </p>
              </div>

              {/* Kartu 2: Respon Terukur */}
              <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-sm hover:bg-black/45 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  <ArrowUpRight className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">
                  Respon Terukur
                </h3>
                <p className="text-white/85 text-xs leading-relaxed">
                  Setiap jurnal aspirasi dipantau dan dikelola oleh tim Admin Jurnal Sukabumi secara real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright Bawah Kiri */}
          <div className="relative z-20 pt-8 mt-6 border-t border-white/20 text-white/75 text-xs font-medium">
            © 2026 Halo Jurnal. Portal Aspirasi Masyarakat.
          </div>
        </div>

        {/* KOLOM KANAN: FORMULIR LOGIN LANGSUNG DI KANVAS (SESUAI BENTUK REFERENSI TANPA KOTAK KARTU) */}
        <div className="bg-surface flex items-center justify-center p-6 sm:p-10 lg:p-14 xl:p-20">
          <div className="w-full max-w-[420px]">
            {/* Header Form */}
            <div className="mb-6">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-1.5">
                Selamat Datang Kembali
              </h2>
              <p className="text-secondary text-xs sm:text-sm">
                Masuk untuk melihat status laporan Anda.
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

            {/* Form */}
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
            <div className="mt-5 text-center">
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

      {/* 3. FOOTER RESMI DI BAGIAN PALING BAWAH (Warna Asli Website: Surface #fbf9f9 & Border #e7bdb8) */}
      <footer className="w-full bg-surface border-t border-outline-variant/60 py-8 sm:py-10 px-6 sm:px-10 lg:px-16 transition-colors">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/halo-jurnal-icon.webp" alt="Halo Jurnal Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-on-surface tracking-tight">
                Halo Jurnal
              </h3>
            </div>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Wadah aspirasi digital untuk mewujudkan tata kelola kota yang lebih baik, transparan, dan akuntabel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-on-surface">
            <Link href="/halo-jurnal/kebijakan-privasi" className="hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/halo-jurnal/syarat-ketentuan" className="hover:text-primary transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/halo-jurnal/hubungi-kami" className="hover:text-primary transition-colors">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </footer>
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
