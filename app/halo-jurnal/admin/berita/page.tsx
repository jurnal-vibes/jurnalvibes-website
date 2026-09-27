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
  Flame,
  Star,
  Calendar,
  User,
  Sparkles,
  Layers,
  ArrowRight,
  Save,
} from 'lucide-react'
import { DUMMY_ARTICLES } from '@/data/dummyArticles'
import { Article, ArticleCategory } from '@/types'

export default function AdminBeritaPage() {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES)
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
  const [newExcerpt, setNewExcerpt] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newReporter, setNewReporter] = useState('')
  const [newIsHero, setNewIsHero] = useState(false)
  const [newIsEditorsPick, setNewIsEditorsPick] = useState(false)

  // Muat artikel dari localStorage jika ada
  useEffect(() => {
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
        // Simpan default awal ke localStorage jika kosong
        localStorage.setItem('jurnal_wave_articles', JSON.stringify(DUMMY_ARTICLES))
      } catch (err) {
        console.error('Error loading articles from localStorage:', err)
      }
    }
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
      if (selectedFilter === 'editors' && !a.isEditorsPick) return false

      return true
    })
  }, [articles, searchQuery, selectedCategory, selectedFilter])

  // Hitung jumlah
  const totalCount = articles.length
  const heroCount = articles.filter((a) => a.isHero).length
  const editorsCount = articles.filter((a) => a.isEditorsPick).length

  // Handle Simpan Berita Baru
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const created: Article = {
      id: `art-${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      excerpt: newExcerpt.trim() || newTitle.trim(),
      content: newContent.trim() || newExcerpt.trim(),
      category: newCategory,
      categoryLabel: newCategory.toUpperCase(),
      imageUrl:
        newImageUrl.trim() ||
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      author: 'Tim Redaksi',
      reporter: newReporter.trim() || 'Redaksi Jurnal Wave',
      redaktur: 'Redaksi Pelaksana',
      tags: [newCategory],
      readTime: '3 min read',
      isHero: newIsHero,
      isEditorsPick: newIsEditorsPick,
      createdAt: 'Baru saja',
      publishedDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }

    const updated = [created, ...articles]
    persistArticles(updated)
    setIsCreateModalOpen(false)

    // Reset Form
    setNewTitle('')
    setNewCategory('berita')
    setNewExcerpt('')
    setNewContent('')
    setNewImageUrl('')
    setNewReporter('')
    setNewIsHero(false)
    setNewIsEditorsPick(false)

    setToastMessage('Berita berhasil ditambahkan dan langsung terbit di Jurnal Wave!')
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Buka Modal Edit
  const handleOpenEdit = (article: Article) => {
    setEditingArticle({ ...article })
    setIsEditModalOpen(true)
  }

  // Handle Simpan Hasil Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArticle || !editingArticle.title.trim()) return

    const updated = articles.map((a) =>
      a.id === editingArticle.id
        ? {
            ...editingArticle,
            slug:
              editingArticle.slug ||
              editingArticle.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, ''),
            categoryLabel: editingArticle.category.toUpperCase(),
          }
        : a
    )

    persistArticles(updated)
    setIsEditModalOpen(false)
    setEditingArticle(null)

    setToastMessage(`Perubahan artikel "${editingArticle.title}" berhasil disimpan!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Hapus Berita
  const handleDeleteArticle = (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus artikel: "${title}"?`)) {
      const updated = articles.filter((a) => a.id !== id)
      persistArticles(updated)
      setToastMessage('Artikel berhasil dihapus dari sistem.')
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Cepat: Toggle Headline / Hero
  const handleToggleHero = (id: string) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, isHero: !a.isHero } : a
    )
    persistArticles(updated)
    const target = updated.find((a) => a.id === id)
    setToastMessage(
      target?.isHero
        ? 'Artikel dijadikan Headline Utama (Hero)!'
        : 'Status Headline Utama dicabut.'
    )
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Cepat: Toggle Pilihan Redaksi
  const handleToggleEditorsPick = (id: string) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, isEditorsPick: !a.isEditorsPick } : a
    )
    persistArticles(updated)
    const target = updated.find((a) => a.id === id)
    setToastMessage(
      target?.isEditorsPick
        ? 'Artikel ditambahkan ke Pilihan Redaksi!'
        : 'Artikel dicabut dari Pilihan Redaksi.'
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
            Tulis berita baru, edit artikel, atur headline utama, dan kelola penerbitan portal Jurnal Wave.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <p className="text-xs text-slate-500 font-medium">Headline Utama (Hero)</p>
            <p className="text-2xl font-heading font-bold text-[#c00015] mt-1">{heroCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#c00015] flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pilihan Redaksi (Editor&apos;s Pick)</p>
            <p className="text-2xl font-heading font-bold text-amber-600 mt-1">{editorsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5" />
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
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Berita ({totalCount})
            </button>
            <button
              onClick={() => setSelectedFilter('hero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'hero'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Headline / Hero ({heroCount})
            </button>
            <button
              onClick={() => setSelectedFilter('editors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'editors'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Pilihan Redaksi ({editorsCount})
            </button>
          </div>

          {/* Search Bar & Dropdown Kategori */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer capitalize"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
                  <th className="py-3 px-4">Penulis &amp; Redaktur</th>
                  <th className="py-3 px-4">Posisi Tayang</th>
                  <th className="py-3 px-4">Tanggal Rilis</th>
                  <th className="py-3 px-4 text-right">Aksi Tindakan</th>
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

                    {/* Kategori */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded capitalize border border-slate-200">
                        {article.category}
                      </span>
                    </td>

                    {/* Penulis & Redaktur */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{article.reporter || article.author}</p>
                      <p className="text-[10px] text-slate-400">Red: {article.redaktur || 'Tim Redaksi'}</p>
                    </td>

                    {/* Tombol Cepat Posisi Tayang */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Hero Button */}
                        <button
                          onClick={() => handleToggleHero(article.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                            article.isHero
                              ? 'bg-red-50 text-[#c00015] border-red-300 font-bold shadow-2xs'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="Klik untuk jadikan atau batalkan status Headline Utama"
                        >
                          <Flame className={`w-3 h-3 ${article.isHero ? 'text-[#c00015]' : 'text-slate-400'}`} />
                          <span>Headline</span>
                        </button>

                        {/* Toggle Pilihan Redaksi */}
                        <button
                          onClick={() => handleToggleEditorsPick(article.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                            article.isEditorsPick
                              ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-2xs'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="Klik untuk jadikan atau batalkan status Pilihan Redaksi"
                        >
                          <Star className={`w-3 h-3 ${article.isEditorsPick ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                          <span>Pilihan</span>
                        </button>
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {article.publishedDate || '26 Okt 2024'}
                    </td>

                    {/* Aksi Nyata: Edit, Baca di Web, Hapus */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Tombol Edit Nyata Berfungsi */}
                        <button
                          onClick={() => handleOpenEdit(article)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
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
                <Edit className="w-5 h-5 text-blue-600" />
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

              {/* Kategori & Reporter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Liputan:
                  </label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        category: e.target.value as ArticleCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] capitalize cursor-pointer"
                  >
                    <option value="berita">Berita Utama</option>
                    <option value="lifestyle">Lifestyle &amp; Wisata</option>
                    <option value="otomotif">Otomotif</option>
                    <option value="sport">Sport</option>
                    <option value="tech">Teknologi</option>
                    <option value="science">Sains</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Jurnalis / Reporter:
                  </label>
                  <input
                    type="text"
                    value={editingArticle.reporter || editingArticle.author}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, reporter: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* URL Thumbnail Foto */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Thumbnail Foto / Cover:
                </label>
                <input
                  type="url"
                  value={editingArticle.imageUrl}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Ringkasan / Lead Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ringkasan / Lead Paragraf:
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Isi Lengkap Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Isi Lengkap Berita:
                </label>
                <textarea
                  rows={6}
                  value={editingArticle.content}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, content: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />
              </div>

              {/* Posisi Berita (Headline & Pilihan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
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
                    className="w-4 h-4 rounded text-[#c00015] focus:ring-[#c00015]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Jadikan Headline Utama</span>
                    <span className="text-[10px] text-slate-500">Tampil besar di bagian paling atas portal.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={editingArticle.isEditorsPick || false}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        isEditorsPick: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#c00015] focus:ring-[#c00015]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Pilihan Redaksi</span>
                    <span className="text-[10px] text-slate-500">Direkomendasikan di section editor.</span>
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
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
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

              {/* Kategori & Reporter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Liputan:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ArticleCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] capitalize cursor-pointer"
                  >
                    <option value="berita">Berita Utama</option>
                    <option value="lifestyle">Lifestyle &amp; Wisata</option>
                    <option value="otomotif">Otomotif</option>
                    <option value="sport">Sport</option>
                    <option value="tech">Teknologi</option>
                    <option value="science">Sains</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Jurnalis / Reporter:
                  </label>
                  <input
                    type="text"
                    value={newReporter}
                    onChange={(e) => setNewReporter(e.target.value)}
                    placeholder="Contoh: Rian Hidayat"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* URL Thumbnail Foto */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Thumbnail Foto / Cover:
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Ringkasan Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ringkasan / Lead Paragraf:
                </label>
                <textarea
                  rows={2}
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="Ketik 1-2 kalimat ringkasan inti berita..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Isi Lengkap Berita */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Isi Lengkap Berita:
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tuliskan naskah berita lengkap di sini..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />
              </div>

              {/* Pilihan Headline & Pilihan Redaksi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={newIsHero}
                    onChange={(e) => setNewIsHero(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c00015] focus:ring-[#c00015]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Jadikan Headline Utama</span>
                    <span className="text-[10px] text-slate-500">Tampil besar di bagian paling atas portal.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={newIsEditorsPick}
                    onChange={(e) => setNewIsEditorsPick(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c00015] focus:ring-[#c00015]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Pilihan Redaksi</span>
                    <span className="text-[10px] text-slate-500">Direkomendasikan di section editor.</span>
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
