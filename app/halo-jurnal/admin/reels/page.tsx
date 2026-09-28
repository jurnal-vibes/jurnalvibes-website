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
  Play,
  MapPin,
  User,
  LayoutGrid,
  List,
  Upload,
  Share2,
  Sparkles,
} from 'lucide-react'
import { DUMMY_REELS } from '@/data/dummyPolls'
import { Reel } from '@/types'

const CATEGORY_OPTIONS = ['Kuliner', 'Wisata', 'Lifestyle', 'Sport', 'Event', 'Budaya']

// Rekomendasi gambar thumbnail Sukabumi yang estetik jika user butuh cepat
const PRESET_THUMBNAILS = [
  { label: 'Kuliner Alun-Alun', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80' },
  { label: 'Bukit Baros Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80' },
  { label: 'Skatepark Lapang Merdeka', url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=700&q=80' },
  { label: 'Vintage Coffee Cikole', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80' },
  { label: 'Curug Cikaso Surade', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=700&q=80' },
  { label: 'Pantai Ujung Genteng', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80' },
]

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>(DUMMY_REELS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('semua')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const [previewReel, setPreviewReel] = useState<Reel | null>(null)

  // Form Fields (VIEWS MANUAL DIHAPUS TOTAL)
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Kuliner')
  const [formCreator, setFormCreator] = useState('')
  const [formPlatform, setFormPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')
  const [formSocialUrl, setFormSocialUrl] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formThumbnail, setFormThumbnail] = useState('')
  const [formVideoUrl, setFormVideoUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Muat Reels dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_reels')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReels(parsed)
            return
          }
        }
        localStorage.setItem('jurnal_wave_reels', JSON.stringify(DUMMY_REELS))
      } catch (err) {
        console.error('Error loading reels:', err)
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
    setFormCategory('Kuliner')
    setFormCreator('@exploresukabumi')
    setFormPlatform('instagram')
    setFormSocialUrl('https://instagram.com/exploresukabumi')
    setFormLocation('Sukabumi')
    setFormThumbnail(PRESET_THUMBNAILS[0].url)
    setFormVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-a-cliff-overlooking-the-sea-41551-large.mp4')
    setIsModalOpen(true)
  }

  // Buka Modal Edit
  const handleOpenEditModal = (reel: Reel) => {
    setEditingReel(reel)
    setFormTitle(reel.title)
    setFormCategory(reel.category || 'Kuliner')
    setFormCreator(reel.creator || '')
    setFormPlatform((reel.platform as any) || (reel.socialUrl?.includes('tiktok.com') ? 'tiktok' : reel.socialUrl?.includes('youtube.com') ? 'youtube' : 'instagram'))
    setFormSocialUrl(reel.socialUrl || (reel.creator ? `https://instagram.com/${reel.creator.replace('@', '')}` : ''))
    setFormLocation(reel.location || '')
    setFormThumbnail(reel.thumbnailUrl || '')
    setFormVideoUrl(reel.videoUrl || '')
    setIsModalOpen(true)
  }

  // Handle Upload Video Lokal
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFormVideoUrl(url)
    }
  }

  // Submit Simpan (Tambah / Edit) - Views dikalkulasi secara organik
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

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

    if (editingReel) {
      // Mode Edit
      const updated = reels.map((r) =>
        r.id === editingReel.id
          ? {
              ...r,
              title: formTitle.trim(),
              category: formCategory,
              creator: cleanCreator,
              platform: formPlatform,
              socialUrl: finalSocialUrl,
              location: formLocation.trim() || 'Sukabumi',
              thumbnailUrl: formThumbnail.trim() || PRESET_THUMBNAILS[0].url,
              videoUrl: formVideoUrl.trim() || undefined,
            }
          : r
      )
      persistReels(updated, `Video Reels "${formTitle.trim()}" berhasil diperbarui!`)
    } else {
      // Mode Tambah Baru (Views mulai dari 0 tayangan organik)
      const newReel: Reel = {
        id: `reel-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        creator: cleanCreator,
        platform: formPlatform,
        socialUrl: finalSocialUrl,
        location: formLocation.trim() || 'Sukabumi',
        thumbnailUrl: formThumbnail.trim() || PRESET_THUMBNAILS[0].url,
        videoUrl: formVideoUrl.trim() || undefined,
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

  return (
    <div className="space-y-6">
      {/* 1. Top Header Bersih & Aksi Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Vibes Reels</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {reels.length} Konten
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kurasi video kreasi kreator Sukabumi. Video dapat diputar langsung di web dengan tautan langsung ke akun medsos pembuatnya.
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

      {/* 2. Kartu Metrik Ringkasan (Bebas Angka Palsu) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Video Reels</span>
          <p className="text-2xl font-bold font-heading text-slate-900">{reels.length}</p>
          <p className="text-[11px] text-slate-500">Tayang di galeri publik &amp; beranda</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Kategori Kurasi</span>
          <p className="text-2xl font-bold font-heading text-slate-900">{categories.length}</p>
          <p className="text-[11px] text-slate-500">Kuliner, Wisata, Lifestyle, dll</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Sistem Tayangan</span>
          <p className="text-2xl font-bold font-heading text-slate-900">Hitung Otomatis</p>
          <p className="text-[11px] text-slate-500 font-medium">Views naik organik saat diputar warga</p>
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
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-2">
          <Film className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">Tidak ada video Reels ditemukan</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau pilih filter kategori lain.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= TAMPILAN GRID VISUAL 9:16 ================= */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredReels.map((reel) => {
            const socialTarget = reel.socialUrl || `https://instagram.com/${(reel.creator || 'jurnalvibes').replace('@', '')}`

            return (
              <div
                key={reel.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col group transition hover:shadow-md"
              >
                {/* Thumbnail 9:16 dengan Overlay Info */}
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/45" />

                  {/* Top Chips: Kategori & Tautan Medsos Kreator */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 text-[10px] z-10">
                    <span className="font-semibold px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs text-white border border-white/20">
                      {reel.category || 'Reels'}
                    </span>

                    {/* Tombol Langsung ke Akun Medsos Asli */}
                    <a
                      href={socialTarget}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-black/60 hover:bg-[#c00015] backdrop-blur-xs text-white/90 hover:text-white border border-white/20 transition cursor-pointer"
                      title={`Buka akun ${reel.creator} di media sosial`}
                    >
                      <span>Medsos</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* Tombol Play di Tengah (Klik untuk Putar Video Langsung) */}
                  <button
                    type="button"
                    onClick={() => setPreviewReel(reel)}
                    className="absolute inset-0 flex items-center justify-center text-white/90 group-hover:text-white z-0 cursor-pointer"
                    title="Klik untuk putar video di web"
                  >
                    <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-xs border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#c00015] group-hover:border-[#c00015] transition shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </button>

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
                        className="font-semibold hover:underline truncate max-w-[110px] pointer-events-auto flex items-center gap-0.5 text-white"
                        title={`Buka profil ${reel.creator}`}
                      >
                        <span>{reel.creator}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-white/70" />
                      </a>
                      <span className="font-mono text-white/70">
                        {reel.viewsCount ? `${reel.viewsCount}x` : '0x'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setPreviewReel(reel)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 text-[11px] font-semibold transition cursor-pointer"
                    title="Setel Video di Web"
                  >
                    <Play className="w-3 h-3 text-[#c00015]" />
                    <span>Putar</span>
                  </button>

                  <div className="flex items-center gap-1">
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
                  <th className="py-3 pl-4 pr-3 whitespace-nowrap w-[90px]">Cover</th>
                  <th className="py-3 px-3">Judul Video</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[110px]">Kategori</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[150px]">Kreator &amp; Medsos</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[120px]">Lokasi</th>
                  <th className="py-3 px-2 whitespace-nowrap w-[85px] text-center">Tayangan</th>
                  <th className="py-3 pl-2 pr-4 whitespace-nowrap w-[120px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReels.map((reel) => {
                  const socialTarget = reel.socialUrl || `https://instagram.com/${(reel.creator || 'jurnalvibes').replace('@', '')}`

                  return (
                    <tr key={reel.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Thumbnail Mini 9:16 */}
                      <td className="py-2.5 pl-4 pr-3 align-middle">
                        <div
                          onClick={() => setPreviewReel(reel)}
                          className="w-12 h-16 rounded-md overflow-hidden bg-slate-900 border border-slate-200 relative group cursor-pointer shrink-0"
                        >
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                            <Play className="w-3 h-3 fill-current" />
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
                        <span className="font-medium text-slate-700">
                          {reel.category || 'Reels'}
                        </span>
                      </td>

                      {/* Kreator & Link Medsos */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                        <a
                          href={socialTarget}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-[#c00015] hover:underline"
                          title="Buka profil asli di medsos"
                        >
                          <span>{reel.creator}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>

                      {/* Lokasi */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap align-middle text-slate-600 text-[11px] truncate">
                        {reel.location || '-'}
                      </td>

                      {/* Views (Organik) */}
                      <td className="py-2.5 px-2 whitespace-nowrap align-middle text-center font-mono font-semibold text-slate-700">
                        {reel.viewsCount ? `${reel.viewsCount}x` : '0x'}
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 pl-2 pr-4 whitespace-nowrap text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPreviewReel(reel)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Putar Video di Web"
                          >
                            <Play className="w-3.5 h-3.5 text-[#c00015]" />
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                  {editingReel ? 'Edit Video Reels' : 'Tambah Video Reels Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body - Bersih, Alur Kurasi Medsos Natural */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* 1. Judul Video */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Judul Video Reels <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Misal: Jajanan Hits Alun-Alun Sukabumi"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                />
              </div>

              {/* 2. Platform & Akun Kreator Pembuat Video */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Platform Medsos</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] transition font-semibold"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube Shorts</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700 block">
                    Nama Akun Kreator <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCreator}
                    onChange={(e) => setFormCreator(e.target.value)}
                    placeholder="@exploresukabumi"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition font-mono"
                  />
                </div>
              </div>

              {/* 3. Link Tautan Postingan / Profil Medsos Asli */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Link Postingan / Profil Medsos Asal (Tautan Tujuan Warga)
                </label>
                <input
                  type="url"
                  value={formSocialUrl}
                  onChange={(e) => setFormSocialUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/... atau https://www.tiktok.com/@..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Saat warga memencet nama akun di video, tautan medsos ini yang akan langsung dibuka.
                </p>
              </div>

              {/* 4. Kategori & Lokasi Spot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Lokasi Spot</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Misal: Cikole, Sukabumi"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                  />
                </div>
              </div>

              {/* 5. Sumber Video (Agar Warga Bisa Setel Video di Web) */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 block">
                    Sumber Video (Agar Bisa Diputar di Web)
                  </label>
                  <span className="text-[10px] text-slate-500">MP4 / WebM</span>
                </div>

                {/* Opsi Upload Langsung dari Perangkat */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pilih Berkas Video</span>
                  </button>
                  <span className="text-[11px] text-slate-500 truncate">
                    {formVideoUrl ? 'Video terpilih siap diputar' : 'Atau masukkan URL video di bawah'}
                  </span>
                </div>

                {/* Input URL Video */}
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#c00015] transition font-mono"
                />
              </div>

              {/* 6. Cover Thumbnail Vertikal */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Foto Cover Thumbnail (Vertikal 9:16) <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015] transition font-mono"
                />

                {/* Preset Cepat Foto Sukabumi */}
                <div className="pt-1">
                  <p className="text-[10px] text-slate-400 mb-1">Preset Cepat Foto Sukabumi:</p>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_THUMBNAILS.map((pst, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormThumbnail(pst.url)}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      >
                        {pst.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Live Player & Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-16 rounded-md overflow-hidden bg-slate-900 border border-slate-300 relative shrink-0">
                  {formThumbnail ? (
                    <img
                      src={formThumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as any).src = PRESET_THUMBNAILS[0].url)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{formTitle || 'Judul Video Reels'}</p>
                  <p className="text-slate-500 font-mono truncate">{formCreator || '@kreator'} • {formPlatform}</p>
                  <p className="text-slate-600 font-medium">✓ Siap diputar di web &amp; terhubung ke medsos asli</p>
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

      {/* ================= MODAL PRATINJAU VIDEO LANGSUNG DI WEB ================= */}
      {previewReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xs w-full aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
            {/* Tombol Tutup */}
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Video Player atau Fallback Cover */}
            <div className="absolute inset-0">
              {previewReel.videoUrl ? (
                <video
                  src={previewReel.videoUrl}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={previewReel.thumbnailUrl}
                  alt={previewReel.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/45 pointer-events-none" />
            </div>

            {/* Top Bar Preview */}
            <div className="relative z-10 p-3 flex items-center justify-between text-white text-xs">
              <span className="font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
                {previewReel.category || 'Vibes Reels'}
              </span>

              {/* Tautan Medsos di Preview */}
              <a
                href={previewReel.socialUrl || `https://instagram.com/${(previewReel.creator || 'jurnalvibes').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold bg-[#c00015] hover:bg-[#a00012] text-white px-2 py-0.5 rounded text-[10px] shadow transition"
              >
                <span>Buka di Medsos</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Bottom Caption Preview */}
            <div className="relative z-10 p-4 space-y-1.5 text-white">
              <div className="flex items-center gap-1.5">
                <a
                  href={previewReel.socialUrl || `https://instagram.com/${(previewReel.creator || 'jurnalvibes').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold hover:underline flex items-center gap-1"
                >
                  <span>{previewReel.creator}</span>
                  <ExternalLink className="w-3 h-3 text-white/70" />
                </a>
              </div>
              <p className="text-xs font-heading font-medium leading-snug line-clamp-2">
                {previewReel.title}
              </p>
              {previewReel.location && (
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#c00015]" />
                  <span>{previewReel.location}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
