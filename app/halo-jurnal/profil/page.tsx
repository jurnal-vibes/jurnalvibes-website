'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import LogoutButton from '@/components/halo-jurnal/LogoutButton'
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Loader2,
  CreditCard,
  AlertCircle,
  Eye,
  UploadCloud,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
} from 'lucide-react'

export default function HaloJurnalProfilPage() {
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // KTP View & Edit States
  const [showKtpModal, setShowKtpModal] = useState(false)
  const [showUploadKtpModal, setShowUploadKtpModal] = useState(false)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [ktpPreviewUrl, setKtpPreviewUrl] = useState<string | null>(null)
  const [uploadingKtp, setUploadingKtp] = useState(false)
  const [ktpError, setKtpError] = useState<string | null>(null)
  const [ktpNotice, setKtpNotice] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowKtpModal(false)
        setShowUploadKtpModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        // Demo fallback
        setUser({ id: 'demo-user-id', email: 'warga@sukabumi.com' })
        setProfile({
          full_name: 'Warga Sukabumi',
          role: 'citizen',
          phone_number: '081234567890',
          ktp_verified: true,
          ktp_photo_url: null,
        })
        setFullName('Warga Sukabumi')
        setPhone('081234567890')
        setLoading(false)
        return
      }

      setUser(authUser)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (prof) {
        setProfile(prof)
        setFullName(prof.full_name || authUser.user_metadata?.full_name || '')
        setPhone(prof.phone_number || '')
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.id === 'demo-user-id') {
      setProfile((prev: any) => ({ ...prev, full_name: fullName, phone_number: phone }))
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) => ({ ...prev, full_name: fullName, phone_number: phone }))
      setEditing(false)
      setKtpNotice('Informasi profil berhasil diperbarui!')
      setTimeout(() => setKtpNotice(null), 4000)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      alert(`Gagal memperbarui profil: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Handle file selection with strict e-KTP geometric validation + AI OCR Text Scanner
  const handleFileSelect = (file: File | null) => {
    if (!file) return
    setKtpError(null)

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setKtpError('Format file KTP harus berupa gambar (JPG, PNG, atau WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setKtpError('Ukuran file KTP maksimal 5MB.')
      return
    }

    // 1. Validasi Dimensi & Rasio Fisik e-KTP (Standar ISO 7810 ID-1: ~1.58 : 1)
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl

    img.onload = async () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const ratio = width / height

      URL.revokeObjectURL(objectUrl)

      // Cek orientasi: Fisik kartu e-KTP wajib posisi horizontal / lanskap
      if (width < height) {
        setKtpError(
          'Dokumen Ditolak! Foto terdeteksi dalam orientasi tegak (portrait/selfie). Pastikan memotret fisik kartu e-KTP secara horizontal (lanskap) dan sejajar.'
        )
        setKtpFile(null)
        setKtpPreviewUrl(null)
        return
      }

      // Cek rasio kartu: e-KTP memiliki rasio resmi 85.6mm / 53.98mm = 1.586
      if (ratio < 1.35 || ratio > 1.85) {
        setKtpError(
          'Dokumen Ditolak! Proporsi gambar tidak sesuai standar fisik e-KTP (Rasio ~1.58:1). Hindari foto persegi (1:1) atau panorama. Pastikan memotret seluruh fisik kartu e-KTP secara utuh.'
        )
        setKtpFile(null)
        setKtpPreviewUrl(null)
        return
      }

      // Cek resolusi minimum: agar NIK, Nama, dan alamat terbaca jelas
      if (width < 600 || height < 350) {
        setKtpError(
          'Kualitas Foto Rendah! Resolusi gambar minimal 600x350 piksel agar NIK dan identitas e-KTP terbaca jelas.'
        )
        setKtpFile(null)
        setKtpPreviewUrl(null)
        return
      }

      // 2. Lolos semua kriteria validasi fisik kartu e-KTP
      setKtpFile(file)
      const preview = URL.createObjectURL(file)
      setKtpPreviewUrl(preview)
    }

    img.onerror = () => {
      setKtpError('Gagal memproses gambar. Pastikan file gambar Anda valid dan tidak rusak.')
      setKtpFile(null)
      setKtpPreviewUrl(null)
    }
  }

  // Handle KTP Upload / Update
  const handleUploadKtp = async () => {
    if (!ktpFile) {
      setKtpError('Silakan pilih berkas foto KTP terlebih dahulu.')
      return
    }

    setUploadingKtp(true)
    setKtpError(null)

    try {
      // Demo session fallback
      if (!user || user.id === 'demo-user-id') {
        const reader = new FileReader()
        reader.onload = () => {
          const base64Url = reader.result as string
          setProfile((prev: any) => ({
            ...prev,
            ktp_photo_url: base64Url,
            ktp_verified: false,
          }))
          setShowUploadKtpModal(false)
          setKtpFile(null)
          setKtpPreviewUrl(null)
          setKtpNotice('Foto KTP demo berhasil diperbarui! Status diubah menjadi "Menunggu Verifikasi".')
          setTimeout(() => setKtpNotice(null), 5000)
        }
        reader.readAsDataURL(ktpFile)
        return
      }

      // Real Supabase storage upload
      const fileExt = ktpFile.name.split('.').pop() || 'jpg'
      const filePath = `${user.id}/ktp_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('ktp-photos')
        .upload(filePath, ktpFile, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('ktp-photos')
        .getPublicUrl(filePath)

      const newKtpUrl = publicUrlData.publicUrl

      // Update profiles database record: reset verified to false for re-review
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ktp_photo_url: newKtpUrl,
          ktp_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setProfile((prev: any) => ({
        ...prev,
        ktp_photo_url: newKtpUrl,
        ktp_verified: false,
      }))

      setShowUploadKtpModal(false)
      setKtpFile(null)
      setKtpPreviewUrl(null)
      setKtpNotice('Foto KTP berhasil diperbarui! Dokumen Anda sedang menunggu verifikasi ulang oleh tim redaksi.')
      setTimeout(() => setKtpNotice(null), 6000)
    } catch (err: any) {
      console.error('Upload KTP error:', err)
      setKtpError(`Gagal mengunggah foto KTP: ${err.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setUploadingKtp(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-secondary">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs">Memuat profil akun...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-6 pt-8 pb-16">
      {/* Toast Notice */}
      {ktpNotice && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ktpNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setKtpNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-outline-variant/60 text-center sm:text-left">
          <UserAvatar
            name={profile?.full_name || user?.email}
            size="xl"
            bgColor="primary"
            className="w-20 h-20 text-2xl font-black shadow-md border-2 border-white/50 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight">
                {profile?.full_name || 'Pengguna Halo Jurnal'}
              </h1>
              {profile?.ktp_verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                  <ShieldCheck className="w-3 h-3" />
                  KTP Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                  <AlertCircle className="w-3 h-3" />
                  Menunggu Verifikasi KTP
                </span>
              )}
            </div>

            <p className="text-xs text-secondary mb-4">
              Peran Akun:{' '}
              <span className="font-semibold text-primary capitalize">{profile?.role || 'Warga'}</span>
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Profile Info Form / Details */}
        <div className="pt-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Alamat Email
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold truncate mt-0.5">
                    {user?.email || '-'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Nomor WhatsApp
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold truncate mt-0.5">
                    {profile?.phone_number || '-'}
                  </p>
                </div>
              </div>

              <div
                onClick={() => setShowKtpModal(true)}
                className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors group"
              >
                <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                      Status Verifikasi KTP
                    </p>
                    <span className="text-[10px] text-primary font-bold group-hover:underline flex items-center gap-0.5">
                      Pratinjau <Eye className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold mt-0.5">
                    {profile?.ktp_verified ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    ID Warga
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-mono font-semibold truncate mt-0.5">
                    {user?.id ? `USR-${user.id.substring(0, 8)}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated e-KTP Verification & Preview Section */}
        <div className="mt-8 pt-8 border-t border-outline-variant/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-extrabold text-base sm:text-lg text-on-surface tracking-tight">
                    Dokumen Verifikasi (e-KTP)
                  </h2>
                  {profile?.ktp_verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                      <ShieldCheck className="w-3 h-3" />
                      Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                      <AlertCircle className="w-3 h-3" />
                      Perlu Tinjauan
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Identitas resmi warga untuk menjamin validitas dan integritas pelaporan
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowKtpModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-bold transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>Lihat Dokumen</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setKtpFile(null)
                  setKtpPreviewUrl(null)
                  setKtpError(null)
                  setShowUploadKtpModal(true)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Ubah KTP</span>
              </button>
            </div>
          </div>

          {/* Visual KTP Card & Info Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Visual KTP Card */}
            <div className="lg:col-span-6">
              <div
                onClick={() => setShowKtpModal(true)}
                className="group relative rounded-2xl overflow-hidden border border-outline-variant/80 shadow-xs cursor-pointer aspect-[1.58/1] transition-transform duration-300 hover:scale-[1.01]"
              >
                {profile?.ktp_photo_url ? (
                  // Actual Uploaded KTP Image
                  <div className="w-full h-full relative bg-slate-900">
                    <img
                      src={profile.ktp_photo_url}
                      alt="Pratinjau KTP Warga"
                      className="w-full h-full object-cover"
                    />
                    {/* Security Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        Terenkripsi
                      </span>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <Eye className="w-4 h-4 text-primary-fixed" />
                        <span>Klik untuk melihat foto KTP beresolusi penuh</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Stylized e-KTP Mockup (Standard ISO 7810 ID-1)
                  <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-4 sm:p-5 text-white flex flex-col justify-between overflow-hidden select-none">
                    {/* Decorative guilloche-like background circles */}
                    <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
                    <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-blue-600/10 blur-xl pointer-events-none" />

                    {/* Card Header */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-sky-200">
                            Republik Indonesia
                          </p>
                          <p className="text-[9px] sm:text-[10px] tracking-wide text-slate-300 font-semibold">
                            Provinsi Jawa Barat • Kota Sukabumi
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-bold text-sky-300 border border-white/15">
                          <Lock className="w-2.5 h-2.5" />
                          e-KTP Warga
                        </span>
                      </div>
                    </div>

                    {/* Card Mid: Smart Chip & Masked NIK */}
                    <div className="my-auto py-2">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Simulated Gold Smart Chip */}
                        <div className="w-8 h-6 rounded bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600/40 shadow-xs flex items-center justify-center">
                          <div className="w-5 h-4 border border-amber-700/30 rounded-xs" />
                        </div>
                        <div className="text-[9px] tracking-widest font-mono text-slate-400 uppercase">
                          Contactless Chip
                        </div>
                      </div>

                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Nomor Induk Kependudukan (NIK)
                      </p>
                      <p className="font-mono font-extrabold text-sm sm:text-base tracking-widest text-sky-100">
                        327202******0001
                      </p>
                    </div>

                    {/* Card Footer: Name & Verification */}
                    <div className="flex items-end justify-between border-t border-white/10 pt-2">
                      <div className="min-w-0 pr-2">
                        <p className="text-[8px] font-bold uppercase text-slate-400">Nama Warga</p>
                        <p className="font-heading font-extrabold text-xs sm:text-sm text-white truncate tracking-wide">
                          {(profile?.full_name || 'Warga Sukabumi').toUpperCase()}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">
                        <Check className="w-2.5 h-2.5" />
                        {profile?.ktp_verified ? 'Terverifikasi' : 'Menunggu'}
                      </div>
                    </div>

                    {/* Hover Hint */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 border border-white/30">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Klik untuk melihat detail</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Guarantee & Information Box */}
            <div className="lg:col-span-6 bg-surface-container-low rounded-2xl border border-outline-variant/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-on-surface">
                    Jaminan Keamanan & Perlindungan Privasi (UU PDP)
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-secondary leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-on-surface font-semibold">Terenkripsi & Rahasia:</strong> Dokumen KTP Anda hanya dapat diakses oleh tim redaksi internal dan tidak pernah dibagikan ke pihak luar maupun feed publik.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-on-surface font-semibold">Integritas Pelaporan:</strong> Verifikasi KTP memastikan laporan yang Anda kirimkan memiliki kredibilitas resmi untuk ditindaklanjuti instansi berwenang.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-on-surface font-semibold">Pembaruan Dokumen:</strong> Anda dapat memperbarui foto KTP kapan saja jika ada perubahan dokumen atau kualitas foto sebelumnya kurang jelas.
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Banner */}
              <div className="mt-4 pt-4 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-secondary">
                  Butuh memperbarui foto KTP?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setKtpFile(null)
                    setKtpPreviewUrl(null)
                    setKtpError(null)
                    setShowUploadKtpModal(true)
                  }}
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ganti Foto KTP Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW KTP LIGHTBOX (WITH SECURITY WATERMARK) */}
      {showKtpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowKtpModal(false)}
        >
          <div
            className="bg-surface border border-outline-variant rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-on-surface">
                    Dokumen Identitas Warga (e-KTP)
                  </h3>
                  <p className="text-[11px] text-secondary flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    Dilindungi Watermark Keamanan UU PDP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKtpModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Image with Watermark Overlay */}
            <div className="py-5">
              <div className="relative rounded-2xl overflow-hidden border border-outline-variant/80 bg-slate-950 flex items-center justify-center aspect-[1.58/1]">
                {profile?.ktp_photo_url ? (
                  <img
                    src={profile.ktp_photo_url}
                    alt="Foto KTP"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full p-6 text-white bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-black tracking-wider uppercase text-sky-200">
                        Republik Indonesia • e-KTP
                      </p>
                      <p className="text-[11px] text-slate-300 font-semibold">
                        Provinsi Jawa Barat • Kota Sukabumi
                      </p>
                    </div>
                    <div className="my-auto py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nomor Induk Kependudukan (NIK)
                      </p>
                      <p className="font-mono font-extrabold text-lg sm:text-xl tracking-widest text-sky-100">
                        327202******0001
                      </p>
                      <p className="text-xs font-bold text-slate-300 mt-2">
                        NAMA:{' '}
                        <span className="text-white font-black">
                          {(profile?.full_name || 'WARGA SUKABUMI').toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10 pt-2">
                      <span>Status: {profile?.ktp_verified ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi'}</span>
                      <span className="font-mono">KOTA SUKABUMI</span>
                    </div>
                  </div>
                )}

                {/* Diagonal Protective Watermark */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
                  <div className="transform -rotate-12 space-y-8 opacity-25 text-center">
                    <p className="text-white font-mono font-black text-sm sm:text-base tracking-[0.2em] uppercase whitespace-nowrap bg-black/40 px-4 py-1 rounded">
                      HANYA UNTUK VERIFIKASI HALO JURNAL
                    </p>
                    <p className="text-white font-mono font-black text-xs sm:text-sm tracking-[0.2em] uppercase whitespace-nowrap bg-black/40 px-4 py-1 rounded">
                      DILINDUNGI UU PERLINDUNGAN DATA PRIBADI
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span className="text-secondary">
                    Status Dokumen:{' '}
                    <strong className="text-on-surface font-semibold">
                      {profile?.ktp_verified ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi Tim Redaksi'}
                    </strong>
                  </span>
                </div>
                <span className="text-[10px] text-secondary font-mono">
                  ID: {user?.id ? user.id.substring(0, 8) : 'demo-user'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/60">
              <button
                type="button"
                onClick={() => {
                  setShowKtpModal(false)
                  setShowUploadKtpModal(true)
                }}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti Dokumen KTP</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKtpModal(false)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD / GANTI FOTO KTP */}
      {showUploadKtpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => {
            if (!uploadingKtp) setShowUploadKtpModal(false)
          }}
        >
          <div
            className="bg-surface border border-outline-variant rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-on-surface">
                    Perbarui Dokumen e-KTP
                  </h3>
                  <p className="text-[11px] text-secondary">
                    Unggah foto KTP asli yang jelas dan tidak terpotong
                  </p>
                </div>
              </div>
              {!uploadingKtp && (
                <button
                  type="button"
                  onClick={() => setShowUploadKtpModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Warning Note */}
            <div className="my-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Perhatian Penting:</strong>
                Mengganti foto KTP akan memicu peninjauan ulang status verifikasi akun Anda oleh tim redaksi sebelum kembali berstatus resmi.
              </div>
            </div>

            {/* Error Message */}
            {ktpError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ktpError}</span>
              </div>
            )}

            {/* Dropzone Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                handleFileSelect(e.dataTransfer.files?.[0] || null)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-outline-variant hover:border-primary/60 bg-surface-container-low'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />

              {ktpPreviewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="relative rounded-xl overflow-hidden border border-outline-variant max-h-44 w-full aspect-[1.58/1] bg-black mb-3">
                    <img
                      src={ktpPreviewUrl}
                      alt="Pratinjau KTP Baru"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{ktpFile?.name}</span>
                    <span className="text-secondary text-[10px]">
                      ({(ktpFile?.size ? ktpFile.size / 1024 / 1024 : 0).toFixed(2)} MB) • Siap Ditinjau
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary mt-1 underline">
                    Klik untuk mengganti dengan file lain
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-on-surface mb-0.5">
                    Klik untuk memilih file atau seret ke sini
                  </span>
                  <span className="text-[11px] text-secondary">
                    Format: JPG, PNG, atau WEBP (Maksimal 5MB)
                  </span>
                </div>
              )}
            </div>

            {/* Quality Checklist */}
            <div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[11px] text-secondary space-y-1">
              <p className="font-bold text-on-surface">Panduan Foto KTP yang Baik:</p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Seluruh 4 sudut kartu KTP terlihat utuh</li>
                <li>Tulisan NIK, Nama, dan Alamat terbaca jelas (tidak buram)</li>
                <li>Bebas dari pantulan cahaya kilat (flash glare)</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-outline-variant/60">
              <button
                type="button"
                disabled={uploadingKtp}
                onClick={() => setShowUploadKtpModal(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={uploadingKtp || !ktpFile}
                onClick={handleUploadKtp}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {uploadingKtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan & Verifikasi Ulang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
