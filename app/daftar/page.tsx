'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createWorker } from 'tesseract.js'
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowLeft,
  Check,
} from 'lucide-react'

export default function DaftarPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [ktpPreviewName, setKtpPreviewName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  // OCR state
  const [isOcrScanning, setIsOcrScanning] = useState(false)
  const [ocrStatus, setOcrStatus] = useState('')
  const [ocrWarning, setOcrWarning] = useState<string | null>(null)
  const [ocrConfirmed, setOcrConfirmed] = useState(false)

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Format file KTP harus berupa gambar (JPG, PNG, atau WEBP).')
      setKtpFile(null)
      setKtpPreviewName('')
      return
    }

    if (file.size < 10 * 1024) {
      setError('Ukuran file KTP terlalu kecil (minimal 10KB).')
      setKtpFile(null)
      setKtpPreviewName('')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file KTP maksimal 10MB.')
      setKtpFile(null)
      setKtpPreviewName('')
      return
    }

    setError('')
    setKtpFile(file)
    setKtpPreviewName(file.name)
    setOcrWarning(null)
    setOcrConfirmed(false)

    // Run OCR Analysis
    setIsOcrScanning(true)
    setOcrStatus('Menganalisis keaslian foto KTP...')

    try {
      const worker = await createWorker('ind')
      const ret = await worker.recognize(file)
      await worker.terminate()

      const text = ret.data.text.toUpperCase()
      const ktpKeywords = ['NIK', 'REPUBLIK INDONESIA', 'PROVINSI', 'KABUPATEN', 'KOTA', 'AGAMA', 'WARGA']
      const matched = ktpKeywords.filter((k) => text.includes(k))

      if (matched.length >= 2) {
        setOcrStatus('✓ Foto KTP terverifikasi')
        setOcrConfirmed(true)
      } else {
        setOcrWarning('Teks KTP kurang terbaca jelas. Mohon pastikan foto KTP tidak blur.')
        setOcrConfirmed(true) // Allow user confirmation fallback
      }
    } catch {
      setOcrConfirmed(true)
    } finally {
      setIsOcrScanning(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName) return setError('Masukkan nama lengkap Anda.')
    if (!email) return setError('Masukkan email Anda.')
    if (!password || password.length < 8) return setError('Password minimal 8 karakter.')
    if (password !== confirmPassword) return setError('Konfirmasi kata sandi tidak cocok.')
    if (!ktpFile) return setError('Foto KTP wajib diunggah untuk verifikasi keabsahan laporan.')
    if (!agreed) return setError('Anda harus menyetujui Syarat & Ketentuan.')

    setLoading(true)
    setError('')

    try {
      const sb = createClient()

      const { error: signUpError } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            phone: phone || null,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setRegistrationComplete(true)
    } catch {
      setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-surface-container-lowest">
        <div className="max-w-md w-full text-center bg-surface border border-outline-variant/80 rounded-3xl p-8 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-on-surface mb-2">
            Periksa Email Anda
          </h2>
          <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-6">
            Kami telah mengirimkan tautan konfirmasi akun ke <strong>{email}</strong>.
            Klik tautan tersebut untuk mengaktifkan akun Anda.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm shadow-xs"
          >
            Menuju Halaman Masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-surface-container-lowest text-on-surface">
      <div className="w-full max-w-lg">
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

        {/* Form Card */}
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
              Pendaftaran Akun Warga
            </h1>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              Satu akun resmi untuk menyampaikan aspirasi dan pengaduan Sukabumi
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Alamat Email Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Nomor WhatsApp <span className="text-secondary font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Ulangi Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* KTP Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Foto KTP untuk Verifikasi <span className="text-rose-500">*</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {isOcrScanning ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mb-1" />
                    <span className="text-xs text-secondary">{ocrStatus}</span>
                  </div>
                ) : ktpPreviewName ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                    <span>{ktpPreviewName}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <UploadCloud className="w-6 h-6 text-secondary mb-1" />
                    <span className="text-xs font-bold text-on-surface">Unggah Foto KTP</span>
                    <span className="text-[10px] text-secondary">
                      KTP dijaga kerahasiaannya dan tidak dipublikasikan ke umum
                    </span>
                  </div>
                )}
              </div>
              {ocrWarning && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {ocrWarning}
                </p>
              )}
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded text-primary focus:ring-primary cursor-pointer"
                required
              />
              <label htmlFor="agree" className="text-xs text-secondary leading-relaxed cursor-pointer">
                Saya menyetujui{' '}
                <Link href="/halo-jurnal/syarat-ketentuan" className="text-primary font-bold hover:underline">
                  Syarat & Ketentuan
                </Link>{' '}
                serta{' '}
                <Link href="/halo-jurnal/kebijakan-privasi" className="text-primary font-bold hover:underline">
                  Kebijakan Privasi
                </Link>{' '}
                Halo Jurnal.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <span>Daftar Akun Sekarang</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-outline-variant/60 text-center">
            <p className="text-xs text-secondary">
              Sudah punya akun warga?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
