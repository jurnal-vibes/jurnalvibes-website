'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Masukkan alamat email Anda.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await new Promise((res) => setTimeout(res, 800))
      setSuccess(true)
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
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

      {/* Kartu Utama Berperbandingan Proporsional - Selaras dengan Login & Daftar */}
      <div className="w-full max-w-5xl bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle Background Glow Khas Halo Jurnal */}
        <div className="absolute -left-12 -top-12 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* SISI KIRI: GAMBAR MASKOT PRESENTER */}
          <div className="md:col-span-5 flex flex-col items-center justify-center pointer-events-none self-stretch pt-2 pb-4">
            <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] md:min-h-[440px] max-h-[460px] flex flex-col items-center justify-start">
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

          {/* SISI KANAN: FORMULIR RESET */}
          <div className="md:col-span-7 flex flex-col justify-center py-2">
            {/* Header Badge */}
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
              Reset Kata Sandi
            </h1>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
              Masukkan alamat email akun warga Anda untuk menerima instruksi pemulihan kata sandi.
            </p>

            {success ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tautan Pemulihan Terkirim</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Kami telah mengirimkan instruksi pemulihan ke alamat <strong>{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm text-center transition-all shadow-xs"
                >
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Alamat Email Terdaftar
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Tautan...</span>
                    </>
                  ) : (
                    <span>Kirim Tautan Pemulihan</span>
                  )}
                </button>
              </form>
            )}

            <div className="mt-5 text-center sm:text-left">
              <p className="text-xs text-secondary">
                Ingat kata sandi Anda?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Masuk Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
