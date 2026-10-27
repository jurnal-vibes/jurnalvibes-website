'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Jika sudah terautentikasi di server, langsung arahkan ke dashboard
  useEffect(() => {
    let isMounted = true
    const checkExistingAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth', { method: 'GET', cache: 'no-store' })
        const json = await res.json()
        if (isMounted && json.authenticated) {
          router.replace('/halo-jurnal/admin')
        }
      } catch {
        // Abaikan jika server belum terjangkau
      }
    }
    checkExistingAuth()
    return () => {
      isMounted = false
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Mohon masukkan alamat email dan kata sandi admin.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()

      if (res.ok && json.success) {
        setSuccessMsg(json.message || 'Login berhasil! Mengalihkan ke dashboard...')
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'jurnal_wave_admin_user',
            JSON.stringify(json.user || { name: 'Admin', email })
          )
        }
        setTimeout(() => {
          router.push('/halo-jurnal/admin')
          router.refresh()
        }, 500)
      } else {
        setErrorMsg(json.message || 'Email atau kata sandi admin salah.')
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server autentikasi: ' + (err?.message || 'Koneksi bermasalah'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] flex flex-col justify-between items-center p-4 sm:p-6 font-sans antialiased selection:bg-[#c00015] selection:text-white">
      {/* Header Kecil Atas */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/halo-jurnal-icon.webp?v=original"
            alt="Halo Jurnal Logo"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-heading font-extrabold text-base tracking-tight text-slate-900">
                Jurnal<span className="text-[#c00015]">Sukabumi</span>
              </span>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded uppercase tracking-wider">
                Redaksi
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Pusat Kendali Halo Jurnal &amp; Wave
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-900 transition flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Card Form Login Tengah */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xs sm:shadow-sm p-6 sm:p-8 space-y-6 my-auto">
        {/* Header Kartu */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/halo-jurnal-icon.webp?v=original"
              alt="Halo Jurnal Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Masuk Meja Redaksi
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Akses khusus Redaksi <strong className="text-slate-800">Jurnal Wave</strong> &amp; Pusat Kendali <strong className="text-slate-800">Halo Jurnal</strong>.
          </p>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#c00015] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Alert Sukses */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jurnalwave.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] focus:ring-1 focus:ring-[#c00015] text-xs sm:text-sm transition-colors"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] focus:ring-1 focus:ring-[#c00015] text-xs sm:text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs sm:text-sm font-semibold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Info Bantuan Akses Resmi */}
        <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Akses aman terenkripsi. Hubungi tim administrator teknis PT Media Jurnal Sukabumi jika mengalami kendala.
          </p>
        </div>
      </div>

      {/* Footer Bawah */}
      <footer className="text-center text-xs text-slate-400 py-4">
        © 2026 <strong className="text-slate-600 font-semibold">Jurnal Wave</strong> — Meja Redaksi &amp;
        Pusat Kendali Jurnal Wave &amp; Halo Jurnal.
      </footer>
    </div>
  )
}
