'use client'

import React, { useState } from 'react'
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminHeaderProps {
  onToggleSidebar: () => void
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (pathname.includes('/berita')) {
        router.push(`/halo-jurnal/admin/berita?search=${encodeURIComponent(searchQuery.trim())}`)
      } else {
        router.push(`/halo-jurnal/admin/laporan?search=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  // Menentukan teks breadcrumb secara dinamis sesuai halaman aktif
  const getBreadcrumb = () => {
    if (pathname === '/halo-jurnal/admin') {
      return { section: 'Halo Jurnal', page: 'Dashboard Overview', sectionHref: '/halo-jurnal/admin' }
    }
    if (pathname?.startsWith('/halo-jurnal/admin/laporan/')) {
      return { section: 'Halo Jurnal', page: 'Detail Investigasi Laporan', sectionHref: '/halo-jurnal/admin/laporan' }
    }
    if (pathname === '/halo-jurnal/admin/laporan') {
      return { section: 'Halo Jurnal', page: 'Laporan Warga', sectionHref: '/halo-jurnal/admin/laporan' }
    }
    if (pathname === '/halo-jurnal/admin/verifikasi-ktp') {
      return { section: 'Halo Jurnal', page: 'Verifikasi KTP & AI', sectionHref: '/halo-jurnal/admin/verifikasi-ktp' }
    }
    if (pathname === '/halo-jurnal/admin/feed-publik') {
      return { section: 'Halo Jurnal', page: 'Moderasi Feed Publik', sectionHref: '/halo-jurnal/admin/feed-publik' }
    }
    if (pathname === '/halo-jurnal/admin/berita') {
      return { section: 'Jurnal Wave', page: 'Manajemen Berita', sectionHref: '/halo-jurnal/admin/berita' }
    }
    if (pathname === '/halo-jurnal/admin/kategori') {
      return { section: 'Jurnal Wave', page: 'Kategori & Headline', sectionHref: '/halo-jurnal/admin/kategori' }
    }
    if (pathname === '/halo-jurnal/admin/pengguna') {
      return { section: 'Sistem', page: 'Tim Redaksi', sectionHref: '/halo-jurnal/admin/pengguna' }
    }
    if (pathname === '/halo-jurnal/admin/pengaturan') {
      return { section: 'Sistem', page: 'Pengaturan Web', sectionHref: '/halo-jurnal/admin/pengaturan' }
    }
    return { section: 'Admin', page: 'Ruang Kerja Redaksi', sectionHref: '/halo-jurnal/admin' }
  }

  const breadcrumb = getBreadcrumb()
  const isBeritaPage = pathname === '/halo-jurnal/admin/berita'

  const notifications = [
    {
      id: 1,
      title: 'Aduan Baru Masuk',
      desc: 'Jalan Rusak di Cikole butuh verifikasi awal.',
      time: '10 menit lalu',
      type: 'urgent',
    },
    {
      id: 2,
      title: 'AI Flagged KTP',
      desc: '1 KTP foto buram membutuhkan tinjauan manual.',
      time: '35 menit lalu',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Laporan Ditindaklanjuti',
      desc: 'Dinas PU merespons aduan JS-20260728-5266.',
      time: '2 jam lalu',
      type: 'info',
    },
  ]

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Kiri: Toggle Sidebar Mobile & Breadcrumb Dinamis */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Dinamis & Presisi */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link
            href={breadcrumb.sectionHref}
            className="hover:text-slate-900 transition-colors"
          >
            {breadcrumb.section}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Tengah: Quick Search Bar Minimalis */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Cari nomor tiket (JS-...), nama pelapor, atau artikel... (Enter)"
            className="w-full pl-9 pr-12 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] focus:ring-1 focus:ring-[#c00015] transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Kanan: Aksi Cepat & Notifikasi */}
      <div className="flex items-center gap-2.5">
        {/* Tombol Tulis Berita (Hanya tampil jika bukan di halaman berita agar tidak redundan) */}
        {!isBeritaPage && (
          <Link
            href="/halo-jurnal/admin/berita"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Berita</span>
          </Link>
        )}

        {/* Lonceng Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c00015]"></span>
          </button>

          {/* Dropdown Notifikasi */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-white border border-slate-200 shadow-lg p-3.5 z-40 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    Notifikasi Masuk
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-[#c00015] hover:underline font-semibold"
                  >
                    Tandai dibaca
                  </button>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          {n.type === 'urgent' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c00015]"></span>
                          )}
                          {n.type === 'warning' && (
                            <Sparkles className="w-3 h-3 text-amber-500" />
                          )}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/halo-jurnal/admin/laporan"
                  onClick={() => setShowNotifications(false)}
                  className="block text-center w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
                >
                  Lihat Semua Notifikasi &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
