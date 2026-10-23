'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [adminUser, setAdminUser] = useState({
    name: 'Redaksi Jurnal Sukabumi',
    email: 'redaksi@jurnalsukabumi.com',
  })

  // Dynamic badge counts
  const [counts, setCounts] = useState({
    pendingReports: 2,
    unreadChat: 0,
    articles: 3,
    reels: 8,
  })

  useEffect(() => {
    let isMounted = true

    const updateCounts = async () => {
      let pending = 2
      let totalArticles = 3

      try {
        const [resReports, resArticles] = await Promise.all([
          fetch('/api/reports', { cache: 'no-store' }),
          fetch('/api/articles', { cache: 'no-store' }),
        ])
        if (resReports.ok) {
          const jsonReports = await resReports.json()
          if (jsonReports.success && Array.isArray(jsonReports.data)) {
            pending = jsonReports.data.filter((r: any) => r.status === 'diterima').length
          }
        }
        if (resArticles.ok) {
          const jsonArticles = await resArticles.json()
          if (jsonArticles.success && Array.isArray(jsonArticles.data)) {
            totalArticles = jsonArticles.data.length
          }
        }
      } catch {}

      if (typeof window !== 'undefined') {
        try {
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

          // 4. Reels count
          const reelsSaved = JSON.parse(
            localStorage.getItem('jurnal_wave_reels') || '[]'
          )
          const totalReels = Array.isArray(reelsSaved) && reelsSaved.length > 0
            ? reelsSaved.length
            : DUMMY_REELS.length

          if (isMounted) {
            setCounts({
              pendingReports: pending,
              unreadChat: unreadChatCount,
              articles: totalArticles,
              reels: totalReels,
            })

            // Baca data profil admin yang sedang login
            const savedUser = localStorage.getItem('jurnal_wave_admin_user')
            if (savedUser) {
              const parsed = JSON.parse(savedUser)
              if (parsed.name || parsed.email) {
                setAdminUser({
                  name: parsed.name || 'Redaksi Jurnal Sukabumi',
                  email: parsed.email || 'redaksi@jurnalsukabumi.com',
                })
              }
            }
          }
        } catch {}
      }
    }

    updateCounts()
    window.addEventListener('storage', updateCounts)
    return () => {
      isMounted = false
      window.removeEventListener('storage', updateCounts)
      window.removeEventListener('focus', updateCounts)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('jurnal_wave_admin_authenticated')
      localStorage.removeItem('jurnal_wave_admin_user')
    }

    onClose()
    router.replace('/halo-jurnal/admin/login')
  }

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
          name: 'Feed Publik',
          href: '/halo-jurnal/admin/feed-publik',
          icon: Globe,
          badge: null,
        },
      ],
    },
    {
      title: 'Jurnal Wave CMS',
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
              src="/halo-jurnal-icon.svg?v=3"
              alt="Jurnal Sukabumi"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-heading font-extrabold text-base tracking-tight text-slate-900">
                  Jurnal<span className="text-[#c00015]">Sukabumi</span>
                </span>
                <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded uppercase tracking-wider">
                  Redaksi
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                Pusat Kendali Halo Jurnal &amp; Wave
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
              <div className="w-7 h-7 rounded-full bg-red-50 text-[#c00015] flex items-center justify-center font-bold text-xs shrink-0 border border-red-100">
                JS
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold text-slate-800 truncate">{adminUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{adminUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              title="Keluar dari Akun Admin"
              disabled={isLoggingOut}
              className="p-1.5 rounded-md text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
