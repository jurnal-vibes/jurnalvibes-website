'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Globe,
  Newspaper,
  Layers,
  Users,
  Settings,
  ExternalLink,
  ChevronRight,
  LogOut,
  X,
  MessageSquare,
  Film,
} from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'
import { DUMMY_ARTICLES } from '@/data/dummyArticles'
import { DUMMY_REELS } from '@/data/dummyPolls'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  // Dynamic badge counts
  const [counts, setCounts] = useState({
    pendingReports: 1,
    unreadChat: 0,
    flaggedKtp: 2,
    articles: 10,
    reels: 8,
  })

  useEffect(() => {
    const updateCounts = () => {
      if (typeof window !== 'undefined') {
        try {
          // 1. Laporan Warga yang menunggu verifikasi (status === 'diterima')
          const overrides = JSON.parse(
            localStorage.getItem('halo_jurnal_status_overrides') || '{}'
          )
          const userReports = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          const combined = [...userReports, ...DUMMY_REPORTS]
          const unique = new Map<string, any>()
          combined.forEach((item) => {
            const key = item.id || item.nomor_tiket || item.ticket_number
            if (key && !unique.has(key)) unique.set(key, item)
          })
          const allReports = Array.from(unique.values()).map((r) => {
            const saved = overrides[r.id] || (r.nomor_tiket ? overrides[r.nomor_tiket] : null)
            return saved?.status ? { ...r, status: saved.status } : r
          })
          const pending = allReports.filter((r) => r.status === 'diterima').length

          // 2. Chat Warga Belum Dibaca
          const readSet = new Set<string>(
            JSON.parse(localStorage.getItem('halo_jurnal_read_chats') || '[]')
          )
          let unreadChatCount = 0
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
                      unreadChatCount++
                    }
                  })
                }
              } catch {}
            }
          }

          // 3. KTP Flagged
          const ktpSaved = JSON.parse(
            localStorage.getItem('halo_jurnal_ktp_verifications') || '[]'
          )
          const flagged = Array.isArray(ktpSaved) && ktpSaved.length > 0
            ? ktpSaved.filter((k: any) => k.status === 'flagged').length
            : 2

          // 4. Articles count
          const artSaved = JSON.parse(
            localStorage.getItem('jurnal_wave_articles') || '[]'
          )
          const totalArticles = Array.isArray(artSaved) && artSaved.length > 0
            ? artSaved.length
            : DUMMY_ARTICLES.length

          // 5. Reels count
          const reelsSaved = JSON.parse(
            localStorage.getItem('jurnal_wave_reels') || '[]'
          )
          const totalReels = Array.isArray(reelsSaved) && reelsSaved.length > 0
            ? reelsSaved.length
            : DUMMY_REELS.length

          setCounts({
            pendingReports: pending,
            unreadChat: unreadChatCount,
            flaggedKtp: flagged,
            articles: totalArticles,
            reels: totalReels,
          })
        } catch {}
      }
    }

    updateCounts()
    window.addEventListener('storage', updateCounts)
    window.addEventListener('focus', updateCounts)
    return () => {
      window.removeEventListener('storage', updateCounts)
      window.removeEventListener('focus', updateCounts)
    }
  }, [])

  const navSections = [
    {
      title: 'Utama',
      items: [
        {
          name: 'Dashboard Overview',
          href: '/halo-jurnal/admin',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      title: 'Halo Jurnal',
      items: [
        {
          name: 'Laporan Warga',
          href: '/halo-jurnal/admin/laporan',
          icon: FileText,
          badge: counts.pendingReports > 0 ? String(counts.pendingReports) : null,
          badgeColor: 'bg-red-500/10 text-[#c00015]',
        },
        {
          name: 'Chat Warga',
          href: '/halo-jurnal/admin/chat',
          icon: MessageSquare,
          badge: counts.unreadChat > 0 ? String(counts.unreadChat) : null,
          badgeColor: 'bg-emerald-500/10 text-emerald-800',
        },
        {
          name: 'Verifikasi KTP',
          href: '/halo-jurnal/admin/verifikasi-ktp',
          icon: ShieldCheck,
          badge: counts.flaggedKtp > 0 ? String(counts.flaggedKtp) : null,
          badgeColor: 'bg-amber-500/10 text-amber-800',
        },
        {
          name: 'Feed Publik',
          href: '/halo-jurnal/admin/feed-publik',
          icon: Globe,
          badge: null,
        },
      ],
    },
    {
      title: 'Jurnal Vibes CMS',
      items: [
        {
          name: 'Artikel Berita',
          href: '/halo-jurnal/admin/berita',
          icon: Newspaper,
          badge: String(counts.articles),
          badgeColor: 'bg-slate-100 text-slate-600',
        },
        {
          name: 'Vibes Reels',
          href: '/halo-jurnal/admin/reels',
          icon: Film,
          badge: String(counts.reels),
          badgeColor: 'bg-slate-100 text-slate-600',
        },
        {
          name: 'Kategori & Headline',
          href: '/halo-jurnal/admin/kategori',
          icon: Layers,
          badge: null,
        },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        {
          name: 'Tim Redaksi',
          href: '/halo-jurnal/admin/pengguna',
          icon: Users,
          badge: null,
        },
        {
          name: 'Pengaturan Web',
          href: '/halo-jurnal/admin/pengaturan',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/halo-jurnal/admin') {
      return pathname === '/halo-jurnal/admin'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo Bersih */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <Link href="/halo-jurnal/admin" className="flex items-center gap-2.5">
            <img
              src="/halo-jurnal-icon.webp"
              alt="Halo Jurnal Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-heading font-extrabold text-base tracking-tight text-slate-900">
                  Jurnal<span className="text-[#c00015]">Wave</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                Meja Redaksi Halo Jurnal
              </span>
            </div>
          </Link>

          {/* Tombol Tutup Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-800 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigasi Ramping */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose()
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-red-50 text-[#c00015] font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-[#c00015]' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge ? (
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-md ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="w-3.5 h-3.5 text-[#c00015]" />
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Sidebar (Profil & Link Portal Warga) */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-1.5">
          <Link
            href="/halo-jurnal"
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Lihat Portal Warga</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">↗</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                JW
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold text-slate-800 truncate">Redaksi</p>
                <p className="text-[10px] text-slate-500 truncate">admin@jurnalwave.id</p>
              </div>
            </div>

            <button
              title="Keluar"
              className="p-1 rounded text-slate-400 hover:text-[#c00015] transition"
              onClick={() => alert('Fitur keluar akan aktif saat autentikasi terhubung.')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
