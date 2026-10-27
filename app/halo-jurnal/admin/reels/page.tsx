'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  Film,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  MapPin,
  LayoutGrid,
  List,
  Upload,
  Image as ImageIcon,
  Loader2,
  Play,
} from 'lucide-react'
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6'
import { Reel } from '@/types'

// Kategori Resmi Jurnal Wave (Portal Berita & Konten Kreatif)
export const JURNAL_WAVE_CATEGORIES = [
  'Berita',
  'Pendidikan & Sekolah',
  'Lifestyle',
  'Kuliner',
  'Wisata',
  'Otomotif',
  'Sport & E-Sport',
  'Teknologi',
  'Science',
  'Health',
  'Loker',
  'Hiburan',
  'Lainnya',
]

const CATEGORY_OPTIONS = JURNAL_WAVE_CATEGORIES

const DEFAULT_REEL_COVER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80'

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('semua')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const [previewReel, setPreviewReel] = useState<Reel | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Berita')
  const [customCategory, setCustomCategory] = useState('')
  const [formCreator, setFormCreator] = useState('')
  const [formPlatform, setFormPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('tiktok')
  const [formSocialUrl, setFormSocialUrl] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formThumbnail, setFormThumbnail] = useState('')
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)

  const coverFileInputRef = useRef<HTMLInputElement>(null)

  // Muat Reels dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_reels')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            // Bersihkan hanya sisa dummy reel-skb jika pernah tersimpan
            const clean = parsed.filter(
              (r: any) =>
                !String(r.id || '').startsWith('reel-skb-') &&
                !String(r.id || '').startsWith('reel-00')
            )
            if (clean.length !== parsed.length) {
              localStorage.setItem('jurnal_wave_reels', JSON.stringify(clean))
            }
            setReels(clean)
            return
          }
        }
        setReels([])
      } catch (err) {
        console.error('Error loading reels:', err)
        setReels([])
      }
    }
  }, [])

  // Simpan data dan kirim event sinkronisasi real-time
  const persistReels = (updated: Reel[], toastText: string) => {
    setReels(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_reels', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving reels:', err)
      }
    }
    setToastMessage(toastText)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Buka Modal Tambah Baru
  const handleOpenCreateModal = () => {
    setEditingReel(null)
    setFormTitle('')
    setFormCategory('Berita')
    setCustomCategory('')
    setFormCreator('')
    setFormPlatform('tiktok')
    setFormSocialUrl('')
    setFormLocation('Sukabumi')
    setFormThumbnail('')
    setIsModalOpen(true)
  }

  // Buka Modal Edit
  const handleOpenEditModal = (reel: Reel) => {
    setEditingReel(reel)
    setFormTitle(reel.title)
    const cat = reel.category || 'Pendidikan & Sekolah'
    if (CATEGORY_OPTIONS.includes(cat)) {
      setFormCategory(cat)
      setCustomCategory('')
    } else {
      setFormCategory('Lainnya')
      setCustomCategory(cat)
    }
    setFormCreator(reel.creator || '')
    const plat = (reel.platform as any) || (reel.socialUrl?.includes('tiktok.com') ? 'tiktok' : reel.socialUrl?.includes('youtube.com') ? 'youtube' : 'instagram')
    setFormPlatform(plat)
    setFormSocialUrl(reel.socialUrl || (reel.creator ? `https://instagram.com/${reel.creator.replace('@', '')}` : ''))
    setFormLocation(reel.location || '')
    setFormThumbnail(reel.thumbnailUrl || '')
    setIsModalOpen(true)
  }

  // Cerdas: Deteksi platform & fetch metadata thumbnail otomatis dari link
  const handleSocialUrlChange = async (url: string) => {
    setFormSocialUrl(url)
    const lower = url.toLowerCase().trim()
    if (!lower) return

    let detectedPlatform: 'instagram' | 'tiktok' | 'youtube' = formPlatform
    if (lower.includes('tiktok.com')) {
      detectedPlatform = 'tiktok'
      setFormPlatform('tiktok')
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      detectedPlatform = 'youtube'
      setFormPlatform('youtube')

      // Ekstraksi ID video YouTube instan
      let ytId = ''
      if (lower.includes('/shorts/')) {
        const match = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/)
        if (match && match[1]) ytId = match[1]
      } else if (lower.includes('v=')) {
        const match = url.match(/v=([a-zA-Z0-9_-]+)/)
        if (match && match[1]) ytId = match[1]
      } else if (lower.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
        if (match && match[1]) ytId = match[1]
      }
      if (ytId) {
        setFormThumbnail(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`)
      }
    } else if (lower.includes('instagram.com')) {
      detectedPlatform = 'instagram'
      setFormPlatform('instagram')
    }

    // Ekstraksi handle kreator cepat dari pola URL jika formCreator masih kosong/default
    if (!formCreator || formCreator === '@exploresukabumi' || formCreator === '@kreator_sukabumi') {
      if (lower.includes('tiktok.com/@')) {
        const match = url.match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/)
        if (match && match[1]) setFormCreator(`@${match[1]}`)
      } else if (lower.includes('instagram.com/')) {
        const match = url.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/)
        if (match && match[1] && match[1] !== 'reel' && match[1] !== 'p') {
          setFormCreator(`@${match[1]}`)
        }
      }
    }

    // Panggil server endpoint /api/reels/metadata untuk ambil cover thumbnail & info video asli
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      try {
        setIsFetchingMetadata(true)
        const res = await fetch(`/api/reels/metadata?url=${encodeURIComponent(url.trim())}`)
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json
          if (data.thumbnailUrl) {
            setFormThumbnail(data.thumbnailUrl)
          }
          if (data.creator && (!formCreator || formCreator === '@kreator_sukabumi' || formCreator === '@exploresukabumi')) {
            setFormCreator(data.creator)
          }
          if (data.platform) {
            setFormPlatform(data.platform)
          }
          if (data.title && !formTitle) {
            setFormTitle(data.title)
          }
        }
      } catch (err) {
        console.warn('Gagal mengambil metadata otomatis:', err)
      } finally {
        setIsFetchingMetadata(false)
      }
    }
  }

  // Handle Upload Foto Cover Langsung dari Komputer / HP
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar yang valid (JPG, PNG, atau WebP).')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormThumbnail(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit Simpan (Tambah / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    const effectiveCategory =
      formCategory === 'Lainnya' ? customCategory.trim() || 'Umum' : formCategory

    const cleanCreator = formCreator.trim()
      ? formCreator.startsWith('@')
        ? formCreator.trim()
        : `@${formCreator.trim()}`
      : '@kreator_sukabumi'

    // Buat tautan medsos otomatis jika belum diisi lengkap
    let finalSocialUrl = formSocialUrl.trim()
    if (!finalSocialUrl) {
      const username = cleanCreator.replace('@', '')
      if (formPlatform === 'tiktok') {
        finalSocialUrl = `https://www.tiktok.com/@${username}`
      } else if (formPlatform === 'youtube') {
        finalSocialUrl = `https://www.youtube.com/@${username}`
      } else {
        finalSocialUrl = `https://www.instagram.com/${username}`
      }
    }

    const finalThumbnail = formThumbnail.trim() || DEFAULT_REEL_COVER

    if (editingReel) {
      // Mode Edit
      const updated = reels.map((r) =>
        r.id === editingReel.id
          ? {
              ...r,
              title: formTitle.trim(),
              category: effectiveCategory,
              creator: cleanCreator,
              platform: formPlatform,
              socialUrl: finalSocialUrl,
              location: formLocation.trim() || 'Sukabumi',
              thumbnailUrl: finalThumbnail,
            }
          : r
      )
      persistReels(updated, `Video Reels "${formTitle.trim()}" berhasil diperbarui!`)
    } else {
      // Mode Tambah Baru
      const newReel: Reel = {
        id: `reel-${Date.now()}`,
        title: formTitle.trim(),
        category: effectiveCategory,
        creator: cleanCreator,
        platform: formPlatform,
        socialUrl: finalSocialUrl,
        location: formLocation.trim() || 'Sukabumi',
        thumbnailUrl: finalThumbnail,
        viewsCount: '0',
        imageAlt: formTitle.trim(),
      }
      const updated = [newReel, ...reels]
      persistReels(updated, `Video Reels "${formTitle.trim()}" berhasil ditambahkan!`)
    }

    setIsModalOpen(false)
  }

  // Hapus Video Reels
  const handleDeleteReel = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus video Reels "${title}"?`)) {
      const updated = reels.filter((r) => r.id !== id)
      persistReels(updated, `Video Reels "${title}" telah dihapus.`)
    }
  }

  // Kategori List
  const categories = useMemo(() => {
    const set = new Set<string>()
    reels.forEach((r) => {
      if (r.category) set.add(r.category)
    })
    return Array.from(set)
  }, [reels])

  // Filtered Reels
  const filteredReels = useMemo(() => {
    return reels.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = r.title.toLowerCase().includes(q)
        const matchCreator = r.creator?.toLowerCase().includes(q)
        const matchLoc = r.location?.toLowerCase().includes(q)
        if (!matchTitle && !matchCreator && !matchLoc) return false
      }
      if (selectedCategory !== 'semua' && r.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false
      }
      return true
    })
  }, [reels, searchQuery, selectedCategory])

  const renderPlatformBadge = (platform?: string) => {
    const p = platform?.toLowerCase()
    if (p === 'tiktok') {
      return (
        <span className="w-5 h-5 rounded bg-black flex items-center justify-center text-[#25F4EE] shadow-2xs">
          <FaTiktok className="w-2.5 h-2.5" />
        </span>
      )
    }
    if (p === 'youtube') {
      return (
        <span className="w-5 h-5 rounded bg-[#FF0000] flex items-center justify-center text-white shadow-2xs">
          <FaYoutube className="w-2.5 h-2.5" />
        </span>
      )
    }
    return (
      <span className="w-5 h-5 rounded bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-2xs">
        <FaInstagram className="w-2.5 h-2.5" />
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Header Bersih & Aksi Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Wave Reels</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {reels.length} Konten
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kurasi video kreasi kreator Sukabumi. Warga dapat menjelajahi video dan langsung terhubung ke konten asli media sosial kreator.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/reels"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Lihat Galeri Publik</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Video Reels</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Kartu Metrik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Video Reels</span>
          <p className="text-2xl font-bold font-heading text-slate-900">{reels.length}</p>
          <p className="text-[11px] text-slate-500">Tayang di galeri publik &amp; beranda portal</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Kategori Kurasi</span>
          <p className="text-2xl font-bold font-heading text-slate-900">{categories.length}</p>
          <p className="text-[11px] text-slate-500">Kuliner, Wisata, Lifestyle, dll</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Integrasi Kreator</span>
          <p className="text-2xl font-bold font-heading text-slate-900">Direct Link</p>
          <p className="text-[11px] text-slate-500 font-medium">Instagram, TikTok, &amp; YouTube</p>
        </div>
      </div>

      {/* 3. Bar Pencarian, Filter Kategori, & Switch View */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Input Pencarian */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul video, @kreator, atau lokasi..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
            />
          </div>

          {/* Toggle View Mode: Grid 9:16 vs Tabel */}
          <div className="flex items-center gap-1 self-end sm:self-auto border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid Video 9:16"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Grid 9:16</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel Ringkas"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Tabel</span>
            </button>
          </div>
        </div>

        {/* Filter Kategori Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('semua')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 ${
              selectedCategory === 'semua'
                ? 'bg-[#c00015] text-white shadow-2xs font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua ({reels.length})
          </button>
          {categories.map((cat) => {
            const count = reels.filter((r) => r.category?.toLowerCase() === cat.toLowerCase()).length
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#c00015] text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Konten Utama: Grid 9:16 atau Tabel Ringkas */}
      {filteredReels.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
          <Film className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-heading font-semibold text-slate-800 text-sm">Tidak ada video Reels ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau pilih filter kategori lain.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= TAMPILAN GRID VISUAL 9:16 ================= */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredReels.map((reel) => {
            const socialTarget = reel.socialUrl || `https://instagram.com/${(reel.creator || 'jurnalwave').replace('@', '')}`

            return (
              <div
                key={reel.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col group transition hover:shadow-md"
              >
                {/* Thumbnail 9:16 dengan Overlay Info */}
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_REEL_COVER
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50" />

                  {/* Top Chips: Kategori & Badge Medsos */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 text-[10px] z-10">
                    <span className="font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white border border-white/20">
                      {!reel.category || reel.category === '-' ? 'Berita' : reel.category}
                    </span>
                    {renderPlatformBadge(reel.platform || (reel.socialUrl?.includes('tiktok') ? 'tiktok' : reel.socialUrl?.includes('youtube') ? 'youtube' : 'instagram'))}
                  </div>

                  {/* Tombol Tengah (Play Video Medsos) - Selaras 100% dengan Beranda */}
                  <a
                    href={socialTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center text-white/90 group-hover:text-white z-0 cursor-pointer"
                    title={`Buka postingan ${reel.creator} di media sosial`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#c00015] group-hover:border-[#c00015] transition shadow-lg">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </a>

                  {/* Bottom Overlay Info */}
                  <div className="absolute bottom-2.5 inset-x-2.5 space-y-1 text-white z-10 pointer-events-none">
                    <h3 className="font-heading font-bold text-xs line-clamp-2 leading-tight drop-shadow-xs">
                      {reel.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-white/90 pt-0.5">
                      <a
                        href={socialTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:underline truncate max-w-[120px] pointer-events-auto flex items-center gap-1 text-white"
                        title={`Buka profil ${reel.creator}`}
                      >
                        <span>{reel.creator}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-white/70" />
                      </a>
                      {reel.location && (
                        <span className="text-[9px] text-white/70 truncate max-w-[70px]">
                          {reel.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={socialTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 hover:text-[#c00015] hover:bg-slate-200/70 text-[11px] font-semibold transition cursor-pointer"
                    title="Buka Link Medsos Asli"
                  >
                    <ExternalLink className="w-3 h-3 text-[#c00015]" />
                    <span>Medsos</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewReel(reel)}
                      className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
                      title="Lihat Pratinjau Kartu"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(reel)}
                      className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
                      title="Edit Data Reels"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReel(reel.id, reel.title)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Video Reels"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ================= TAMPILAN TABEL DATA ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 pl-4 pr-3 whitespace-nowrap w-[80px]">Cover</th>
                  <th className="py-3 px-3">Judul Video</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[100px]">Kategori</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[160px]">Kreator &amp; Medsos</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[120px]">Lokasi</th>
                  <th className="py-3 pl-2 pr-4 whitespace-nowrap w-[120px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReels.map((reel) => {
                  const socialTarget = reel.socialUrl || `https://instagram.com/${(reel.creator || 'jurnalwave').replace('@', '')}`

                  return (
                    <tr key={reel.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Thumbnail Mini 9:16 */}
                      <td className="py-2.5 pl-4 pr-3 align-middle">
                        <div
                          onClick={() => setPreviewReel(reel)}
                          className="w-11 h-14 rounded-md overflow-hidden bg-slate-900 border border-slate-200 relative group cursor-pointer shrink-0"
                        >
                          {/* eslint-disable-next-img-element */}
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_REEL_COVER
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>

                      {/* Judul Video */}
                      <td className="py-2.5 px-3 align-middle min-w-0">
                        <p className="font-heading font-semibold text-slate-900 truncate">
                          {reel.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {reel.id}
                        </p>
                      </td>

                      {/* Kategori */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {reel.category || 'Reels'}
                        </span>
                      </td>

                      {/* Kreator & Link Medsos */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5">
                          {renderPlatformBadge(reel.platform || (reel.socialUrl?.includes('tiktok') ? 'tiktok' : reel.socialUrl?.includes('youtube') ? 'youtube' : 'instagram'))}
                          <a
                            href={socialTarget}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-[#c00015] hover:underline"
                            title="Buka postingan asli di media sosial"
                          >
                            <span>{reel.creator}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        </div>
                      </td>

                      {/* Lokasi */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap align-middle text-slate-600 text-[11px] truncate">
                        {reel.location || '-'}
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 pl-2 pr-4 whitespace-nowrap text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1">
                          <a
                            href={socialTarget}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-slate-400 hover:text-[#c00015] hover:bg-slate-100 transition cursor-pointer"
                            title="Buka Postingan Medsos Asli"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setPreviewReel(reel)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Lihat Pratinjau Kartu"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(reel)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReel(reel.id, reel.title)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH / EDIT VIDEO REELS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                  {editingReel ? 'Edit Konten Wave Reels' : 'Tambah Konten Wave Reels Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body - Terfokus pada Kurasi Medsos & Auto Thumbnail */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* 1. Tautan Postingan Medsos (Cerdas: Auto Detect Platform & Auto Fetch Cover) */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-[#c00015]" />
                    <span>Link Video Medsos (TikTok / Instagram / YouTube Shorts) *</span>
                  </label>
                  {isFetchingMetadata ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Mengambil data...
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#c00015] bg-[#c00015]/10 px-2 py-0.5 rounded">
                      Wajib
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formSocialUrl}
                    onChange={(e) => handleSocialUrlChange(e.target.value)}
                    placeholder="Tempel tautan video di sini: https://vt.tiktok.com/... atau https://youtube.com/shorts/..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#c00015] transition font-mono pr-8"
                  />
                  {isFetchingMetadata && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c00015]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Cukup tempel tautan video, sistem otomatis mendeteksi platform, kreator, dan mengambil cover video aslinya.
                </p>
              </div>

              {/* 2. Judul Video Reels */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Judul Video Reels <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Siswa SDN Cikole Raih Prestasi di Ajang Kreativitas Pelajar Sukabumi"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#c00015] transition"
                />
              </div>

              {/* 3. Kategori Video (Dropdown Simpel & Bersih + Ketik Manual Jika 'Lainnya') */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Kategori Video <span className="text-[#c00015]">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#c00015] transition font-medium"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {formCategory === 'Lainnya' && (
                  <div className="pt-1.5">
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Ketik nama kategori baru (contoh: Prestasi Siswa, Loker Sukabumi, dll)..."
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#c00015]/40 rounded-lg text-slate-900 focus:outline-none focus:border-[#c00015] transition font-medium"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* 4. Platform, Akun Kreator & Lokasi Spot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Platform Medsos</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] transition font-semibold"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="youtube">YouTube Shorts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">
                    Nama Akun Kreator <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCreator}
                    onChange={(e) => setFormCreator(e.target.value)}
                    placeholder="Contoh: @jurnalsukabumi"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Lokasi Spot</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Misal: Kota Sukabumi"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                  />
                </div>
              </div>

              {/* 5. Cover Thumbnail (Otomatis dari Video + Opsi Upload Manual) */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#c00015]" />
                    <span>Cover Thumbnail Video</span>
                  </label>
                  {formThumbnail ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> Cover Siap
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Otomatis dari video</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-600 flex-1">
                    {formThumbnail
                      ? 'Cover video berhasil diambil otomatis dari tautan. Anda juga dapat menggantinya dengan foto cover dari perangkat jika diinginkan.'
                      : 'Cover otomatis diekstrak saat Anda menempelkan tautan video TikTok, YouTube Shorts, atau Instagram.'}
                  </p>
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold transition cursor-pointer shadow-2xs shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c00015]" />
                    <span>Pilih Foto dari Perangkat</span>
                  </button>
                </div>
              </div>

              {/* 6. Pratinjau Tampilan Beranda (Harmonis & Clean) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-16 sm:w-20 aspect-[9/16] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 relative shrink-0 shadow-xs">
                  {formThumbnail ? (
                    // eslint-disable-next-img-element
                    <img
                      src={formThumbnail}
                      alt="Preview Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_REEL_COVER
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  {/* Gradient Overlay Selaras 100% dengan Beranda */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 flex flex-col justify-between p-1.5 pointer-events-none">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[7px] font-semibold text-white bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/20 leading-none truncate max-w-[55px]">
                        {formCategory === 'Lainnya' ? customCategory || 'Lainnya' : formCategory}
                      </span>
                      {renderPlatformBadge(formPlatform)}
                    </div>

                    <div className="text-[8px] text-white leading-tight space-y-0.5">
                      <p className="font-semibold text-white/80 text-[7px] truncate">{formCreator || '@kreator'}</p>
                      <p className="font-bold line-clamp-1">{formTitle || 'Judul Video'}</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      Pratinjau Tampilan Beranda
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono capitalize">
                      {formPlatform}
                    </span>
                  </div>
                  <p className="font-heading font-bold text-slate-900 text-xs truncate">
                    {formTitle || 'Judul Video Reels'}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px] truncate">
                    {formCreator || '@kreator'} • {formLocation || 'Sukabumi'} • <span className="text-[#c00015] font-semibold">{formCategory === 'Lainnya' ? (customCategory || 'Lainnya') : formCategory}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 font-normal pt-0.5">
                    Tampilan kartu ini akan muncul langsung di bagian <strong>Wave Reels</strong> beranda portal.
                  </p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  {editingReel ? 'Simpan Perubahan' : 'Terbitkan Video Reels'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PRATINJAU KARTU REELS LENGKAP ================= */}
      {previewReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xs w-full aspect-[9/16] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
            {/* Tombol Tutup */}
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer border border-white/20"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Gambar Cover Vertikal */}
            <div className="absolute inset-0">
              {/* eslint-disable-next-img-element */}
              <img
                src={previewReel.thumbnailUrl}
                alt={previewReel.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_REEL_COVER
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 pointer-events-none" />
            </div>

            {/* Top Bar Preview */}
            <div className="relative z-10 p-3.5 flex items-center justify-between text-white text-xs">
              <span className="text-[10px] font-semibold tracking-wide text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20">
                {previewReel.category || 'Berita'}
              </span>

              {renderPlatformBadge(previewReel.platform || (previewReel.socialUrl?.includes('tiktok') ? 'tiktok' : previewReel.socialUrl?.includes('youtube') ? 'youtube' : 'instagram'))}
            </div>

            {/* Bottom Content Preview & Tombol Buka Medsos */}
            <div className="relative z-10 p-4 space-y-2.5 text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white/90 block">
                  {previewReel.creator}
                </span>

                <p className="text-sm font-heading font-bold leading-snug drop-shadow-sm">
                  {previewReel.title}
                </p>

                {previewReel.location && (
                  <p className="text-[11px] text-white/75 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#c00015]" />
                    <span>{previewReel.location}</span>
                  </p>
                )}
              </div>

              {/* Tombol CTA Buka Postingan Asli */}
              <a
                href={previewReel.socialUrl || `https://instagram.com/${(previewReel.creator || 'jurnalwave').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <span>Buka Postingan Asli Medsos</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
