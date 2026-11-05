'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Search,
  Globe,
  Lock,
  Inbox,
} from 'lucide-react'
import { DummyReport } from '@/data/dummyReports'

export default function AdminHaloJurnalDashboardPage() {
  const [reportsList, setReportsList] = useState<DummyReport[]>([])
  const [tabFilter, setTabFilter] = useState<'semua' | 'publik' | 'privat'>('semua')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    // Pembersihan otomatis sisa-sisa cache percakapan lama di browser
    if (typeof window !== 'undefined') {
      try {
        const hasPurgedV2 = localStorage.getItem('halo_jurnal_chat_cleanup_v2')
        if (!hasPurgedV2) {
          localStorage.removeItem('halo_jurnal_read_chats')
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i)
            if (k && k.startsWith('halo_jurnal_chat_')) {
              localStorage.removeItem(k)
            }
          }
          localStorage.setItem('halo_jurnal_chat_cleanup_v2', 'true')
        }
      } catch {}
    }

    const loadReports = async () => {
      try {
        const res = await fetch('/api/reports', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && isMounted) {
            setReportsList(json.data)
            return
          }
        }
      } catch (err) {
        console.warn('Gagal memuat aduan Hallo Jurnal:', err)
      }

      if (typeof window !== 'undefined') {
        try {
          const saved = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          if (Array.isArray(saved) && isMounted) {
            setReportsList(saved)
          }
        } catch {}
      }
    }

    const loadChatCount = () => {
      if (typeof window === 'undefined') return
      try {
        const readSet = new Set<string>(
          JSON.parse(localStorage.getItem('halo_jurnal_read_chats') || '[]')
        )
        let unread = 0
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('halo_jurnal_chat_')) {
            try {
              const list = JSON.parse(localStorage.getItem(k) || '[]')
              if (Array.isArray(list)) {
                list.forEach((m: any) => {
                  if (
                    m.sender_id !== 'admin-redaksi' &&
                    m.profiles?.role !== 'admin' &&
                    m.role !== 'admin' &&
                    !readSet.has(m.id)
                  ) {
                    unread++
                  }
                })
              }
            } catch {}
          }
        }
        if (isMounted) setUnreadChatCount(unread)
      } catch {}
    }

    loadReports()
    loadChatCount()

    window.addEventListener('storage', loadReports)
    window.addEventListener('focus', loadReports)

    return () => {
      isMounted = false
      window.removeEventListener('storage', loadReports)
      window.removeEventListener('focus', loadReports)
    }
  }, [])

  // Metrics Aduan Warga
  const totalReports = reportsList.length
  const totalPublik = useMemo(
    () => reportsList.filter((r) => r.is_public || (r as any).visibilitas === 'publik').length,
    [reportsList]
  )
  const totalPrivat = totalReports - totalPublik

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reportsList.filter((item) => {
      const isItemPublic = item.is_public || (item as any).visibilitas === 'publik'
      if (tabFilter === 'publik' && !isItemPublic) return false
      if (tabFilter === 'privat' && isItemPublic) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTicket = item.nomor_tiket?.toLowerCase().includes(q)
        const matchTitle = item.judul?.toLowerCase().includes(q)
        const matchDesc = item.deskripsi?.toLowerCase().includes(q)
        if (!matchTicket && !matchTitle && !matchDesc) return false
      }
      return true
    })
  }, [reportsList, tabFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* 1. Header Dashboard Pemantauan Hallo Jurnal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Dashboard Pemantauan Hallo Jurnal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ruang kendali cepat verifikasi aduan masuk, moderasi tayang, dan respon pesan warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/halo-jurnal/admin/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-200"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
            <span>Chat Warga</span>
            {unreadChatCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {unreadChatCount}
              </span>
            )}
          </Link>
          <Link
            href="/halo-jurnal"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition border border-slate-200 shadow-2xs hover:border-[#c00015]/40 hover:text-[#c00015]"
          >
            <span>Buka Portal Hallo Jurnal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Kartu Metrik Aduan Warga (Selaras dengan Pilihan Warga) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Aduan
            </span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {totalReports}
          </p>
          <p className="text-[11px] text-slate-500">Semua aduan terdaftar</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tayang Publik
            </span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {totalPublik}
          </p>
          <p className="text-[11px] text-slate-500">Terbuka di portal warga</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Aduan Privat
            </span>
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {totalPrivat}
          </p>
          <p className="text-[11px] text-slate-500">Tertutup khusus redaksi</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pesan Warga
            </span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {unreadChatCount}
          </p>
          <p className="text-[11px] text-slate-500">Pesan belum terbaca</p>
        </div>
      </div>

      {/* 3. Panel Tabel Aduan Warga */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { key: 'semua' as const, label: `Semua Aduan (${totalReports})` },
              { key: 'publik' as const, label: `Tayang Publik (${totalPublik})` },
              { key: 'privat' as const, label: `Privat (${totalPrivat})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTabFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  tabFilter === tab.key
                    ? 'bg-[#c00015] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket atau judul pengaduan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c00015]"
            />
          </div>
        </div>

        {/* Tabel Pengaduan */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-[160px]">No. Tiket</th>
                <th className="py-3 px-4">Uraian Pengaduan</th>
                <th className="py-3 px-4 w-[120px]">Visibilitas</th>
                <th className="py-3 px-4 w-[140px]">Tanggal Masuk</th>
                <th className="py-3 px-4 text-right w-[110px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-700">Tidak ada aduan dalam filter ini</p>
                    <p className="text-[11px]">Belum ada data aduan yang sesuai dengan kriteria pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.slice(0, 10).map((rep) => {
                  const isItemPublic = rep.is_public || (rep as any).visibilitas === 'publik'
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                        {rep.nomor_tiket}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <h4 className="font-semibold text-slate-900 line-clamp-1">
                          {rep.judul}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {rep.deskripsi}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isItemPublic ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>Publik</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Privat</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(rep.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link
                          href={`/halo-jurnal/admin/laporan/${rep.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                        >
                          <span>Detail Tiket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Navigasi ke Arsip Lengkap */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            Menampilkan <strong>{Math.min(filteredReports.length, 10)}</strong> dari{' '}
            <strong>{filteredReports.length}</strong> aduan dalam antrean aktif.
          </div>
          <Link
            href="/halo-jurnal/admin/laporan"
            className="inline-flex items-center gap-1.5 font-semibold text-[#c00015] hover:text-[#a00012] transition"
          >
            <span>Buka Buku Induk &amp; Arsip Lengkap Warga</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
