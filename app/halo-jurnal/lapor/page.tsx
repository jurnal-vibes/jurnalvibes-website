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
          if (parsed && (parsed.id || parsed.email)) {
            setUser(parsed)
          } else {
            setUser(null)
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
      // Hitung urutan nomor tiket HJ secara berurutan
      let maxSeq = 8
      if (typeof window !== 'undefined') {
        try {
          const userReports = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
          if (Array.isArray(userReports)) {
            userReports.forEach((r: any) => {
              const numStr = (r.nomor_tiket || r.ticket_number || '').replace('HJ-', '')
              const num = parseInt(numStr, 10)
              if (!isNaN(num) && num > maxSeq) {
                maxSeq = num
              }
            })
          }
        } catch {}
      }
      const nextSeq = maxSeq + 1
      const ticketNumber = `HJ-${String(nextSeq).padStart(3, '0')}`

      const finalKategori = 'Pengaduan Warga'
      const newReportId = `lap-sukabumi-${Date.now()}`
      const pelaporDisplayName = user?.user_metadata?.full_name || user?.full_name || user?.name || 'Warga Sukabumi'
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
          message: `Halo ${pelaporDisplayName}, terima kasih telah berbagi informasi ini. Ruang obrolan ini dapat Anda gunakan untuk koordinasi langsung atau menambahkan keterangan tambahan jika diperlukan.`,
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
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="text-center py-10 sm:py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs max-w-md mx-auto w-full">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            Masuk untuk Membuat Pengaduan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
            Sesuai standar verifikasi fakta dan perlindungan saksi/pelapor di Hallo Jurnal, Anda wajib masuk ke akun warga sebelum mengirimkan aduan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?redirect=/halo-jurnal/lapor"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </Link>
            <Link
              href="/daftar"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all text-center cursor-pointer"
            >
              Daftar Akun Baru
            </Link>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/halo-jurnal"
              className="text-xs text-slate-400 hover:text-primary transition-colors font-medium cursor-pointer"
            >
              ← Kembali ke Beranda Hallo Jurnal
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-16">
      {/* Header Info */}
      <div className="text-left mb-6 sm:mb-8">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          Salurkan Aduan Anda di Hallo Jurnal
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed">
          Wadah aduan online dan komunikasi warga Sukabumi secara langsung dan transparan.
        </p>
      </div>

      {/* Form Pengaduan Utama */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs space-y-5 sm:space-y-6"
      >
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                Judul Aduan <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-secondary mb-2">
                Tuliskan inti kejadian atau topik yang ingin Anda sampaikan secara singkat.
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Lampu PJU padam di Lingkar Selatan / Genangan air di Cisaat"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                Isi Cerita &amp; Rincian Kejadian <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-secondary mb-2">
                Ceritakan apa yang terjadi, lokasi tepatnya, atau situasi di lapangan secara santai dan jelas.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Ceritakan kejadian yang Anda lihat atau temui, lokasi tepatnya, dan info pendukung lainnya..."
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
                  <span className="text-xs font-bold text-on-surface">Identitas Pelapor</span>
                </div>
              </div>

              {/* Data Akun Warga Terisi */}
              <div className="p-4 bg-surface-container-lowest grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-secondary uppercase font-semibold block">Nama Pelapor</span>
                  <span className="font-semibold text-on-surface block mt-0.5">
                    {user?.user_metadata?.full_name || user?.full_name || user?.name || 'Warga Sukabumi'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary uppercase font-semibold block">Nomor WhatsApp</span>
                  <span className="font-semibold text-on-surface block mt-0.5 font-mono">
                    {user?.phone || user?.phone_number || '-'}
                  </span>
                </div>
              </div>

              {/* Ketentuan Privasi & Checkbox */}
              <div className="p-4 space-y-3 bg-surface-container-lowest">
                {/* Jaminan Perlindungan Privasi Pelapor (Otomatis Anonim di Publik) */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/60">
                  <ShieldCheck className="w-4 h-4 text-secondary/80 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-on-surface block">
                      Identitas Terlindungi (Anonim di Publik)
                    </span>
                    <span className="text-[11px] text-secondary block mt-0.5 leading-relaxed">
                      Data akun dan kontak Anda disimpan secara aman hanya untuk kebutuhan konfirmasi redaksi. Di ruang publik, identitas Anda otomatis dirahasiakan.
                    </span>
                  </div>
                </div>

                {/* Checkbox Wajib: Pernyataan Kebenaran Informasi */}
                <label className="flex items-start gap-2.5 text-xs text-on-surface cursor-pointer select-none pt-2.5 border-t border-outline-variant/40">
                  <input
                    type="checkbox"
                    checked={legalAgreed}
                    onChange={(e) => setLegalAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-outline-variant text-[#c00015] accent-[#c00015] focus:ring-[#c00015] cursor-pointer shrink-0"
                    required
                  />
                  <div>
                    <span className="font-bold text-on-surface">
                      Pernyataan Kebenaran Informasi <span className="text-[#c00015]">*</span>
                    </span>
                    <span className="text-[11px] text-secondary block mt-0.5 leading-relaxed">
                      Saya menyatakan bahwa informasi dan bukti yang saya kirimkan adalah benar sesuai kejadian yang saya ketahui. Saya bersedia dihubungi oleh tim redaksi jika diperlukan konfirmasi lebih lanjut.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Info Penanganan Ringkas (Tanpa Janji Berlebih) */}
            <div className="p-3.5 bg-surface-container-low/70 rounded-2xl text-[11px] text-secondary leading-relaxed border border-outline-variant/50 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Laporan yang masuk akan ditinjau dan dikurasi oleh tim Redaksi Hallo Jurnal sesuai kelayakan serta urgensi informasi di lapangan.
              </span>
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
                    <span>Mengirimkan Pengaduan...</span>
                  </>
                ) : (
                  <span>Kirim Pengaduan</span>
                )}
              </button>
            </div>
          </form>
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
