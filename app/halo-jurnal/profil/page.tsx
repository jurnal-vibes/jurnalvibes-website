'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import {
  User,
  Phone,
  Edit2,
  Camera,
  Trash2,
  Check,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LogIn,
} from 'lucide-react'

// Diameter lingkaran crop di dalam viewport UI (pixel)
const APERTURE_SIZE = 200

export default function HaloJurnalProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [initialPhone, setInitialPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // OTP State untuk ganti nomor
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null)

  // Modal Sesuaikan / Crop Foto Profil
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const startPosRef = useRef({ x: 0, y: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
    const handleStorage = () => fetchProfile()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Timer countdown OTP
  useEffect(() => {
    if (otpCooldown <= 0) return
    const interval = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [otpCooldown])

  const fetchProfile = () => {
    setLoading(true)
    try {
      let localUser: any = null
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed && (parsed.id || parsed.email || parsed.phone)) {
              localUser = parsed
            }
          } catch {}
        }
      }

      if (!localUser) {
        setUser(null)
        setFullName('')
        setPhone('')
        setInitialPhone('')
        setAvatarUrl(null)
        return
      }

      const userFullName = localUser.full_name || localUser.name || ''
      const userPhone = localUser.phone || localUser.phone_number || ''
      const userAvatar = localUser.avatar_url || localUser.avatar || null

      setUser(localUser)
      setFullName(userFullName)
      setPhone(userPhone)
      setInitialPhone(userPhone)
      setAvatarUrl(userAvatar)
    } catch (err) {
      console.error('Fetch profile error:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Hitung skala dasar agar gambar selalu menutupi lingkaran crop tanpa celah kosong
  const baseScale =
    naturalSize.w > 0 && naturalSize.h > 0
      ? Math.max(APERTURE_SIZE / naturalSize.w, APERTURE_SIZE / naturalSize.h)
      : 1
  const currentScale = baseScale * cropZoom
  const displayW = naturalSize.w * currentScale
  const displayH = naturalSize.h * currentScale

  // Batas geser agar gambar tidak keluar dari lingkaran
  const maxOffsetX = Math.max(0, (displayW - APERTURE_SIZE) / 2)
  const maxOffsetY = Math.max(0, (displayH - APERTURE_SIZE) / 2)

  // Otomatis batasi posisi geser saat zoom diperkecil
  useEffect(() => {
    if (!isCropModalOpen || naturalSize.w === 0) return
    setCropPos((prev) => ({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y)),
    }))
  }, [cropZoom, maxOffsetX, maxOffsetY, isCropModalOpen, naturalSize.w])

  // Apakah nomor HP sedang diubah dari nomor awal?
  const cleanCurrentPhone = phone.trim().replace(/[^0-9]/g, '')
  const cleanOriginalPhone = initialPhone.trim().replace(/[^0-9]/g, '')
  const isPhoneChanged = cleanCurrentPhone !== cleanOriginalPhone

  // Pilih file foto -> Ukur dimensi & buka popup
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format file harus berupa gambar (JPG, PNG, atau WEBP).')
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto maksimal 5 MB.')
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        const testImg = new Image()
        testImg.onload = () => {
          setNaturalSize({ w: testImg.naturalWidth, h: testImg.naturalHeight })
          setCropImageSrc(dataUrl)
          setCropZoom(1)
          setCropPos({ x: 0, y: 0 })
          setIsCropModalOpen(true)
        }
        testImg.src = dataUrl
      }
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  // Terapkan hasil penyesuaian foto dari Canvas (100% presisi 1:1)
  const handleApplyCroppedImage = () => {
    if (!cropImageSrc || naturalSize.w === 0) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const outputSize = 400 // Resolusi HD 400x400
      const ratio = outputSize / APERTURE_SIZE

      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Potong lingkaran
      ctx.beginPath()
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()

      // Gambar dengan skala dan translasi tepat
      const drawW = displayW * ratio
      const drawH = displayH * ratio
      const drawX = outputSize / 2 + cropPos.x * ratio - drawW / 2
      const drawY = outputSize / 2 + cropPos.y * ratio - drawH / 2

      ctx.drawImage(img, drawX, drawY, drawW, drawH)

      const croppedDataUrl = canvas.toDataURL('image/png')
      setAvatarUrl(croppedDataUrl)

      const updated = {
        ...(user || {}),
        avatar_url: croppedDataUrl,
        avatar: croppedDataUrl,
      }
      setUser(updated)
      if (typeof window !== 'undefined') {
        localStorage.setItem('halo_jurnal_current_user', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      }

      setIsCropModalOpen(false)
      setCropImageSrc(null)
      setNotice('Foto profil berhasil diperbarui!')
      setTimeout(() => setNotice(null), 3000)
    }
    img.src = cropImageSrc
  }

  // Pointer drag events untuk geser foto
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    startPosRef.current = { x: cropPos.x, y: cropPos.y }
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const newX = startPosRef.current.x + dx
    const newY = startPosRef.current.y + dy

    setCropPos({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  // Zoom dengan scroll mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setCropZoom((prev) => Math.min(3, Math.max(1, +(prev + delta).toFixed(2))))
  }

  // Hapus foto profil dan kembalikan ke avatar inisial
  const handleRemoveAvatar = () => {
    setAvatarUrl(null)
    const updated = {
      ...(user || {}),
      avatar_url: null,
      avatar: null,
    }
    setUser(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('halo_jurnal_current_user', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    }
    setNotice('Foto profil berhasil dihapus.')
    setTimeout(() => setNotice(null), 3000)
  }

  // Kirim OTP saat nomor HP baru diinput
  const handleSendOtp = async () => {
    if (cleanCurrentPhone.length < 10 || cleanCurrentPhone.length > 14) {
      setOtpError('Nomor WhatsApp baru harus 10–14 digit angka.')
      return
    }

    setOtpLoading(true)
    setOtpError(null)

    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-wa-otp',
          phone: cleanCurrentPhone,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setOtpError(data.message || 'Gagal mengirim kode OTP ke nomor baru.')
        return
      }

      setOtpSent(true)
      setOtpCooldown(60)
      setSimulatedOtp(data.otpDemo || '123456')
      setNotice(`Kode verifikasi OTP dikirim ke WhatsApp ${cleanCurrentPhone}`)
      setTimeout(() => setNotice(null), 4000)
    } catch {
      setOtpError('Terjadi kesalahan jaringan saat mengirim kode OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Verifikasi OTP
  const handleVerifyOtp = async () => {
    const code = otpCode.trim()
    if (code.length < 6) {
      setOtpError('Masukkan 6 digit kode OTP verifikasi.')
      return
    }

    setOtpLoading(true)
    setOtpError(null)

    try {
      const res = await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-wa-otp',
          phone: cleanCurrentPhone,
          otpCode: code,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setOtpError(data.message || 'Kode OTP tidak sesuai atau sudah kedaluwarsa.')
        return
      }

      setOtpVerified(true)
      setSimulatedOtp(null)
      setNotice('Nomor WhatsApp baru berhasil diverifikasi!')
      setTimeout(() => setNotice(null), 4000)
    } catch {
      setOtpError('Gagal memverifikasi kode OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Simpan data nama & nomor
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap tidak boleh kosong.')
      return
    }

    if (!cleanCurrentPhone) {
      setErrorMessage('Nomor WhatsApp tidak boleh kosong.')
      return
    }

    // Jika nomor diubah tapi belum verifikasi OTP
    if (isPhoneChanged && !otpVerified) {
      setErrorMessage('Silakan verifikasi nomor WhatsApp baru Anda dengan kode OTP terlebih dahulu.')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    const updated = {
      ...(user || {}),
      full_name: fullName.trim(),
      name: fullName.trim(),
      phone: cleanCurrentPhone,
      phone_number: cleanCurrentPhone,
      avatar_url: avatarUrl,
      avatar: avatarUrl,
      user_metadata: {
        ...(user?.user_metadata || {}),
        full_name: fullName.trim(),
        phone: cleanCurrentPhone,
      },
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('halo_jurnal_current_user', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    }

    // Sinkronisasi data ke server
    try {
      await fetch('/api/auth/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-profile',
          id: user?.id,
          email: user?.email,
          oldPhone: initialPhone,
          fullName: fullName.trim(),
          phone: cleanCurrentPhone,
        }),
      })
    } catch {}

    setUser(updated)
    setInitialPhone(cleanCurrentPhone)
    setSaving(false)
    setEditing(false)
    setOtpSent(false)
    setOtpVerified(false)
    setOtpCode('')
    setNotice('Data profil berhasil diperbarui!')
    setTimeout(() => setNotice(null), 4000)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setFullName(user?.full_name || user?.name || '')
    setPhone(initialPhone)
    setOtpSent(false)
    setOtpVerified(false)
    setOtpCode('')
    setOtpError(null)
    setErrorMessage(null)
    setSimulatedOtp(null)
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="text-center py-10 sm:py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs max-w-md mx-auto w-full">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <User className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            Masuk ke Akun Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
            Silakan masuk ke akun Anda untuk melihat dan memperbarui identitas warga, nomor WhatsApp, serta foto profil.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?redirect=/halo-jurnal/profil"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </Link>
            <Link
              href="/daftar"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all text-center cursor-pointer"
            >
              Daftar Akun Baru
            </Link>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/halo-jurnal"
              className="text-xs text-slate-400 hover:text-primary transition-colors font-medium cursor-pointer"
            >
              ← Kembali ke Beranda Hallo Jurnal
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-4">
      {/* Hidden File Input untuk Memilih Foto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelect}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* POPUP MODAL SESUAIKAN FOTO (SVG Masked, 100% Precise) */}
      {isCropModalOpen && cropImageSrc && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  Sesuaikan Foto Profil
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Geser dan atur perbesaran agar pas di dalam lingkaran
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCropModalOpen(false)
                  setCropImageSrc(null)
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewport Interaktif untuk Crop & Pan */}
            <div className="p-4 sm:p-5 flex flex-col items-center">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
                className="relative w-64 h-64 sm:w-72 sm:h-72 overflow-hidden bg-slate-900 rounded-2xl select-none cursor-grab active:cursor-grabbing flex items-center justify-center touch-none shadow-inner"
              >
                {/* Gambar Target yang digeser dan di-zoom */}
                <img
                  src={cropImageSrc}
                  alt="Pratinjau Foto"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${cropPos.x}px), calc(-50% + ${cropPos.y}px))`,
                    width: `${displayW}px`,
                    height: `${displayH}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }}
                  className="pointer-events-none select-none"
                />

                {/* SVG Mask: Memotong lingkaran 200px bersih tanpa bug ring CSS */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  width="100%"
                  height="100%"
                >
                  <defs>
                    <mask id="avatar-crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <circle cx="50%" cy="50%" r={APERTURE_SIZE / 2} fill="black" />
                    </mask>
                  </defs>
                  {/* Layer gelap di luar lingkaran */}
                  <rect
                    width="100%"
                    height="100%"
                    fill="rgba(15, 23, 42, 0.72)"
                    mask="url(#avatar-crop-mask)"
                  />
                  {/* Garis batas putih lingkaran */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={APERTURE_SIZE / 2}
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    className="drop-shadow-md"
                  />
                </svg>
              </div>

              {/* Teks Bantuan di bawah Viewport (Tidak Menutupi Foto) */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 text-center">
                Geser foto untuk memposisikan • Scroll untuk zoom
              </p>

              {/* Kontrol Zoom & Reset */}
              <div className="w-full max-w-[280px] flex items-center gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setCropZoom((prev) => Math.max(1, +(prev - 0.15).toFixed(2)))}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[#c00015] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setCropZoom((prev) => Math.min(3, +(prev + 0.15).toFixed(2)))}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCropZoom(1)
                    setCropPos({ x: 0, y: 0 })
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Atur Ulang Posisi"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Footer Aksi Modal */}
            <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                Pilih Foto Lain
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCropModalOpen(false)
                    setCropImageSrc(null)
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyCroppedImage}
                  className="px-4 py-2 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan Foto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Sukses */}
      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Notifikasi Error */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KARTU PROFIL UTAMA (Minimalis & Profesional) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Area Foto Profil */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative group">
            <UserAvatar
              name={fullName || user?.full_name || 'Warga'}
              avatarUrl={avatarUrl}
              size="xl"
            />
            {/* Tombol Kamera untuk Ganti Foto */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-slate-900"
              title="Ganti Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Opsi Ubah / Hapus Foto */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-[#c00015] hover:text-[#900010] cursor-pointer transition-colors"
            >
              Ganti Foto
            </button>
            {avatarUrl && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="font-medium text-slate-500 hover:text-rose-600 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* TAMPILAN VIEW ATAU EDIT */}
        {!editing ? (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            {/* Hanya Nama */}
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">
              {user?.full_name || user?.name || 'Warga'}
            </h1>

            {/* Hanya Nomor WhatsApp */}
            <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.phone || user?.phone_number || '-'}</span>
            </div>

            {/* Tombol Edit Profil */}
            <div className="mt-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profil</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORM EDIT PROFIL */
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c00015]/20 focus:border-[#c00015] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setOtpVerified(false)
                    setOtpSent(false)
                    setOtpCode('')
                    setOtpError(null)
                    setSimulatedOtp(null)
                  }}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c00015]/20 focus:border-[#c00015] transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* SEKSI VERIFIKASI OTP: Hanya tampil jika nomor WhatsApp diubah */}
            {isPhoneChanged && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-[#c00015] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Verifikasi Nomor Baru
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Karena Anda mengubah nomor WhatsApp, verifikasi kode OTP diperlukan sebelum menyimpan perubahan.
                    </p>
                  </div>
                </div>

                {otpError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs">
                    {otpError}
                  </div>
                )}

                {/* Simulasi banner OTP */}
                {simulatedOtp && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs">
                    Kode OTP Verifikasi WhatsApp Anda:{' '}
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-100 tracking-wider">
                      {simulatedOtp}
                    </span>
                  </div>
                )}

                {!otpVerified ? (
                  <div className="space-y-2.5 pt-1">
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || cleanCurrentPhone.length < 10}
                        className="w-full py-2 px-3 rounded-xl bg-[#c00015] hover:bg-[#a00012] disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>Kirim Kode OTP WhatsApp</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="6 digit kode OTP"
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-mono tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c00015]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpLoading || otpCode.length < 6}
                            className="px-4 py-2 rounded-xl bg-[#c00015] hover:bg-[#a00012] disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Verifikasi</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Belum menerima kode?</span>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpCooldown > 0 || otpLoading}
                            className="font-medium text-[#c00015] hover:text-[#900010] disabled:text-slate-400 cursor-pointer"
                          >
                            {otpCooldown > 0 ? `Kirim ulang (${otpCooldown}s)` : 'Kirim Ulang OTP'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nomor WhatsApp baru terverifikasi</span>
                  </div>
                )}
              </div>
            )}

            {/* Tombol Aksi Simpan / Batal */}
            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || (isPhoneChanged && !otpVerified)}
                className="px-5 py-2 rounded-xl bg-[#c00015] hover:bg-[#a00012] disabled:opacity-50 text-white text-xs font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
