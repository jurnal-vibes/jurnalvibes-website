'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Newspaper,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  Pin,
  Calendar,
  User,
  Layers,
  ArrowRight,
  Save,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { Article, ArticleCategory } from '@/types'

// Daftar Kategori Resmi Jurnal Wave beserta nama tampilannya
const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  berita: 'Berita',
  lifestyle: 'Lifestyle',
  loker: 'Lowongan Kerja',
  otomotif: 'Otomotif',
  sport: 'Sport & E-Sport',
  tech: 'Teknologi',
  science: 'Science',
  health: 'Health',
  kuliner: 'Kuliner',
  wisata: 'Wisata',
  hiburan: 'Hiburan & Seni',
}

const OFFICIAL_CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'berita', label: 'Berita' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'loker', label: 'Lowongan Kerja (Loker)' },
  { value: 'otomotif', label: 'Otomotif' },
  { value: 'sport', label: 'Sport & E-Sport' },
  { value: 'tech', label: 'Teknologi' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
  { value: 'kuliner', label: 'Kuliner' },
  { value: 'wisata', label: 'Wisata' },
  { value: 'hiburan', label: 'Hiburan & Seni' },
]

const formatSubCategory = (sub: string) => {
  if (!sub) return ''
  const trimmed = sub.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

export default function AdminBeritaPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('semua')
  const [selectedFilter, setSelectedFilter] = useState<string>('semua')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Form State untuk Tambah Berita Baru
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<ArticleCategory>('berita')
  const [newSubCategory, setNewSubCategory] = useState('')
  const [newExcerpt, setNewExcerpt] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageCaption, setNewImageCaption] = useState('')
  const [newReporter, setNewReporter] = useState('')
  const [newRedaktur, setNewRedaktur] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newIsHero, setNewIsHero] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Helper otomatis ekstrak 1-2 kalimat pertama dari isi berita untuk ringkasan/subjudul di bawah judul
  const extractAutoExcerpt = (text: string): string => {
    if (!text.trim()) return ''
    const clean = text.replace(/\s+/g, ' ').trim()
    const sentences = clean.match(/[^.!?]+[.!?]+/g)
    if (sentences && sentences.length > 0) {
      const firstTwo = sentences.slice(0, 2).join(' ').trim()
      return firstTwo.length > 220 ? firstTwo.slice(0, 220) + '...' : firstTwo
    }
    return clean.slice(0, 180) + (clean.length > 180 ? '...' : '')
  }

  // Helper kompres dan konversi gambar ke Base64 optimal
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          const maxDimension = 1200
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            } else {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.82))
          } else {
            resolve(e.target?.result as string)
          }
        }
        img.onerror = () => reject(new Error('Gagal memproses berkas gambar'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Gagal membaca berkas'))
      reader.readAsDataURL(file)
    })
  }

  // Handle Upload Foto Berita Baru
  const handleImageUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const base64 = await compressImage(file)
      setNewImageUrl(base64)
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Gagal memproses foto. Silakan coba file gambar lain.')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Upload Foto Saat Edit Berita
  const handleImageUploadEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingArticle) return
    try {
      setIsUploading(true)
      const base64 = await compressImage(file)
      setEditingArticle({ ...editingArticle, imageUrl: base64 })
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Gagal memproses foto. Silakan coba file gambar lain.')
    } finally {
      setIsUploading(false)
    }
  }

  // Muat artikel dari MySQL (dengan fallback localStorage)
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await fetch('/api/articles')
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setArticles(json.data)
            if (typeof window !== 'undefined') {
              localStorage.setItem('jurnal_wave_articles', JSON.stringify(json.data))
            }
            return
          }
        }
      } catch (err) {
        console.warn('Gagal memuat artikel dari MySQL, menggunakan fallback lokal:', err)
      }

      // Fallback local storage jika offline
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed)
              return
            }
          }
        } catch {}
      }
      setArticles([])
    }

    loadArticles()
  }, [])

  // Helper simpan ke localStorage
  const persistArticles = (updated: Article[]) => {
    setArticles(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_articles', JSON.stringify(updated))
        // Kirim event realtime agar seluruh tab/halaman publik langsung tersinkron
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving articles to localStorage:', err)
      }
    }
  }

  // Kategori unik
  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [articles])

  // Filter Artikel
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = a.title?.toLowerCase().includes(q)
        const matchAuthor = a.author?.toLowerCase().includes(q)
        const matchReporter = a.reporter?.toLowerCase().includes(q)
        const matchCategory = a.category?.toLowerCase().includes(q)
        if (!matchTitle && !matchAuthor && !matchReporter && !matchCategory) return false
      }

      // 2. Kategori
      if (selectedCategory !== 'semua' && a.category !== selectedCategory) {
        return false
      }

      // 3. Filter Khusus
      if (selectedFilter === 'hero' && !a.isHero) return false

      return true
    })
  }, [articles, searchQuery, selectedCategory, selectedFilter])

  // Hitung jumlah
  const totalCount = articles.length
  const heroCount = articles.filter((a) => a.isHero).length

  // Handle Simpan Berita Baru ke MySQL
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    let finalCategoryLabel = (CATEGORY_DISPLAY_MAP[newCategory] || newCategory).toUpperCase()
    if (newCategory === 'berita') {
      if (newSubCategory === 'kampus') finalCategoryLabel = 'KAMPUS'
      else if (newSubCategory === 'sekolah') finalCategoryLabel = 'SEKOLAH'
      else if (newSubCategory === 'daerah') finalCategoryLabel = 'BERITA DAERAH'
      else finalCategoryLabel = 'BERITA'
    } else if (newCategory === 'lifestyle') {
      if (newSubCategory === 'style') finalCategoryLabel = 'STYLE & FASHION'
      else if (newSubCategory === 'culinary') finalCategoryLabel = 'KULINER'
      else if (newSubCategory === 'traveling') finalCategoryLabel = 'TRAVELING'
      else finalCategoryLabel = 'LIFESTYLE'
    }

    const autoExcerpt = newExcerpt.trim() || extractAutoExcerpt(newContent) || newTitle.trim()
    const parsedTags = newTags.trim()
      ? newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
      : ['#BERITA', '#JurnalWave', `#${newCategory.toUpperCase()}`]

    const payload = {
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: finalCategoryLabel,
      subCategory: newSubCategory || undefined,
      excerpt: autoExcerpt,
      content: newContent.trim() || autoExcerpt,
      imageUrl:
        newImageUrl.trim() ||
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      imageCaption: newImageCaption.trim() || undefined,
      imageAlt: newImageCaption.trim() || undefined,
      author: 'Tim Redaksi',
      reporter: newReporter.trim() || 'Fajar Pratama',
      redaktur: newRedaktur.trim() || 'Ujang Herlan',
      tags: parsedTags,
      isHero: newIsHero,
      isEditorsPick: false,
    }

    let createdArticle: Article | null = null

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          createdArticle = json.data
        }
      }
    } catch (err) {
      console.warn('Gagal simpan ke database, menyimpan ke local storage:', err)
    }

    if (!createdArticle) {
      createdArticle = {
        id: `art-${Date.now()}`,
        ...payload,
        slug: newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
        author: 'Tim Redaksi',
        redaktur: newRedaktur.trim() || 'Ujang Herlan',
        reporter: newReporter.trim() || 'Fajar Pratama',
        readTime: '3 min read',
        createdAt: 'Baru saja',
        publishedDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      }
    }

    const updated = [createdArticle, ...articles]
    persistArticles(updated)
    setIsCreateModalOpen(false)

    // Reset Form
    setNewTitle('')
    setNewCategory('berita')
    setNewSubCategory('')
    setNewExcerpt('')
    setNewContent('')
    setNewImageUrl('')
    setNewImageCaption('')
    setNewReporter('')
    setNewRedaktur('')
    setNewTags('')
    setNewIsHero(false)

    setToastMessage('Berita berhasil diterbitkan ke database!')
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Buka Modal Edit
  const handleOpenEdit = (article: Article) => {
    setEditingArticle({ ...article })
    setIsEditModalOpen(true)
  }

  // Handle Simpan Hasil Edit ke Database
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArticle || !editingArticle.title.trim()) return

    let finalCategoryLabel = (CATEGORY_DISPLAY_MAP[editingArticle.category] || editingArticle.category).toUpperCase()
    const sub = (editingArticle.subCategory || '').toLowerCase()
    if (editingArticle.category === 'berita') {
      if (sub === 'kampus') finalCategoryLabel = 'KAMPUS'
      else if (sub === 'sekolah') finalCategoryLabel = 'SEKOLAH'
      else if (sub === 'daerah') finalCategoryLabel = 'BERITA DAERAH'
      else finalCategoryLabel = 'BERITA'
    } else if (editingArticle.category === 'lifestyle') {
      if (sub === 'style') finalCategoryLabel = 'STYLE & FASHION'
      else if (sub === 'culinary') finalCategoryLabel = 'KULINER'
      else if (sub === 'traveling') finalCategoryLabel = 'TRAVELING'
      else finalCategoryLabel = 'LIFESTYLE'
    }

    const autoExcerpt = editingArticle.excerpt?.trim() || extractAutoExcerpt(editingArticle.content || '') || editingArticle.title
    const captionVal = editingArticle.imageCaption?.trim() || editingArticle.imageAlt?.trim() || undefined
    const updatedArticle = {
      ...editingArticle,
      imageCaption: captionVal,
      imageAlt: captionVal,
      categoryLabel: finalCategoryLabel,
      excerpt: autoExcerpt,
      slug:
        editingArticle.slug ||
        editingArticle.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
    }

    try {
      await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle),
      })
    } catch (err) {
      console.warn('Gagal update ke database:', err)
    }

    const updated = articles.map((a) =>
      a.id === editingArticle.id ? updatedArticle : a
    )

    persistArticles(updated)
    setIsEditModalOpen(false)
    setEditingArticle(null)

    setToastMessage(`Perubahan artikel "${editingArticle.title}" berhasil disimpan!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Hapus Berita dari Database
  const handleDeleteArticle = async (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus artikel: "${title}"?`)) {
      try {
        await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        })
      } catch (err) {
        console.warn('Gagal menghapus dari database:', err)
      }

      const updated = articles.filter((a) => a.id !== id)
      persistArticles(updated)
      setToastMessage('Artikel berhasil dihapus dari database!')
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Cepat: Toggle Headline / Hero ke Database
  const handleToggleHero = async (id: string) => {
    const target = articles.find((a) => a.id === id)
    if (!target) return
    const newHeroState = !target.isHero

    const updated = articles.map((a) =>
      a.id === id ? { ...a, isHero: newHeroState } : a
    )
    persistArticles(updated)

    try {
      await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isHero: newHeroState }),
      })
    } catch (err) {
      console.warn('Gagal sinkron status Hero ke database:', err)
    }

    setToastMessage(
      newHeroState
        ? 'Artikel dimasukkan ke Headline Slider Beranda!'
        : 'Artikel dicabut dari Headline Slider.'
    )
    setTimeout(() => setToastMessage(null), 3000)
  }


  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Manajemen Berita &amp; Konten Media
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tulis berita baru, edit artikel, kelola status headline slider beranda, dan publikasi portal Jurnal Wave.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Berita Baru</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:underline font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Kartu Metrik Ringkas Konten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Artikel Terbit</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Headline Slider Beranda</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{heroCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Pin className="w-5 h-5 -rotate-45" />
          </div>
        </div>
      </div>

      {/* 3. Panel Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Status Cepat */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'semua'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Berita ({totalCount})
            </button>
            <button
              onClick={() => setSelectedFilter('hero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'hero'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Headline Slider ({heroCount})
            </button>
          </div>

          {/* Search Bar & Dropdown Kategori */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              {OFFICIAL_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul berita..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabel Daftar Berita */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredArticles.length}</strong> artikel
          </span>
          <span className="text-[11px]">Dapat langsung diedit, diubah headline, atau dihapus</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Newspaper className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Tidak ada artikel yang sesuai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Artikel &amp; Thumbnail</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Reporter &amp; Editor</th>
                  <th className="py-3 px-4">Posisi Tayang</th>
                  <th className="py-3 px-4">Tanggal Rilis</th>
                  <th className="py-3 px-4 text-center">Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail & Judul */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold text-slate-900 line-clamp-1">
                            {article.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kategori Rubrik */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const catKey = (article.category || '').toLowerCase().trim()
                        const categoryLabel = CATEGORY_DISPLAY_MAP[catKey] || article.category

                        const mainCat = catKey
                        const mainLabel = (CATEGORY_DISPLAY_MAP[catKey] || '').toLowerCase().trim()
                        const rawSub = (article.subCategory || '').trim()
                        const subLower = rawSub.toLowerCase()

                        const hasSubCategory =
                          rawSub &&
                          subLower !== mainCat &&
                          subLower !== mainLabel &&
                          subLower !== 'tech' &&
                          subLower !== 'teknologi' &&
                          subLower !== 'berita'

                        return (
                          <div className="flex flex-col items-center w-fit gap-0.5">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                              {categoryLabel}
                            </span>
                            {hasSubCategory && (
                              <span className="text-[10px] text-slate-400 font-medium capitalize text-center">
                                {rawSub.toLowerCase()}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>

                    {/* Reporter & Editor (Gaya SukabumiUpdate) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <p className="font-semibold text-slate-900 flex items-center gap-1">
                          <span className="text-[10px] font-normal text-slate-400">Oleh:</span>{' '}
                          {article.reporter || article.author || 'Tim Redaksi'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="text-[10px] font-bold text-[#c00015]">EDITOR:</span>{' '}
                          {article.redaktur || article.editor || 'Ujang Herlan'}
                        </p>
                      </div>
                    </td>

                    {/* Tombol Cepat Posisi Tayang */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Hero Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleHero(article.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer select-none active:scale-95 ${
                            article.isHero
                              ? 'bg-[#c00015] hover:bg-[#a00012] text-white shadow-2xs'
                              : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title={
                            article.isHero
                              ? 'Headline aktif (Klik untuk matikan / jadikan Berita Feed reguler)'
                              : 'Klik untuk mengaktifkan ke Headline Slider Beranda'
                          }
                        >
                          <Pin
                            className={`w-3.5 h-3.5 -rotate-45 ${
                              article.isHero ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span>{article.isHero ? 'Headline Slider' : 'Berita Feed'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {article.publishedDate || '26 Okt 2024'}
                    </td>

                    {/* Aksi Nyata: Edit, Baca di Web, Hapus */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {/* Tombol Edit Nyata Berfungsi */}
                        <button
                          onClick={() => handleOpenEdit(article)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Berita Ini"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Buka Tampilan Publik */}
                        <Link
                          href={`/artikel/${article.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Lihat Tampilan Warga di Portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Edit Berita (Nyata Berfungsi Penuh) */}
      {isEditModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Edit Berita: <span className="text-slate-600 font-normal truncate max-w-xs">{editingArticle.title}</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingArticle(null)
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Judul Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Berita: <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Kategori, Sub-Kategori & Reporter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Utama:
                  </label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        category: e.target.value as ArticleCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    {OFFICIAL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sub-Kategori:
                  </label>
                  {editingArticle.category === 'berita' ? (
                    <select
                      value={editingArticle.subCategory || ''}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          subCategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      <option value="">Semua Berita</option>
                      <option value="kampus">Kampus</option>
                      <option value="sekolah">Sekolah</option>
                    </select>
                  ) : editingArticle.category === 'lifestyle' ? (
                    <select
                      value={editingArticle.subCategory || ''}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          subCategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      <option value="">Semua Lifestyle</option>
                      <option value="style">Style</option>
                      <option value="culinary">Culinary</option>
                      <option value="traveling">Traveling</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="Tidak ada sub-kategori"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reporter / Penulis (Tampil di Atas: "Oleh: ..."):
                  </label>
                  <input
                    type="text"
                    value={editingArticle.reporter || ''}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, reporter: e.target.value })
                    }
                    placeholder="Contoh: Ilham Nugraha / Asep Awaludin"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* Redaktur & Tagar Berita */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Editor / Redaktur (Tampil di Bawah: "EDITOR: ..."):
                  </label>
                  <input
                    type="text"
                    value={editingArticle.redaktur || ''}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, redaktur: e.target.value })
                    }
                    placeholder="Contoh: Denis Febrian / Ujang Herlan"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tagar Berita (TAG):
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editingArticle.tags) ? editingArticle.tags.join(', ') : (editingArticle.tags || '')}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) as any,
                      })
                    }
                    placeholder="Contoh: #BERITA, #Sukabumi, #Trending"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* Foto Thumbnail Berita (Bisa Upload atau Masukkan Link) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Foto Utama / Cover Berita:
                </label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 space-y-2.5">
                  {editingArticle.imageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-44 flex items-center justify-center group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingArticle.imageUrl}
                        alt="Preview Cover"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5 text-[#c00015]" />
                          <span>Ganti Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={handleImageUploadEdit}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingArticle({ ...editingArticle, imageUrl: '' })}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/95 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#c00015] bg-white rounded-xl py-5 px-4 cursor-pointer transition group text-center">
                      <div className="w-9 h-9 rounded-full bg-red-50 text-[#c00015] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        {isUploading ? 'Sedang memproses foto...' : 'Pilih Foto dari Komputer / HP'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        JPG, PNG, atau WebP (Otomatis dioptimalkan)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUploadEdit}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                        Atau tautan URL:
                      </span>
                      <input
                        type="url"
                        value={editingArticle.imageUrl?.startsWith('data:') ? '' : editingArticle.imageUrl}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, imageUrl: e.target.value })
                        }
                        placeholder={
                          editingArticle.imageUrl?.startsWith('data:')
                            ? '(Foto fisik terunggah dari perangkat)'
                            : 'https://images.unsplash.com/...'
                        }
                        className="flex-1 px-2.5 py-1 text-[11px] rounded-md bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#c00015]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Keterangan & Sumber Foto (Caption) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Keterangan & Sumber Foto (Caption):
                  </label>
                  <span className="text-[11px] text-slate-400">Opsional</span>
                </div>
                <input
                  type="text"
                  value={editingArticle.imageCaption || editingArticle.imageAlt || ''}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      imageCaption: e.target.value,
                      imageAlt: e.target.value,
                    })
                  }
                  placeholder="Contoh: Suasana peninjauan jalan di Sukabumi. (Foto: Dok. Humas Pemda / Sukabumi Update)"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  📌 <strong className="font-semibold text-slate-700">Instruksi:</strong> Tuliskan keterangan singkat foto beserta sumber asal (misal: <span className="italic">Foto: Dok. Istimewa</span> atau <span className="italic">Foto: Antara / Hendra</span>). Teks ini akan dimuat rapi tepat di bawah foto artikel seperti contoh portal SukabumiUpdate.
                </p>
              </div>

              {/* Isi Lengkap Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Isi Lengkap Berita: <span className="text-[#c00015]">*</span>
                </label>
                <textarea
                  rows={6}
                  value={editingArticle.content}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, content: e.target.value })
                  }
                  placeholder="Tuliskan naskah lengkap tubuh berita..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />
              </div>

              {/* Ringkasan / Lead Berita */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Ringkasan / Lead Berita:
                  </label>
                  <span className="text-[11px] text-slate-400">Opsional</span>
                </div>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                  }
                  placeholder="Ketik ringkasan, atau kosongkan agar otomatis menggunakan kalimat awal naskah..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Teks pengantar di bawah judul artikel. Jika dikosongkan, sistem otomatis menggunakan kalimat awal naskah.
                </p>
              </div>

              {/* Posisi Berita (Headline Slider) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={editingArticle.isHero || false}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        isHero: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#c00015] focus:ring-[#c00015] accent-[#c00015]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Tampilkan di Headline Slider Beranda</span>
                    <span className="text-[10px] text-slate-500">Berita akan masuk dalam deretan slider berita utama yang bergulir di bagian atas beranda.</span>
                  </div>
                </label>
              </div>

              {/* Tombol Simpan Edit */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingArticle(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Artikel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Tambah Berita Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Tulis Berita Baru Jurnal Wave
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Judul Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Berita: <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Perbaikan Jalur Lingkar Sukabumi Mulai Dikebut..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Kategori, Sub-Kategori & Reporter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Utama: <span className="text-[#c00015]">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value as ArticleCategory)
                      setNewSubCategory('')
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    {OFFICIAL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sub-Kategori:
                  </label>
                  {newCategory === 'berita' ? (
                    <select
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      <option value="">Semua Berita</option>
                      <option value="kampus">Kampus</option>
                      <option value="sekolah">Sekolah</option>
                    </select>
                  ) : newCategory === 'lifestyle' ? (
                    <select
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      <option value="">Semua Lifestyle</option>
                      <option value="style">Style</option>
                      <option value="culinary">Culinary</option>
                      <option value="traveling">Traveling</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="Tidak ada sub-kategori"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reporter / Penulis (Tampil di Atas: "Oleh: ..."):
                  </label>
                  <input
                    type="text"
                    value={newReporter}
                    onChange={(e) => setNewReporter(e.target.value)}
                    placeholder="Contoh: Ilham Nugraha / Asep Awaludin"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* Redaktur & Tagar Berita */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Editor / Redaktur (Tampil di Bawah: "EDITOR: ..."):
                  </label>
                  <input
                    type="text"
                    value={newRedaktur}
                    onChange={(e) => setNewRedaktur(e.target.value)}
                    placeholder="Contoh: Denis Febrian / Ujang Herlan"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tagar Berita (TAG):
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Contoh: #BERITA, #Sukabumi, #Trending"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* Foto Thumbnail Berita (Bisa Upload atau Masukkan Link) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Foto Utama / Cover Berita:
                </label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 space-y-2.5">
                  {newImageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-44 flex items-center justify-center group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newImageUrl}
                        alt="Preview Cover"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5 text-[#c00015]" />
                          <span>Ganti Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={handleImageUploadNew}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewImageUrl('')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/95 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#c00015] bg-white rounded-xl py-5 px-4 cursor-pointer transition group text-center">
                      <div className="w-9 h-9 rounded-full bg-red-50 text-[#c00015] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        {isUploading ? 'Sedang memproses foto...' : 'Pilih Foto dari Komputer / HP'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        JPG, PNG, atau WebP (Otomatis dioptimalkan)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUploadNew}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                        Atau tautan URL:
                      </span>
                      <input
                        type="url"
                        value={newImageUrl.startsWith('data:') ? '' : newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder={
                          newImageUrl.startsWith('data:')
                            ? '(Foto fisik terunggah dari perangkat)'
                            : 'https://images.unsplash.com/...'
                        }
                        className="flex-1 px-2.5 py-1 text-[11px] rounded-md bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#c00015]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Keterangan & Sumber Foto (Caption) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Keterangan & Sumber Foto (Caption):
                  </label>
                  <span className="text-[11px] text-slate-400">Opsional</span>
                </div>
                <input
                  type="text"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Contoh: Suasana peninjauan jalan di Sukabumi. (Foto: Dok. Humas Pemda / Sukabumi Update)"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  📌 <strong className="font-semibold text-slate-700">Instruksi:</strong> Tuliskan keterangan singkat foto beserta sumber asal (misal: <span className="italic">Foto: Dok. Istimewa</span> atau <span className="italic">Foto: Antara / Hendra</span>). Teks ini akan dimuat rapi tepat di bawah foto artikel seperti contoh portal SukabumiUpdate.
                </p>
              </div>

              {/* Isi Lengkap Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Isi Lengkap Berita: <span className="text-[#c00015]">*</span>
                </label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tuliskan naskah lengkap tubuh berita..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />
              </div>

              {/* Ringkasan / Lead Berita */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Ringkasan / Lead Berita:
                  </label>
                  <span className="text-[11px] text-slate-400">Opsional</span>
                </div>
                <textarea
                  rows={2}
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="Ketik ringkasan, atau kosongkan agar otomatis menggunakan kalimat awal naskah..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Teks pengantar di bawah judul artikel. Jika dikosongkan, sistem otomatis menggunakan kalimat awal naskah.
                </p>
              </div>

              {/* Pilihan Headline Slider */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={newIsHero}
                    onChange={(e) => setNewIsHero(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c00015] focus:ring-[#c00015] accent-[#c00015]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Tampilkan di Headline Slider Beranda</span>
                    <span className="text-[10px] text-slate-500">Berita akan masuk dalam deretan slider berita utama yang bergulir di bagian atas beranda.</span>
                  </div>
                </label>
              </div>

              {/* Tombol Terbitkan */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Terbitkan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
