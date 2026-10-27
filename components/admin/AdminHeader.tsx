'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Menu,
  Search,
  Bell,
  Plus,
  MessageSquare,
  X,
  ExternalLink,
  LogOut,
  AlertCircle,
  CheckCircle2,
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
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [chatNotifications, setChatNotifications] = useState<any[]>([])
  const [toastNotification, setToastNotification] = useState<{
    id: string
    nomor_tiket: string
    laporan_id: string
    message: string
    sender_name: string
  } | null>(null)

  // Track message IDs that have already triggered a live pop-up toast in this session
  const seenMessageIds = useRef<Set<string>>(new Set())

  // Web Audio synthetic pleasant chime for notification alert
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch {}
  }

  // Scan localStorage for citizen chat messages
  const checkChatNotifications = (isInitial = false) => {
    if (typeof window === 'undefined') return
    try {
      const readChats: string[] = JSON.parse(
        localStorage.getItem('halo_jurnal_read_chats') || '[]'
      )
      const readSet = new Set(readChats)

      // Collect all chat keys
      const incomingChats: any[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('halo_jurnal_chat_')) {
          try {
            const raw = localStorage.getItem(key)
            if (!raw) continue
            const messages = JSON.parse(raw)
            if (Array.isArray(messages)) {
              // Find report info from ticket key
              const ticketOrId = key.replace('halo_jurnal_chat_', '')
              const reportId = ticketOrId
              const reportTicket = ticketOrId

              messages.forEach((msg: any) => {
                const isWarga =
                  msg.sender_id !== 'admin-redaksi' &&
                  msg.profiles?.role !== 'admin' &&
                  msg.role !== 'admin'
                if (isWarga) {
                  incomingChats.push({
                    ...msg,
                    laporan_id: reportId,
                    nomor_tiket: reportTicket,
                  })
                }
              })
            }
          } catch {}
        }
      }

      // Deduplicate by message id
      const uniqueMap = new Map<string, any>()
      incomingChats.forEach((c) => {
        if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c)
      })
      const sorted = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      // Unread count
      const unreadList = sorted.filter((c) => !readSet.has(c.id))
      setUnreadChatCount(unreadList.length)
      setChatNotifications(sorted.slice(0, 5))

      // Trigger pop-up toast if there is a new unread message not yet toasted
      if (unreadList.length > 0) {
        const newest = unreadList[0]
        if (!seenMessageIds.current.has(newest.id)) {
          seenMessageIds.current.add(newest.id)
          if (!isInitial) {
            setToastNotification({
              id: newest.id,
              nomor_tiket: newest.nomor_tiket,
              laporan_id: newest.laporan_id,
              message: newest.message,
              sender_name: newest.profiles?.full_name || 'Warga Pelapor',
            })
            playNotificationChime()
            document.title = `🔴 (${unreadList.length}) Pesan Baru - Halo Jurnal Admin`
          }
        }
      }
    } catch (err) {
      console.error('Error scanning chat notifications:', err)
    }
  }

  useEffect(() => {
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

        const hasPurged = localStorage.getItem('halo_jurnal_dummy_purged_v1')
        if (!hasPurged) {
          localStorage.removeItem('halo_jurnal_user_reports')
          localStorage.removeItem('halo_jurnal_status_overrides')
          localStorage.removeItem('halo_jurnal_read_chats')
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i)
            if (k && k.startsWith('halo_jurnal_chat_')) {
              localStorage.removeItem(k)
            }
          }
          localStorage.setItem('halo_jurnal_dummy_purged_v1', 'true')
        }
      } catch {}
    }

    checkChatNotifications(true)
    const handleStorage = () => checkChatNotifications(false)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', () => checkChatNotifications(false))
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', () => checkChatNotifications(false))
    }
  }, [])

  // Auto dismiss toast after 8 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [toastNotification])

  const markAllAsRead = () => {
    if (typeof window !== 'undefined') {
      try {
        const allIds = chatNotifications.map((c) => c.id)
        localStorage.setItem('halo_jurnal_read_chats', JSON.stringify(allIds))
        setUnreadChatCount(0)
        setToastNotification(null)
        document.title = 'Halo Jurnal Admin — Ruang Kerja Redaksi'
      } catch {}
    }
  }

  const handleQuickLogout = async () => {
    if (typeof window !== 'undefined' && !confirm('Apakah Anda yakin ingin keluar dari akun administrator?')) {
      return
    }

    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('jurnal_wave_admin_authenticated')
      localStorage.removeItem('jurnal_wave_admin_user')
    }

    router.replace('/halo-jurnal/admin/login')
  }

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
      return { section: 'Jurnal Wave', page: 'Dashboard Media', sectionHref: '/halo-jurnal/admin' }
    }
    if (pathname === '/halo-jurnal/admin/halo') {
      return { section: 'Halo Jurnal', page: 'Dashboard Pemantauan', sectionHref: '/halo-jurnal/admin/halo' }
    }
    if (pathname?.startsWith('/halo-jurnal/admin/laporan/')) {
      return { section: 'Halo Jurnal', page: 'Detail Investigasi Laporan', sectionHref: '/halo-jurnal/admin/laporan' }
    }
    if (pathname === '/halo-jurnal/admin/laporan') {
      return { section: 'Halo Jurnal', page: 'Buku Induk Laporan', sectionHref: '/halo-jurnal/admin/laporan' }
    }
    if (pathname === '/halo-jurnal/admin/chat') {
      return { section: 'Halo Jurnal', page: 'Pusat Chat Warga', sectionHref: '/halo-jurnal/admin/chat' }
    }
    if (pathname === '/halo-jurnal/admin/feed-publik') {
      return { section: 'Halo Jurnal', page: 'Moderasi Feed Publik', sectionHref: '/halo-jurnal/admin/feed-publik' }
    }
    if (pathname === '/halo-jurnal/admin/berita') {
      return { section: 'Jurnal Wave', page: 'Manajemen Berita', sectionHref: '/halo-jurnal/admin/berita' }
    }
    if (pathname === '/halo-jurnal/admin/reels') {
      return { section: 'Jurnal Wave', page: 'Wave Reels', sectionHref: '/halo-jurnal/admin/reels' }
    }
    if (pathname === '/halo-jurnal/admin/loker') {
      return { section: 'Jurnal Wave', page: 'Lowongan Kerja', sectionHref: '/halo-jurnal/admin/loker' }
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
  const isJurnalWaveSection = breadcrumb.section === 'Jurnal Wave'
  const showTulisBerita = isJurnalWaveSection && pathname !== '/halo-jurnal/admin/berita'

  return (
    <>
      {/* Toast Alert Melayang Real-Time Saat Ada Pesan Baru Masuk */}
      {toastNotification && (
        <div className="fixed top-18 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 z-50 max-w-sm sm:w-full bg-white rounded-xl shadow-2xl border-l-4 border-l-[#c00015] border border-slate-200/90 p-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#c00015] shrink-0" />
              <span className="text-xs font-heading font-bold text-slate-900">
                Pesan Baru dari Warga!
              </span>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="font-semibold text-slate-700">{toastNotification.sender_name}</span>
              <span>•</span>
              <span className="font-mono text-slate-700 font-semibold">
                {toastNotification.nomor_tiket}
              </span>
            </div>
            <p className="text-slate-800 font-medium line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] leading-relaxed">
              &ldquo;{toastNotification.message}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">Baru saja masuk</span>
            <Link
              href={`/halo-jurnal/admin/laporan/${toastNotification.laporan_id}`}
              onClick={() => {
                setToastNotification(null)
                markAllAsRead()
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c00015] hover:underline"
            >
              <span>Buka &amp; Balas Chat</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

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
          {/* Tombol Tulis Berita (Khusus Portal Media Jurnal Wave) */}
          {showTulisBerita && (
            <Link
              href="/halo-jurnal/admin/berita"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Berita</span>
            </Link>
          )}

          {/* Lonceng Notifikasi Terpadu (Live Chat & Status) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#c00015] text-white shadow-2xs animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 -mr-2 sm:mr-0 mt-2 w-[calc(100vw-32px)] sm:w-92 max-w-sm rounded-xl bg-white border border-slate-200 shadow-xl p-3.5 z-40 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        Notifikasi Masuk
                      </span>
                      {unreadChatCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/10 text-[#c00015]">
                          {unreadChatCount} chat baru
                        </span>
                      )}
                    </div>
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#c00015] hover:underline font-semibold cursor-pointer"
                    >
                      Tandai dibaca
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                    {/* Pesan Chat Warga Terbaru */}
                    {chatNotifications.map((c) => (
                      <Link
                        key={c.id}
                        href={`/halo-jurnal/admin/laporan/${c.laporan_id}`}
                        onClick={() => {
                          setShowNotifications(false)
                          markAllAsRead()
                        }}
                        className="block p-2.5 rounded-lg bg-red-50/50 hover:bg-red-50 border border-red-100 hover:border-red-200 transition space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 text-[#c00015]" />
                            <span>{c.profiles?.full_name || 'Warga Pelapor'}</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {c.nomor_tiket}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 line-clamp-1">
                          &ldquo;{c.message}&rdquo;
                        </p>
                        <span className="text-[10px] text-slate-400 block text-right">
                          {new Date(c.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </Link>
                    ))}

                    {/* Notifikasi Kosong jika belum ada */}
                    {chatNotifications.length === 0 && (
                      <div className="text-center py-6 text-slate-400 space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">Belum ada notifikasi baru</p>
                        <p className="text-[10px] text-slate-400">Pemberitahuan laporan atau chat masuk akan tampil di sini.</p>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/halo-jurnal/admin/laporan"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
                  >
                    Buka Semua Laporan Warga &rarr;
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Tombol Logout Cepat Header */}
          <button
            onClick={handleQuickLogout}
            title="Keluar dari Akun Admin"
            className="p-2 rounded-lg text-slate-500 hover:text-[#c00015] hover:bg-red-50 border border-slate-200/80 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-[11px] font-semibold">Keluar</span>
          </button>
        </div>
      </header>
    </>
  )
}
