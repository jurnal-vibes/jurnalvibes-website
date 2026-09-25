'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import LocationPicker from '@/components/halo-jurnal/LocationPicker'
import {
  AlertTriangle,
  Lightbulb,
  Info,
  Sparkles,
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
    categories: [
      'Infrastruktur',
      'Kebersihan Lingkungan',
      'Keamanan & Ketertiban',
      'Pelayanan Publik',
      'Kesehatan',
      'Lainnya',
    ],
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
    categories: [
      'Pembangunan Daerah',
      'Program Kemasyarakatan',
      'Inovasi Pelayanan',
      'Fasilitas Umum',
      'Lainnya',
    ],
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
    categories: ['Kebijakan', 'Data Statistik', 'Anggaran', 'Laporan Kegiatan', 'Lainnya'],
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
    categories: [
      'Gotong Royong',
      'Prestasi Warga',
      'UMKM & Ekonomi Lokal',
      'Komunitas & Kegiatan Sosial',
      'Lainnya',
    ],
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

const jenisInformasiList = [
  'Kebijakan',
  'Data Statistik',
  'Anggaran',
  'Laporan Kegiatan',
  'Lainnya',
]

function LaporForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase] = useState(() => createClient())

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
  const [instansi, setInstansi] = useState('')
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

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      } else {
        setUser({ id: 'demo-user-id', email: 'warga@sukabumi.com' })
      }
    }
    checkUser()
  }, [supabase])

  const handleTabChange = (newType: ReportType) => {
    setActiveType(newType)
    setCategory('')
    setInstansi('')
    setJenisInformasi('')
    router.push(`/halo-jurnal/lapor?type=${newType}`, { scroll: false })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
        reader.readAsDataURL(selectedFile)
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
        const reader = new FileReader()
        reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Upload foto/video hanya wajib untuk jenis Pengaduan
    if (reportType === 'pengaduan' && !file) {
      alert('Foto/Video bukti pendukung wajib dilampirkan khusus untuk laporan Pengaduan.')
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
      // 0. Ensure user profile exists
      if (user.id !== 'demo-user-id') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Warga Sukabumi',
              role: 'citizen',
              ktp_verified: false,
            },
            { onConflict: 'id', ignoreDuplicates: true }
          )
        }
      }

      // Generate ticket number: JS-YYYYMMDD-XXXX
      const date = new Date()
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const ticketNumber = `JS-${yyyy}${mm}${dd}-${random4}`

      const finalKategori = reportType === 'informasi' ? jenisInformasi : category

      // Simpan ke localStorage agar selalu muncul di Laporan Saya meskipun Supabase offline / schema belum termigrasi
      const newReportId = `lap-sukabumi-${Date.now()}`
      const newReportData = {
        id: newReportId,
        ticket_number: ticketNumber,
        nomor_tiket: ticketNumber,
        user_id: user.id,
        jenis: reportType,
        kategori: finalKategori,
        judul: title,
        deskripsi: description,
        lokasi: locationData.address || (reportType === 'inspirasi' ? 'Sukabumi' : ''),
        latitude: locationData.lat,
        longitude: locationData.lng,
        instansi_tujuan: reportType === 'informasi' ? instansi : null,
        jenis_informasi: reportType === 'informasi' ? jenisInformasi : null,
        status: 'diterima',
        is_public: true,
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
            catatan: 'Laporan baru diterima oleh sistem Halo Jurnal',
            created_at: new Date().toISOString(),
          },
        ],
      }

      try {
        if (typeof window !== 'undefined') {
          const prev = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
          localStorage.setItem('halo_jurnal_user_reports', JSON.stringify([newReportData, ...prev]))
        }
      } catch {}

      // 1. Coba kirim ke Supabase jika tabel tersedia di cloud
      try {
        const { data: laporan, error: laporanError } = await supabase
          .from('laporan')
          .insert({
            ticket_number: ticketNumber,
            user_id: user.id,
            jenis: reportType,
            kategori: finalKategori,
            judul: title,
            deskripsi: description,
            lokasi: locationData.address || (reportType === 'inspirasi' ? 'Sukabumi' : ''),
            latitude: locationData.lat,
            longitude: locationData.lng,
            instansi_tujuan: reportType === 'informasi' ? instansi : null,
            jenis_informasi: reportType === 'informasi' ? jenisInformasi : null,
            status: 'diterima',
            is_public: true,
            dukungan_count: 0,
          })
          .select()
          .single()

        // 2. Upload Lampiran jika laporan berhasil diinsert ke Supabase
        if (!laporanError && laporan && file) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${laporan.id}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('laporan-lampiran')
            .upload(filePath, file)

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('laporan-lampiran')
              .getPublicUrl(filePath)

            await supabase.from('laporan_lampiran').insert({
              laporan_id: laporan.id,
              file_url: publicUrlData.publicUrl,
              file_type: file.type,
            })
          }

          // 3. Insert Status Log
          await supabase.from('status_log').insert({
            laporan_id: laporan.id,
            status: 'diterima',
            catatan: 'Laporan baru diterima oleh sistem Halo Jurnal',
            changed_by: user.id,
          })
        }
      } catch (cloudErr) {
        console.warn('Supabase cloud insert notice:', cloudErr)
      }

      alert(`Laporan berhasil dikirim! Nomor Tiket Anda: ${ticketNumber}`)
      router.push('/halo-jurnal/laporan-saya')
    } catch (error: any) {
      console.error(error)
      alert(`Terjadi kesalahan: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { type: 'pengaduan' as const, label: 'Pengaduan', icon: AlertTriangle },
    { type: 'aspirasi' as const, label: 'Aspirasi', icon: Lightbulb },
    { type: 'informasi' as const, label: 'Informasi', icon: Info },
    { type: 'inspirasi' as const, label: 'Inspirasi', icon: Sparkles },
  ]

  const displayCategory =
    reportType === 'informasi'
      ? jenisInformasi || 'Pilih Jenis'
      : category || 'Pilih Kategori'

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-10 sm:pt-12 md:pt-16 pb-16">
      {/* Header Info */}
      <div className="text-left max-w-3xl mb-6">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          {config.headerTitle}
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed">{config.headerDesc}</p>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center justify-start gap-2 mb-8 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = reportType === tab.type
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => handleTabChange(tab.type)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer select-none shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-outline-variant/80 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
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
            className="bg-surface border border-outline-variant/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6"
          >
            {/* Conditional: Instansi for Informasi */}
            {reportType === 'informasi' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                  Instansi / Lembaga Tujuan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
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
            )}

            {/* Conditional: Jenis Informasi vs Category */}
            {reportType === 'informasi' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                  Jenis Informasi yang Diminta <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jenisInformasi}
                  onChange={(e) => setJenisInformasi(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
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
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm tracking-tight shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
          </form>
        </div>

        {/* Sidebar Column: Pratinjau Bersih Bergaya Jurnal Wave */}
        <div className="space-y-5 lg:sticky lg:top-24 self-start">
          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-5 sm:p-6 shadow-xs">
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
              <p
                className={`text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                  description.trim() ? 'text-secondary' : 'text-secondary/40 italic'
                }`}
              >
                {description.trim() ||
                  'Detail dan kronologi kejadian yang Anda tulis akan ditampilkan di sini.'}
              </p>

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
