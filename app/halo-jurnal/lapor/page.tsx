'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UploadCloud,
  Send,
  Loader2,
  X,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  User,
  ShieldCheck,
  LogIn,
  Info,
} from 'lucide-react'

function LaporForm() {
  const router = useRouter()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Identitas & Legalitas
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [legalAgreed, setLegalAgreed] = useState(false)

  useEffect(() => {
    // Sinkronisasi data user aktif
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('halo_jurnal_current_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (
            parsed &&
            (parsed.id === 'demo-user-id' ||
              parsed.id === 'warga-demo' ||
              parsed.email === 'warga@sukabumi.com' ||
              (typeof parsed.id === 'string' && parsed.id.startsWith('warga-17')))
          ) {
            localStorage.removeItem('halo_jurnal_current_user')
            setUser(null)
          } else {
            setUser(parsed)
          }
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
    setCheckingAuth(false)
  }, [])

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          const maxDimension = 1200
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            } else {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.8))
          } else {
            resolve(e.target?.result as string)
          }
        }
        img.onerror = () => reject(new Error('Gagal memproses berkas gambar'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Gagal membaca berkas'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('Ukuran file maksimal 50MB.')
        return
      }
      setFile(selectedFile)

      if (selectedFile.type.startsWith('image/')) {
        compressImage(selectedFile)
          .then((compressed) => setPreviewUrl(compressed))
          .catch(() => {
            const reader = new FileReader()
            reader.onload = () => setPreviewUrl(reader.result as string)
            reader.readAsDataURL(selectedFile)
          })
      } else {
        const reader = new FileReader()
        reader.onload = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(selectedFile)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.size > 50 * 1024 * 1024) {
        alert('Ukuran file maksimal 50MB.')
        return
      }
      setFile(droppedFile)

      if (droppedFile.type.startsWith('image/')) {
        compressImage(droppedFile)
          .then((compressed) => setPreviewUrl(compressed))
          .catch(() => {
            const reader = new FileReader()
            reader.onload = () => setPreviewUrl(reader.result as string)
            reader.readAsDataURL(droppedFile)
          })
      } else {
        const reader = new FileReader()
        reader.onload = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(droppedFile)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Silakan masuk ke akun warga terlebih dahulu untuk mengirim pengaduan.')
      router.push('/login?redirect=/halo-jurnal/lapor')
      return
    }

    if (!title.trim() || !description.trim()) {
      alert('Mohon isi judul dan deskripsi aduan secara lengkap.')
      return
    }

    if (!file) {
      alert('Mohon lampirkan bukti foto atau video pengaduan.')
      return
    }

    if (!legalAgreed) {
      alert('Anda wajib menyetujui pernyataan pertanggungjawaban hukum.')
      return
    }

    setLoading(true)
    try {
      const date = new Date()
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const ticketNumber = `JS-${yyyy}${mm}${dd}-${random4}`

      const finalKategori = 'Pengaduan Warga'
      const newReportId = `lap-sukabumi-${Date.now()}`
      const pelaporDisplayName = user?.user_metadata?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Warga Sukabumi'
      const pelaporDomisili = user?.alamat_domisili || user?.detail_alamat || 'Sukabumi'

      const newReportData = {
        id: newReportId,
        ticket_number: ticketNumber,
        nomor_tiket: ticketNumber,
        user_id: user?.id || 'warga-anon',
        user_email: user?.email || '',
        email: user?.email || '',
        pelaporEmail: user?.email || '',
        pelapor_email: user?.email || '',
        pelaporName: pelaporDisplayName,
        alamat_domisili: pelaporDomisili,
        is_anonim: isAnonymous,
        is_anonymous: isAnonymous,
        legal_agreement: true,
        legal_agreed_at: new Date().toISOString(),
        jenis: 'pengaduan',
        kategori: finalKategori,
        judul: title.trim(),
        deskripsi: description.trim(),
        lokasi: pelaporDomisili,
        latitude: null,
        longitude: null,
        instansi_tujuan: null,
        jenis_informasi: null,
        status: 'diterima',
        is_public: false,
        dukungan_count: 0,
        komentar_count: 0,
        created_at: new Date().toISOString(),
        laporan_lampiran: previewUrl
          ? [{ id: `lamp-${Date.now()}`, file_url: previewUrl, file_type: file?.type || (previewUrl.startsWith('data:video') ? 'video/mp4' : 'image/jpeg') }]
          : [],
        status_log: [
          {
            id: `log-${Date.now()}`,
            status: 'diterima',
            catatan: 'Laporan baru diterima oleh sistem (Menunggu Review Redaksi)',
            created_at: new Date().toISOString(),
          },
        ],
      }

      // Kirim laporan ke database via API
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketNumber,
            title: title.trim(),
            description: description.trim(),
            reportType: finalKategori,
            category: finalKategori,
            kategori: finalKategori,
            jenis: 'pengaduan',
            address: pelaporDomisili,
            latitude: null,
            longitude: null,
            pelaporName: pelaporDisplayName,
            nama_pelapor: pelaporDisplayName,
            pelaporPhone: user?.phone || user?.phone_number || '',
            telepon: user?.phone || user?.phone_number || '',
            pelaporEmail: user?.email || '',
            email: user?.email || '',
            previewUrl: previewUrl || '',
            attachments: previewUrl
              ? [{ file_url: previewUrl, file_type: file?.type || (previewUrl.startsWith('data:video') ? 'video/mp4' : 'image/jpeg') }]
              : [],
            isAnonymous,
            legalAgreement: true,
            domisili: pelaporDomisili,
          }),
        })
      } catch (err) {
        console.warn('Gagal simpan ke database, tetap menyimpan ke local cache:', err)
      }

      // Sinkronkan ke local storage
      try {
        if (typeof window !== 'undefined') {
          const prev = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
          localStorage.setItem('halo_jurnal_user_reports', JSON.stringify([newReportData, ...prev]))
          window.dispatchEvent(new Event('storage'))
        }
      } catch {}

      // Buat sesi ruang chat aktif & kirim pesan sambutan otomatis dari Redaksi
      try {
        const welcomeMessage = {
          id: `msg-welcome-${Date.now()}`,
          ticketNumber,
          sender: 'Redaksi Hallo Jurnal',
          sender_name: 'Redaksi Hallo Jurnal',
          role: 'admin',
          avatar: '/logo-white.png',
          message: `Halo ${pelaporDisplayName}, laporan Anda dengan Nomor Tiket #${ticketNumber} telah diterima oleh Redaksi Hallo Jurnal. Tim kami sedang memverifikasi laporan Anda. Anda dapat berkoordinasi langsung dengan kami di ruang chat ini.`,
          created_at: new Date().toISOString(),
          timestamp: 'Baru saja',
          isSystem: true,
        }
        localStorage.setItem(`halo_jurnal_chat_${ticketNumber}`, JSON.stringify([welcomeMessage]))
        localStorage.setItem(`halo_jurnal_chat_${newReportId}`, JSON.stringify([welcomeMessage]))
      } catch {}

      router.push(`/halo-jurnal/laporan/${newReportId}?sukses=1#chat`)
    } catch (error: any) {
      console.error(error)
      setLoading(false)
    }
  }

  // Tampilkan loader saat inisialisasi sesi login
  if (checkingAuth) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c00015]" />
      </div>
    )
  }

  // Auth Gate: Jika belum login, jangan buka form buat aduan
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#c00015]/10 text-[#c00015] flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            Masuk untuk Membuat Pengaduan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
            Sesuai standar verifikasi fakta dan perlindungan hukum saksi/pelapor di Hallo Jurnal Sukabumi, Anda wajib masuk ke akun warga terlebih dahulu sebelum membuat laporan pengaduan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?redirect=/halo-jurnal/lapor"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs text-center flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </Link>
            <Link
              href="/daftar"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/halo-jurnal"
              className="text-xs text-slate-400 hover:text-[#c00015] dark:hover:text-[#ff6b6b] transition-colors font-medium"
            >
              ← Kembali ke Beranda Hallo Jurnal
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 sm:pt-12 md:pt-16 pb-16">
      {/* Header Info */}
      <div className="text-left max-w-3xl mb-8">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          Salurkan Aduan Anda di Hallo Jurnal
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed">
          Wadah aduan online dan komunikasi warga, Anda secara langsung di sini.
        </p>
      </div>

      {/* Main Grid: Form + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                Judul Pengaduan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Jalan rusak berlubang di depan RT 05 Cisaat"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                Deskripsi Pengaduan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Tuliskan kronologi dan rincian masalah yang Anda alami secara mendalam dan detail..."
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary resize-y"
                required
              />
            </div>

            {/* File Upload (Wajib untuk Pengaduan) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                Lampiran Bukti Foto/Video <span className="text-rose-500">* (Wajib)</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : previewUrl
                    ? 'border-primary/40 bg-surface-container-low'
                    : 'border-outline-variant hover:border-primary/50 bg-surface-container-low'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block max-w-full">
                      {file?.type.startsWith('video/') || previewUrl.startsWith('data:video') ? (
                        <video
                          src={previewUrl}
                          controls
                          className="max-h-64 sm:max-h-80 rounded-xl mx-auto shadow-md"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-64 sm:max-h-80 rounded-xl mx-auto object-contain shadow-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          setPreviewUrl(null)
                        }}
                        className="absolute -top-3 -right-3 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-secondary">
                      Klik atau seret untuk mengganti berkas (Maks. 50MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-secondary">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-on-surface">
                        Klik atau seret file foto/video ke sini
                      </p>
                      <p className="text-[11px] text-secondary">
                        Format JPG, PNG, MP4, WebM (Maks. 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Identitas Pelapor Terdaftar */}
            <div className="border border-outline-variant/80 rounded-2xl overflow-hidden divide-y divide-outline-variant/60">
              <div className="p-4 bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-on-surface">Identitas Pelapor Terdaftar</span>
                </div>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Warga Terverifikasi
                </span>
              </div>

              {/* Data Akun Warga Terisi */}
              <div className="p-4 bg-surface-container-lowest grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-secondary uppercase font-semibold block">Nama Warga</span>
                  <span className="font-semibold text-on-surface block mt-0.5">
                    {user?.user_metadata?.full_name || user?.full_name || user?.name || user?.email?.split('@')[0] || 'Warga Sukabumi'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary uppercase font-semibold block">Kontak Warga</span>
                  <span className="font-semibold text-on-surface block mt-0.5">
                    {user?.phone || user?.phone_number || user?.email || '-'}
                  </span>
                </div>
              </div>

              {/* Ketentuan Privasi & Checkbox Legal */}
              <div className="p-4 space-y-3 bg-surface-container-lowest">
                {/* Jaminan Perlindungan Privasi Pelapor (Otomatis Anonim di Publik) */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/60">
                  <ShieldCheck className="w-4 h-4 text-secondary/80 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-on-surface block">
                      Identitas Anda Otomatis Dilindungi (Anonim di Publik)
                    </span>
                    <span className="text-[11px] text-secondary block mt-0.5 leading-relaxed">
                      Sesuai standar perlindungan pelapor (UU PDP), data akun dan kontak Anda hanya disimpan secara privat oleh Tim Redaksi untuk verifikasi. Di publik, identitas Anda otomatis dirahasiakan.
                    </span>
                  </div>
                </div>

                {/* Checkbox Wajib: Pernyataan Pertanggungjawaban Hukum */}
                <label className="flex items-start gap-2.5 text-xs text-on-surface cursor-pointer select-none pt-2.5 border-t border-outline-variant/40">
                  <input
                    type="checkbox"
                    checked={legalAgreed}
                    onChange={(e) => setLegalAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary shrink-0"
                    required
                  />
                  <div>
                    <span className="font-bold text-on-surface">
                      Pernyataan Pertanggungjawaban Hukum <span className="text-primary">*</span>
                    </span>
                    <span className="text-[11px] text-secondary block mt-0.5 leading-relaxed">
                      Saya menyatakan identitas, informasi, dan bukti yang saya lampirkan adalah benar. Saya bersedia dihubungi tim redaksi serta siap hadir memberikan keterangan dan pertanggungjawaban apabila laporan ini ditindaklanjuti.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !file || !legalAgreed}
                className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-bold text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengirimkan Laporan Resmi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Kirim Pengaduan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Column (Sisi Kanan) */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-on-surface">
                Pratinjau Aduan
              </h2>
            </div>

            {/* Pratinjau Foto/Video */}
            <div className="w-full h-44 rounded-2xl bg-surface-container-low border border-outline-variant overflow-hidden flex items-center justify-center relative">
              {previewUrl ? (
                file?.type.startsWith('video/') || previewUrl.startsWith('data:video') ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-secondary/40 space-y-1">
                  <ImageIcon className="w-8 h-8 stroke-1" />
                  <span className="text-[11px]">Foto/video bukti akan tampil di sini</span>
                </div>
              )}
            </div>

            {/* Info Teks Preview */}
            <div className="space-y-3 pt-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary">
                Pengaduan Warga
              </span>

              {/* Judul Laporan */}
              <h3
                className={`font-heading font-bold text-base sm:text-lg leading-snug line-clamp-2 ${
                  title.trim() ? 'text-on-surface' : 'text-secondary/50 italic font-normal'
                }`}
              >
                {title.trim() || 'Judul pengaduan Anda...'}
              </h3>

              {/* Deskripsi Laporan */}
              <div
                className={`text-xs sm:text-sm leading-relaxed text-justify [text-align-last:left] space-y-2 ${
                  description.trim() ? 'text-secondary' : 'text-secondary/40 italic'
                }`}
              >
                {description.trim() ? (
                  description
                    .split(/\n+/)
                    .map((p: string) => p.trim())
                    .filter(Boolean)
                    .map((paragraf: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraf}
                      </p>
                    ))
                ) : (
                  <p>Kronologi dan rincian aduan yang Anda tulis akan ditampilkan di sini.</p>
                )}
              </div>
            </div>

            {/* Info Penanganan Ringkas */}
            <div className="p-3 bg-surface-container-low/70 rounded-2xl text-[11px] text-secondary leading-relaxed border border-outline-variant/50 flex items-start gap-2.5 mt-5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Laporan aduan Anda akan ditinjau dan ditindaklanjuti secara langsung oleh tim Redaksi Jurnal Wave dalam waktu 2x24 jam.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HaloJurnalLaporPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LaporForm />
    </Suspense>
  )
}
