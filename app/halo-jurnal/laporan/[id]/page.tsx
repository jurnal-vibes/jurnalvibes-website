'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ThumbsUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  Paperclip,
  Share2,
  Lock,
  EyeOff,
  Check,
  AlertTriangle,
  MessageSquare,
  Globe,
  Search,
  FileCheck,
} from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'
import { normalizeCategoryName } from '@/data/haloJurnalCategories'

export default function HaloJurnalLaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLocalAuthor, setIsLocalAuthor] = useState(false)
  const [showChatSimulation, setShowChatSimulation] = useState(false)

  // Chat states
  const [messages, setMessages] = useState<any[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatFile, setChatFile] = useState<File | null>(null)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatFileRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            setUser(null)
          }
        }
      }
    }
    checkUser()
    window.addEventListener('storage', checkUser)
    return () => window.removeEventListener('storage', checkUser)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        const localList = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
        const isOwner = localList.some(
          (r: any) => r.id === id || r.ticket_number === id || r.nomor_tiket === id
        )
        setIsLocalAuthor(isOwner)
      } catch {
        setIsLocalAuthor(false)
      }
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchReportDetail()
      fetchChatMessages()
    }
  }, [id, user])

  // Realtime subscription for chat messages
  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`chat_messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `laporan_id=eq.${id}`,
        },
        async (payload: any) => {
          const newMsg = payload.new
          if (!newMsg) return

          const { data: fullMsg } = await supabase
            .from('chat_messages')
            .select(`*, profiles:sender_id(full_name, role)`)
            .eq('id', newMsg.id)
            .single()

          const msgToAdd = fullMsg || newMsg

          setMessages((prev) => {
            if (prev.some((m) => m.id === msgToAdd.id)) {
              return prev
            }
            return [...prev, msgToAdd]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, supabase])

  useEffect(() => {
    if (showChatSimulation || (user && report && (report.user_id === user.id || isLocalAuthor))) {
      scrollToBottom()
    }
  }, [messages, showChatSimulation])

  const fetchChatMessages = async () => {
    try {
      const { data: chatData, error } = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', id)
        .order('created_at', { ascending: true })

      let merged = chatData || []
      if (typeof window !== 'undefined') {
        const local = JSON.parse(
          localStorage.getItem(`halo_jurnal_chat_${id}`) ||
          (report?.nomor_tiket ? localStorage.getItem(`halo_jurnal_chat_${report.nomor_tiket}`) : null) ||
          '[]'
        )
        const map = new Map<string, any>()
        merged.forEach((m: any) => map.set(m.id, m))
        local.forEach((m: any) => {
          if (!map.has(m.id)) map.set(m.id, m)
        })
        merged = Array.from(map.values()).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }
      setMessages(merged)
    } catch {
      if (typeof window !== 'undefined') {
        const local = JSON.parse(
          localStorage.getItem(`halo_jurnal_chat_${id}`) ||
          (report?.nomor_tiket ? localStorage.getItem(`halo_jurnal_chat_${report.nomor_tiket}`) : null) ||
          '[]'
        )
        setMessages(local)
      }
    }
  }

  useEffect(() => {
    fetchChatMessages()
    window.addEventListener('storage', fetchChatMessages)
    window.addEventListener('focus', fetchChatMessages)
    return () => {
      window.removeEventListener('storage', fetchChatMessages)
      window.removeEventListener('focus', fetchChatMessages)
    }
  }, [id, report?.nomor_tiket])

  const fetchReportDetail = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('laporan')
        .select(`
          *,
          laporan_lampiran(*),
          status_log(*)
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        let found = DUMMY_REPORTS.find((r) => r.id === id || r.nomor_tiket === id)
        if (!found && typeof window !== 'undefined') {
          try {
            const localList = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
            found = localList.find((r: any) => r.id === id || r.ticket_number === id || r.nomor_tiket === id)
          } catch {}
        }

        // Terapkan override status dari admin jika ada
        if (found && typeof window !== 'undefined') {
          try {
            const overrides = JSON.parse(localStorage.getItem('halo_jurnal_status_overrides') || '{}')
            const saved = overrides[found.id] || (found.nomor_tiket ? overrides[found.nomor_tiket] : null)
            if (saved) {
              found = {
                ...found,
                status: saved.status || found.status,
                is_public: saved.is_public !== undefined ? saved.is_public : found.is_public,
                status_log: saved.status_log || found.status_log,
              }
            }
          } catch {}
        }

        setReport(found || null)
      } else {
        setReport(data)
        if (user) {
          const { data: likeData } = await supabase
            .from('dukungan')
            .select('id')
            .eq('laporan_id', id)
            .eq('user_id', user.id)
            .single()
          setHasLiked(!!likeData)
        }
      }
    } catch {
      let found = DUMMY_REPORTS.find((r) => r.id === id || r.nomor_tiket === id)
      if (!found && typeof window !== 'undefined') {
        try {
          const localList = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
          found = localList.find((r: any) => r.id === id || r.ticket_number === id || r.nomor_tiket === id)
        } catch {}
      }

      // Terapkan override status dari admin jika ada
      if (found && typeof window !== 'undefined') {
        try {
          const overrides = JSON.parse(localStorage.getItem('halo_jurnal_status_overrides') || '{}')
          const saved = overrides[found.id] || (found.nomor_tiket ? overrides[found.nomor_tiket] : null)
          if (saved) {
            found = {
              ...found,
              status: saved.status || found.status,
              is_public: saved.is_public !== undefined ? saved.is_public : found.is_public,
              status_log: saved.status_log || found.status_log,
            }
          }
        } catch {}
      }

      setReport(found || null)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk memberi dukungan.')
      return
    }
    if (isLiking || !report) return

    setIsLiking(true)
    const nextLiked = !hasLiked
    setHasLiked(nextLiked)
    setReport((prev: any) => ({
      ...prev,
      dukungan_count: nextLiked
        ? (prev?.dukungan_count || 0) + 1
        : Math.max(0, (prev?.dukungan_count || 0) - 1),
    }))

    try {
      if (nextLiked) {
        await supabase.from('dukungan').insert({ laporan_id: id, user_id: user.id })
      } else {
        await supabase.from('dukungan').delete().eq('laporan_id', id).eq('user_id', user.id)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    let activeUser = user
    if (!activeUser && typeof window !== 'undefined') {
      activeUser = {
        id: 'citizen-demo-sukabumi',
        email: 'warga@sukabumi.com',
        full_name: 'Warga Sukabumi',
        role: 'citizen',
        nik: '3202112345670001',
        ktp_verified: true,
        user_metadata: { full_name: 'Warga Sukabumi' },
      }
      setUser(activeUser)
      localStorage.setItem('halo_jurnal_current_user', JSON.stringify(activeUser))
      window.dispatchEvent(new Event('storage'))
    }

    if (!chatMessage.trim() && !chatFile) return

    setIsSendingChat(true)
    try {
      let fileUrl = null
      let fileType = null

      if (chatFile) {
        const fileExt = chatFile.name.split('.').pop()
        const fileName = `${id}-${Date.now()}.${fileExt}`
        const filePath = `${activeUser?.id || 'demo'}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('laporan-lampiran')
          .upload(filePath, chatFile)

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('laporan-lampiran')
            .getPublicUrl(filePath)
          fileUrl = publicUrlData.publicUrl
          fileType = chatFile.type
        }
      }

      let sentMsg = null
      try {
        const { data: newMsg, error } = await supabase
          .from('chat_messages')
          .insert({
            laporan_id: id,
            sender_id: user.id,
            message: chatMessage.trim() || 'Mengirim lampiran berkas',
            file_url: fileUrl,
            file_type: fileType,
          })
          .select(`*, profiles:sender_id(full_name, role)`)
          .single()

        if (!error && newMsg) {
          sentMsg = newMsg
        }
      } catch {}

      if (!sentMsg) {
        sentMsg = {
          id: `chat-citizen-${Date.now()}`,
          laporan_id: id,
          sender_id: user.id,
          message: chatMessage.trim() || 'Mengirim berkas',
          file_url: fileUrl,
          file_type: fileType,
          created_at: new Date().toISOString(),
          profiles: {
            full_name: user?.user_metadata?.full_name || 'Warga Pelapor',
            role: 'citizen',
          },
        }
      }

      setMessages((prev) => {
        const next = [...prev, sentMsg]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`halo_jurnal_chat_${id}`, JSON.stringify(next))
            if (report?.nomor_tiket) {
              localStorage.setItem(`halo_jurnal_chat_${report.nomor_tiket}`, JSON.stringify(next))
            }
            window.dispatchEvent(new Event('storage'))
          } catch {}
        }
        return next
      })
      setChatMessage('')
      setChatFile(null)
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setIsSendingChat(false)
    }
  }

  // Format date helper matching: "4 Sep 2026, 15.31"
  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const dateFormatted = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${dateFormatted}, ${hours}.${minutes}`
    } catch {
      return dateStr
    }
  }

  // Construct status timeline items (difilter dari log teknis database yang membingungkan warga)
  const getTimelineItems = () => {
    if (report?.status_log && report.status_log.length > 0) {
      // 1. Saring pesan teknis seperti perubahan visibilitas internal
      const meaningfulLogs = report.status_log.filter((log: any) => {
        if (!log.catatan) return true
        const text = log.catatan.toLowerCase()
        if (
          text.startsWith('visibilitas laporan diatur') ||
          text.includes('visibilitas diatur ke')
        ) {
          return false
        }
        return true
      })

      if (meaningfulLogs.length > 0) {
        return [...meaningfulLogs]
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((log: any) => {
            let title = 'Laporan Diterima'
            if (log.status === 'selesai') title = 'Laporan Selesai Dituntaskan'
            else if (log.status === 'ditindaklanjuti') title = 'Koordinasi Dinas Instansi'
            else if (log.status === 'diproses') title = 'Investigasi Lapangan'

            let defaultNote = 'Laporan telah diverifikasi oleh tim Halo Jurnal.'
            if (log.status === 'selesai') {
              defaultNote = 'Penanganan masalah telah dituntaskan dan dikonfirmasi selesai.'
            } else if (log.status === 'ditindaklanjuti') {
              defaultNote = 'Laporan diteruskan ke instansi dinas berwenang untuk tindak lanjut teknis.'
            } else if (log.status === 'diproses') {
              defaultNote = 'Tim redaksi sedang memvalidasi fakta dan menginvestigasi kondisi lapangan.'
            }

            return {
              id: log.id,
              status: log.status,
              title,
              date: formatLogDate(log.created_at),
              catatan: log.catatan || defaultNote,
            }
          })
      }
    }

    // Fallback yang rapi & berbobot
    const items = []
    const createdAt = report?.created_at || new Date().toISOString()

    if (report?.status === 'selesai') {
      items.push({
        id: 'log-3',
        status: 'selesai',
        title: 'Laporan Selesai Dituntaskan',
        date: formatLogDate(new Date(new Date(createdAt).getTime() + 86400000 * 3).toISOString()),
        catatan: 'Penanganan masalah telah selesai dituntaskan dan terverifikasi di lapangan.',
      })
    }
    if (report?.status === 'selesai' || report?.status === 'ditindaklanjuti') {
      items.push({
        id: 'log-2',
        status: 'ditindaklanjuti',
        title: 'Koordinasi Dinas Terkait',
        date: formatLogDate(new Date(new Date(createdAt).getTime() + 86400000 * 2).toISOString()),
        catatan: 'Laporan diteruskan ke instansi dinas berwenang Kabupaten/Kota Sukabumi.',
      })
    }
    if (report?.status === 'selesai' || report?.status === 'ditindaklanjuti' || report?.status === 'diproses') {
      items.push({
        id: 'log-1b',
        status: 'diproses',
        title: 'Investigasi Lapangan',
        date: formatLogDate(new Date(new Date(createdAt).getTime() + 86400000 * 1).toISOString()),
        catatan: 'Tim redaksi memvalidasi bukti dan melakukan investigasi di lokasi.',
      })
    }

    items.push({
      id: 'log-1',
      status: 'diterima',
      title: 'Laporan Diterima Sistem',
      date: formatLogDate(createdAt),
      catatan: 'Laporan warga berhasil diterima dan diverifikasi dengan nomor tiket sah.',
    })

    return items
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-secondary">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs">Memuat detail laporan...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-extrabold text-xl text-on-surface mb-2">
          Laporan Tidak Ditemukan
        </h2>
        <p className="text-secondary text-xs sm:text-sm mb-6">
          Laporan dengan nomor ID tersebut tidak ditemukan atau bersifat privat.
        </p>
        <Link
          href="/halo-jurnal/feed-publik"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Feed Publik</span>
        </Link>
      </div>
    )
  }

  const isAuthor =
    (user && report && (report.user_id === user.id || report.email === user.email)) || isLocalAuthor
  const isAdmin = user && (user.role === 'admin' || user.email?.includes('admin'))
  const canAccessChat = isAuthor || isAdmin || showChatSimulation
  const ticketDisplayId =
    report.nomor_tiket ||
    report.ticket_number ||
    (report.id && report.id.startsWith('JS-') ? report.id : `JS-${report.id.substring(0, 8)}`)
  const timelineItems = getTimelineItems()

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary mb-6 font-medium">
        <Link
          href="/halo-jurnal/feed-publik"
          className="hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <span>Feed Publik</span>
        </Link>
        <span className="text-secondary/50 font-semibold">&gt;</span>
        <span className="text-primary font-bold font-mono">ID #{ticketDisplayId}</span>
      </div>

      {/* Banner Peringatan Laporan Privat / Disembunyikan */}
      {report.is_public === false && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-start gap-3.5 shadow-md">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                Laporan Bersifat Privat / Rahasia
              </span>
              <span className="text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                Disembunyikan dari Feed Publik
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Laporan ini disembunyikan dari Feed Publik warga oleh Redaksi Halo Jurnal. Hanya pemilik nomor tiket{' '}
              <code className="text-amber-300 font-mono font-bold">{ticketDisplayId}</code> dan admin redaksi yang
              dapat memantau penanganan ini. Dukungan publik dinonaktifkan.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Report Details & Riwayat Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs">
            {/* Header: Category Badge + Status Badge + Dukung Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="bg-surface-container-high border border-outline-variant/80 text-secondary font-bold text-[11px] tracking-wider px-3 py-1 rounded-lg uppercase">
                  {normalizeCategoryName(report.kategori) || report.jenis || 'Umum'}
                </span>
                {report.is_public === false ? (
                  <span className="inline-flex items-center gap-1 bg-surface-container-high text-secondary text-[11px] font-medium px-2.5 py-1 rounded-lg border border-outline-variant/60">
                    <Lock className="w-3 h-3 text-secondary" />
                    <span>Privat</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-surface-container-high text-secondary text-[11px] font-medium px-2.5 py-1 rounded-lg border border-outline-variant/60">
                    <Globe className="w-3 h-3 text-secondary" />
                    <span>Publik</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status */}
                {report.status === 'selesai' && (
                  <span className="text-xs font-bold text-secondary dark:text-slate-400 tracking-tight">
                    Selesai
                  </span>
                )}
                {report.status === 'ditindaklanjuti' && (
                  <span className="text-xs font-bold text-secondary dark:text-slate-400 tracking-tight">
                    Ditindaklanjuti
                  </span>
                )}
                {report.status === 'diproses' && (
                  <span className="text-xs font-bold text-secondary dark:text-slate-400 tracking-tight">
                    Diproses
                  </span>
                )}
                {report.status === 'diterima' && (
                  <span className="text-xs font-bold text-secondary dark:text-slate-400 tracking-tight">
                    Diterima
                  </span>
                )}

                {/* Dukung Button */}
                {report.is_public === false ? (
                  <span
                    title="Dukungan publik dinonaktifkan karena laporan ini berstatus privat"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed select-none"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dukungan Dinonaktifkan</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      hasLiked
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'border-[#a83232]/50 text-[#852221] dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                    <span>Dukung Laporan ({report.dukungan_count || 0})</span>
                  </button>
                )}

                {/* Bagikan */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: report.judul,
                        url: window.location.href,
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Tautan laporan disalin ke clipboard!')
                    }
                  }}
                  className="p-1.5 text-secondary hover:text-on-surface transition-colors cursor-pointer rounded-lg hover:bg-surface-container-high"
                  title="Bagikan Laporan"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-4 capitalize">
              {report.judul}
            </h1>

            {/* Metadata Rows */}
            <div className="space-y-2.5 text-xs sm:text-sm text-secondary mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0 text-secondary/80" />
                <span>
                  Dilaporkan pada{' '}
                  {new Date(report.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-start gap-2 text-primary font-medium">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{report.lokasi || 'Sukabumi, Jawa Barat, Indonesia'}</span>
              </div>

              <div className="flex items-center gap-2 text-secondary italic">
                <EyeOff className="w-4 h-4 shrink-0 text-secondary/70" />
                <span>Pelapor Anonim (Terenkripsi)</span>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-6 border-outline-variant/60" />

            {/* Section: Deskripsi Laporan */}
            <div className="mb-8">
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface mb-2.5">
                Deskripsi Laporan
              </h2>
              <p className="text-on-surface text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {report.deskripsi}
              </p>
            </div>

            {/* Section: Lampiran Bukti */}
            <div className="mb-8">
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface mb-3">
                Lampiran Bukti
              </h2>
              {report.laporan_lampiran && report.laporan_lampiran.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {report.laporan_lampiran.map((lampiran: any) => (
                    <a
                      key={lampiran.id || lampiran.file_url}
                      href={lampiran.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high relative block aspect-video"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={lampiran.file_url}
                        alt="Bukti Lampiran"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/60 text-xs text-secondary">
                  Tidak ada berkas lampiran yang dilampirkan.
                </div>
              )}
            </div>

            {/* Section: Riwayat Status (Tampilan Bersih & Rapi Persis Versi Awal) */}
            <div className="pt-2">
              <div className="pb-3 mb-6 border-b border-outline-variant/60">
                <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
                  Riwayat Status
                </h2>
              </div>

              <div className="relative pl-8 space-y-7 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-outline-variant/70">
                {timelineItems.map((item, idx) => {
                  const isCompleted = item.status === 'selesai'

                  return (
                    <div key={item.id || idx} className="relative">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-8 top-0.5">
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-2xs">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant text-secondary flex items-center justify-center shadow-2xs">
                            <Send className="w-3.5 h-3.5 -rotate-45" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="pl-3 sm:pl-4">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface">
                          {item.title}
                        </h3>
                        <p className="text-xs text-secondary mt-0.5 mb-2 font-normal">
                          {item.date}
                        </p>

                        {/* Note Box */}
                        <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-xs sm:text-sm text-on-surface leading-relaxed max-w-xl">
                          {item.catatan}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Langsung Redaksi (Selalu Aktif & Terbuka) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className="pb-3 mb-4 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface">
                    Chat Langsung Redaksi
                  </h3>
                  <p className="text-[11px] text-secondary">
                    Ruang privat pelapor &amp; admin
                  </p>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 mb-4 no-scrollbar">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = user && msg.sender_id === user.id
                  const isAdminMsg =
                    msg.profiles?.role === 'admin' || msg.profiles?.role === 'superadmin'

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-secondary">
                        <span className="font-bold text-on-surface">
                          {isAdminMsg ? '🛡️ Admin Redaksi' : msg.profiles?.full_name || 'Warga Pelapor'}
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
                        className={`rounded-2xl px-3.5 py-2 max-w-[88%] text-xs leading-relaxed ${
                          isMine
                            ? 'bg-primary text-white rounded-br-2xs'
                            : isAdminMsg
                            ? 'bg-surface-container-highest border border-outline-variant text-on-surface rounded-bl-2xs'
                            : 'bg-surface-container-high text-on-surface rounded-bl-2xs'
                        }`}
                      >
                        <p>{msg.message}</p>
                        {msg.file_url && (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block rounded-lg overflow-hidden border border-white/20"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.file_url}
                              alt="Attachment"
                              className="max-h-32 object-cover"
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 px-2 text-xs text-secondary">
                  <p className="text-[11px] leading-relaxed">
                    Belum ada percakapan. Kirim pesan untuk menambahkan keterangan atau bukti foto kepada tim redaksi.
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Section */}
            {user ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                {chatFile && (
                  <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl text-xs text-primary">
                    <span className="truncate">{chatFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setChatFile(null)}
                      className="text-rose-500 font-bold ml-2 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={chatFileRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) setChatFile(e.target.files[0])
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => chatFileRef.current?.click()}
                    className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-secondary hover:text-on-surface transition-colors cursor-pointer shrink-0"
                    title="Lampirkan foto"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Kirim pesan klarifikasi..."
                    className="flex-1 px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                  />

                  <button
                    type="submit"
                    disabled={isSendingChat}
                    className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                  >
                    {isSendingChat ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 text-center">
                <p className="text-xs text-secondary mb-3 leading-relaxed">
                  Masuk dengan akun Anda untuk mengirim pesan atau bukti klarifikasi kepada redaksi.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Masuk untuk Mengirim Pesan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
