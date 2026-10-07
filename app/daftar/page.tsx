'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  AlertCircle,
  UploadCloud,
  FileCheck,
  X,
  ArrowLeft,
} from 'lucide-react'

export default function DaftarPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('')
  const [nik, setNik] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [ktpPreviewUrl, setKtpPreviewUrl] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Handle Foto KTP
  const handleFileChange = (file: File | null) => {
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Format berkas KTP harus berupa gambar (JPG, PNG, atau WEBP).')
      setKtpFile(null)
      setKtpPreviewUrl(null)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran foto KTP maksimal 10MB.')
      setKtpFile(null)
      setKtpPreviewUrl(null)
      return
    }

    setError('')
    setKtpFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setKtpPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
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

    if (!fullName.trim()) return setError('Mohon masukkan nama lengkap sesuai KTP.')
    if (!email.trim()) return setError('Mohon masukkan alamat email aktif.')
    if (!nik.trim() || nik.length !== 16) return setError('Nomor NIK 16 digit wajib diisi sesuai e-KTP fisik.')
    if (!ktpFile && !ktpPreviewUrl) return setError('Foto fisik e-KTP asli wajib diunggah untuk verifikasi keabsahan warga.')
    if (!password || password.length < 8) return setError('Kata sandi minimal 8 karakter.')
    if (password !== confirmPassword) return setError('Konfirmasi kata sandi tidak cocok.')
    if (!agreed) return setError('Anda harus menyetujui pernyataan keabsahan dan ketentuan.')

    setLoading(true)
    setError('')

    try {
      const newUserSession = {
        id: 'citizen-' + Date.now(),
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        phone_number: phone.trim() || null,
        nik: nik.trim() || null,
        user_metadata: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          nik: nik.trim() || null,
          ktp_photo_url: ktpPreviewUrl || null,
        },
        role: 'citizen',
        ktp_verified: true,
        ktp_photo_url: ktpPreviewUrl || null,
      }

      if (typeof window !== 'undefined') {
        // Simpan ke daftar user terdaftar
        try {
          const registeredUsersRaw = localStorage.getItem('halo_jurnal_registered_users')
          const list = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : []
          list.push(newUserSession)
          localStorage.setItem('halo_jurnal_registered_users', JSON.stringify(list))
        } catch {}

        // Simpan session aktif
        localStorage.setItem('halo_jurnal_current_user', JSON.stringify(newUserSession))
        window.dispatchEvent(new Event('storage'))
      }

      setRegistrationSuccess(true)
    } catch {
      setError('Terjadi kendala teknis saat pendaftaran. Silakan coba kembali.')
    } finally {
      setLoading(false)
    }
  }

  // Tampilan Sukses Registrasi
  if (registrationSuccess) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-surface text-on-surface">
        <header className="w-full px-6 py-4 flex items-center justify-between border-b border-outline-variant/40">
          <Link href="/halo-jurnal" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/halo-jurnal-icon.webp" alt="Halo Jurnal Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-heading font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
              Halo Jurnal
            </span>
          </Link>
          <Link
            href="/halo-jurnal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="font-heading font-extrabold text-2xl text-on-surface tracking-tight">
              Pendaftaran Berhasil!
            </h2>

            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Selamat datang, <span className="font-bold text-on-surface">{fullName}</span>. Akun warga Anda telah aktif di portal Halo Jurnal Sukabumi.
            </p>

            {ktpFile ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-2 text-left">
                <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Dokumen KTP Anda berhasil diunggah untuk verifikasi prioritas.</span>
              </div>
            ) : null}

            <div className="pt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => router.push('/halo-jurnal/beranda')}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Lanjut ke Beranda Warga &rarr;
              </button>
              <Link
                href="/halo-jurnal/lapor"
                className="w-full py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs transition-colors"
              >
                Mulai Buat Laporan Pertama
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* SISI KIRI: GAMBAR MASKOT (KEPALA PAS DI ATAS, KAKI TERANGKAT RAPI DARI BAWAH) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center pointer-events-none self-stretch pt-2 pb-4 sticky top-6">
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

          {/* SISI KANAN: KALIMAT DI ATAS & TEMPAT DAFTAR DI BAWAHNYA */}
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
                Daftar Akun Warga
              </h1>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg">
                Lengkapi identitas Anda untuk mulai menyampaikan aspirasi, aduan fasilitas publik, dan memantau tindak lanjut secara transparan.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Form Pendaftaran */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Nama Lengkap (Sesuai KTP) <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* NIK */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Nomor Induk Kependudukan (NIK) <span className="text-primary font-bold">* (Wajib)</span>
                  </label>
                  <span className="text-[11px] text-secondary font-mono">
                    {nik.length}/16 Digit
                  </span>
                </div>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={nik}
                    maxLength={16}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setNik(val)
                    }}
                    placeholder="3202xxxxxxxx0001"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Email & No WhatsApp (2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Alamat Email <span className="text-primary">*</span>
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

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    No. WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Kata Sandi & Konfirmasi (2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer p-1"
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Konfirmasi Sandi <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant/80 rounded-lg text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Unggah Foto e-KTP (Wajib Verifikasi) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Foto Fisik e-KTP Asli <span className="text-primary font-bold">* (Wajib)</span>
                  </label>
                  <span className="text-[11px] font-medium text-secondary">
                    Verifikasi Keabsahan Warga
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />

                {ktpPreviewUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-10 rounded overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ktpPreviewUrl}
                          alt="Pratinjau e-KTP"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface truncate">
                          {ktpFile?.name || 'Berkas e-KTP Terunggah'}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {(ktpFile?.size ? ktpFile.size / 1024 : 0).toFixed(0)} KB • Siap Diverifikasi Redaksi
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setKtpFile(null)
                        setKtpPreviewUrl(null)
                      }}
                      className="p-1 rounded-lg text-secondary hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Ganti foto e-KTP"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/80 hover:border-primary/60 bg-surface-container-low'
                    }`}
                  >
                    <UploadCloud className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-xs text-on-surface font-medium">
                      Tarik &amp; lepas foto e-KTP asli atau <span className="text-primary font-bold">Pilih Berkas (Wajib)</span>
                    </p>
                    <p className="text-[10px] text-secondary mt-0.5">
                      Format: JPG, PNG, atau WEBP (Maksimal 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Persetujuan Syarat & Ketentuan */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreed"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer w-4 h-4 shrink-0"
                />
                <label htmlFor="agreed" className="text-xs text-secondary leading-snug cursor-pointer select-none">
                  Saya menyatakan bahwa data yang saya masukkan adalah sah dan benar, serta menyetujui{' '}
                  <Link href="/halo-jurnal/syarat-ketentuan" className="text-primary font-semibold hover:underline">
                    Syarat &amp; Ketentuan
                  </Link>{' '}
                  serta{' '}
                  <Link href="/halo-jurnal/kebijakan-privasi" className="text-primary font-semibold hover:underline">
                    Kebijakan Privasi
                  </Link>{' '}
                  Halo Jurnal Sukabumi.
                </label>
              </div>

              {/* Tombol Submit Pendaftaran */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
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

            {/* Tautan Masuk bagi yang sudah punya akun */}
            <div className="mt-5 text-center">
              <p className="text-xs text-secondary">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Masuk di Sini &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
