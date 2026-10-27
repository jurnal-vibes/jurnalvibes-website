'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Newspaper,
  Film,
  Briefcase,
  Pin,
  ExternalLink,
  Edit,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { Article, Job } from '@/types'
import { DUMMY_JOBS } from '@/data/dummyJobs'

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  berita: 'Berita',
  lifestyle: 'Lifestyle',
  loker: 'Lowongan Kerja',
  otomotif: 'Otomotif',
  sport: 'Sport & E-Sport',
  tech: 'Teknologi',
  teknologi: 'Teknologi',
  science: 'Science',
  health: 'Health',
  kuliner: 'Kuliner',
  wisata: 'Wisata',
  hiburan: 'Hiburan & Seni',
}

export default function AdminDashboardMediaPage() {
  const [articlesList, setArticlesList] = useState<Article[]>([])
  const [reelsCount, setReelsCount] = useState<number>(0)
  const [jobsList, setJobsList] = useState<Job[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      // 1. Load Articles dari API database
      try {
        const resArticles = await fetch('/api/articles', { cache: 'no-store' })
        if (resArticles.ok) {
          const json = await resArticles.json()
          if (json.success && Array.isArray(json.data) && isMounted) {
            setArticlesList(json.data)
          }
        }
      } catch (err) {
        console.warn('Gagal memuat artikel dari API:', err)
      }

      // 2. Load Reels & Jobs dari localStorage
      if (typeof window !== 'undefined') {
        try {
          const savedReels = JSON.parse(
            localStorage.getItem('jurnal_wave_reels') || '[]'
          )
          if (isMounted) {
            setReelsCount(Array.isArray(savedReels) ? savedReels.length : 0)
          }

          const savedJobs = JSON.parse(
            localStorage.getItem('jurnal_wave_jobs') || '[]'
          )
          if (Array.isArray(savedJobs) && savedJobs.length > 0) {
            if (isMounted) setJobsList(savedJobs)
          } else {
            if (isMounted) setJobsList(DUMMY_JOBS)
          }

          // Fallback articles if API empty
          if (articlesList.length === 0) {
            const savedArticles = JSON.parse(
              localStorage.getItem('jurnal_wave_articles') || '[]'
            )
            if (Array.isArray(savedArticles) && savedArticles.length > 0 && isMounted) {
              setArticlesList(savedArticles)
            }
          }
        } catch {}
      }
    }

    loadData()
    window.addEventListener('storage', loadData)
    window.addEventListener('focus', loadData)

    return () => {
      isMounted = false
      window.removeEventListener('storage', loadData)
      window.removeEventListener('focus', loadData)
    }
  }, [])

  // Metrics
  const totalBerita = articlesList.length
  const headlineBerita = articlesList.filter((a) => a.isHero).length
  const totalJobs = jobsList.length
  const recentArticles = articlesList.slice(0, 8)

  // Handle Toggle On/Off Headline Slider langsung dari Dashboard
  const handleToggleHero = async (id: string) => {
    const target = articlesList.find((a) => a.id === id)
    if (!target) return
    const newHeroState = !target.isHero

    const updated = articlesList.map((a) =>
      a.id === id ? { ...a, isHero: newHeroState } : a
    )
    setArticlesList(updated)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_articles', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch {}
    }

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
        ? `Artikel "${target.title.slice(0, 32)}..." diaktifkan ke Headline Slider Beranda!`
        : `Artikel "${target.title.slice(0, 32)}..." dikembalikan ke Berita Feed.`
    )
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Sukses Toggle */}
      {toastMessage && (
        <div className="p-3 bg-[#c00015] text-white rounded-xl text-xs flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white cursor-pointer px-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}
      {/* 1. Header Khusus Jurnal Wave CMS (Bersih Tanpa Tombol Berjejer Norak) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Dashboard Media Jurnal Wave
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat kendali operasional penerbitan berita, kurasi Wave Reels, dan bursa lowongan kerja Sukabumi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/halo-jurnal/admin/berita"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Berita Baru</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition border border-slate-200"
          >
            <span>Buka Web Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Empat Kartu Metrik Jurnal Wave CMS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/halo-jurnal/admin/berita"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-[#c00015]/40 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#c00015]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Artikel Berita
            </span>
            <Newspaper className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900 group-hover:text-[#c00015]">
            {totalBerita}
          </p>
          <p className="text-[11px] text-slate-500">Artikel tayang aktif</p>
        </Link>

        <Link
          href="/halo-jurnal/admin/kategori"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-[#c00015]/40 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#c00015]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c00015]">
              Headline Slider
            </span>
            <Pin className="w-4 h-4 text-[#c00015] -rotate-45" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-[#c00015]">
            {headlineBerita}
          </p>
          <p className="text-[11px] text-slate-500">Berita aktif di slider beranda</p>
        </Link>

        <Link
          href="/halo-jurnal/admin/reels"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-slate-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-900">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Wave Reels
            </span>
            <Film className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {reelsCount}
          </p>
          <p className="text-[11px] text-slate-500">Video 9:16 terkurasi</p>
        </Link>

        <Link
          href="/halo-jurnal/admin/loker"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-slate-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-900">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Lowongan Kerja
            </span>
            <Briefcase className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {totalJobs}
          </p>
          <p className="text-[11px] text-slate-500">Peluang karir aktif</p>
        </Link>
      </div>

      {/* 3. Tabel Artikel Berita Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Daftar Artikel Berita Terbaru
            </h3>
            <p className="text-[11px] text-slate-500">
              Status publikasi dan posisi penayangan berita di portal Jurnal Wave.
            </p>
          </div>
          <Link
            href="/halo-jurnal/admin/berita"
            className="text-xs font-semibold text-[#c00015] hover:underline flex items-center gap-1"
          >
            <span>Buka Semua Berita</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Artikel &amp; Thumbnail</th>
                <th className="py-3 px-4">Kategori Rubrik</th>
                <th className="py-3 px-4">Reporter &amp; Editor</th>
                <th className="py-3 px-4">Posisi Tayang</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-700">Belum ada artikel berita yang dimuat</p>
                    <p className="text-[11px]">Gunakan tombol &quot;Tulis Berita Baru&quot; untuk menerbitkan berita pertama.</p>
                  </td>
                </tr>
              ) : (
                recentArticles.map((art) => {
                  return (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                            }}
                            className="w-12 h-9 rounded-md object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 line-clamp-1">
                              {art.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {art.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {(() => {
                          const catKey = (art.category || '').toLowerCase().trim()
                          const label = CATEGORY_DISPLAY_MAP[catKey] || art.category
                          const rawSub = (art.subCategory || '').trim()
                          const subLower = rawSub.toLowerCase()
                          const hasSub =
                            rawSub &&
                            subLower !== catKey &&
                            subLower !== label.toLowerCase() &&
                            subLower !== 'tech' &&
                            subLower !== 'teknologi' &&
                            subLower !== 'berita'

                          return (
                            <div className="flex flex-col items-center w-fit gap-0.5">
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                {label}
                              </span>
                              {hasSub && (
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
                            {art.reporter || art.author || 'Tim Redaksi'}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[#c00015]">EDITOR:</span>{' '}
                            {art.redaktur || art.editor || 'Ujang Herlan'}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleHero(art.id)}
                          title={
                            art.isHero
                              ? 'Headline aktif (Klik untuk matikan / jadikan Berita Feed reguler)'
                              : 'Klik untuk mengaktifkan ke Headline Slider Beranda'
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer select-none active:scale-95 ${
                            art.isHero
                              ? 'bg-[#c00015] hover:bg-[#a00012] text-white shadow-2xs'
                              : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <Pin
                            className={`w-3 h-3 -rotate-45 ${
                              art.isHero ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span>{art.isHero ? 'Headline Slider' : 'Berita Feed'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Link
                            href="/halo-jurnal/admin/berita"
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit Artikel"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/artikel/${art.slug || art.id}`}
                            target="_blank"
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Buka di Portal Warga"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
