'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare,
  Search,
  Send,
  Loader2,
  ShieldCheck,
  ExternalLink,
  User,
  RefreshCw,
  MapPin,
  Clock,
  FileText,
  ArrowLeft,
} from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'
import { createClient } from '@/lib/supabase/client'

function ChatDeskContent() {
  const searchParams = useSearchParams()
  const initialTicketParam = searchParams.get('ticket') || searchParams.get('id')

  // Semua daftar tiket laporan (dummy + user)
  const [reports, setReports] = useState<DummyReport[]>(DUMMY_REPORTS)
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketParam || DUMMY_REPORTS[0]?.nomor_tiket || DUMMY_REPORTS[0]?.id
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'semua' | 'belum_dibalas' | 'ktp_sah'>('semua')
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [mobilePane, setMobilePane] = useState<'inbox' | 'chat'>('inbox')
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Map ringkasan pesan terakhir per tiket
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

  // Muat daftar laporan lengkap (DUMMY + user created)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userReports = JSON.parse(
          localStorage.getItem('halo_jurnal_user_reports') || '[]'
        )
        const combined = [...userReports, ...DUMMY_REPORTS]
        const map = new Map<string, any>()
        combined.forEach((item) => {
          const key = item.nomor_tiket || item.id || item.ticket_number
          if (key && !map.has(key)) map.set(key, item)
        })
        const allList = Array.from(map.values())
        setReports(allList)

        if (initialTicketParam) {
          setSelectedTicketId(initialTicketParam)
        } else if (allList.length > 0 && !selectedTicketId) {
          setSelectedTicketId(allList[0].nomor_tiket || allList[0].id)
        }
      } catch (err) {
        console.error('Error loading reports in chat desk:', err)
      }
    }
  }, [initialTicketParam])

  // Scan metadata percakapan untuk seluruh tiket
  const scanAllTicketChats = () => {
    if (typeof window !== 'undefined') {
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
            const isCitizenLast =
              lastMsg.sender_id !== 'admin-redaksi' &&
              lastMsg.profiles?.role !== 'admin' &&
              lastMsg.role !== 'admin'
            const unread = sorted.filter(
              (m) =>
                m.sender_id !== 'admin-redaksi' &&
                m.profiles?.role !== 'admin' &&
                !readSet.has(m.id)
            ).length

            const metaPayload = {
              lastMessage: lastMsg.message || 'Mengirim berkas lampiran',
              lastTime: lastMsg.created_at,
              unreadCount: unread,
              isWaitingAdmin: isCitizenLast,
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
        console.error('Error scanning ticket chats:', err)
      }
    }
  }

  // Muat pesan tiket yang sedang aktif dipilih
  const loadActiveMessages = async () => {
    if (!selectedTicketId) return
    const activeReport = reports.find(
      (r) => r.id === selectedTicketId || r.nomor_tiket === selectedTicketId
    )
    const targetId = activeReport?.id || selectedTicketId
    const targetTicket = activeReport?.nomor_tiket

    let chatData: any = null
    try {
      const supabase = createClient()
      const res = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', targetId)
        .order('created_at', { ascending: true })
      chatData = res.data
    } catch {}

    let merged = chatData || []
    if (typeof window !== 'undefined') {
      const local = JSON.parse(
        localStorage.getItem(`halo_jurnal_chat_${targetId}`) ||
        (targetTicket ? localStorage.getItem(`halo_jurnal_chat_${targetTicket}`) : null) ||
        '[]'
      )
      const map = new Map<string, any>()
      merged.forEach((m: any) => map.set(m.id, m))
      local.forEach((m: any) => {
        if (!map.has(m.id)) map.set(m.id, m)
      })
      merged = Array.from(map.values()).sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }

    setMessages(merged)

    // Tandai pesan tiket ini sebagai sudah dibaca
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

  useEffect(() => {
    scanAllTicketChats()
    loadActiveMessages()

    const handleStorage = () => {
      scanAllTicketChats()
      loadActiveMessages()
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [selectedTicketId, reports])

  // Auto-scroll saat pesan masuk
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Kirim pesan balasan resmi redaksi
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedTicketId) return

    setIsSending(true)
    const activeReport = reports.find(
      (r) => r.id === selectedTicketId || r.nomor_tiket === selectedTicketId
    )
    const targetId = activeReport?.id || selectedTicketId
    const targetTicket = activeReport?.nomor_tiket
    const text = inputText.trim()

    let sentMsg: any = null
    try {
      const supabase = createClient()
      const { data: newMsg, error } = await supabase
        .from('chat_messages')
        .insert({
          laporan_id: targetId,
          sender_id: 'admin-redaksi',
          message: text,
        })
        .select(`*, profiles:sender_id(full_name, role)`)
        .single()

      if (!error && newMsg) sentMsg = newMsg
    } catch {}

    if (!sentMsg) {
      sentMsg = {
        id: `chat-admin-${Date.now()}`,
        laporan_id: targetId,
        sender_id: 'admin-redaksi',
        message: text,
        created_at: new Date().toISOString(),
        profiles: {
          full_name: '🛡️ Redaksi Halo Jurnal',
          role: 'admin',
        },
      }
    }

    const next = [...messages, sentMsg]
    setMessages(next)
    setInputText('')

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`halo_jurnal_chat_${targetId}`, JSON.stringify(next))
        if (targetTicket) {
          localStorage.setItem(`halo_jurnal_chat_${targetTicket}`, JSON.stringify(next))
        }
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving chat in desk:', err)
      }
    }

    setIsSending(false)
  }

  // Filter percakapan di panel kiri
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
    if (filterType === 'ktp_sah') {
      return !(rep as any).is_anonim
    }
    return true
  })

  // Data tiket terpilih
  const currentReport = reports.find(
    (r) => r.id === selectedTicketId || r.nomor_tiket === selectedTicketId
  )

  return (
    <div className="space-y-3">
      {/* Header Bar Bersih & Presisi */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-lg font-heading font-bold text-slate-900 tracking-tight">
            Pusat Chat Warga
          </h1>
          <p className="text-xs text-slate-500">
            Kanal koordinasi resmi redaksi dengan para pelapor aduan Sukabumi
          </p>
        </div>

        <button
          onClick={() => {
            scanAllTicketChats()
            loadActiveMessages()
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Main Full-Height 2-Panel Workspace (Locked to Viewport, Input Always Visible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-175px)] md:h-[calc(100vh-210px)] min-h-[480px] max-h-[760px]">
        {/* ================= PANEL KIRI: INBOX TIKET WARGA ================= */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex-col bg-slate-50/50 shrink-0 h-full overflow-hidden ${mobilePane === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          {/* Search Bar & Filter */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tiket, judul, lokasi..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { key: 'semua', label: 'Semua' },
                { key: 'belum_dibalas', label: 'Belum Dibalas' },
                { key: 'ktp_sah', label: 'KTP Sah' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
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

          {/* List Tiket Percakapan (Scrollable) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 [scrollbar-width:thin]">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">Tidak ada percakapan</p>
                <p className="text-[11px]">Coba ubah kata kunci atau filter.</p>
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
                    className={`p-3 transition cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-red-50/70 border-l-2 border-l-[#c00015]'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-900 shrink-0">
                          {rep.nomor_tiket}
                        </span>
                        {isWaiting && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 shrink-0">
                            Butuh Balasan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
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
        <div className={`flex-1 flex-col bg-white h-full overflow-hidden min-w-0 ${mobilePane === 'inbox' ? 'hidden md:flex' : 'flex'}`}>
          {currentReport ? (
            <>
              {/* Header Obrolan Tunggal Rapi & Elegan (1 Baris Utuh Tanpa Pita Bertumpuk) */}
              <div className="px-3.5 sm:px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Tombol Kembali ke Daftar Tiket di Layar HP */}
                  <button
                    type="button"
                    onClick={() => setMobilePane('inbox')}
                    className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer shrink-0"
                    title="Kembali ke Daftar Tiket"
                    aria-label="Kembali ke Daftar Tiket"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-heading font-bold text-slate-900 truncate">
                      {currentReport.judul}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mt-0.5">
                      <span className="font-mono font-semibold text-slate-700">
                        {currentReport.nomor_tiket}
                      </span>
                      <span>•</span>
                      <span>
                        {(currentReport as any).is_anonim ? 'Pelapor Anonim' : 'Warga Sukabumi'}
                      </span>
                      {!(currentReport as any).is_anonim && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            KTP Sah
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="truncate flex items-center gap-0.5 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{currentReport.lokasi}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Akses Berkas Laporan */}
                <Link
                  href={`/halo-jurnal/admin/laporan/${currentReport.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition shadow-2xs shrink-0 cursor-pointer"
                >
                  <span className="hidden sm:inline">Buka Berkas</span>
                  <span className="sm:hidden">Berkas</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>

              {/* Area Balon Percakapan (Scrollable Tengah) */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 [scrollbar-width:thin]"
              >
                {messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400 space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <p className="font-semibold text-slate-700">Belum ada percakapan langsung</p>
                    <p className="text-[11px] max-w-sm mx-auto text-slate-400">
                      Gunakan template balasan cepat atau ketik pesan di bawah untuk memulai koordinasi resmi dengan pelapor.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin =
                      msg.sender_id === 'admin-redaksi' ||
                      msg.profiles?.role === 'admin' ||
                      msg.role === 'admin'

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                          <span
                            className={`font-bold ${
                              isAdmin ? 'text-[#c00015]' : 'text-slate-800'
                            }`}
                          >
                            {isAdmin ? 'Redaksi Halo Jurnal' : (msg.profiles?.full_name || 'Pelapor')}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-[#c00015] text-white rounded-tr-none shadow-2xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.message}</p>
                          {msg.file_url && (
                            <a
                              href={msg.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition"
                            >
                              <img
                                src={msg.file_url}
                                alt="Lampiran bukti"
                                className="max-h-48 w-auto object-cover rounded"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Pinned Bottom: Template Chips & Form Input */}
              <div className="p-3 sm:px-4 border-t border-slate-200 bg-white space-y-2 shrink-0">
                {/* Template Balasan Cepat Ringkas */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400 mr-0.5">Template:</span>
                  {[
                    {
                      label: 'Minta Foto Bukti',
                      text: 'Halo Bapak/Ibu pelapor, mohon bantuannya untuk mengirimkan foto atau video bukti tambahan dari sudut berbeda di lokasi.',
                    },
                    {
                      label: 'Konfirmasi Patokan Titik',
                      text: 'Mohon konfirmasi patokan atau landmark terdekat di sekitar titik lokasi untuk mempermudah tim verifikasi lapangan kami.',
                    },
                    {
                      label: 'Jadwal Cek Lapangan',
                      text: 'Tim redaksi investigasi kami saat ini sedang bergerak menuju lokasi untuk melakukan pengecekan faktual.',
                    },
                    {
                      label: 'Disposisi ke Dinas',
                      text: 'Laporan Anda telah kami teruskan secara resmi ke dinas teknis terkait untuk ditindaklanjuti secara administratif.',
                    },
                  ].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(tmpl.text)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition cursor-pointer"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                {/* Form Input Kirim Pesan */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tulis pesan klarifikasi resmi untuk pelapor tiket ini..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputText.trim()}
                    className="px-4 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
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
    </div>
  )
}

export default function AdminChatPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-slate-400">
          Memuat Pusat Chat Warga...
        </div>
      }
    >
      <ChatDeskContent />
    </Suspense>
  )
}
