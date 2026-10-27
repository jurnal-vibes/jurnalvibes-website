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
  FileCheck,
  Inbox,
  Sparkles,
  X,
} from 'lucide-react'
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
  const [mobileTab, setMobileTab] = useState<'detail' | 'chat'>('detail')

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
  const hasLoadedReportRef = useRef(false)
  const seenChatIdsRef = useRef<Set<string>>(new Set())
  const hasInitializedChatRef = useRef(false)

  // Suara notifikasi Web Audio API yang merdu dan ramah untuk warga saat pesan redaksi masuk
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
      // Nada harmonis ramah: D5 (587.33Hz) ke A5 (880Hz)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch {}
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (
              parsed &&
              (parsed.id === 'demo-user-id' ||
                parsed.id === 'warga-demo' ||
                parsed.id === 'warga-demo-sukabumi' ||
                parsed.email === 'warga@sukabumi.com')
            ) {
              localStorage.removeItem('halo_jurnal_current_user')
              setUser(null)
            } else {
              setUser((prev: any) => {
                if (prev && parsed && prev.id === parsed.id && prev.email === parsed.email) return prev
                return parsed
              })
            }
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
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
        const currentUserPhone = (user.phone || user.phone_number || '').replace(/\D/g, '')

        const isOwner = localList.some((r: any) => {
          const isTargetReport = r.id === id || r.ticket_number === id || r.nomor_tiket === id
          if (!isTargetReport) return false

          const reportUserId = r.user_id || r.userId
          const reportEmail = (r.email || r.user_email || r.pelaporEmail || r.pelapor_email || '').toLowerCase().trim()
          const rPhone = (r.telepon || r.phone || r.pelaporPhone || '').replace(/\D/g, '')

          if (currentUserId && reportUserId && String(reportUserId) === String(currentUserId)) return true
          if (currentUserEmail && reportEmail && reportEmail === currentUserEmail) return true
          if (currentUserPhone && rPhone && rPhone === currentUserPhone) return true
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
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('sukses=1')) {
        setShowSuccessBanner(true)
        setMobileTab('chat')
      }
      if (window.location.hash === '#chat') {
        setMobileTab('chat')
      }
    }
    if (id) {
      fetchReportDetail()
      fetchChatMessages()
    }
  }, [id])

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
          sender_id: m.sender_id || m.senderId,
          sender: m.sender_name || (m.role === 'redaksi' || m.role === 'admin' ? 'Redaksi Halo Jurnal' : 'Warga Pelapor'),
          sender_name: m.sender_name || (m.role === 'redaksi' || m.role === 'admin' ? 'Redaksi Halo Jurnal' : 'Warga Pelapor'),
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

    let finalMessages: any[] = []
    if (dbMessages.length > 0) {
      finalMessages = dbMessages
    } else if (typeof window !== 'undefined') {
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
      finalMessages = local
    }

    // Periksa notifikasi suara saat ada pesan baru dari pihak redaksi / admin
    if (finalMessages.length > 0) {
      if (!hasInitializedChatRef.current) {
        // Catat pesan yang sudah ada saat halaman pertama kali dibuka
        finalMessages.forEach((m: any) => seenChatIdsRef.current.add(m.id))
        hasInitializedChatRef.current = true
      } else {
        let hasNewRedaksiMessage = false
        finalMessages.forEach((m: any) => {
          if (!seenChatIdsRef.current.has(m.id)) {
            seenChatIdsRef.current.add(m.id)
            const isRedaksi = m.role === 'redaksi' || m.role === 'admin' || m.sender_id === 'admin-redaksi'
            if (isRedaksi) {
              hasNewRedaksiMessage = true
            }
          }
        })
        if (hasNewRedaksiMessage) {
          playNotificationChime()
        }
      }
    }

    setMessages(finalMessages)
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
    if (!hasLoadedReportRef.current) {
      setLoading(true)
    }
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

    // 2. Jika tidak ada di DB, cari di laporan lokal warga
    if (!found && typeof window !== 'undefined') {
      try {
        const localList = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        found = localList.find((r: any) => r.id === id || r.ticket_number === id || r.nomor_tiket === id)
      } catch {}
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
    const ticketKey = found?.nomor_tiket || found?.ticket_number || found?.ticketNumber || found?.id || id

    if (user?.email && ticketKey) {
      try {
        const supRes = await fetch(
          `/api/reports/support?ticket=${encodeURIComponent(ticketKey)}&email=${encodeURIComponent(user.email)}`
        )
        const supData = await supRes.json()
        if (supData.success) {
          if (typeof supData.count === 'number') {
            found.dukungan_count = supData.count
            setReport({ ...found })
          }
          setHasLiked(Boolean(supData.isSupported))
        }
      } catch {}
    } else if (typeof window !== 'undefined') {
      try {
        const storedLikes: string[] = JSON.parse(localStorage.getItem('halo_jurnal_user_likes') || '[]')
        setHasLiked(storedLikes.includes(ticketKey) || storedLikes.includes(id))
      } catch {}
    }
    setLoading(false)
    hasLoadedReportRef.current = true
  }

  const handleLike = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk memberi dukungan.')
      return
    }
    if (isLiking || !report) return

    const ticketKey = report.nomor_tiket || report.ticket_number || report.ticketNumber || report.id || id
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
          ? Array.from(new Set([...storedLikes, ticketKey, id]))
          : storedLikes.filter((item) => item !== ticketKey && item !== id)
        localStorage.setItem('halo_jurnal_user_likes', JSON.stringify(nextLikes))
      } catch {}
    }

    try {
      const res = await fetch('/api/reports/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber: ticketKey,
          email: user.email,
        }),
      })
      const data = await res.json()
      if (data.success && typeof data.dukunganCount === 'number') {
        setReport((prev: any) => ({
          ...prev,
          dukungan_count: data.dukunganCount,
        }))
        setHasLiked(Boolean(data.isSupported))
      }
    } catch (err) {
      console.error('Error saving support on detail page:', err)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const activeUser = user
    if (!activeUser) {
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk mengirim tanggapan.')
      return
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

      seenChatIdsRef.current.add(sentMsg.id)
      setMessages((prev) => [...prev, sentMsg])

      if (typeof window !== 'undefined') {
        try {
          const nextLocal = [...messages, sentMsg]
          localStorage.setItem(`halo_jurnal_chat_${id}`, JSON.stringify(nextLocal))
          if (report?.nomor_tiket) {
            localStorage.setItem(`halo_jurnal_chat_${report.nomor_tiket}`, JSON.stringify(nextLocal))
          }
          setTimeout(() => {
            window.dispatchEvent(new Event('storage'))
          }, 0)
        } catch {}
      }

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
            const isStory =
              (report?.jenis || '').toLowerCase() === 'inspirasi' ||
              (report?.kategori || '').toLowerCase().includes('inspirasi')

            let title = isStory ? 'Cerita Inspirasi Diterima' : 'Laporan Diterima'
            let defaultNote = isStory
              ? 'Cerita inspirasi telah masuk ke meja kurasi redaksi Halo Jurnal.'
              : 'Laporan telah diverifikasi oleh tim Halo Jurnal.'

            if (isStory) {
              if (log.status === 'selesai') {
                title = 'Cerita Disetujui & Tayang'
                defaultNote = 'Cerita inspirasi Anda telah disetujui oleh redaksi dan ditayangkan di Feed Inspirasi Sukabumi.'
              } else if (log.status === 'ditindaklanjuti') {
                title = '🌟 Terpilih Liputan Berita'
                defaultNote = 'Selamat! Cerita inspirasi Anda terpilih oleh redaksi untuk diangkat menjadi liputan berita resmi Jurnal Sukabumi.'
              } else if (log.status === 'diproses') {
                title = 'Kurasi & Telaah Editorial'
                defaultNote = 'Tim redaktur sedang menelaah kelayakan materi dan memvalidasi keaslian cerita inspirasi.'
              } else if (log.status === 'ditolak') {
                title = 'Tidak Lolos Kurasi'
                defaultNote = 'Cerita inspirasi belum memenuhi standar kurasi redaksi.'
              }
            } else {
              if (log.status === 'selesai') {
                title = 'Laporan Selesai Dituntaskan'
                defaultNote = 'Penanganan masalah telah dituntaskan dan dikonfirmasi selesai.'
              } else if (log.status === 'ditindaklanjuti') {
                title = 'Koordinasi Dinas Instansi'
                defaultNote = 'Laporan diteruskan ke instansi dinas berwenang untuk tindak lanjut teknis.'
              } else if (log.status === 'diproses') {
                title = 'Investigasi Lapangan'
                defaultNote = 'Tim redaksi sedang memvalidasi fakta dan menginvestigasi kondisi lapangan.'
              }
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
    const isStory =
      (report?.jenis || '').toLowerCase() === 'inspirasi' ||
      (report?.kategori || '').toLowerCase().includes('inspirasi')

    if (isStory) {
      if (report?.status === 'selesai') {
        items.push({
          id: 'log-3',
          status: 'selesai',
          title: 'Cerita Disetujui & Tayang',
          date: formatLogDate(new Date(new Date(createdAt).getTime() + 86400000 * 2).toISOString()),
          catatan: 'Cerita inspirasi Anda telah disetujui redaksi dan ditayangkan di Feed Inspirasi Sukabumi.',
        })
      }
      if (report?.status === 'selesai' || report?.status === 'ditindaklanjuti') {
        items.push({
          id: 'log-2',
          status: 'ditindaklanjuti',
          title: '🌟 Terpilih Liputan Berita',
          date: formatLogDate(new Date(new Date(createdAt).getTime() + 86400000 * 1.5).toISOString()),
          catatan: 'Cerita inspirasi Anda terpilih oleh redaksi Jurnal Sukabumi untuk diangkat menjadi liputan berita resmi.',
        })
      }
      if (report?.status === 'selesai' || report?.status === 'ditindaklanjuti' || report?.status === 'diproses') {
        items.push({
          id: 'log-1b',
          status: 'diproses',
          title: 'Kurasi & Telaah Editorial',
          date: formatLogDate(new Date(new Date(createdAt).getTime() + 86400000 * 1).toISOString()),
          catatan: 'Tim redaktur sedang menelaah kelayakan materi dan memvalidasi keaslian cerita inspirasi.',
        })
      }
      items.push({
        id: 'log-1',
        status: 'diterima',
        title: 'Cerita Inspirasi Diterima',
        date: formatLogDate(createdAt),
        catatan: 'Cerita inspirasi Anda berhasil diterima di meja kurasi redaksi Halo Jurnal.',
      })
      return items
    }

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
  const currentUserEmail = (user?.email || '').toLowerCase().trim()
  const reportEmail = (report?.email || report?.user_email || report?.pelapor_email || report?.pelaporEmail || '').toLowerCase().trim()
  const currentUserPhone = (user?.phone || user?.phone_number || user?.user_metadata?.phone || '').replace(/\D/g, '')
  const reportPhone = (report?.telepon || report?.phone || report?.pelaporPhone || report?.citizenPhone || '').replace(/\D/g, '')

  const isEmailMatch = Boolean(currentUserEmail && reportEmail && currentUserEmail === reportEmail)
  const isPhoneMatch = Boolean(currentUserPhone && reportPhone && currentUserPhone === reportPhone)
  const isUserIdMatch = Boolean(
    user?.id && report && (
      (report.user_id && String(report.user_id) === String(user.id)) ||
      (report.userId && String(report.userId) === String(user.id))
    )
  )
  const isWargaAccount = Boolean(
    currentUserEmail && (
      currentUserEmail.startsWith('warga@') ||
      currentUserEmail === 'warga@sukabumi.com'
    )
  )

  const isAuthor = Boolean(
    isAuthenticated &&
    report && (
      isUserIdMatch ||
      isEmailMatch ||
      isPhoneMatch ||
      isWargaAccount ||
      isLocalAuthor
    )
  )
  const isAdmin = Boolean(isAuthenticated && (user.role === 'admin' || user.email?.toLowerCase().includes('admin')))
  const canAccessChat = Boolean(isAuthenticated && (isAuthor || isAdmin))
  const isInspirasi = Boolean(
    report && (
      (report.jenis || '').toLowerCase() === 'inspirasi' ||
      (report.kategori || '').toLowerCase().includes('inspirasi')
    )
  )
  const ticketDisplayId =
    report.nomor_tiket ||
    report.ticket_number ||
    (report.id && report.id.startsWith('JS-') ? report.id : `JS-${report.id.substring(0, 8)}`)
  const timelineItems = getTimelineItems()

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary mb-5 font-medium">
        <Link
          href="/halo-jurnal/feed-publik"
          className="hover:text-on-surface transition-colors flex items-center gap-1.5"
        >
          <span>Feed Publik</span>
        </Link>
        <span className="text-secondary/40 font-semibold">&gt;</span>
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-container text-on-surface border border-outline-variant/60">
          ID #{ticketDisplayId}
        </span>
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

      {/* Mobile View Switcher (Detail vs Chat) */}
      <div className="lg:hidden flex items-center p-1 bg-surface-container rounded-2xl mb-5 border border-outline-variant/60 sticky top-16 z-30 shadow-xs backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
            mobileTab === 'detail'
              ? 'bg-surface text-primary shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Detail &amp; Riwayat Aduan
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileTab('chat')
            setTimeout(scrollToBottom, 150)
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            mobileTab === 'chat'
              ? 'bg-surface text-primary shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          {canAccessChat ? (
            <MessageSquare className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3 h-3 text-secondary/80" />
          )}
          <span>{canAccessChat ? 'Chat Redaksi' : 'Chat Privat'}</span>
          {canAccessChat && messages.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Report Details & Riwayat Status */}
        <div className={`lg:col-span-2 space-y-6 ${mobileTab === 'detail' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs">
            {/* Header: Category + Status + Privacy di kiri, Tombol Bagikan di kanan */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] tracking-wide uppercase">
                  {normalizeCategoryName(report.kategori) || report.jenis || 'Umum'}
                </span>

                {/* Status Tag (Linear / Apple Monochromatic Minimalist) */}
                {report.status === 'selesai' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide ${
                    isInspirasi
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                  }`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 stroke-[2.2px] ${isInspirasi ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{isInspirasi ? 'Disetujui & Tayang' : 'Selesai'}</span>
                  </span>
                )}
                {report.status === 'ditindaklanjuti' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide ${
                    isInspirasi
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                  }`}>
                    {isInspirasi ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2px]" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2px]" />
                    )}
                    <span>{isInspirasi ? '🌟 Liputan Berita' : 'Ditindaklanjuti'}</span>
                  </span>
                )}
                {report.status === 'diproses' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide ${
                    isInspirasi
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                  }`}>
                    <Clock className={`w-3.5 h-3.5 stroke-[2.2px] ${isInspirasi ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{isInspirasi ? 'Sedang Dikurasi' : 'Diproses'}</span>
                  </span>
                )}
                {report.status === 'diterima' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold tracking-wide">
                    <Inbox className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2px]" />
                    <span>{isInspirasi ? 'Menunggu Kurasi' : 'Diterima'}</span>
                  </span>
                )}
                {report.status === 'ditolak' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />
                    <span>{isInspirasi ? 'Tidak Lolos' : 'Ditolak'}</span>
                  </span>
                )}

                <span className="text-slate-300 dark:text-slate-700 font-mono">•</span>
                {report.is_public === false ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Privat</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publik</span>
                  </span>
                )}
              </div>

              {/* Bagikan di pojok kanan atas */}
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-secondary hover:text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
                title="Bagikan Laporan"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bagikan</span>
              </button>
            </div>

            {/* Title */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-4 capitalize">
              {report.judul}
            </h1>

            {/* Metadata Rows */}
            <div className="space-y-2.5 text-xs sm:text-sm text-secondary mb-5">
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

            {/* Action Row: Dukung Laporan (Proporsional & Seimbang) */}
            <div className="pt-1 pb-1">
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    hasLiked
                      ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15'
                      : 'bg-surface hover:bg-surface-container-high border-outline-variant text-on-surface hover:text-primary hover:border-primary/40'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasLiked ? 'fill-current text-primary' : 'text-secondary'}`} />
                  <span>{hasLiked ? 'Didukung' : 'Dukung Laporan'} ({report.dukungan_count || 0})</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <hr className="my-6 border-outline-variant/60" />

            {/* Section: Deskripsi Laporan */}
            <div className="mb-8">
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface mb-2.5">
                Deskripsi Laporan
              </h2>
              <div className="space-y-3 sm:space-y-3.5 text-on-surface text-xs sm:text-sm leading-relaxed text-justify [text-align-last:left]">
                {report.deskripsi
                  ? report.deskripsi
                      .split(/\n+/)
                      .map((p: string) => p.trim())
                      .filter(Boolean)
                      .map((paragraf: string, idx: number) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraf}
                        </p>
                      ))
                  : null}
              </div>
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

            {/* Section: Riwayat Status (Tampilan Sangat Ramping & Bersih) */}
            <div className="pt-2">
              <div className="pb-2.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  {isInspirasi ? 'Riwayat Kurasi Editorial' : 'Riwayat Status'}
                </h2>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200 dark:before:bg-slate-800">
                {timelineItems.map((item, idx) => {
                  const status = (item.status || '').toLowerCase()
                  return (
                    <div key={item.id || idx} className="relative group">
                      {/* Timeline Node Icon (Monochrome Editorial Minimalist - No Rainbow AI Slop) */}
                      <div className="absolute -left-6 top-0.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            idx === 0
                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ring-4 ring-white dark:ring-slate-900 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 ring-4 ring-white dark:ring-slate-900'
                          }`}
                        >
                          {status === 'selesai' ? (
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          ) : status === 'ditolak' ? (
                            <X className="w-2.5 h-2.5 stroke-[2.5]" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                idx === 0
                                  ? 'bg-white dark:bg-slate-900'
                                  : 'bg-slate-400 dark:bg-slate-500'
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Content: Judul, Tanggal, & Catatan Mengalir Rapi Tanpa Kotak Tebal */}
                      <div className="pl-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                          <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {item.date}
                          </span>
                        </div>

                        {item.catatan && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5 font-normal">
                            {item.catatan}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tombol Cepat Buka Chat untuk Mobile (Hanya untuk Pemilik Laporan / Admin) */}
            {canAccessChat && (
              <div className="lg:hidden pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMobileTab('chat')
                    setTimeout(scrollToBottom, 150)
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Buka Ruang Chat Redaksi ({messages.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Langsung Redaksi */}
        <div className={`lg:col-span-1 space-y-6 ${mobileTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
            {/* Kembali ke Detail untuk Mobile */}
            <div className="lg:hidden pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileTab('detail')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lihat Detail &amp; Riwayat Aduan</span>
              </button>
            </div>

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
                      const isRedaksi =
                        msg.role === 'admin' ||
                        msg.role === 'redaksi' ||
                        msg.profiles?.role === 'admin' ||
                        msg.profiles?.role === 'redaksi' ||
                        msg.profiles?.role === 'superadmin' ||
                        msg.sender === 'Redaksi Halo Jurnal' ||
                        msg.sender_name === 'Redaksi Halo Jurnal' ||
                        msg.sender_name === 'Admin Redaksi' ||
                        (msg.sender_name && msg.sender_name.toLowerCase().includes('redaksi')) ||
                        msg.isSystem === true

                      // Di halaman pelapor warga:
                      // Jika dilihat oleh warga -> Pesan warga di KANAN (isMine = true), pesan redaksi di KIRI (isMine = false)
                      // Jika dilihat oleh admin redaksi -> Pesan redaksi di KANAN, pesan warga di KIRI
                      const isMine = isAdmin ? isRedaksi : !isRedaksi
                      const isAdminMsg = isRedaksi

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
                  <div className="pt-2">
                    <Link
                      href="/halo-jurnal/lapor"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
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
