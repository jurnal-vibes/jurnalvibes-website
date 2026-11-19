'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  X,
  Send,
  ExternalLink,
  RefreshCw,
  Search,
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useAdminData } from '@/context/AdminDataContext'
import { DummyReport } from '@/data/dummyReports'

export default function FloatingAdminChat() {
  const { reports, isLoadingReports, counts, refreshReports } = useAdminData()
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'semua' | 'belum_dibalas' | 'sudah_respon'>('semua')
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [mobilePane, setMobilePane] = useState<'inbox' | 'chat'>('inbox')
  const [activePhoto, setActivePhoto] = useState<string | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Map ringkasan metadata per tiket (pesan terakhir, belum dibaca, status menunggu)
  const [ticketMeta, setTicketMeta] = useState<
    Record<
      string,
      {
        lastMessage: string
        lastTime: string
        unreadCount: number
        isWaitingAdmin: boolean
        messageCount: number
      }
    >
  >({})

  // Auto-select tiket pertama saat reports tersedia
  useEffect(() => {
    if (!selectedTicketId && reports.length > 0) {
      setSelectedTicketId(reports[0].nomor_tiket || reports[0].id)
    }
  }, [reports, selectedTicketId])

  // Scan metadata percakapan dari seluruh tiket
  const scanAllTicketChats = () => {
    if (typeof window === 'undefined') return
    try {
      const readSet = new Set<string>(
        JSON.parse(localStorage.getItem('halo_jurnal_read_chats') || '[]')
      )
      const newMeta: Record<string, any> = {}

      reports.forEach((rep) => {
        const keyId = rep.id
        const keyTicket = rep.nomor_tiket
        const localId = localStorage.getItem(`halo_jurnal_chat_${keyId}`)
        const localTicket = keyTicket
          ? localStorage.getItem(`halo_jurnal_chat_${keyTicket}`)
          : null
        const raw = localId || localTicket || '[]'

        let chatList: any[] = []
        try {
          chatList = JSON.parse(raw)
        } catch {}

        if (Array.isArray(chatList) && chatList.length > 0) {
          const sorted = [...chatList].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          const lastMsg = sorted[sorted.length - 1]
          const isWargaLast =
            lastMsg.role !== 'admin' &&
            lastMsg.role !== 'redaksi' &&
            lastMsg.sender_id !== 'admin-redaksi' &&
            lastMsg.sender_id !== 'dev-admin' &&
            lastMsg.sender_id !== 'admin' &&
            lastMsg.profiles?.role !== 'admin' &&
            lastMsg.profiles?.role !== 'redaksi' &&
            !(lastMsg.sender_name && lastMsg.sender_name.toLowerCase().includes('redaksi'))

          const unread = sorted.filter(
            (m) =>
              m.role !== 'admin' &&
              m.role !== 'redaksi' &&
              m.sender_id !== 'admin-redaksi' &&
              m.sender_id !== 'dev-admin' &&
              m.sender_id !== 'admin' &&
              m.profiles?.role !== 'admin' &&
              m.profiles?.role !== 'redaksi' &&
              !(m.sender_name && m.sender_name.toLowerCase().includes('redaksi')) &&
              !readSet.has(m.id)
          ).length

          const metaPayload = {
            lastMessage: lastMsg.message || 'Mengirim berkas lampiran',
            lastTime: lastMsg.created_at,
            unreadCount: unread,
            isWaitingAdmin: isWargaLast,
            messageCount: sorted.length,
          }
          newMeta[rep.id] = metaPayload
          if (rep.nomor_tiket) newMeta[rep.nomor_tiket] = metaPayload
        } else {
          const defaultMeta = {
            lastMessage: 'Belum ada percakapan langsung',
            lastTime: rep.created_at,
            unreadCount: 0,
            isWaitingAdmin: false,
            messageCount: 0,
          }
          newMeta[rep.id] = defaultMeta
          if (rep.nomor_tiket) newMeta[rep.nomor_tiket] = defaultMeta
        }
      })

      setTicketMeta(newMeta)
    } catch (err) {
      console.error('Error scanning floating ticket chats:', err)
    }
  }

  // Muat pesan aktif untuk tiket terpilih
  const loadActiveMessages = async () => {
    if (!selectedTicketId) return
    const activeReport = reports.find(
      (r) => r.id === selectedTicketId || r.nomor_tiket === selectedTicketId
    )
    const targetId = activeReport?.id || selectedTicketId
    const targetTicket = activeReport?.nomor_tiket

    let dbMessages: any[] = []
    try {
      const res = await fetch(`/api/chat?ticketNumber=${encodeURIComponent(targetTicket || targetId)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          dbMessages = json.data
        }
      }
    } catch {}

    let merged = dbMessages
    if (typeof window !== 'undefined') {
      const local = JSON.parse(
        localStorage.getItem(`halo_jurnal_chat_${targetId}`) ||
        (targetTicket ? localStorage.getItem(`halo_jurnal_chat_${targetTicket}`) : null) ||
        '[]'
      )
      if (dbMessages.length > 0) {
        merged = dbMessages.map((dbM) => {
          if (!dbM.file_url && local.length > 0) {
            const matched = local.find(
              (loc: any) =>
                loc.id === dbM.id ||
                (loc.created_at === dbM.created_at && (loc.sender_id === dbM.sender_id || loc.message === dbM.message))
            )
            if (matched && matched.file_url) {
              return {
                ...dbM,
                file_url: matched.file_url,
                file_type: matched.file_type,
              }
            }
          }
          return dbM
        })
        localStorage.setItem(`halo_jurnal_chat_${targetId}`, JSON.stringify(merged))
        if (targetTicket) {
          localStorage.setItem(`halo_jurnal_chat_${targetTicket}`, JSON.stringify(merged))
        }
      } else {
        merged = local
      }
    }

    setMessages(merged)

    // Tandai pesan sudah dibaca
    if (typeof window !== 'undefined' && merged.length > 0) {
      try {
        const readChats: string[] = JSON.parse(
          localStorage.getItem('halo_jurnal_read_chats') || '[]'
        )
        const readSet = new Set(readChats)
        merged.forEach((m: any) => readSet.add(m.id))
        localStorage.setItem(
          'halo_jurnal_read_chats',
          JSON.stringify(Array.from(readSet))
        )
      } catch {}
    }
  }

  // Sinkronisasi realtime saat popup dibuka atau tiket berganti
  useEffect(() => {
    if (!isOpen) return
    scanAllTicketChats()
    loadActiveMessages()

    const handleStorage = () => {
      scanAllTicketChats()
      loadActiveMessages()
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)

    const pollInterval = setInterval(() => {
      loadActiveMessages()
      scanAllTicketChats()
    }, 4000)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [isOpen, selectedTicketId, reports])

  // Scroll otomatis ke percakapan terakhir
  useEffect(() => {
    if (isOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  // Kirim balasan redaksi
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedTicketId || isSending) return

    setIsSending(true)
    const activeReport = reports.find(
      (r) => r.id === selectedTicketId || r.nomor_tiket === selectedTicketId
    )
    const targetId = activeReport?.id || selectedTicketId
    const targetTicket = activeReport?.nomor_tiket
    const text = inputText.trim()

    setInputText('')

    // Kirim langsung ke API database
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber: targetTicket || targetId,
          senderId: 'admin-redaksi',
          senderName: '🛡️ Redaksi Hallo Jurnal',
          role: 'admin',
          message: text,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const newMsg = {
            id: json.data.id,
            ticketNumber: json.data.ticketNumber,
            sender_id: json.data.sender_id,
            sender_name: json.data.sender_name || '🛡️ Redaksi Hallo Jurnal',
            role: json.data.role || 'redaksi',
            message: json.data.message,
            created_at: json.data.created_at,
            profiles: {
              full_name: json.data.sender_name || '🛡️ Redaksi Hallo Jurnal',
              role: 'admin',
            },
          }
          const next = [...messages, newMsg]
          setMessages(next)
          if (typeof window !== 'undefined') {
            localStorage.setItem(`halo_jurnal_chat_${targetId}`, JSON.stringify(next))
            if (targetTicket) {
              localStorage.setItem(`halo_jurnal_chat_${targetTicket}`, JSON.stringify(next))
            }
            window.dispatchEvent(new Event('storage'))
          }
          setIsSending(false)
          return
        }
      }
    } catch (err) {
      console.warn('Notice chat API sync error:', err)
    }

    // Fallback lokal jika offline
    const sentMsg = {
      id: `chat-admin-${Date.now()}`,
      laporan_id: targetId,
      sender_id: 'admin-redaksi',
      sender_name: '🛡️ Redaksi Hallo Jurnal',
      role: 'redaksi',
      message: text,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: '🛡️ Redaksi Hallo Jurnal',
        role: 'admin',
      },
    }

    const next = [...messages, sentMsg]
    setMessages(next)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`halo_jurnal_chat_${targetId}`, JSON.stringify(next))
        if (targetTicket) {
          localStorage.setItem(`halo_jurnal_chat_${targetTicket}`, JSON.stringify(next))
        }
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving chat locally:', err)
      }
    }

    setIsSending(false)
  }

  // Filter daftar tiket warga di panel kiri
  const filteredReports = reports.filter((rep) => {
    const meta = ticketMeta[rep.nomor_tiket] || ticketMeta[rep.id]
    const matchesSearch =
      rep.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.nomor_tiket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.lokasi && rep.lokasi.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (filterType === 'belum_dibalas') {
      return meta?.isWaitingAdmin || (meta?.unreadCount || 0) > 0
    }
    if (filterType === 'sudah_respon') {
      return !meta?.isWaitingAdmin && (meta?.messageCount || 0) > 0
    }
    return true
  })

  // Tiket yang sedang dibuka
  const currentReport = reports.find(
    (r) => r.id === selectedTicketId || r.nomor_tiket === selectedTicketId
  )

  const unreadTotal = counts.unreadChat || 0

  return (
    <>
      {/* 1. Floating Action Bubble (Pojok Kanan Bawah) */}
      <div className="fixed bottom-5 right-5 z-40 select-none">
        <button
          type="button"
          onClick={() => {
            const next = !isOpen
            setIsOpen(next)
            if (next) {
              scanAllTicketChats()
              loadActiveMessages()
            }
          }}
          className="relative flex items-center gap-2 px-4 py-3 bg-[#c00015] hover:bg-[#a00012] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 cursor-pointer group"
          title="Buka Pusat Chat Warga Hallo Jurnal"
        >
          <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            Chat Warga
          </span>

          {unreadTotal > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-extrabold ring-2 ring-white animate-bounce">
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          )}
        </button>
      </div>

      {/* 2. Floating Popup Chat Window (Full Layar di Mobile, Floating / True Full Layar di Desktop) */}
      {isOpen && (
        <>
          {/* Backdrop gelap saat mode floating di desktop jika diperlukan */}
          {isMaximized && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-200"
              onClick={() => setIsMaximized(false)}
            />
          )}

          <div
            className={`fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
              isMaximized
                ? 'inset-0 w-full h-full rounded-none border-0'
                : 'inset-0 w-full h-full rounded-none border-0 sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[680px] md:w-[780px] lg:w-[860px] sm:h-[620px] sm:max-h-[86vh] sm:rounded-2xl sm:border sm:border-slate-200 animate-in fade-in slide-in-from-bottom-4'
            }`}
          >
            {/* Header Utama Popup Bar */}
            <div className="px-4 py-2.5 bg-[#c00015] text-white flex items-center justify-between shrink-0 select-none">
              <h3 className="text-xs sm:text-sm font-bold font-heading leading-tight truncate">
                Pusat Chat Warga
              </h3>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    scanAllTicketChats()
                    loadActiveMessages()
                    refreshReports()
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Segarkan Chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaximized((prev) => !prev)}
                  className="hidden sm:inline-flex p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title={isMaximized ? 'Perkecil Tampilan' : 'Perluas ke Layar Penuh'}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setIsMaximized(false)
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Tutup Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Area Kerja 2-Panel (Inbox Tiket di Kiri, Workspace Chat di Kanan) */}
            <div className="flex-1 flex overflow-hidden min-h-0 bg-white">
              {/* ================= PANEL KIRI: INBOX TIKET WARGA ================= */}
              <div
                className={`w-full ${
                  isMaximized ? 'sm:w-80 md:w-96 lg:w-[400px]' : 'sm:w-72 md:w-80'
                } border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0 h-full overflow-hidden transition-all duration-200 ${
                  mobilePane === 'chat' ? 'hidden sm:flex' : 'flex'
                }`}
              >
              {/* Search Bar & Filter Tabs */}
              <div className="p-2.5 border-b border-slate-200 bg-white space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nomor tiket / aduan..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                  />
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {[
                    { key: 'semua', label: 'Semua' },
                    { key: 'belum_dibalas', label: 'Perlu Balasan' },
                    { key: 'sudah_respon', label: 'Direspons' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterType(tab.key as any)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        filterType === tab.key
                          ? 'bg-[#c00015] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Tiket Percakapan */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 [scrollbar-width:thin]">
                {isLoadingReports && filteredReports.length === 0 ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-100 space-y-1.5 animate-pulse">
                        <div className="h-3 bg-slate-200 rounded w-20" />
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                    <MessageSquare className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Tidak ada tiket</p>
                    <p className="text-[10px]">Coba ubah kata kunci atau filter.</p>
                  </div>
                ) : (
                  filteredReports.map((rep) => {
                    const isSelected =
                      selectedTicketId === rep.nomor_tiket || selectedTicketId === rep.id
                    const meta = ticketMeta[rep.nomor_tiket] || ticketMeta[rep.id]
                    const hasUnread = (meta?.unreadCount || 0) > 0
                    const isWaiting = meta?.isWaitingAdmin

                    return (
                      <div
                        key={rep.id}
                        onClick={() => {
                          setSelectedTicketId(rep.nomor_tiket || rep.id)
                          setMobilePane('chat')
                        }}
                        className={`p-2.5 transition cursor-pointer text-left relative ${
                          isSelected
                            ? 'bg-red-50/70 border-l-2 border-l-[#c00015]'
                            : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-xs font-bold text-slate-900 shrink-0">
                              {rep.nomor_tiket}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {hasUnread && (
                              <span className="px-1.5 py-0.5 rounded-full font-bold bg-[#c00015] text-white text-[9px]">
                                {meta.unreadCount} baru
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {meta?.lastTime
                                ? new Date(meta.lastTime).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-xs font-heading font-semibold text-slate-900 line-clamp-1">
                          {rep.judul}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {meta?.lastMessage || 'Belum ada percakapan'}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* ================= PANEL KANAN: WORKSPACE CHAT AKTIF ================= */}
            <div
              className={`flex-1 flex flex-col bg-white h-full overflow-hidden min-w-0 ${
                mobilePane === 'inbox' ? 'hidden sm:flex' : 'flex'
              }`}
            >
              {currentReport ? (
                <>
                  {/* Header Obrolan Tiket Terpilih */}
                  <div className="px-3.5 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Tombol Kembali ke Inbox (Khusus Layar Kecil) */}
                      <button
                        type="button"
                        onClick={() => setMobilePane('inbox')}
                        className="sm:hidden p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
                        title="Kembali ke Daftar Tiket"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-heading font-bold text-slate-900 truncate">
                          {currentReport.judul}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate mt-0.5">
                          <span className="font-mono font-semibold text-slate-700">
                            {currentReport.nomor_tiket}
                          </span>
                          <span>•</span>
                          <span>
                            {(currentReport as any).pelaporName ||
                              (currentReport as any).nama_pelapor ||
                              'Warga Sukabumi'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/halo-jurnal/admin/laporan/${currentReport.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition shadow-2xs shrink-0 cursor-pointer"
                    >
                      <span>Detail</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>

                  {/* Area Balon Percakapan */}
                  <div
                    ref={chatScrollRef}
                    className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#fbf9f9] [scrollbar-width:thin]"
                  >
                    {messages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-600">Belum ada percakapan langsung</p>
                        <p className="text-[10px] text-slate-400">
                          Ketik pesan di bawah untuk memulai koordinasi dengan pelapor.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isAdmin =
                          msg.role === 'admin' ||
                          msg.role === 'redaksi' ||
                          msg.sender_id === 'admin-redaksi' ||
                          msg.sender_id === 'dev-admin' ||
                          msg.sender_id === 'admin' ||
                          msg.profiles?.role === 'admin' ||
                          msg.profiles?.role === 'redaksi' ||
                          msg.sender_name === 'Admin Redaksi' ||
                          (msg.sender_name && msg.sender_name.toLowerCase().includes('redaksi'))

                        const timeStr = new Date(msg.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            {!isAdmin && (
                              <div className="mb-1 text-[10px] text-slate-600 font-bold">
                                {msg.sender_name || msg.profiles?.full_name || 'Pelapor'}
                              </div>
                            )}

                            <div
                              className={`rounded-2xl px-3.5 py-2 max-w-[85%] text-xs leading-relaxed ${
                                isAdmin
                                  ? 'bg-[#c00015] text-white rounded-tr-none shadow-2xs'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.message}</p>
                              {msg.file_url && (
                                <button
                                  type="button"
                                  onClick={() => setActivePhoto(msg.file_url)}
                                  className="mt-1.5 block rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition text-left cursor-pointer"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={msg.file_url}
                                    alt="Lampiran bukti"
                                    className="max-h-36 w-auto object-cover rounded"
                                  />
                                </button>
                              )}
                              <div
                                className={`text-[10px] text-right mt-1 font-medium select-none ${
                                  isAdmin ? 'text-white/80' : 'text-slate-400'
                                }`}
                              >
                                {timeStr}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Pinned Bottom: Form Input */}
                  <div className="p-2.5 sm:px-3 border-t border-slate-200 bg-white shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ketik balasan untuk pelapor..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !inputText.trim()}
                        className="px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                      >
                        {isSending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Kirim</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
                  Pilih salah satu tiket di sebelah kiri untuk membuka ruang obrolan warga.
                </div>
              )}
            </div>
          </div>

          {/* Modal Lightbox Foto Resolusi Penuh */}
          {activePhoto && (
            <div
              onClick={() => setActivePhoto(null)}
              className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs cursor-pointer animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-2xl max-h-[85vh] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto}
                  alt="Foto Bukti Diperbesar"
                  className="max-h-[80vh] max-w-full w-auto rounded-xl object-contain shadow-2xl"
                />
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/90 hover:bg-black text-white rounded-full shadow-lg transition cursor-pointer"
                  title="Tutup foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </>
  )
}
