'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLocalAuthor, setIsLocalAuthor] = useState(false)
  const [showChatSimulation, setShowChatSimulation] = useState(false)

  // Chat states
  const [messages, setMessages] = useState<any[]>([])
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
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
    const checkUser = () => {
      if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined' && id && user) {
      try {
        const localList = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
        const currentUserId = user.id
        const currentUserEmail = (user.email || '').toLowerCase().trim()

        const isOwner = localList.some((r: any) => {
          const isTargetReport = r.id === id || r.ticket_number === id || r.nomor_tiket === id
          if (!isTargetReport) return false

          const reportUserId = r.user_id || r.userId
          const reportEmail = (r.email || r.user_email || r.pelaporEmail || r.pelapor_email || '').toLowerCase().trim()

          if (currentUserId && reportUserId && reportUserId === currentUserId) return true
          if (currentUserEmail && reportEmail && reportEmail === currentUserEmail) return true
          return false
        })
        setIsLocalAuthor(isOwner)
      } catch {
        setIsLocalAuthor(false)
      }
    } else {
      setIsLocalAuthor(false)
    }
  }, [id, user])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('sukses=1')) {
      setShowSuccessBanner(true)
    }
    if (id) {
      fetchReportDetail()
      fetchChatMessages()
    }
  }, [id, user])

  useEffect(() => {
    if (showChatSimulation || (user && report && (report.user_id === user.id || isLocalAuthor))) {
      scrollToBottom()
    }
  }, [messages, showChatSimulation])

  const fetchChatMessages = async () => {
    const ticketNum = report?.nomor_tiket || report?.ticket_number || report?.ticketNumber || id
    if (!ticketNum) return

    let dbMessages: any[] = []
    try {
      const res = await fetch(`/api/chat?ticketNumber=${encodeURIComponent(ticketNum)}`, {
        cache: 'no-store',
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        dbMessages = json.data.map((m: any) => ({
          id: m.id,
          sender: m.sender_name || 'Redaksi',
          sender_name: m.sender_name || 'Redaksi',
          role: m.role || 'warga',
          message: m.message,
          created_at: m.created_at,
          profiles: {
            full_name: m.sender_name,
            role: m.role,
          },
        }))
      }
    } catch (err) {
      console.warn('Gagal memuat chat dari API:', err)
    }

    if (dbMessages.length > 0) {
      setMessages(dbMessages)
      return
    }

    // Fallback ke localStorage jika chat belum ada di database
    if (typeof window !== 'undefined') {
      const chatKey = report?.nomor_tiket || report?.ticket_number || id
      let local = JSON.parse(
        localStorage.getItem(`halo_jurnal_chat_${chatKey}`) ||
        localStorage.getItem(`halo_jurnal_chat_${id}`) ||
        '[]'
      )
      if (local.length === 0 && report) {
        const ticket = report.nomor_tiket || report.ticket_number || id
        const pelapor = (report as any).pelaporName || (report as any).nama_pelapor || 'Warga'
        const initialSystemMessage = {
          id: `sys-${Date.now()}`,
          sender: 'Redaksi Halo Jurnal',
          sender_name: 'Redaksi Halo Jurnal',
          role: 'admin',
          avatar: '/logo-white.png',
          message: `Halo ${pelapor}, laporan Anda dengan Nomor Tiket #${ticket} telah diterima oleh Redaksi Halo Jurnal. Tim kami sedang memverifikasi laporan Anda. Anda dapat berkoordinasi langsung dengan tim redaksi melalui ruang obrolan ini.`,
          created_at: new Date().toISOString(),
          timestamp: 'Baru saja',
          isSystem: true,
        }
        local = [initialSystemMessage]
      }
      setMessages(local)
    }
  }

  // Polling chat otomatis setiap 5 detik agar percakapan dua arah selalu ter-update
  useEffect(() => {
    fetchChatMessages()
    const interval = setInterval(() => {
      fetchChatMessages()
    }, 5000)

    window.addEventListener('storage', fetchChatMessages)
    window.addEventListener('focus', fetchChatMessages)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', fetchChatMessages)
      window.removeEventListener('focus', fetchChatMessages)
    }
  }, [id, report?.nomor_tiket, report?.ticketNumber])

  const fetchReportDetail = async () => {
    setLoading(true)
    let found: any = null

    // 1. Coba ambil langsung dari database Neon DB via API
    try {
      const res = await fetch(`/api/reports?ticket=${encodeURIComponent(id)}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        found = json.data[0]
      }
    } catch (err) {
      console.warn('Gagal fetch laporan dari API database:', err)
    }

    // 2. Jika tidak ada di DB, cari di dummy & localStorage
    if (!found) {
      found = DUMMY_REPORTS.find((r) => r.id === id || r.nomor_tiket === id || (r as any).ticketNumber === id)
      if (!found && typeof window !== 'undefined') {
        try {
          const localList = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          found = localList.find((r: any) => r.id === id || r.ticket_number === id || r.nomor_tiket === id)
        } catch {}
      }
    }

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
    if (typeof window !== 'undefined') {
      try {
        const storedLikes: string[] = JSON.parse(localStorage.getItem('halo_jurnal_user_likes') || '[]')
        setHasLiked(storedLikes.includes(id))
      } catch {}
    }
    setLoading(false)
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

    if (typeof window !== 'undefined') {
      try {
        const storedLikes: string[] = JSON.parse(
          localStorage.getItem('halo_jurnal_user_likes') || '[]'
        )
        const nextLikes = nextLiked
          ? [...storedLikes, id]
          : storedLikes.filter((item) => item !== id)
        localStorage.setItem('halo_jurnal_user_likes', JSON.stringify(nextLikes))
      } catch {}
    }
    setIsLiking(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    let activeUser = user
    if (!activeUser && typeof window !== 'undefined') {
      activeUser = {
        id: 'warga-demo-sukabumi',
        email: 'warga@sukabumi.com',
        full_name: 'Warga Sukabumi',
        role: 'warga',
        phone: '081234567890',
        is_verified: true,
        user_metadata: { full_name: 'Warga Sukabumi', phone: '081234567890' },
      }
      setUser(activeUser)
      localStorage.setItem('halo_jurnal_current_user', JSON.stringify(activeUser))
      window.dispatchEvent(new Event('storage'))
    }

    if (!chatMessage.trim() && !chatFile) return

    setIsSendingChat(true)
    try {
      let fileUrl: string | null = null
      let fileType: string | null = null

      if (chatFile) {
        fileType = chatFile.type
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(chatFile)
        })
      }

      const ticketNum = report?.nomor_tiket || report?.ticket_number || report?.ticketNumber || id
      const textMsg = chatMessage.trim() || 'Mengirim berkas'
      const senderDisplayName = activeUser?.user_metadata?.full_name || activeUser?.full_name || 'Warga Pelapor'

      // 1. Kirim pesan ke API database Neon DB
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketNumber: ticketNum,
            message: textMsg,
            senderName: senderDisplayName,
            senderId: activeUser?.id || 'warga',
            role: 'warga',
          }),
        })
      } catch (apiErr) {
        console.warn('Gagal kirim chat ke database via API:', apiErr)
      }

      const sentMsg = {
        id: `chat-warga-${Date.now()}`,
        laporan_id: id,
        sender_id: activeUser?.id || 'warga',
        message: textMsg,
        file_url: fileUrl,
        file_type: fileType,
        created_at: new Date().toISOString(),
        profiles: {
          full_name: senderDisplayName,
          role: 'warga',
        },
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

  const isAuthenticated = Boolean(user && user.email)
  const isAuthor = Boolean(
    isAuthenticated &&
    report && (
      (report.user_id && user.id && String(report.user_id) === String(user.id)) ||
      (report.email && user.email && report.email.toLowerCase() === user.email.toLowerCase()) ||
      (report.pelapor_email && user.email && report.pelapor_email.toLowerCase() === user.email.toLowerCase()) ||
      (report.user_email && user.email && report.user_email.toLowerCase() === user.email.toLowerCase()) ||
      isLocalAuthor
    )
  )
  const isAdmin = Boolean(isAuthenticated && (user.role === 'admin' || user.email?.toLowerCase().includes('admin')))
  const canAccessChat = Boolean(isAuthenticated && (isAuthor || isAdmin))
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

      {/* Banner Sukses Kirim Laporan */}
      {showSuccessBanner && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-950 dark:text-emerald-100 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Laporan Berhasil Diterima oleh Redaksi!
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                Nomor Tiket Anda: <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">#{ticketDisplayId}</span>. Tim redaksi telah menerima laporan Anda dan membuka ruang obrolan langsung di samping untuk koordinasi verifikasi fakta.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 p-1 cursor-pointer font-bold"
            title="Tutup banner"
          >
            ✕
          </button>
        </div>
      )}

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
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs">
            {/* Header: Category Badge + Status Badge + Dukung Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] tracking-wider px-3 py-1 rounded-full uppercase">
                  {normalizeCategoryName(report.kategori) || report.jenis || 'Umum'}
                </span>
                {report.is_public === false ? (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Privat</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>Publik</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Editorial Pill (After UX style) */}
                {report.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40 text-[11px] font-semibold tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Selesai
                  </span>
                )}
                {report.status === 'ditindaklanjuti' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/40 text-[11px] font-semibold tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    Ditindaklanjuti
                  </span>
                )}
                {report.status === 'diproses' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40 text-[11px] font-semibold tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                    Diproses
                  </span>
                )}
                {report.status === 'diterima' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 text-[11px] font-semibold tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
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

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-secondary/80" />
                <span>{report.lokasi || 'Sukabumi, Jawa Barat, Indonesia'}</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-secondary/80" />
                <span>Identitas Pelapor Dilindungi (Anonim di Publik)</span>
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
        {/* Right Column: Chat Langsung Redaksi (Privat & Dilindungi Enkripsi) */}
        {/* Right Column: Chat Langsung Redaksi (Privat & Dilindungi Enkripsi - After UX Style) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
            {/* Header Chat */}
            <div className="pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 stroke-[2px]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    Chat Langsung Redaksi
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {canAccessChat ? 'Ruang privat pelapor & admin' : 'Saluran privat terenkripsi'}
                  </p>
                </div>
              </div>

              {!canAccessChat && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                  <Lock className="w-3 h-3 text-[#c00015]" />
                  <span>Terkunci</span>
                </span>
              )}
            </div>

            {canAccessChat ? (
              <>
                {/* Message Thread (HANYA DITAMPILKAN JIKA PEMILIK LAPORAN ATAU ADMIN) */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 mb-4 no-scrollbar">
                  {messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMine = user && msg.sender_id === user.id
                      const isAdminMsg =
                        !isMine && (
                          msg.role === 'admin' ||
                          msg.profiles?.role === 'admin' ||
                          msg.profiles?.role === 'superadmin' ||
                          msg.sender === 'Redaksi Halo Jurnal' ||
                          msg.sender_name === 'Redaksi Halo Jurnal' ||
                          msg.isSystem === true
                        )

                      const timeStr = (() => {
                        try {
                          const d = new Date(msg.created_at)
                          if (isNaN(d.getTime())) return 'Baru saja'
                          return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
                        } catch {
                          return 'Baru saja'
                        }
                      })()

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                        >
                          {/* Message Header Sender */}
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-secondary">
                            {isAdminMsg ? (
                              <>
                                <span className="font-bold text-primary flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                  Redaksi Halo Jurnal
                                </span>
                                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                                  Redaksi
                                </span>
                                <span>•</span>
                                <span>{timeStr}</span>
                              </>
                            ) : isMine ? (
                              <>
                                <span>{timeStr}</span>
                                <span>•</span>
                                <span className="font-bold text-on-surface">Anda</span>
                              </>
                            ) : (
                              <>
                                <span className="font-bold text-on-surface">
                                  {msg.profiles?.full_name || msg.sender_name || 'Warga Pelapor'}
                                </span>
                                <span>•</span>
                                <span>{timeStr}</span>
                              </>
                            )}
                          </div>

                          {/* Bubble Message */}
                          <div
                            className={`rounded-2xl px-4 py-2.5 max-w-[88%] text-xs leading-relaxed shadow-2xs ${
                              isMine
                                ? 'bg-primary text-white rounded-tr-2xs'
                                : isAdminMsg
                                ? 'bg-surface-container-low border border-outline-variant/80 text-on-surface rounded-tl-2xs'
                                : 'bg-surface-container text-on-surface rounded-tl-2xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.message}</p>
                            {msg.file_url && (
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 block rounded-lg overflow-hidden border border-outline-variant/40"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={msg.file_url}
                                  alt="Lampiran chat"
                                  className="max-h-36 object-cover rounded-lg"
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

                {/* Form Input Chat */}
                <form onSubmit={handleSendMessage} className="space-y-2">
                  {chatFile && (
                    <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl text-xs text-primary border border-outline-variant/60">
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
                  <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-low border border-outline-variant/80 rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
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
                      className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
                      title="Lampirkan foto"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Kirim pesan klarifikasi..."
                      className="flex-1 bg-transparent px-2 py-1 text-xs text-on-surface placeholder:text-secondary focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={isSendingChat || (!chatMessage.trim() && !chatFile)}
                      className="p-2 rounded-lg bg-primary hover:bg-primary-dark text-white disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-2xs"
                      title="Kirim pesan"
                    >
                      {isSendingChat ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* KARTU PRIVASI RESMI TERKUNCI (AFTER UX STYLE: CLEAN, MODERN & SLEEK) */
              <div className="text-center py-7 px-3 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mx-auto shadow-2xs">
                  <Lock className="w-5 h-5 text-slate-700 dark:text-slate-300 stroke-[2px]" />
                </div>

                <div className="space-y-1 max-w-xs mx-auto">
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                    Ruang Koordinasi Privat Terkunci
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Percakapan langsung dengan tim redaksi bersifat rahasia dan dilindungi enkripsi (UU PDP).
                  </p>
                </div>

                <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c00015]" />
                    <span>Akses Dibatasi Khusus:</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c00015] shrink-0" />
                      <span>Pemilik akun yang mengirim laporan ini</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c00015] shrink-0" />
                      <span>Tim Redaksi Jurnal Sukabumi yang bertugas</span>
                    </li>
                  </ul>
                </div>

                {!user ? (
                  <div className="pt-1 space-y-2">
                    <Link
                      href={`/login?redirect=/halo-jurnal/laporan/${id}#chat`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white font-heading font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Masuk sebagai Pemilik Laporan</span>
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      Belum punya akun?{' '}
                      <Link href="/daftar" className="text-[#c00015] font-semibold hover:underline">
                        Daftar Akun Baru
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="pt-1 space-y-2.5">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left">
                      <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-snug">
                        Akun aktif: <strong>{user.email}</strong>. Ruang obrolan ini khusus pemilik tiket laporan ini.
                      </p>
                    </div>
                    <Link
                      href="/halo-jurnal/lapor"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Ajukan Laporan Baru Anda Sendiri</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
