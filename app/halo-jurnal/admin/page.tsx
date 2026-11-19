'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Newspaper,
  FileText,
  Briefcase,
  Film,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Edit,
  Globe,
  Lock,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react'
import { Article } from '@/types'
import { DummyReport, DUMMY_REPORTS } from '@/data/dummyReports'
import { useAdminData } from '@/context/AdminDataContext'

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
  hiburan: 'Hiburan',
  inspirasi: 'Inspirasi',
}

const SAMPLE_DUMMY_REPORTS: DummyReport[] = DUMMY_REPORTS

const SAMPLE_SUPPLEMENTAL_ARTICLES: Article[] = [
  {
    id: 'art-demo-1',
    title: 'Festival Kuliner Sukabumi 2026 Siap Digelar di Kawasan Selabintana',
    slug: 'festival-kuliner-sukabumi-2026',
    excerpt: 'Puluhan pelaku UMKM kuliner khas Sukabumi siap meramaikan festival tahunan dengan sajian legendaris.',
    content: 'Festival kuliner...',
    category: 'kuliner',
    categoryLabel: 'Kuliner',
    imageUrl: '/hero-banner.webp',
    author: 'Revan Fatkhurezi',
    reporter: 'Revan Fatkhurezi',
    redaktur: 'Tim Redaksi',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    status: 'published',
  },
  {
    id: 'art-demo-2',
    title: 'Peluang Karir Digital & Tech Hub Berkembang Pesat bagi Gen Z Sukabumi',
    slug: 'peluang-karir-digital-sukabumi',
    excerpt: 'Ekosistem kerja remote dan industri kreatif digital membuka banyak kesempatan baru bagi talenta muda.',
    content: 'Peluang karir...',
    category: 'tech',
    categoryLabel: 'Teknologi',
    imageUrl: '/hero-banner.webp',
    author: 'Ilham Nugraha',
    reporter: 'Ilham Nugraha',
    redaktur: 'Denis Febrian',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: 'published',
  },
  {
    id: 'art-demo-3',
    title: 'Revitalisasi Pasar Pelita Tingkatkan Perputaran Ekonomi Komoditas Lokal',
    slug: 'revitalisasi-pasar-pelita-sukabumi',
    excerpt: 'Penataan kios dan fasilitas sanitasi modern memberikan kenyamanan lebih bagi pedagang dan pembeli.',
    content: 'Pasar pelita...',
    category: 'berita',
    categoryLabel: 'Berita',
    imageUrl: '/hero-banner.webp',
    author: 'Donie Makapeli',
    reporter: 'Donie Makapeli',
    redaktur: 'Tim Redaksi',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    status: 'published',
  },
]

export default function UnifiedAdminDashboardPage() {
  const {
    articles: contextArticles,
    isLoadingArticles,
    reports: contextReports,
    isLoadingReports,
    counts,
  } = useAdminData()

  const [articlesList, setArticlesList] = useState<Article[]>(contextArticles)
  const [reportsList, setReportsList] = useState<DummyReport[]>(contextReports)
  const [activeTableTab, setActiveTableTab] = useState<'berita' | 'aduan'>('berita')

  useEffect(() => {
    if (contextArticles.length > 0) {
      setArticlesList(contextArticles)
    } else if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_articles')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) setArticlesList(parsed)
        }
      } catch {}
    }
  }, [contextArticles])

  useEffect(() => {
    if (contextReports.length > 0) {
      setReportsList(contextReports)
    }
  }, [contextReports])

  // Data Berita Gabungan
  const displayArticles = useMemo(() => {
    const combined = [...articlesList, ...SAMPLE_SUPPLEMENTAL_ARTICLES]
    const seen = new Set<string>()
    return combined.filter((a) => {
      const key = (a.slug || a.id || a.title || '').toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [articlesList])

  // Data Aduan Warga
  const displayReports = useMemo(() => {
    if (reportsList.length > 0) return reportsList
    return SAMPLE_DUMMY_REPORTS
  }, [reportsList])

  // Hitungan Metrik 4 Pilar Utama
  const totalBerita = displayArticles.length
  const totalAduan = displayReports.length
  const totalLoker = counts.jobs > 0 ? counts.jobs : 5
  const totalReels = counts.reels > 0 ? counts.reels : 4

  // Rasio Visibilitas Hak Tayang Aduan (Publik vs Privat)
  const aduanPublik = displayReports.filter(
    (r) => r.is_public || (r as any).visibilitas === 'publik'
  ).length
  const aduanPrivat = Math.max(0, totalAduan - aduanPublik)
  const rasioPublik = totalAduan > 0 ? Math.round((aduanPublik / totalAduan) * 100) : 75

  // Donut SVG geometry
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offsetPublik = circumference - (rasioPublik / 100) * circumference

  const recentArticles = displayArticles.slice(0, 5)
  const recentReports = displayReports.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 1. Baris Atas: 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Berita Tayang (Jurnal Wave) */}
        <Link
          href="/halo-jurnal/admin/berita"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#c00015]/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Berita Tayang
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 group-hover:bg-red-50 group-hover:text-[#c00015] transition">
                <Newspaper className="w-4 h-4 text-slate-600 group-hover:text-[#c00015]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 group-hover:text-[#c00015] transition">
              {totalBerita}
            </p>
            <p className="text-xs text-slate-400 mt-1">Artikel portal Jurnal Wave</p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kanal Berita &amp; Rubrik</span>
          </div>
        </Link>

        {/* Card 2: Aduan Warga (Hallo Jurnal) */}
        <Link
          href="/halo-jurnal/admin/laporan"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#c00015]/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Aduan Warga
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 group-hover:bg-red-50 group-hover:text-[#c00015] transition">
                <FileText className="w-4 h-4 text-slate-600 group-hover:text-[#c00015]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 group-hover:text-[#c00015] transition">
              {totalAduan}
            </p>
            <p className="text-xs text-slate-400 mt-1">Laporan masuk Hallo Jurnal</p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>Buku Induk &amp; Arsip Warga</span>
          </div>
        </Link>

        {/* Card 3: Lowongan Kerja */}
        <Link
          href="/halo-jurnal/admin/loker"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#c00015]/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Lowongan Kerja
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 group-hover:bg-slate-100 transition">
                <Briefcase className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              {totalLoker}
            </p>
            <p className="text-xs text-slate-400 mt-1">Peluang karir terverifikasi</p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Info Karir Sukabumi</span>
          </div>
        </Link>

        {/* Card 4: Wave Reels */}
        <Link
          href="/halo-jurnal/admin/reels"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#c00015]/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Wave Reels
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 group-hover:bg-purple-50 group-hover:text-purple-600 transition">
                <Film className="w-4 h-4 text-slate-600 group-hover:text-purple-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 group-hover:text-purple-600 transition">
              {totalReels}
            </p>
            <p className="text-xs text-slate-400 mt-1">Video pendek terkurasi</p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-purple-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Konten Visual 9:16</span>
          </div>
        </Link>
      </div>

      {/* 2. Baris Utama: Panel Moderasi Hak Tayang & Akses Cepat (Kiri) + Tabel Aktivitas Terbaru (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Moderasi Hak Tayang & Akses Cepat (4 Kolom pada LG) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Donut: Moderasi Hak Tayang Aduan */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 font-heading">
                  Moderasi Hak Tayang
                </h3>
                <p className="text-2xl font-extrabold font-heading text-slate-900 mt-1">
                  {aduanPublik} Publik
                </p>
                <p className="text-[11px] text-slate-400">
                  {aduanPrivat} aduan tersimpan privat
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-[#c00015] border border-red-200">
                {totalAduan} Total
              </span>
            </div>

            {/* Circular Donut Graphic */}
            <div className="my-5 flex items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-slate-100"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-[#c00015] transition-all duration-500 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offsetPublik}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-heading font-extrabold text-base text-slate-900 block leading-none">
                    {rasioPublik}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                    Feed Publik
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c00015]" />
                <span className="font-medium text-slate-700">{aduanPublik} Tayang</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="font-medium text-slate-500">{aduanPrivat} Privat</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Buku Induk Hallo Jurnal</span>
              <Link
                href="/halo-jurnal/admin/laporan"
                className="text-[#c00015] hover:underline font-semibold text-xs flex items-center gap-1"
              >
                <span>Kelola Aduan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card: Pintasan Akses Cepat */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 font-heading uppercase tracking-wider">
              Akses Cepat Pengelolaan
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <Link
                href="/halo-jurnal/admin/berita"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#c00015] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-[#c00015] transition">
                    Manajemen Konten
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/halo-jurnal/admin/chat"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#c00015] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-[#c00015] transition">
                    Pusat Chat Web Warga
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/halo-jurnal/admin/warga"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-slate-900 transition">
                    Direktori Akun Warga
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tabel Aktivitas Terbaru (8 Kolom pada LG) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Header Tabel dengan Tab Pengalih & Link "Lihat semua →" */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTableTab('berita')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTableTab === 'berita'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Berita Terbaru
              </button>
              <button
                type="button"
                onClick={() => setActiveTableTab('aduan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTableTab === 'aduan'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Aduan Warga
              </button>
            </div>

            <Link
              href={activeTableTab === 'berita' ? '/halo-jurnal/admin/berita' : '/halo-jurnal/admin/laporan'}
              className="text-xs font-semibold text-slate-600 hover:text-[#c00015] flex items-center gap-1 transition"
            >
              <span>Lihat semua</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Isi Tabel */}
          <div className="flex-1 overflow-x-auto">
            {activeTableTab === 'berita' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4">Judul Berita</th>
                    <th className="py-2.5 px-4 w-32">Kategori</th>
                    <th className="py-2.5 px-4 w-36">Penulis / Reporter</th>
                    <th className="py-2.5 px-4 w-28">Tanggal</th>
                    <th className="py-2.5 px-4 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentArticles.map((art) => {
                    const catKey = (art.category || '').toLowerCase().trim()
                    const catLabel = CATEGORY_DISPLAY_MAP[catKey] || art.category
                    return (
                      <tr key={art.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                if (!target.src.endsWith('/hero-banner.webp')) {
                                  target.src = '/hero-banner.webp'
                                }
                              }}
                              className="w-10 h-7 rounded-md object-cover bg-slate-100 shrink-0 border border-slate-200"
                            />
                            <span className="font-semibold text-slate-900 truncate block">
                              {art.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {catLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                          {art.reporter || art.author || 'Tim Redaksi'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {new Date(art.publishedDate || art.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <Link
                            href="/halo-jurnal/admin/berita"
                            className="p-1 rounded-md text-slate-400 hover:text-[#c00015] hover:bg-slate-100 transition inline-block"
                            title="Edit Berita"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4 w-36">No. Tiket</th>
                    <th className="py-2.5 px-4">Judul Pengaduan</th>
                    <th className="py-2.5 px-4 w-28">Visibilitas</th>
                    <th className="py-2.5 px-4 w-28">Tanggal</th>
                    <th className="py-2.5 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReports.map((rep) => {
                    const isPublic = rep.is_public || (rep as any).visibilitas === 'publik'
                    return (
                      <tr key={rep.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                          {rep.nomor_tiket}
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <span className="font-semibold text-slate-900 truncate block">
                            {rep.judul}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPublic
                                ? 'bg-red-50 text-[#c00015] border border-red-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isPublic ? 'Publik' : 'Privat'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {new Date(rep.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/halo-jurnal/admin/chat?ticket=${rep.nomor_tiket || rep.id}`}
                              className="p-1 rounded-md text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition inline-block"
                              title="Buka Chat dengan Pelapor"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/halo-jurnal/admin/laporan/${rep.id}`}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition inline-block"
                              title="Buka Detail Aduan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
