'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Newspaper,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  Pin,
  Calendar,
  User,
  Layers,
  ArrowRight,
  Save,
  Upload,
  Image as ImageIcon,
  Loader2,
  Clock,
  Send,
  CheckCircle2,
  Archive,
  ArchiveRestore,
  FileText,
  RotateCcw,
  Tag,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Star,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Article, ArticleCategory } from '@/types'
import AdminToast from '@/components/admin/AdminToast'
import { useConfirm } from '@/components/admin/AdminConfirmDialog'

export interface CategoryItem {
  value: string
  label: string
  subCategories?: string[]
}

// Daftar 7 Kategori Resmi Jurnal Wave beserta nama tampilannya (Loker dikelola terpisah di menu Lowongan Kerja)
const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  berita: 'Berita',
  kuliner: 'Kuliner',
  wisata: 'Wisata',
  hiburan: 'Hiburan',
  tech: 'Tech & Game',
  sport: 'Sport',
  inspirasi: 'Inspirasi',
  lifestyle: 'Lifestyle',
  otomotif: 'Otomotif',
  science: 'Science',
  health: 'Health',
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { value: 'berita', label: 'Berita' },
  { value: 'kuliner', label: 'Kuliner' },
  { value: 'wisata', label: 'Wisata' },
  { value: 'hiburan', label: 'Hiburan' },
  { value: 'tech', label: 'Tech & Game' },
  { value: 'sport', label: 'Sport' },
  { value: 'inspirasi', label: 'Inspirasi' },
]

// Stop words bahasa Indonesia untuk ekstraksi kata kunci berita
const INDO_STOP_WORDS = new Set([
  'dan', 'yang', 'di', 'ke', 'dari', 'untuk', 'pada', 'ini', 'itu', 'dengan',
  'atau', 'ada', 'tidak', 'saat', 'telah', 'akan', 'bisa', 'cara', 'begini',
  'oleh', 'juga', 'karena', 'dalam', 'tentang', 'lebih', 'sudah', 'saya', 'kamu',
  'dia', 'mereka', 'kita', 'kami', 'bikin', 'membuat', 'jadi', 'hasil', 'hasilnya',
  'pakai', 'menggunakan', 'sebuah', 'para', 'pun', 'jika', 'agar', 'sangat', 'seperti',
  'serta', 'hingga', 'lagi', 'bahwa', 'bagi', 'terus', 'belum', 'harus', 'dapat',
  'hal', 'namun', 'antara', 'setiap', 'terhadap', 'kembali', 'setelah', 'sebelum',
  'melalui', 'atas', 'bawah', 'depan', 'belakang', 'tengah', 'baru', 'lama', 'satu',
  'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
  'orang', 'hari', 'tahun', 'bulan', 'waktu', 'secara', 'saja', 'tersebut', 'banyak'
])

const generateSmartTags = (
  title: string,
  category: string,
  content?: string
): string => {
  const tags: string[] = ['#JurnalWave', '#Sukabumi']

  // 1. Tag Kategori Wajib
  const catMap: Record<string, string> = {
    berita: 'Berita',
    kuliner: 'Kuliner',
    wisata: 'Wisata',
    hiburan: 'Hiburan',
    tech: 'Teknologi',
    sport: 'Sport',
    inspirasi: 'Inspirasi',
    lifestyle: 'Lifestyle',
    otomotif: 'Otomotif',
    science: 'Science',
    health: 'Health',
  }
  const catLabel = catMap[category.toLowerCase()] || (category.charAt(0).toUpperCase() + category.slice(1).toLowerCase())
  if (catLabel && !tags.some(t => t.toLowerCase() === `#${catLabel.toLowerCase()}`)) {
    tags.push(`#${catLabel}`)
  }

  // 2. Ekstraksi Kata Kunci Cerdas dari Judul Berita
  if (title && title.trim()) {
    const words = title
      .replace(/[^\w\s]/gi, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => {
        const lower = w.toLowerCase()
        if (lower.length < 3 && lower !== 'ai' && lower !== 'ev' && lower !== 'ui' && lower !== 'ux') return false
        if (INDO_STOP_WORDS.has(lower)) return false
        if (/^\d+$/.test(w)) return false
        return true
      })

    const extracted: string[] = []
    const seen = new Set<string>(tags.map(t => t.slice(1).toLowerCase()))

    for (const word of words) {
      const lower = word.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        const formatted = lower === 'ai' ? 'AI' : lower === 'ev' ? 'EV' : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        extracted.push(`#${formatted}`)
        if (extracted.length >= 4) break
      }
    }

    // 4. Jika kata kunci judul masih kurang dari 2 dan ada isi berita, ambil kata kunci dari isi berita
    if (extracted.length < 2 && content && content.trim()) {
      const contentWords = content
        .replace(/[^\w\s]/gi, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => {
          const lower = w.toLowerCase()
          return lower.length >= 4 && !INDO_STOP_WORDS.has(lower) && !seen.has(lower) && !/^\d+$/.test(w)
        })

      for (const cw of contentWords) {
        const lower = cw.toLowerCase()
        if (!seen.has(lower)) {
          seen.add(lower)
          const formatted = cw.charAt(0).toUpperCase() + cw.slice(1).toLowerCase()
          extracted.push(`#${formatted}`)
          if (extracted.length >= 3) break
        }
      }
    }

    tags.push(...extracted)
  }

  return tags.join(', ')
}

// Kata sambung yang dilarang berada di awal kalimat Subjudul / Lead
const INVALID_START_WORDS = /^(tetapi|namun|sementara|adapun|sedangkan|dan|atau|bahkan|sehingga|maka|pasalnya|sebab|karena|oleh karena itu|kemudian|selanjutnya|selain itu|di sisi lain|meski|meskipun|walaupun|padahal|lantaran)\b/i

/**
 * Menyaring kalimat pemikat (hook / lead) terbaik dari naskah berita
 * yang menarik perhatian pembaca, bersih tanpa kata sambung gantung dan tanpa kutipan putus.
 */
const generateSmartLead = (title: string, content: string): string => {
  if (!content || !content.trim()) return ''

  // 1. Bersihkan naskah dari tag/komentar dan wire headers
  const clean = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^(JURNALWAVE\.COM|JURNAL WAVE|JURNALVIBES\.COM|JURNAL VIBES)(\s*[-–—]\s*)/i, '')
    .replace(/^([A-Z\s]+)\s*[-–—]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!clean) return ''

  // 2. Pecah ke dalam kalimat-kalimat
  const rawSentences = clean.match(/[^.!?]+[.!?]+/g) || []

  // 3. Filter ketat kalimat yang layak menjadi subjudul pemikat
  const validCandidates = rawSentences
    .map((s) => s.trim())
    .filter((s) => {
      // Panjang ideal subjudul antara 45 sampai 160 karakter
      if (s.length < 45 || s.length > 165) return false

      // Tolak kalimat yang diawali tanda kutip, strip, atau koma
      if (/^["'“”„«\-,–—]/.test(s)) return false

      // Tolak kalimat yang diakhiri tanda kutip gantung tanpa pasangan awal
      const quotesCount = (s.match(/["'“”„«»]/g) || []).length
      if (quotesCount % 2 !== 0) return false

      // Tolak kalimat yang diawali kata sambung gantung (Tetapi, Namun, Sementara, dll.)
      if (INVALID_START_WORDS.test(s)) return false

      // Tolak teks administratif editorial
      if (/^(baca juga|editor|reporter|foto:|penulis:|dokumen|sumber:)/i.test(s)) return false

      return true
    })

  if (validCandidates.length === 0) {
    // Jika tidak ada yang lolos kriteria ketat, cari kalimat pertama yang bersih dari kata sambung
    const firstClean = rawSentences
      .map((s) => s.trim())
      .find((s) => s.length >= 40 && !INVALID_START_WORDS.test(s) && !/^["'“”]/.test(s))
    if (firstClean) {
      return firstClean.length > 160 ? firstClean.slice(0, 155).replace(/\s+\S*$/, '') + '...' : firstClean
    }
    return ''
  }

  // Kata kunci penanda daya tarik berita (Hook Keywords)
  const HOOK_KEYWORDS = /(berhasil|sukses|resmi|mencatat|tercatat|sorotan|penting|terungkap|memastikan|lonjakan|dampak|fenomena|kemenangan|potensi|langkah|strategi|perhatian|unggulan|puncak|fokus|diimbau|ajang|persiapan|sejarah|prestasi|antusias|viral)/i

  let bestLead = ''
  let bestScore = -100

  for (let idx = 0; idx < validCandidates.length; idx++) {
    const s = validCandidates[idx]
    let score = 0

    // Poin daya tarik kata kunci berita
    const matches = s.match(new RegExp(HOOK_KEYWORDS.source, 'gi'))
    if (matches) {
      score += matches.length * 4
    }

    // Poin panjang ideal (65-130 karakter enak dibaca dalam 1 tarikan nafas)
    if (s.length >= 65 && s.length <= 130) {
      score += 3
    }

    // Kurangi nilai jika kalimat mirip/menjiplak judul
    if (title && s.toLowerCase().includes(title.toLowerCase().trim())) {
      score -= 5
    }

    // Beri sedikit prioritas untuk kalimat di awal/tengah cerita (alur pengait alami)
    if (idx <= 3) {
      score += 2
    }

    if (score > bestScore) {
      bestScore = score
      bestLead = s
    }
  }

  return bestLead || validCandidates[0] || ''
}

export default function AdminBeritaPage() {
  const confirmDialog = useConfirm()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('semua')
  const [selectedFilter, setSelectedFilter] = useState<string>('semua')
  const [toast, setToast] = useState<{ id: number; type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast = { id: Date.now(), type, message }
    setToast(newToast)
    setTimeout(() => {
      setToast((current) => (current?.id === newToast.id ? null : current))
    }, 3500)
  }

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [fullscreenTarget, setFullscreenTarget] = useState<'create' | 'edit' | null>(null)
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null)

  // Listener tombol Escape untuk keluar dari mode layar penuh atau lightbox foto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImageModalUrl) {
          setPreviewImageModalUrl(null)
          return
        }
        if (fullscreenTarget) {
          setFullscreenTarget(null)
          return
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenTarget, previewImageModalUrl])

  // Form State untuk Tambah Berita Baru
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<ArticleCategory>('berita')
  const [newExcerpt, setNewExcerpt] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageCaption, setNewImageCaption] = useState('')
  const [newReporter, setNewReporter] = useState('')
  const [newRedaktur, setNewRedaktur] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newIsHero, setNewIsHero] = useState(false)
  const [newPublishType, setNewPublishType] = useState<'now' | 'draft'>('now')
  const [editPublishType, setEditPublishType] = useState<'now' | 'draft' | 'archived'>('now')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTagsManuallyEdited, setIsTagsManuallyEdited] = useState(false)
  const [isExcerptManuallyEdited, setIsExcerptManuallyEdited] = useState(false)

  // Manajemen Kategori Berita
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [editingCatValue, setEditingCatValue] = useState<string | null>(null)
  const [editingCatLabel, setEditingCatLabel] = useState<string>('')

  // Inisialisasi & Sinkronisasi 7 Kategori Resmi Jurnal Wave dari localStorage
  useEffect(() => {
    try {
      const savedCats =
        localStorage.getItem('jurnal_wave_custom_categories') ||
        localStorage.getItem('jurnal_wave_categories')
      if (savedCats) {
        const parsed = JSON.parse(savedCats)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Periksa apakah kategori inti Jurnal Wave sudah ada dan loker sudah dihapus dari artikel
          const hasWaveCategories =
            parsed.some((c: CategoryItem) => c.value === 'kuliner') &&
            parsed.some((c: CategoryItem) => c.value === 'wisata') &&
            parsed.some((c: CategoryItem) => c.value === 'hiburan') &&
            parsed.some((c: CategoryItem) => c.value === 'inspirasi') &&
            !parsed.some((c: CategoryItem) => c.value === 'loker')

          if (hasWaveCategories) {
            setCategoriesList(parsed)
            return
          }

          // Jika browser menyimpan cache lama, upgrade otomatis ke 7 kategori resmi Jurnal Wave
          const customAdded = parsed.filter(
            (c: CategoryItem) =>
              !DEFAULT_CATEGORIES.some((d) => d.value.toLowerCase() === c.value.toLowerCase()) &&
              !['lifestyle', 'otomotif', 'science', 'health', 'loker'].includes(c.value.toLowerCase())
          )
          const merged = [...DEFAULT_CATEGORIES, ...customAdded]
          setCategoriesList(merged)
          localStorage.setItem('jurnal_wave_custom_categories', JSON.stringify(merged))
          localStorage.setItem('jurnal_wave_categories', JSON.stringify(merged))
          return
        }
      }
      setCategoriesList(DEFAULT_CATEGORIES)
      localStorage.setItem('jurnal_wave_custom_categories', JSON.stringify(DEFAULT_CATEGORIES))
      localStorage.setItem('jurnal_wave_categories', JSON.stringify(DEFAULT_CATEGORIES))
    } catch {
      setCategoriesList(DEFAULT_CATEGORIES)
    }
  }, [])

  const persistCategories = (updated: CategoryItem[]) => {
    setCategoriesList(updated)
    try {
      localStorage.setItem('jurnal_wave_custom_categories', JSON.stringify(updated))
      localStorage.setItem('jurnal_wave_categories', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch {}
  }

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categoriesList.length - 1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...categoriesList]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    persistCategories(updated)
  }

  const getCategoryLabel = (catKey: string): string => {
    if (!catKey) return 'Umum'
    const found = categoriesList.find((c) => c.value.toLowerCase() === catKey.toLowerCase())
    if (found) return found.label
    return CATEGORY_DISPLAY_MAP[catKey] || (catKey.charAt(0).toUpperCase() + catKey.slice(1))
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanLabel = newCatLabel.trim()
    if (!cleanLabel) {
      showToast('Nama kategori tidak boleh kosong.', 'error')
      return
    }

    const generatedSlug = cleanLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!generatedSlug) {
      showToast('Format nama kategori tidak valid.', 'error')
      return
    }

    const isDuplicate = categoriesList.some(
      (c) => c.value.toLowerCase() === generatedSlug || c.label.toLowerCase() === cleanLabel.toLowerCase()
    )

    if (isDuplicate) {
      showToast(`Kategori "${cleanLabel}" sudah ada.`, 'error')
      return
    }

    const updated = [
      ...categoriesList,
      { value: generatedSlug, label: cleanLabel },
    ]
    persistCategories(updated)
    setNewCatLabel('')
    showToast(`Kategori "${cleanLabel}" berhasil ditambahkan!`, 'success')
  }

  const handleDeleteCategory = async (catValue: string, catLabel: string) => {
    const isConfirmed = await confirmDialog({
      title: 'Hapus Kategori?',
      message: `Yakin ingin menghapus kategori "${catLabel}"?`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    })
    if (!isConfirmed) return

    const updated = categoriesList.filter((c) => c.value.toLowerCase() !== catValue.toLowerCase())
    if (updated.length === 0) {
      showToast('Minimal harus menyisakan 1 kategori aktif.', 'error')
      return
    }

    persistCategories(updated)

    if (selectedCategory.toLowerCase() === catValue.toLowerCase()) {
      setSelectedCategory('semua')
    }
    if ((newCategory as string).toLowerCase() === catValue.toLowerCase()) {
      setNewCategory((updated[0].value as ArticleCategory) || 'berita')
    }

    showToast(`Kategori "${catLabel}" berhasil dihapus.`, 'success')
  }

  const handleResetCategories = async () => {
    const isConfirmed = await confirmDialog({
      title: 'Reset Kategori?',
      message: 'Kembalikan ke 7 kategori resmi Jurnal Wave?',
      confirmText: 'Reset',
      cancelText: 'Batal',
      variant: 'warning',
    })
    if (!isConfirmed) return

    setEditingCatValue(null)
    setEditingCatLabel('')
    persistCategories(DEFAULT_CATEGORIES)
    showToast('Daftar kategori berhasil dikembalikan ke 7 kategori resmi Jurnal Wave.', 'success')
  }

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCatValue(cat.value)
    setEditingCatLabel(cat.label)
  }

  const handleCancelEditCategory = () => {
    setEditingCatValue(null)
    setEditingCatLabel('')
  }

  const handleSaveCategoryName = (catValue: string) => {
    const cleanLabel = editingCatLabel.trim()
    if (!cleanLabel) {
      showToast('Nama kategori tidak boleh kosong.', 'error')
      return
    }

    const isDuplicate = categoriesList.some(
      (c) => c.value.toLowerCase() !== catValue.toLowerCase() && c.label.toLowerCase() === cleanLabel.toLowerCase()
    )

    if (isDuplicate) {
      showToast(`Kategori "${cleanLabel}" sudah ada.`, 'error')
      return
    }

    const updated = categoriesList.map((c) =>
      c.value.toLowerCase() === catValue.toLowerCase() ? { ...c, label: cleanLabel } : c
    )
    persistCategories(updated)
    setEditingCatValue(null)
    setEditingCatLabel('')
    showToast(`Nama kategori berhasil diperbarui menjadi "${cleanLabel}".`, 'success')
  }

  // Otomatis isi dan perbarui tagar ketika judul, kategori, atau isi berita terisi
  useEffect(() => {
    if (isTagsManuallyEdited) return
    const autoTags = generateSmartTags(newTitle, newCategory, newContent)
    setNewTags(autoTags)
  }, [newTitle, newCategory, newContent, isTagsManuallyEdited])

  // Otomatis pilih kalimat pemikat (lead) ketika judul atau isi berita terisi
  useEffect(() => {
    if (isExcerptManuallyEdited) return
    if (!newContent.trim()) {
      setNewExcerpt('')
      return
    }
    const auto = generateSmartLead(newTitle, newContent)
    setNewExcerpt(auto)
  }, [newTitle, newContent, isExcerptManuallyEdited])

  // Helper deduplikasi artikel berdasarkan slug, title, atau id
  const dedupeArticles = (items: Article[]): Article[] => {
    const seen = new Set<string>()
    return items.filter((item) => {
      const key = (item.slug || item.title || item.id || '').toLowerCase().trim()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Helper kompres dan konversi gambar ke Base64 optimal
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
            try {
              // Otomatis ubah & kompres ke WebP modern (standar Google SEO & super hemat bandwidth)
              const webpData = canvas.toDataURL('image/webp', 0.85)
              if (webpData.startsWith('data:image/webp')) {
                resolve(webpData)
                return
              }
            } catch {}
            resolve(canvas.toDataURL('image/jpeg', 0.85))
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

  // Handle Upload Foto Berita Baru
  const handleImageUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const base64 = await compressImage(file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      })
      const data = await res.json()
      if (data.success && data.url) {
        setNewImageUrl(data.url)
      } else {
        throw new Error(data.message || 'Gagal mengunggah foto ke server')
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      alert('Gagal memproses foto: ' + (err?.message || 'Silakan coba lagi'))
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Upload Foto Saat Edit Berita
  const handleImageUploadEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingArticle) return
    try {
      setIsUploading(true)
      const base64 = await compressImage(file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      })
      const data = await res.json()
      if (data.success && data.url) {
        setEditingArticle({ ...editingArticle, imageUrl: data.url })
      } else {
        throw new Error(data.message || 'Gagal mengunggah foto ke server')
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      alert('Gagal memproses foto: ' + (err?.message || 'Silakan coba lagi'))
    } finally {
      setIsUploading(false)
    }
  }

  // Muat artikel secara instan (0 ms) dari cache, lalu sinkronisasi database di latar belakang
  useEffect(() => {
    // 1. Instant Cache Load: Tampilkan seketika dari cache lokal tanpa jeda (0 ms)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_articles')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setArticles(dedupeArticles(parsed))
            setIsLoading(false)
          }
        }
      } catch {}
    }

    // 2. Silent Background Sync: Cek pembaruan terbaru dari database PostgreSQL di latar belakang
    fetch('/api/articles?admin=true', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const cleanData = dedupeArticles(json.data)
          setArticles(cleanData)
          if (typeof window !== 'undefined') {
            localStorage.setItem('jurnal_wave_articles', JSON.stringify(cleanData))
          }
        }
      })
      .catch((err) => {
        console.warn('Background sync artikel notice:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Helper simpan ke localStorage
  const persistArticles = (updated: Article[]) => {
    const cleanUpdated = dedupeArticles(updated)
    setArticles(cleanUpdated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_articles', JSON.stringify(cleanUpdated))
        // Kirim event realtime agar seluruh tab/halaman publik langsung tersinkron
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving articles to localStorage:', err)
      }
    }
  }

  // Kategori unik
  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [articles])

  // Filter Artikel
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = a.title?.toLowerCase().includes(q)
        const matchAuthor = a.author?.toLowerCase().includes(q)
        const matchReporter = a.reporter?.toLowerCase().includes(q)
        const matchCategory = a.category?.toLowerCase().includes(q)
        if (!matchTitle && !matchAuthor && !matchReporter && !matchCategory) return false
      }

      // 2. Kategori
      if (selectedCategory !== 'semua') {
        const catLower = selectedCategory.toLowerCase()
        const articleCat = (a.category || '').toLowerCase()
        const articleLabel = (a.categoryLabel || '').toLowerCase()
        if (articleCat !== catLower && articleLabel !== catLower) {
          return false
        }
      }

      // 3. Filter Khusus
      if (selectedFilter === 'hero' && !a.isHero) return false
      if (selectedFilter === 'published' && a.status && a.status !== 'published') return false
      if (selectedFilter === 'draft' && a.status !== 'draft') return false
      if (selectedFilter === 'archived' && a.status !== 'archived') return false

      return true
    })
  }, [articles, searchQuery, selectedCategory, selectedFilter])

  // Hitung jumlah
  const totalCount = articles.length
  const publishedCount = articles.filter((a) => !a.status || a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length
  const archivedCount = articles.filter((a) => a.status === 'archived').length
  const heroCount = articles.filter((a) => a.isHero).length

  // Handle Simpan Berita Baru ke MySQL
  const handleCreateArticle = async (e: React.FormEvent, forceStatus?: 'published' | 'draft') => {
    e.preventDefault()
    if (isSubmitting || !newTitle.trim()) return
    setIsSubmitting(true)

    try {
      const isDraft = forceStatus ? forceStatus === 'draft' : newPublishType === 'draft'
      const finalCategoryLabel = getCategoryLabel(newCategory).toUpperCase()
      const cleanContent = (newContent || '').replace(/<!--[\s\S]*?-->/g, '').trim()
      const autoExcerpt = newExcerpt.trim() || generateSmartLead(newTitle, cleanContent)
      const rawTags = newTags.trim() || generateSmartTags(newTitle, newCategory, cleanContent)
      const parsedTags = rawTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))

      const payload = {
        title: newTitle.trim(),
        category: newCategory,
        categoryLabel: finalCategoryLabel,
        subCategory: undefined,
        excerpt: autoExcerpt,
        content: cleanContent || autoExcerpt,
        imageUrl:
          newImageUrl.trim() ||
          '/hero-banner.webp',
        imageCaption: newImageCaption.trim() || undefined,
        imageAlt: newImageCaption.trim() || undefined,
        author: newReporter.trim() || 'Tim Redaksi',
        reporter: newReporter.trim() || 'Tim Redaksi',
        redaktur: newRedaktur.trim() || 'Tim Redaksi',
        tags: parsedTags,
        isHero: newIsHero,
        isEditorsPick: false,
        status: isDraft ? ('draft' as const) : ('published' as const),
        scheduledAt: null,
      }

      let createdArticle: Article | null = null
      let apiErrorMessage = ''

      try {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await res.json().catch(() => null)

        if (res.ok && json?.success && json?.data) {
          createdArticle = json.data
        } else {
          apiErrorMessage = json?.message || `Gagal menyimpan ke database (Status: ${res.status} ${res.statusText})`
        }
      } catch (err: any) {
        console.error('Gagal fetch /api/articles:', err)
        apiErrorMessage = err?.message || 'Gagal menghubungi server database'
      }

      if (!createdArticle) {
        alert(`❌ GAGAL MENERBITKAN BERITA KE DATABASE:\n${apiErrorMessage}\n\nBerita TIDAK disimpan karena gagal masuk ke server database. Silakan pastikan Anda sudah login admin di /halo-jurnal/admin/login dan koneksi server stabil.`)
        return
      }

      const updated = [createdArticle, ...articles.filter((a) => a.id !== createdArticle!.id && a.slug !== createdArticle!.slug)]
      persistArticles(updated)
      setIsCreateModalOpen(false)

      // Reset Form
      setNewTitle('')
      setNewCategory('berita')
      setNewExcerpt('')
      setNewContent('')
      setNewImageUrl('')
      setNewImageCaption('')
      setNewReporter('')
      setNewRedaktur('')
      setNewTags('')
      setIsTagsManuallyEdited(false)
      setIsExcerptManuallyEdited(false)
      setNewIsHero(false)
      setNewPublishType('now')

      showToast(
        isDraft
          ? 'Naskah berhasil disimpan sebagai Draf!'
          : 'Berita berhasil diterbitkan ke database!',
        'success'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Buka Modal Edit
  const handleOpenEdit = (article: Article) => {
    let initialTags = article.tags
    if (!initialTags || (Array.isArray(initialTags) && initialTags.length === 0)) {
      initialTags = generateSmartTags(article.title, article.category, article.content)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }
    let initialExcerpt = article.excerpt
    if (!initialExcerpt || !initialExcerpt.trim()) {
      initialExcerpt = generateSmartLead(article.title, article.content)
    }

    if (article.status === 'draft') {
      setEditPublishType('draft')
    } else if (article.status === 'archived') {
      setEditPublishType('archived')
    } else {
      setEditPublishType('now')
    }

    setEditingArticle({ ...article, tags: initialTags, excerpt: initialExcerpt })
    setIsEditModalOpen(true)
  }

  // Handle Cepat: Ubah status artikel (Tayang, Draf, Arsip)
  const handleUpdateStatus = async (
    id: string,
    title: string,
    targetStatus: 'published' | 'archived' | 'draft'
  ) => {
    const isConfirmed = await confirmDialog({
      title:
        targetStatus === 'published'
          ? 'Tayangkan Artikel?'
          : targetStatus === 'archived'
          ? 'Arsipkan Artikel?'
          : 'Simpan Draf?',
      message:
        targetStatus === 'published'
          ? 'Tayangkan artikel ini ke publik sekarang?'
          : targetStatus === 'archived'
          ? 'Tarik artikel ini dari publik ke arsip?'
          : 'Ubah artikel ini menjadi draf redaksi?',
      confirmText:
        targetStatus === 'published'
          ? 'Tayangkan'
          : targetStatus === 'archived'
          ? 'Arsipkan'
          : 'Simpan Draf',
      cancelText: 'Batal',
      variant: targetStatus === 'published' ? 'success' : 'warning',
    })

    if (!isConfirmed) return
    try {
      const res = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: targetStatus, scheduledAt: null }),
      })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.success) {
        const updated = articles.map((a) =>
          a.id === id ? { ...a, status: targetStatus, scheduledAt: null } : a
        )
        persistArticles(updated)
        const successMsg =
          targetStatus === 'published'
            ? `Artikel "${title}" kini sudah tayang secara publik!`
            : targetStatus === 'archived'
            ? `Artikel "${title}" berhasil ditarik dan diarsipkan.`
            : `Artikel "${title}" kini disimpan sebagai draf.`
        showToast(successMsg, 'success')
      } else {
        showToast('Gagal memperbarui status: ' + (json?.message || 'Error tidak diketahui'), 'error')
      }
    } catch (err: any) {
      showToast('Gagal memperbarui status: ' + (err?.message || 'Koneksi error'), 'error')
    }
  }

  const handleQuickPublish = (id: string, title: string) => handleUpdateStatus(id, title, 'published')

  // Handle Simpan Hasil Edit ke Database
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !editingArticle || !editingArticle.title.trim()) return
    setIsSubmitting(true)

    try {
      const finalCategoryLabel = getCategoryLabel(editingArticle.category).toUpperCase()
      const cleanContent = (editingArticle.content || '').replace(/<!--[\s\S]*?-->/g, '').trim()
      const autoExcerpt = editingArticle.excerpt?.trim() || generateSmartLead(editingArticle.title, cleanContent)
      const captionVal = editingArticle.imageCaption?.trim() || editingArticle.imageAlt?.trim() || undefined
      const updatedArticle = {
        ...editingArticle,
        author: editingArticle.reporter?.trim() || editingArticle.author || 'Tim Redaksi',
        reporter: editingArticle.reporter?.trim() || 'Tim Redaksi',
        redaktur: editingArticle.redaktur?.trim() || 'Tim Redaksi',
        subCategory: undefined,
        status:
          editPublishType === 'draft'
            ? ('draft' as const)
            : editPublishType === 'archived'
            ? ('archived' as const)
            : ('published' as const),
        scheduledAt: null,
        content: cleanContent,
        imageCaption: captionVal,
        imageAlt: captionVal,
        categoryLabel: finalCategoryLabel,
        excerpt: autoExcerpt,
        slug:
          editingArticle.slug ||
          editingArticle.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
      }

      try {
        const res = await fetch('/api/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedArticle),
        })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success) {
          alert(`❌ GAGAL MEMPERBARUI BERITA:\n${json?.message || `Status: ${res.status}`}\n\nPerubahan tidak tersimpan ke server.`)
          return
        }
      } catch (err: any) {
        console.error('Gagal update ke database:', err)
        alert(`❌ GAGAL MEMPERBARUI BERITA:\n${err?.message || 'Koneksi ke server terputus'}`)
        return
      }

      const updated = articles.map((a) =>
        a.id === editingArticle.id ? updatedArticle : a
      )

      persistArticles(updated)
      setIsEditModalOpen(false)
      setEditingArticle(null)

      showToast(`Perubahan artikel "${editingArticle.title}" berhasil disimpan!`, 'success')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Hapus Berita dari Database
  const handleDeleteArticle = async (id: string, title: string) => {
    const isConfirmed = await confirmDialog({
      title: 'Hapus Artikel?',
      message: 'Yakin ingin menghapus artikel ini secara permanen?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    })

    if (isConfirmed) {
      try {
        const res = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success) {
          showToast(`Gagal menghapus berita: ${json?.message || `Status: ${res.status}`}`, 'error')
          return
        }
      } catch (err: any) {
        console.error('Gagal menghapus dari database:', err)
        showToast(`Gagal menghapus berita: ${err?.message || 'Koneksi ke server terputus'}`, 'error')
        return
      }

      const updated = articles.filter((a) => a.id !== id)
      persistArticles(updated)
      showToast('Artikel berhasil dihapus dari database!', 'success')
    }
  }

  // Handle Cepat: Toggle Headline / Hero ke Database
  const handleToggleHero = async (id: string) => {
    const target = articles.find((a) => a.id === id)
    if (!target) return
    const newHeroState = !target.isHero

    const updated = articles.map((a) =>
      a.id === id ? { ...a, isHero: newHeroState } : a
    )
    persistArticles(updated)

    try {
      await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isHero: newHeroState }),
      })
    } catch (err) {
      console.warn('Gagal sinkron status Hero ke database:', err)
    }

    showToast(
      newHeroState
        ? 'Artikel disorot ke Headline Slider Beranda!'
        : 'Sorotan headline dicabut dari Beranda.',
      'success'
    )
  }


  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Manajemen Konten
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan dan kelola artikel berita, liputan daerah, kuliner, wisata, dan kategori konten portal Jurnal Wave.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsCategoryModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs cursor-pointer"
            title="Kelola Kategori Berita"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Kelola Kategori</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsTagsManuallyEdited(false)
              setIsExcerptManuallyEdited(false)
              setIsCreateModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Artikel</span>
          </button>
        </div>
      </div>

      {/* Floating Popup Toast Notification */}
      <AdminToast
        message={toast?.message || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* 2. Panel Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Status Cepat */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'semua'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setSelectedFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tayang ({publishedCount})
            </button>
            <button
              onClick={() => setSelectedFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'draft'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Draf ({draftCount})
            </button>
            <button
              onClick={() => setSelectedFilter('archived')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'archived'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Arsip ({archivedCount})
            </button>
            <button
              onClick={() => setSelectedFilter('hero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'hero'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Headline ({heroCount})
            </button>
          </div>

          {/* Search Bar & Dropdown Kategori */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul berita..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabel Daftar Berita */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 px-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredArticles.length}</strong> artikel
          </span>
        </div>

        {isLoading && articles.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-[#c00015] animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-500">Memuat artikel media...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Newspaper className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Tidak ada artikel yang sesuai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Artikel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Reporter &amp; Editor</th>
                  <th className="py-3 px-4">Status &amp; Rilis</th>
                  <th className="py-3 px-4 text-center">Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Artikel: Headline Star + Thumbnail + Judul */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-center gap-2.5">
                        {/* Tombol Star Headline Cepat (Murni Ikon Tanpa Card) */}
                        <button
                          type="button"
                          onClick={() => handleToggleHero(article.id)}
                          className="p-1 transition cursor-pointer select-none shrink-0"
                          title={
                            article.isHero
                              ? '⭐ Headline Aktif di Slider Beranda (Klik untuk batalkan)'
                              : 'Klik untuk jadikan Headline Slider Beranda'
                          }
                        >
                          <Star
                            className={`w-4 h-4 transition ${
                              article.isHero
                                ? 'fill-amber-400 text-amber-500 hover:scale-110'
                                : 'fill-transparent text-slate-300 hover:text-amber-400 hover:scale-110'
                            }`}
                          />
                        </button>

                        {/* Thumbnail */}
                        <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (!target.src.endsWith('/hero-banner.webp')) {
                                target.src = '/hero-banner.webp'
                              }
                            }}
                          />
                        </div>

                        {/* Judul Artikel */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/artikel/${article.slug}`}
                            target="_blank"
                            className="font-medium text-[11px] text-slate-600 hover:text-[#c00015] line-clamp-2 transition leading-normal"
                            title={`Buka "${article.title}" di tab baru`}
                          >
                            {article.title}
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Kategori Konten */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                        {getCategoryLabel((article.category || '').toLowerCase().trim())}
                      </span>
                    </td>

                    {/* Reporter & Editor */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <p className="font-medium text-slate-700 flex items-center gap-1">
                          <span className="text-[10px] font-normal text-slate-400">Oleh:</span>{' '}
                          {article.reporter || article.author || 'Tim Redaksi'}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="text-[9px] font-bold text-[#c00015]">EDITOR:</span>{' '}
                          {article.redaktur || article.editor || 'Ujang Herlan'}
                        </p>
                      </div>
                    </td>

                    {/* Status & Tanggal Rilis */}
                    <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                      {article.status === 'draft' ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            <FileText className="w-3 h-3 text-indigo-500" />
                            Draf Redaksi
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Belum Tayang
                          </span>
                        </div>
                      ) : article.status === 'archived' ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            <Archive className="w-3 h-3 text-slate-500" />
                            Diarsipkan
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Ditarik dari publik
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Tayang
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {article.publishedDate || '26 Okt 2024'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Aksi Nyata: Pratinjau, Edit, Arsip/Pulihkan, Hapus */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {/* 1. Buka Tampilan Publik di Tab Baru */}
                        <Link
                          href={`/artikel/${article.slug}`}
                          target="_blank"
                          className={`p-1.5 rounded-lg transition ${
                            article.status === 'draft' || article.status === 'archived'
                              ? 'text-slate-300 hover:text-slate-400 cursor-not-allowed'
                              : 'text-slate-400 hover:text-[#c00015] hover:bg-red-50 cursor-pointer'
                          }`}
                          title={
                            article.status === 'draft' || article.status === 'archived'
                              ? 'Belum tayang publik'
                              : 'Buka Halaman Artikel di Tab Baru'
                          }
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* 2. Tombol Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(article)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer"
                          title="Edit Berita Ini"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Aksi Cepat Arsip / Pulihkan / Terbitkan */}
                        {article.status === 'draft' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickPublish(article.id, article.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer"
                            title="Langsung Terbitkan Sekarang ke Publik"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        ) : article.status === 'archived' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(article.id, article.title, 'published')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer"
                            title="Pulihkan Berita Kembali Tayang ke Publik"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(article.id, article.title, 'archived')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer"
                            title="Arsipkan Berita (Tarik dari publik tanpa menghapus)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* 4. Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Edit Berita (Nyata Berfungsi Penuh) */}
      {isEditModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Edit Artikel
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingArticle(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Judul Artikel */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Artikel <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, title: e.target.value })
                    }
                    placeholder="Masukkan judul artikel..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                {/* Kategori, Penulis & Editor */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori <span className="text-[#c00015]">*</span>
                    </label>
                    <select
                      value={editingArticle.category}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          category: e.target.value as ArticleCategory,
                        })
                      }
                      className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 truncate" title="Penulis / Reporter">
                      Penulis / Reporter
                    </label>
                    <input
                      type="text"
                      value={editingArticle.reporter || ''}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, reporter: e.target.value })
                      }
                      placeholder="Masukkan nama penulis..."
                      className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 truncate" title="Editor / Redaktur">
                      Editor / Redaktur
                    </label>
                    <input
                      type="text"
                      value={editingArticle.redaktur || ''}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, redaktur: e.target.value })
                      }
                      placeholder="Masukkan nama editor..."
                      className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                    />
                  </div>
                </div>

                {/* Foto Cover */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Foto Cover
                  </label>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    {/* Thumbnail Gambar */}
                    {editingArticle.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImageModalUrl(editingArticle.imageUrl || '')}
                        className="relative shrink-0 w-16 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                        title="Klik untuk melihat foto"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editingArticle.imageUrl}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="shrink-0 w-16 h-11 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white shadow-2xs">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}

                    {/* Input URL Gambar */}
                    <input
                      type="url"
                      value={editingArticle.imageUrl?.startsWith('data:') ? '' : (editingArticle.imageUrl || '')}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, imageUrl: e.target.value })
                      }
                      placeholder={
                        editingArticle.imageUrl?.startsWith('data:')
                          ? '(Foto terunggah dari file)'
                          : 'Masukkan tautan URL foto (https://...)'
                      }
                      className="flex-1 min-w-0 h-9 px-3 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#c00015]"
                    />

                    {/* Tombol Unggah File */}
                    <label className="h-9 px-3.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 flex items-center gap-1.5 transition shrink-0 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isUploading ? 'Mengunggah...' : 'Pilih File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUploadEdit}
                        className="hidden"
                      />
                    </label>

                    {/* Tombol Hapus jika ada gambar */}
                    {editingArticle.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingArticle({ ...editingArticle, imageUrl: '' })}
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center justify-center transition cursor-pointer shrink-0"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Keterangan & Sumber Foto (Caption) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan & Sumber Foto <span className="font-normal text-slate-400">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={editingArticle.imageCaption || editingArticle.imageAlt || ''}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        imageCaption: e.target.value,
                        imageAlt: e.target.value,
                      })
                    }
                    placeholder="Masukkan keterangan foto..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                {/* Isi Artikel */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Isi Artikel <span className="text-[#c00015]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFullscreenTarget('edit')}
                      className="text-[11px] text-slate-500 hover:text-[#c00015] flex items-center gap-1 font-medium transition cursor-pointer hover:bg-red-50/60 px-2 py-0.5 rounded border border-transparent hover:border-red-100"
                      title="Buka naskah dalam mode layar penuh"
                    >
                      <Maximize2 className="w-3 h-3 text-slate-500" />
                      <span>Layar Penuh</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={editingArticle.content}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, content: e.target.value })
                    }
                    placeholder="Masukkan isi artikel..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                  />
                </div>

                {/* Tagar (Tags) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tagar (Tags)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editingArticle.tags) ? editingArticle.tags.join(', ') : (editingArticle.tags || '')}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) as any,
                      })
                    }
                    placeholder="Masukkan tagar (misal: #JurnalWave, #Sukabumi)..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* Footer Modal: Headline + Status Select + Action Buttons */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={editingArticle.isHero || false}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        isHero: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#c00015] accent-[#c00015] cursor-pointer"
                  />
                  <span>Headline Slider Beranda</span>
                </label>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-1">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    <select
                      value={editPublishType}
                      onChange={(e) => setEditPublishType(e.target.value as any)}
                      className="h-8 px-2.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      <option value="now">Tayang Publik</option>
                      <option value="draft">Draf</option>
                      <option value="archived">Arsipkan</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !editingArticle.title.trim()}
                    className="px-4 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] disabled:opacity-50 text-white font-bold transition text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Tambah Berita Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Buat Artikel Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateArticle(e, 'published')} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Judul Artikel */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Artikel <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Masukkan judul artikel..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                {/* Kategori, Penulis & Editor */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori <span className="text-[#c00015]">*</span>
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        setNewCategory(e.target.value as ArticleCategory)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 truncate" title="Penulis / Reporter">
                      Penulis / Reporter
                    </label>
                    <input
                      type="text"
                      value={newReporter}
                      onChange={(e) => setNewReporter(e.target.value)}
                      placeholder="Masukkan nama penulis..."
                      className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 truncate" title="Editor / Redaktur">
                      Editor / Redaktur
                    </label>
                    <input
                      type="text"
                      value={newRedaktur}
                      onChange={(e) => setNewRedaktur(e.target.value)}
                      placeholder="Masukkan nama editor..."
                      className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                    />
                  </div>
                </div>

                {/* Foto Cover */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Foto Cover
                  </label>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    {/* Thumbnail Gambar */}
                    {newImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImageModalUrl(newImageUrl)}
                        className="relative shrink-0 w-16 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                        title="Klik untuk melihat foto"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={newImageUrl}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="shrink-0 w-16 h-11 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white shadow-2xs">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}

                    {/* Input URL Gambar */}
                    <input
                      type="url"
                      value={newImageUrl.startsWith('data:') ? '' : newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder={
                        newImageUrl.startsWith('data:')
                          ? '(Foto terunggah dari file)'
                          : 'Masukkan tautan URL foto (https://...)'
                      }
                      className="flex-1 min-w-0 h-9 px-3 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#c00015]"
                    />

                    {/* Tombol Unggah File */}
                    <label className="h-9 px-3.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 flex items-center gap-1.5 transition shrink-0 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isUploading ? 'Mengunggah...' : 'Pilih File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUploadNew}
                        className="hidden"
                      />
                    </label>

                    {/* Tombol Hapus jika ada gambar */}
                    {newImageUrl && (
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center justify-center transition cursor-pointer shrink-0"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Keterangan & Sumber Foto (Caption) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan & Sumber Foto <span className="font-normal text-slate-400">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="Masukkan keterangan foto..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                {/* Isi Artikel */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Isi Artikel <span className="text-[#c00015]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFullscreenTarget('create')}
                      className="text-[11px] text-slate-500 hover:text-[#c00015] flex items-center gap-1 font-medium transition cursor-pointer hover:bg-red-50/60 px-2 py-0.5 rounded border border-transparent hover:border-red-100"
                      title="Buka naskah dalam mode layar penuh"
                    >
                      <Maximize2 className="w-3 h-3 text-slate-500" />
                      <span>Layar Penuh</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Masukkan isi artikel..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                  />
                </div>

                {/* Tagar (Tags) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tagar (Tags)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => {
                      setNewTags(e.target.value)
                      setIsTagsManuallyEdited(Boolean(e.target.value.trim()))
                    }}
                    placeholder="Masukkan tagar (misal: #JurnalWave, #Sukabumi)..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              {/* Footer Modal: Headline Checkbox + Action Buttons */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={newIsHero}
                    onChange={(e) => setNewIsHero(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c00015] accent-[#c00015] cursor-pointer"
                  />
                  <span>Headline Slider Beranda</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting || isUploading || !newTitle.trim()}
                    onClick={(e) => handleCreateArticle(e, 'draft')}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 font-semibold transition text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Simpan Draf</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !newTitle.trim()}
                    className="px-4 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] disabled:opacity-50 text-white font-bold transition text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Terbitkan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 7. Modal Fullscreen Editor untuk Isi Artikel */}
      {fullscreenTarget && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-150">
          {/* Top Bar */}
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2 py-0.5 rounded bg-[#c00015]/10 text-[#c00015] font-bold text-xs uppercase tracking-wide">
                Layar Penuh
              </span>
              <h2 className="text-sm font-bold text-slate-800 truncate">
                {fullscreenTarget === 'create'
                  ? newTitle || 'Artikel Baru'
                  : editingArticle?.title || 'Edit Artikel'}
              </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {(fullscreenTarget === 'create'
                  ? newContent
                  : editingArticle?.content || ''
                )
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length}{' '}
                kata
              </span>
              <button
                type="button"
                onClick={() => setFullscreenTarget(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Keluar layar penuh (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Selesai & Kembali</span>
              </button>
            </div>
          </div>

          {/* Textarea Workspace */}
          <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col">
            <textarea
              autoFocus
              value={
                fullscreenTarget === 'create'
                  ? newContent
                  : editingArticle?.content || ''
              }
              onChange={(e) => {
                if (fullscreenTarget === 'create') {
                  setNewContent(e.target.value)
                } else if (editingArticle) {
                  setEditingArticle({ ...editingArticle, content: e.target.value })
                }
              }}
              placeholder="Tuliskan naskah isi artikel secara leluasa di sini..."
              className="w-full flex-1 p-5 text-sm sm:text-base text-slate-800 leading-relaxed rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:border-[#c00015] resize-none font-sans"
            />
          </div>
        </div>
      )}

      {/* 8. Modal Pratinjau Foto Penuh (Lightbox Murni) */}
      {previewImageModalUrl && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewImageModalUrl(null)}
        >
          {/* Tombol X di pojok kanan atas */}
          <button
            type="button"
            onClick={() => setPreviewImageModalUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer z-10"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hanya Gambar Asli */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImageModalUrl}
            alt="Foto Penuh"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 6. Modal Kelola Kategori Berita */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#c00015]/10 text-[#c00015] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Manajemen Kategori
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Atur daftar dan urutan kategori konten portal Jurnal Wave
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false)
                  setEditingCatValue(null)
                  setEditingCatLabel('')
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Form Tambah Kategori */}
              <form onSubmit={handleAddCategory} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Tambah Kategori Baru:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="Nama Kategori (contoh: Pendidikan, Opini, Event...)"
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c00015]"
                  />
                  <button
                    type="submit"
                    disabled={!newCatLabel.trim()}
                    className="px-4 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] disabled:opacity-40 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Kategori baru akan langsung tersedia di filter dan form tulis/edit berita.
                </p>
              </form>

              {/* Daftar Kategori Aktif */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Urutan Kategori Resmi Jurnal Wave ({categoriesList.length}):
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Gunakan tombol panah untuk mengatur posisi urutan di menu.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetCategories}
                    className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    title="Kembalikan ke 7 kategori resmi Jurnal Wave"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {categoriesList.map((cat, idx) => {
                    const articleCount = articles.filter(
                      (a) => (a.category || '').toLowerCase() === cat.value.toLowerCase()
                    ).length
                    const isEditing = editingCatValue === cat.value

                    return (
                      <div
                        key={cat.value}
                        className={`p-2.5 px-3 flex items-center justify-between transition gap-2 ${
                          isEditing ? 'bg-slate-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Tombol Urutan Posisi (Naik / Turun) */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0 || isEditing}
                            onClick={() => handleMoveCategory(idx, 'up')}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                            title="Pindah ke Atas"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categoriesList.length - 1 || isEditing}
                            onClick={() => handleMoveCategory(idx, 'down')}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                            title="Pindah ke Bawah"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-[10px] text-slate-400 w-4 text-center">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Nama Kategori / Input Edit Inline */}
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-1.5 min-w-0">
                            <input
                              type="text"
                              autoFocus
                              value={editingCatLabel}
                              onChange={(e) => setEditingCatLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveCategoryName(cat.value)
                                if (e.key === 'Escape') handleCancelEditCategory()
                              }}
                              className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300 focus:border-[#c00015] text-slate-800 focus:outline-none min-w-0 transition"
                              placeholder="Nama kategori..."
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCategoryName(cat.value)}
                              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 text-emerald-700 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                              title="Simpan Perubahan (Enter)"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditCategory}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-[#c00015] border border-red-200 hover:border-[#c00015] text-[#c00015] hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
                              title="Batal (Esc)"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate block">
                              {cat.label}
                            </span>
                          </div>
                        )}

                        {/* Jumlah Berita & Tombol Aksi (Edit & Hapus) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                              articleCount > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                            title={`Digunakan oleh ${articleCount} artikel aktif`}
                          >
                            {articleCount} artikel
                          </span>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 transition cursor-pointer"
                              title={`Ganti nama kategori ${cat.label}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isEditing}
                            onClick={() => handleDeleteCategory(cat.value, cat.label)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#c00015] hover:bg-red-50 disabled:opacity-20 transition cursor-pointer"
                            title={`Hapus kategori ${cat.label}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false)
                  setEditingCatValue(null)
                  setEditingCatLabel('')
                }}
                className="px-4 py-2 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
