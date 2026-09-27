'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Layers,
  Flame,
  Plus,
  Check,
  Edit,
  ExternalLink,
  Newspaper,
  Star,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { DUMMY_ARTICLES } from '@/data/dummyArticles'
import { Article } from '@/types'

interface CategoryMeta {
  id: string
  slug: string
  name: string
  description: string
  articleCount: number
  isActive: boolean
}

const DEFAULT_CATEGORIES: CategoryMeta[] = [
  {
    id: 'cat-1',
    slug: 'berita',
    name: 'Berita Utama',
    description: 'Liputan peristiwa aktual, kebijakan publik, dan kabar hangat Sukabumi.',
    articleCount: 42,
    isActive: true,
  },
  {
    id: 'cat-2',
    slug: 'lifestyle',
    name: 'Lifestyle & Wisata',
    description: 'Destinasi wisata alam, kuliner legendaris, dan gaya hidup masyarakat.',
    articleCount: 18,
    isActive: true,
  },
  {
    id: 'cat-3',
    slug: 'otomotif',
    name: 'Otomotif',
    description: 'Review kendaraan, tips berkendara jalur pegunungan, dan modifikasi.',
    articleCount: 12,
    isActive: true,
  },
  {
    id: 'cat-4',
    slug: 'sport',
    name: 'Sport',
    description: 'Kompetisi sepak bola daerah, prestasi atlet lokal, dan turnamen.',
    articleCount: 8,
    isActive: true,
  },
  {
    id: 'cat-5',
    slug: 'tech',
    name: 'Teknologi',
    description: 'Perkembangan gadget, internet pedesaan, dan inovasi digital.',
    articleCount: 6,
    isActive: true,
  },
  {
    id: 'cat-6',
    slug: 'science',
    name: 'Sains & Lingkungan',
    description: 'Konservasi alam Geopark Ciletuh, cuaca, dan sains lingkungan.',
    articleCount: 5,
    isActive: true,
  },
]

export default function AdminKategoriHeadlinePage() {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES)
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES)
  const [selectedHeroId, setSelectedHeroId] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Muat data dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedArticles = localStorage.getItem('jurnal_wave_articles')
        if (savedArticles) {
          const parsed = JSON.parse(savedArticles)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setArticles(parsed)
            const currentHero = parsed.find((a: Article) => a.isHero)
            if (currentHero) setSelectedHeroId(currentHero.id)
          }
        } else {
          const defaultHero = DUMMY_ARTICLES.find((a) => a.isHero)
          if (defaultHero) setSelectedHeroId(defaultHero.id)
        }

        const savedCats = localStorage.getItem('jurnal_wave_categories')
        if (savedCats) {
          const parsedCats = JSON.parse(savedCats)
          if (Array.isArray(parsedCats) && parsedCats.length > 0) {
            setCategories(parsedCats)
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
  }, [])

  // Cari artikel Hero saat ini
  const activeHeroArticle =
    articles.find((a) => a.id === selectedHeroId) ||
    articles.find((a) => a.isHero) ||
    articles[0]

  // Ganti Headline Utama
  const handleSetHeroArticle = (newId: string) => {
    const updated = articles.map((a) => ({
      ...a,
      isHero: a.id === newId,
    }))
    setArticles(updated)
    setSelectedHeroId(newId)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_articles', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving hero update:', err)
      }
    }

    const chosen = updated.find((a) => a.id === newId)
    setToastMessage(`Headline Utama berhasil diubah ke: "${chosen?.title}"`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Toggle status kategori
  const handleToggleCategory = (catId: string) => {
    const updated = categories.map((c) =>
      c.id === catId ? { ...c, isActive: !c.isActive } : c
    )
    setCategories(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_categories', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving category update:', err)
      }
    }
    setToastMessage('Status visibilitas rubrik kategori diperbarui.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Pengaturan Headline &amp; Rubrikasi Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan artikel utama yang tampil di beranda depan portal dan kelola rubrik liputan media.
          </p>
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

      {/* 2. Kartu Penentuan Headline Utama (Hero Slot) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#c00015]" />
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-900">
                Headline Utama Beranda (Hero Banner)
              </h2>
              <p className="text-[11px] text-slate-500">
                Artikel terpilih akan otomatis tampil dengan ukuran terbesar di posisi teratas portal Jurnal Wave.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Artikel Headline Aktif */}
        {activeHeroArticle && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="md:col-span-4 rounded-lg overflow-hidden aspect-video md:aspect-auto bg-slate-200 border border-slate-300">
              <img
                src={activeHeroArticle.imageUrl}
                alt={activeHeroArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-8 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold bg-[#c00015] text-white px-2 py-0.5 rounded uppercase">
                    Headline Aktif
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 capitalize bg-white px-2 py-0.5 rounded border border-slate-200">
                    {activeHeroArticle.category}
                  </span>
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900 leading-snug">
                  {activeHeroArticle.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {activeHeroArticle.excerpt}
                </p>
              </div>

              {/* Selector untuk mengganti Headline */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ganti Headline Utama dengan Artikel Lain:
                  </label>
                  <select
                    value={activeHeroArticle.id}
                    onChange={(e) => handleSetHeroArticle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    {articles.map((art) => (
                      <option key={art.id} value={art.id}>
                        [{art.category.toUpperCase()}] {art.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Link
                  href={`/artikel/${activeHeroArticle.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold self-end sm:self-auto transition"
                >
                  <span>Lihat di Web</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tabel Rubrik & Kategori Berita */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-heading font-bold text-slate-900">
              Struktur Rubrik Liputan Portal
            </h2>
          </div>
          <span className="text-xs text-slate-500">{categories.length} Kategori Aktif</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Rubrik</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Deskripsi Liputan</th>
                <th className="py-3 px-4">Jumlah Artikel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cat.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    /{cat.slug}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">{cat.description}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {cat.articleCount} artikel
                  </td>
                  <td className="py-3.5 px-4">
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleCategory(cat.id)}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                    >
                      {cat.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
