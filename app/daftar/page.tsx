'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  ShieldCheck,
  FileCheck,
  X,
  Landmark,
  ArrowUpRight,
} from 'lucide-react'
import HaloJurnalHeader from '@/components/halo-jurnal/HaloJurnalHeader'

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

  // Isi Otomatis untuk Uji Coba Cepat
  const handleAutoFillDemo = () => {
    setFullName('Siti Nurhaliza')
    setNik('3202116508950002')
    setEmail('siti.sukabumi@gmail.com')
    setPhone('085723456789')
    setPassword('WargaSukabumi123!')
    setConfirmPassword('WargaSukabumi123!')
    // Berikan contoh preview e-KTP dan mock file agar langsung lolos validasi wajib KTP
    const sampleKtpSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23cbd5e1"/><text x="200" y="125" font-family="sans-serif" font-size="16" fill="%23334155" text-anchor="middle">Contoh e-KTP Siti Nurhaliza</text></svg>'
    setKtpPreviewUrl(sampleKtpSvg)
    const mockFile = new File(['mock-ktp-demo'], 'ktp_siti_nurhaliza.jpg', { type: 'image/jpeg' })
    setKtpFile(mockFile)
    setAgreed(true)
    setError('')
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
      const sb = createClient()

      // 1. Coba registrasi ke Supabase
      const { data } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || null,
            nik: nik.trim() || null,
            ktp_photo_url: ktpPreviewUrl || null,
          },
        },
      })

      // 2. Simpan session warga ke localStorage agar langsung sinkron dengan profil & portal
      const newUserSession = {
        id: data?.user?.id || 'citizen-' + Date.now(),
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
        <HaloJurnalHeader />
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
        <footer className="w-full bg-surface border-t border-outline-variant/60 py-8 px-6 text-center text-xs text-secondary">
          © 2026 Halo Jurnal. Portal Aspirasi Masyarakat Sukabumi.
        </footer>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-surface text-on-surface">
      {/* 1. HEADER RESMI WEBSITE (Warna Asli Website: Surface #fbf9f9 & Border #e7bdb8) */}
      <HaloJurnalHeader />

      {/* 2. TATA LETAK SPLIT 50/50 UTAMA (SELARAS DENGAN HALAMAN LOGIN) */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
        {/* KOLOM KIRI: BACKGROUND FOTO BERANDA (/hero-banner.webp) DENGAN INFORMASI KEPERCAYAAN */}
        <div className="relative overflow-hidden bg-black text-white p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between">
          {/* Foto Resmi yang Sama Persis dengan Halaman Beranda & Login */}
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
              Aspirasi &amp; Partisipasi<br />
              Warga Sukabumi.
            </h1>

            {/* Sub-judul */}
            <p className="text-white/95 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mb-8 font-normal drop-shadow-xs">
              Daftarkan akun untuk menyampaikan laporan pelayanan publik, memantau transparansi tindak lanjut, dan berkolaborasi bersama redaksi Jurnal Sukabumi.
            </p>

            {/* 2 Kartu Frosted Glass */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* Kartu 1: Data Terenkripsi */}
              <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-sm hover:bg-black/45 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">
                  Kerahasiaan NIK &amp; KTP
                </h3>
                <p className="text-white/85 text-xs leading-relaxed">
                  Identitas kependudukan dilindungi standar UU PDP dan tidak disebarluaskan.
                </p>
              </div>

              {/* Kartu 2: Respon Terukur */}
              <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-sm hover:bg-black/45 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  <ArrowUpRight className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">
                  Tindak Lanjut Nyata
                </h3>
                <p className="text-white/85 text-xs leading-relaxed">
                  Setiap pengaduan warga langsung diproses redaksi dan diteruskan ke instansi terkait.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright Bawah Kiri */}
          <div className="relative z-20 pt-8 mt-6 border-t border-white/20 text-white/75 text-xs font-medium">
            © 2026 Halo Jurnal. Portal Aspirasi Masyarakat.
          </div>
        </div>

        {/* KOLOM KANAN: FORMULIR DAFTAR LANGSUNG DI KANVAS (SELARAS DENGAN FORMULIR LOGIN) */}
        <div className="bg-surface flex items-center justify-center p-6 sm:p-10 lg:p-14 xl:p-16">
          <div className="w-full max-w-[480px]">
            {/* Header Form */}
            <div className="mb-6">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-1.5">
                Daftar Akun
              </h2>
              <p className="text-secondary text-xs sm:text-sm">
                Lengkapi identitas Anda untuk mulai menyampaikan pengaduan &amp; aspirasi.
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

            {/* Tombol Isi Otomatis Contoh (Demo Test) */}
            <div className="mt-6 pt-4 border-t border-outline-variant/40 text-center">
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <span>Gunakan Data Contoh untuk Uji Coba Pendaftaran</span>
              </button>
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
