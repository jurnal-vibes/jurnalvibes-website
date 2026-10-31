'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LocationPicker from '@/components/halo-jurnal/LocationPicker'
import {
  AlertTriangle,
  Lightbulb,
  Info,
  BookOpen,
  UploadCloud,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  X,
  FileText,
  Calendar,
  MapPin,
  Eye,
  Image as ImageIcon,
  User,
  ShieldCheck,
  LogIn,
} from 'lucide-react'

type ReportType = 'pengaduan' | 'aspirasi' | 'informasi' | 'inspirasi'

interface FormConfig {
  headerTitle: string
  headerDesc: string
  titleLabel: string
  titlePlaceholder: string
  descLabel: string
  descPlaceholder: string
  locationLabel: string
  categories: string[]
  submitText: string
  sidebarInfo: string
}

import { REPORT_CATEGORIES_BY_TYPE } from '@/data/haloJurnalCategories'

const formConfigs: Record<ReportType, FormConfig> = {
  pengaduan: {
    headerTitle: 'Formulir Pengaduan Warga',
    headerDesc:
      'Formulir resmi pelaporan masalah atau keluhan pelayanan publik. Pastikan data yang Anda masukkan valid untuk mempercepat proses penanganan.',
    titleLabel: 'Judul Pengaduan',
    titlePlaceholder: 'Contoh: Jalan rusak berlubang di depan RT 05 Cisaat',
    descLabel: 'Detail Pengaduan / Keluhan',
    descPlaceholder: 'Jelaskan masalah yang Anda alami secara detail dan kronologinya...',
    locationLabel: 'Lokasi Kejadian',
    categories: REPORT_CATEGORIES_BY_TYPE.pengaduan,
    submitText: 'Kirim Pengaduan',
    sidebarInfo:
      'Laporan pengaduan Anda akan ditindaklanjuti oleh tim Redaksi Jurnal Sukabumi dalam waktu 2x24 jam.',
  },
  aspirasi: {
    headerTitle: 'Formulir Aspirasi & Usulan',
    headerDesc: 'Formulir penyampaian ide, gagasan, atau harapan warga untuk kemajuan bersama Sukabumi.',
    titleLabel: 'Judul Aspirasi / Usulan',
    titlePlaceholder: 'Contoh: Usulan revitalisasi taman bermain di RW 03',
    descLabel: 'Rincian Ide / Usulan',
    descPlaceholder: 'Jelaskan ide atau harapan Anda untuk kemajuan bersama...',
    locationLabel: 'Lokasi Target / Scope Usulan',
    categories: REPORT_CATEGORIES_BY_TYPE.aspirasi,
    submitText: 'Kirim Aspirasi',
    sidebarInfo:
      'Aspirasi Anda akan didokumentasikan dan dipublikasikan untuk menjadi pertimbangan instansi terkait.',
  },
  informasi: {
    headerTitle: 'Permohonan Informasi Publik',
    headerDesc:
      'Ajukan permintaan data atau kebijakan resmi melalui sistem keterbukaan informasi yang dikelola tim Jurnal Sukabumi.',
    titleLabel: 'Judul Permohonan',
    titlePlaceholder: 'Contoh: Permintaan Data Anggaran Kebersihan 2024',
    descLabel: 'Rincian Permohonan',
    descPlaceholder:
      'Jelaskan informasi apa yang Anda butuhkan dan untuk keperluan apa secara mendetail.',
    locationLabel: 'Wilayah / Scope Informasi',
    categories: REPORT_CATEGORIES_BY_TYPE.informasi,
    submitText: 'Ajukan Permohonan',
    sidebarInfo:
      'Permohonan akan diproses maksimal 10 hari kerja sesuai UU Keterbukaan Informasi Publik.',
  },
  inspirasi: {
    headerTitle: 'Bagikan Cerita Inspirasi',
    headerDesc:
      'Ceritakan kegiatan positif atau inovasi yang terjadi di lingkungan Anda untuk menginspirasi warga Sukabumi lainnya!',
    titleLabel: 'Judul Cerita',
    titlePlaceholder: 'Contoh: Gotong Royong Warga Bersihkan Sungai Cimandiri',
    descLabel: 'Ceritakan Kegiatannya',
    descPlaceholder:
      'Ceritakan kegiatan atau hal positif yang terjadi, siapa yang terlibat, dan dampaknya...',
    locationLabel: 'Lokasi Kegiatan (Opsional)',
    categories: REPORT_CATEGORIES_BY_TYPE.inspirasi,
    submitText: 'Bagikan Cerita',
    sidebarInfo:
      'Cerita Anda akan diverifikasi oleh Redaksi. Setelah disetujui, cerita akan tayang di Feed Publik.',
  },
}

const instansiList = [
  'Dinas Pekerjaan Umum & Tata Ruang',
  'Dinas Kesehatan',
  'Dinas Lingkungan Hidup',
  'Satpol PP',
  'Dinas Pendidikan',
  'Dinas Perhubungan',
  'Dinas Sosial',
  'Lainnya',
]

const jenisInformasiList = REPORT_CATEGORIES_BY_TYPE.informasi

function LaporForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawType = searchParams.get('type') || 'pengaduan'
  const initialType: ReportType = ['pengaduan', 'aspirasi', 'informasi', 'inspirasi'].includes(rawType)
    ? (rawType as ReportType)
    : 'pengaduan'

  const [activeType, setActiveType] = useState<ReportType>(initialType)

  useEffect(() => {
    const paramType = searchParams.get('type')
    if (paramType && ['pengaduan', 'aspirasi', 'informasi', 'inspirasi'].includes(paramType)) {
      setActiveType(paramType as ReportType)
    }
  }, [searchParams])

  const reportType = activeType
  const config = formConfigs[reportType]

  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form State
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [instansi, setInstansi] = useState('')
  const [customInstansi, setCustomInstansi] = useState('')
  const [jenisInformasi, setJenisInformasi] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationData, setLocationData] = useState<{
    address: string
    lat: number | null
    lng: number | null
  }>({
    address: '',
    lat: null,
    lng: null,
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [legalAgreed, setLegalAgreed] = useState(false)

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
                parsed.email === 'warga@sukabumi.com' ||
                (typeof parsed.id === 'string' && parsed.id.startsWith('warga-17')))
            ) {
              localStorage.removeItem('halo_jurnal_current_user')
            } else {
              setUser(parsed)
              return
            }
          } catch {}
        }
      }
      setUser(null)
    }
    checkUser()
    window.addEventListener('storage', checkUser)
    return () => window.removeEventListener('storage', checkUser)
  }, [])

  const handleTabChange = (newType: ReportType) => {
    setActiveType(newType)
    setCategory('')
    setCustomCategory('')
    setInstansi('')
    setCustomInstansi('')
    setJenisInformasi('')
    router.push(`/halo-jurnal/lapor?type=${newType}`, { scroll: false })
  }

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
      setFile(selectedFile)

      if (selectedFile.type.startsWith('image/')) {
        compressImage(selectedFile)
          .then((compressed) => setPreviewUrl(compressed))
          .catch(() => {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
            reader.readAsDataURL(selectedFile)
          })
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0]
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        compressImage(selectedFile)
          .then((compressed) => setPreviewUrl(compressed))
          .catch(() => {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
            reader.readAsDataURL(selectedFile)
          })
      } else {
        setPreviewUrl(null)
      }
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Upload bukti pendukung WAJIB minimal 1 file untuk semua laporan
    if (!file) {
      alert('Bukti pendukung (foto/video/dokumen) wajib dilampirkan minimal 1 berkas.')
      return
    }

    if (!legalAgreed) {
      alert('Anda wajib mencentang Pernyataan Pertanggungjawaban Hukum sebelum mengirim laporan.')
      return
    }

    // Validation
    if (reportType === 'inspirasi') {
      if (!category || !title || !description) {
        alert('Mohon lengkapi Kategori, Judul, dan Isi Cerita.')
        return
      }
    } else if (reportType === 'informasi') {
      if (!instansi || !jenisInformasi || !title || !description || !locationData.address) {
        alert('Mohon lengkapi semua field yang wajib (Instansi, Jenis, Judul, Rincian, dan Lokasi).')
        return
      }
    } else {
      if (!category || !title || !description || !locationData.address) {
        alert('Mohon lengkapi semua field yang wajib (Kategori, Judul, Isi Laporan, dan Lokasi).')
        return
      }
    }

    setLoading(true)
    try {
      // Generate ticket number: JS-YYYYMMDD-XXXX
      const date = new Date()
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const ticketNumber = `JS-${yyyy}${mm}${dd}-${random4}`

      let finalKategori = reportType === 'informasi' ? jenisInformasi : category
      if (finalKategori === 'Lainnya' && customCategory.trim()) {
        finalKategori = customCategory.trim()
      }
      let finalInstansi = instansi
      if (reportType === 'informasi' && finalInstansi === 'Lainnya' && customInstansi.trim()) {
        finalInstansi = customInstansi.trim()
      }

      const newReportId = `lap-sukabumi-${Date.now()}`
      const pelaporDisplayName = user?.user_metadata?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Warga Sukabumi'
      const pelaporDomisili = user?.alamat_domisili || user?.detail_alamat || (reportType === 'inspirasi' ? 'Sukabumi' : '')

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
        jenis: reportType,
        kategori: finalKategori,
        judul: title,
        deskripsi: description,
        lokasi: locationData.address || (reportType === 'inspirasi' ? 'Sukabumi' : ''),
        latitude: locationData.lat,
        longitude: locationData.lng,
        instansi_tujuan: reportType === 'informasi' ? finalInstansi : null,
        jenis_informasi: reportType === 'informasi' ? finalKategori : null,
        status: 'diterima',
        is_public: false,
        dukungan_count: 0,
        komentar_count: 0,
        created_at: new Date().toISOString(),
        laporan_lampiran: previewUrl
          ? [{ id: `lamp-${Date.now()}`, file_url: previewUrl, file_type: file?.type }]
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

      // 1. Kirim laporan ke database MySQL XAMPP via API
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketNumber,
            title,
            description,
            reportType: finalKategori,
            category: finalKategori,
            kategori: finalKategori,
            jenis: reportType,
            address: locationData.address || '',
            latitude: locationData.lat || null,
            longitude: locationData.lng || null,
            pelaporName: pelaporDisplayName,
            nama_pelapor: pelaporDisplayName,
            pelaporPhone: user?.phone || user?.phone_number || '',
            telepon: user?.phone || user?.phone_number || '',
            pelaporEmail: user?.email || '',
            email: user?.email || '',
            previewUrl: previewUrl || '',
            isAnonymous,
            legalAgreement: true,
            domisili: pelaporDomisili,
          }),
        })
      } catch (err) {
        console.warn('Gagal simpan ke database, tetap menyimpan ke local cache:', err)
      }

      // 2. Sinkronkan ke local storage
      try {
        if (typeof window !== 'undefined') {
          const prev = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
          localStorage.setItem('halo_jurnal_user_reports', JSON.stringify([newReportData, ...prev]))
          window.dispatchEvent(new Event('storage'))
        }
      } catch {}

      // 3. Buat sesi ruang chat aktif & kirim pesan sambutan otomatis dari Redaksi
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

      // Transisi langsung tanpa alert popup bawaan browser
      router.push(`/halo-jurnal/laporan/${newReportId}?sukses=1#chat`)
    } catch (error: any) {
      console.error(error)
      setLoading(false)
    }
  }

  const tabs = [
    { type: 'pengaduan' as const, label: 'Pengaduan', icon: AlertTriangle },
    { type: 'aspirasi' as const, label: 'Aspirasi', icon: Lightbulb },
    { type: 'informasi' as const, label: 'Informasi', icon: Info },
    { type: 'inspirasi' as const, label: 'Inspirasi', icon: BookOpen },
  ]

  const displayCategory =
    reportType === 'informasi'
      ? jenisInformasi || 'Pilih Jenis'
      : category || 'Pilih Kategori'

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 sm:pt-12 md:pt-16 pb-16">
      {/* Header Info */}
      <div className="text-left max-w-3xl mb-6">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          {config.headerTitle}
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed">{config.headerDesc}</p>
      </div>

      {/* Type Tabs: Pas 4 kolom penuh di mobile tanpa perlu digeser ke kanan */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-8 border border-slate-200/80 dark:border-slate-700/60 max-w-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = reportType === tab.type
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => handleTabChange(tab.type)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-bold tracking-tight transition-all duration-200 cursor-pointer select-none text-center ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary hover:text-on-surface hover:bg-white/70 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm leading-tight">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Grid: Form + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6"
          >
            {/* Conditional: Instansi for Informasi */}
            {reportType === 'informasi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                    Instansi / Lembaga Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={instansi}
                    onChange={(e) => setInstansi(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Instansi Terkait --</option>
                    {instansiList.map((ins) => (
                      <option key={ins} value={ins}>
                        {ins}
                      </option>
                    ))}
                  </select>
                </div>

                {instansi === 'Lainnya' && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-bold text-on-surface">
                      Sebutkan Nama Instansi / Lembaga Lainnya <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customInstansi}
                      onChange={(e) => setCustomInstansi(e.target.value)}
                      placeholder="Contoh: Kantor Pertanahan/BPN, Kemenag, Bawaslu..."
                      className="w-full px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Conditional: Jenis Informasi vs Category */}
            {reportType === 'informasi' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                    Jenis Informasi yang Diminta <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jenisInformasi}
                    onChange={(e) => setJenisInformasi(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Jenis Informasi --</option>
                    {jenisInformasiList.map((jenis) => (
                      <option key={jenis} value={jenis}>
                        {jenis}
                      </option>
                    ))}
                  </select>
                </div>

                {jenisInformasi === 'Lainnya' && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-bold text-on-surface">
                      Sebutkan Topik Informasi yang Diminta <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Contoh: Rincian Anggaran Beasiswa Daerah..."
                      className="w-full px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {config.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {category === 'Lainnya' && (
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/25 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-bold text-on-surface">
                      Sebutkan Kategori / Topik Laporan Anda <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Contoh: Pendidikan Sekolah, Sengketa Lahan, Bantuan Sosial..."
                      className="w-full px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                      required
                    />
                    <p className="text-[11px] text-secondary">
                      Tuliskan topik masalah secara spesifik agar tim redaksi dapat meneruskannya ke dinas yang tepat.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                {config.titleLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={config.titlePlaceholder}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                {config.descLabel} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder={config.descPlaceholder}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary resize-y"
                required
              />
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                {config.locationLabel}{' '}
                {reportType !== 'inspirasi' && <span className="text-rose-500">*</span>}
              </label>
              <LocationPicker value={locationData} onChange={setLocationData} />
            </div>

            {/* File Upload (Dinamis: Wajib untuk Pengaduan, Opsional untuk lainnya) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                Lampiran Bukti Foto/Video{' '}
                {reportType === 'pengaduan' ? (
                  <span className="text-rose-500">* (Wajib)</span>
                ) : (
                  <span className="text-secondary font-normal lowercase">(opsional)</span>
                )}
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-between gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant max-w-md mx-auto">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-on-surface truncate">{file.name}</p>
                        <p className="text-[11px] text-secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Lampiran Terpilih
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setPreviewUrl(null)
                      }}
                      className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/50 text-secondary flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Hapus file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-3 text-secondary">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-on-surface mb-1">
                      Klik atau seret file foto/video ke sini
                    </p>
                    <p className="text-[11px] text-secondary">Format JPG, PNG, MP4 (Maks. 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seksi Legalitas & Identitas Pelapor */}
            <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-low/80 overflow-hidden text-xs">
              {/* Header Box */}
              <div className="px-4 py-3 bg-surface-container border-b border-outline-variant/60 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-on-surface">
                  <User className="w-4 h-4 text-primary" />
                  <span>Identitas Pelapor Terdaftar</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/80 text-on-surface text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Warga Terverifikasi
                </span>
              </div>

              {/* Data Pelapor */}
              {user ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-secondary border-b border-outline-variant/50">
                  <div>
                    <span className="block text-[11px] text-secondary">Nama Lengkap:</span>
                    <span className="text-on-surface font-semibold text-xs">{user?.user_metadata?.full_name || user?.full_name || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-secondary">No. WhatsApp / HP:</span>
                    <span className="text-on-surface font-semibold text-xs">{user?.phone || user?.phone_number || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-secondary">Alamat Email:</span>
                    <span className="text-on-surface font-semibold text-xs">{user?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-secondary">Alamat Domisili:</span>
                    <span className="text-on-surface font-semibold text-xs">{user?.alamat_domisili || user?.detail_alamat || '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">Anda Belum Masuk ke Akun Warga</span>
                    <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 block mt-0.5">
                      Identitas pelapor resmi dibutuhkan untuk verifikasi aduan oleh tim redaksi.
                    </span>
                  </div>
                  <Link
                    href="/login?redirect=/halo-jurnal/lapor"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shrink-0 shadow-2xs transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk Akun</span>
                  </Link>
                </div>
              )}

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
            {!user ? (
              <div className="pt-2">
                <Link
                  href="/login?redirect=/halo-jurnal/lapor"
                  className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk untuk Mengirim Laporan</span>
                </Link>
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading || !file || !legalAgreed}
                className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{config.submitText}</span>
                  </>
                )}
              </button>
            )}
            {!file && (
              <p className="text-[11px] text-center text-primary font-medium">
                * Wajib mengunggah minimal 1 file foto/video bukti untuk membuka tombol kirim.
              </p>
            )}
            {file && !legalAgreed && (
              <p className="text-[11px] text-center text-amber-600 dark:text-amber-400 font-medium">
                * Wajib mencentang kotak pernyataan hukum di atas untuk mengirim laporan.
              </p>
            )}
          </form>
        </div>

        {/* Sidebar Column: Pratinjau Bersih Bergaya Jurnal Wave */}
        <div className="space-y-5 lg:sticky lg:top-24 self-start">
          <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            {/* Header Pratinjau */}
            <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-outline-variant/60">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-bold text-sm text-on-surface">
                Pratinjau Laporan
              </h2>
            </div>

            {/* Media Box */}
            <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/60 relative mb-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Pratinjau Media"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-secondary/60 gap-1.5 p-4 text-center">
                  <ImageIcon className="w-8 h-8 stroke-1 text-secondary/50" />
                  <span className="text-xs">Foto/video bukti akan tampil di sini</span>
                </div>
              )}
            </div>

            {/* Konten Laporan Bergaya Jurnal Wave */}
            <div className="space-y-2.5">
              {/* Kategori & Tipe */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-primary font-bold text-xs uppercase tracking-wider">
                  {displayCategory && displayCategory !== 'Pilih Kategori' && displayCategory !== 'Pilih Jenis'
                    ? displayCategory
                    : reportType}
                </span>
                <span className="text-secondary/40">•</span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-secondary text-[10px] font-semibold capitalize">
                  {reportType}
                </span>
              </div>

              {/* Judul Laporan */}
              <h3
                className={`font-heading font-bold text-base sm:text-lg leading-snug line-clamp-2 ${
                  title.trim() ? 'text-on-surface' : 'text-secondary/50 italic font-normal'
                }`}
              >
                {title.trim() || 'Judul laporan Anda...'}
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
                  <p>Detail dan kronologi kejadian yang Anda tulis akan ditampilkan di sini.</p>
                )}
              </div>

              {/* Lokasi Kejadian */}
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {locationData.address || 'Lokasi belum ditentukan'}
                </span>
              </div>
            </div>

            {/* Info Penanganan Ringkas */}
            <div className="p-3 bg-surface-container-low/70 rounded-2xl text-[11px] text-secondary leading-relaxed border border-outline-variant/50 flex items-start gap-2.5 mt-5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{config.sidebarInfo}</span>
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
