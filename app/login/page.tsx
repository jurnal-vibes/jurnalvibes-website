'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react'

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
      ? 'Terjadi kesalahan saat verifikasi. Silakan coba lagi.'
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
      setError('Masukkan email dan password Anda.')
      return
    }
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Silakan periksa inbox email Anda.')
      } else {
        setError('Email atau kata sandi tidak sesuai.')
      }
    } else {
      router.push('/halo-jurnal/beranda')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-surface-container-lowest text-on-surface">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/halo-jurnal"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halo Jurnal</span>
          </Link>
        </div>

        {/* Brand Card */}
        <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs mb-3 overflow-hidden">
              <img
                src="/halo-jurnal-icon.webp"
                alt="Halo Jurnal Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-on-surface tracking-tight">
              Masuk ke Halo Jurnal
            </h1>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              Portal aspirasi dan pengaduan warga Sukabumi
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  Kata Sandi
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lupa Sandi?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-outline-variant/60 text-center">
            <p className="text-xs text-secondary">
              Belum punya akun warga?{' '}
              <Link href="/daftar" className="text-primary font-bold hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
