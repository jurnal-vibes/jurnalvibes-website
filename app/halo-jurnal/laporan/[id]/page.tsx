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
  MessageSquare,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  Paperclip,
  Share2,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'

export default function HaloJurnalLaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

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
      }
    }
    checkUser()
  }, [])

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
    scrollToBottom()
  }, [messages])

  const fetchChatMessages = async () => {
    try {
      const { data: chatData, error } = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', id)
        .order('created_at', { ascending: true })

      if (!error && chatData) {
        setMessages(chatData)
      }
    } catch (err) {
      console.error('Chat fetch error:', err)
    }
  }

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
    if (!user) {
      alert('Silakan login untuk mengirim tanggapan.')
      return
    }
    if (!chatMessage.trim() && !chatFile) return

    setIsSendingChat(true)
    try {
      let fileUrl = null
      let fileType = null

      if (chatFile) {
        const fileExt = chatFile.name.split('.').pop()
        const fileName = `${id}-${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

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
        setMessages((prev) => [...prev, newMsg])
        setChatMessage('')
        setChatFile(null)
      }
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setIsSendingChat(false)
    }
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

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 pb-16">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Report Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            {/* Header / Ticket & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-secondary bg-surface-container-high px-2.5 py-1 rounded-md">
                  {report.ticket_number || `JS-${report.id.substring(0, 8)}`}
                </span>
                <span className="text-xs font-bold text-primary capitalize px-2 py-0.5 rounded-full bg-primary/10">
                  {report.jenis || 'Laporan'}
                </span>
              </div>

              {report.status === 'selesai' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider border border-emerald-200/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
              {report.status === 'diproses' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider border border-amber-200/50">
                  <Clock className="w-3.5 h-3.5" />
                  Diproses
                </span>
              )}
              {report.status === 'diterima' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider border border-blue-200/50">
                  <Clock className="w-3.5 h-3.5" />
                  Diterima
                </span>
              )}
              {report.status === 'ditindaklanjuti' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider border border-purple-200/50">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Ditindaklanjuti
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-on-surface mb-3 tracking-tight">
              {report.judul}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1 text-primary font-semibold">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{report.lokasi || 'Sukabumi'}</span>
              </span>
              {report.kategori && (
                <span className="bg-surface-container-high px-2 py-0.5 rounded-full text-[11px] font-medium text-on-surface">
                  {report.kategori}
                </span>
              )}
            </div>

            {/* Content Body */}
            <div className="text-on-surface text-sm leading-relaxed whitespace-pre-line mb-6 font-normal">
              {report.deskripsi}
            </div>

            {/* Lampiran Images */}
            {report.laporan_lampiran && report.laporan_lampiran.length > 0 && (
              <div className="mb-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary block">
                  Foto / Berkas Lampiran
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.laporan_lampiran.map((lampiran: any) => (
                    <a
                      key={lampiran.id || lampiran.file_url}
                      href={lampiran.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high relative block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={lampiran.file_url}
                        alt="Bukti Lampiran"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar (Like / Share) */}
            <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hasLiked
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{report.dukungan_count || 0} Dukungan</span>
              </button>

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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>

          {/* Interactive Chat / Tanggapan Box */}
          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/60">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-base text-on-surface">
                Tanggapan & Diskusi Publik ({messages.length})
              </h2>
            </div>

            {/* Message Thread */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-4 no-scrollbar">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = user && msg.sender_id === user.id
                  const isAdmin =
                    msg.profiles?.role === 'admin' || msg.profiles?.role === 'superadmin'

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-secondary">
                        <span className="font-bold text-on-surface">
                          {isAdmin ? '🛡️ Admin Redaksi' : msg.profiles?.full_name || 'Warga'}
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
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-primary text-white rounded-br-2xs'
                            : isAdmin
                            ? 'bg-amber-500/10 border border-amber-500/30 text-on-surface rounded-bl-2xs'
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
                            <img src={msg.file_url} alt="Attachment" className="max-h-32 object-cover" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center py-8 text-xs text-secondary">
                  Belum ada tanggapan. Kirim tanggapan pertama untuk memulai diskusi!
                </p>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            {user ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                {chatFile && (
                  <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl text-xs text-primary">
                    <span className="truncate">{chatFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setChatFile(null)}
                      className="text-rose-500 font-bold ml-2"
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
                    placeholder="Tulis tanggapan atau informasi tambahan..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                  />

                  <button
                    type="submit"
                    disabled={isSendingChat}
                    className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition-all disabled:opacity-50 cursor-pointer shrink-0"
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
              <div className="p-3 text-center bg-surface-container-low rounded-xl text-xs text-secondary">
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Login sekarang
                </Link>{' '}
                untuk ikut menanggapi atau berdiskusi pada laporan ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Timeline & Metadata */}
        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-on-surface mb-4 pb-2 border-b border-outline-variant/60">
              Riwayat Penanganan
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
              {report.status_log && report.status_log.length > 0 ? (
                report.status_log.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary border-2 border-surface" />
                    <p className="text-xs font-bold text-on-surface capitalize">{log.status}</p>
                    <p className="text-[11px] text-secondary mt-0.5">{log.catatan || 'Status diperbarui'}</p>
                    <span className="text-[10px] text-secondary/80 block mt-1">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary border-2 border-surface" />
                  <p className="text-xs font-bold text-on-surface capitalize">{report.status}</p>
                  <p className="text-[11px] text-secondary mt-0.5">Laporan diterima dalam sistem</p>
                  <span className="text-[10px] text-secondary/80 block mt-1">
                    {new Date(report.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
