import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { clearServerArticlesCache } from '@/lib/wordpress'
import { INITIAL_ARTICLES } from '@/lib/initialArticles'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_FALLBACK_IMAGE = '/hero-banner.webp'

// Helper pencegah Base64 raksasa masuk ke database PostgreSQL
async function sanitizeArticleImage(rawUrl?: string | null): Promise<string> {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_FALLBACK_IMAGE
  const trimmed = rawUrl.trim()
  if (trimmed.startsWith('data:image/')) {
    try {
      const matches = trimmed.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      let ext = 'jpg'
      let buffer: Buffer
      if (matches && matches.length === 3) {
        if (matches[1].includes('png')) ext = 'png'
        else if (matches[1].includes('webp')) ext = 'webp'
        buffer = Buffer.from(matches[2], 'base64')
      } else {
        buffer = Buffer.from(trimmed.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      }
      const safeName = `article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const publicPath = join(process.cwd(), 'public', 'uploads', 'articles', safeName)
      await writeFile(publicPath, buffer)
      return `/uploads/articles/${safeName}`
    } catch (err) {
      console.warn('Gagal mengubah base64 image di server:', err)
      return DEFAULT_FALLBACK_IMAGE
    }
  }
  return trimmed
}

// Helper format artikel dari Prisma ke format Frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArticleFromDb(item: any) {
  let cat = (item.category || '').toLowerCase().trim()
  const rawLabel = (item.categoryLabel || '').trim()

  if (cat === 'sains' || cat === 'sains & lingkungan') {
    cat = 'science'
  } else if (cat === 'kesehatan') {
    cat = 'health'
  }

  const upperLabel = rawLabel.toUpperCase()
  const isInvalid = cat === 'infrastruktur' || upperLabel === 'INFRASTRUKTUR' || cat === 'lingkungan' || cat === 'pelayanan'
  const finalCategory = isInvalid ? 'berita' : (cat || 'berita')

  let finalLabel = rawLabel
  if (isInvalid) {
    finalLabel = 'BERITA'
  } else if (finalCategory === 'science' && (!rawLabel || upperLabel === 'SAINS' || upperLabel === 'SAINS & LINGKUNGAN' || upperLabel === 'SCIENCE')) {
    finalLabel = 'Science'
  } else if (finalCategory === 'health' && (!rawLabel || upperLabel === 'KESEHATAN' || upperLabel === 'HEALTH')) {
    finalLabel = 'Health'
  } else if (!rawLabel) {
    finalLabel = finalCategory.toUpperCase()
  }

  const safeImageUrl =
    item.imageUrl &&
    (item.imageUrl.startsWith('http') ||
      item.imageUrl.startsWith('/') ||
      item.imageUrl.startsWith('data:image/'))
      ? item.imageUrl
      : DEFAULT_FALLBACK_IMAGE

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    category: finalCategory,
    categoryLabel: finalLabel,
    imageUrl: safeImageUrl,
    imageAlt: item.imageAlt || item.title,
    imageCaption: item.imageAlt || undefined,
    author: item.author || 'Tim Redaksi',
    reporter: item.reporter || 'Redaksi Jurnal Wave',
    redaktur: item.redaktur || 'Redaksi Pelaksana',
    readTime: item.readTime || '5 min read',
    isHero: Boolean(item.isHero),
    isEditorsPick: Boolean(item.isEditorsPick),
    badge:
      item.badge && item.badge !== 'HOT' && item.badge !== 'VIRAL'
        ? item.badge
        : undefined,
    subCategory: (() => {
      if (item.badge && item.badge !== 'HOT' && item.badge !== 'VIRAL') {
        const b = item.badge.toLowerCase().trim()
        if (b !== finalCategory && b !== finalLabel.toLowerCase()) return item.badge
      }
      if (
        item.categoryLabel &&
        item.categoryLabel !== 'HOT' &&
        item.categoryLabel !== 'VIRAL'
      ) {
        const labelLower = item.categoryLabel.toLowerCase().trim()
        const catLower = finalCategory.toLowerCase().trim()
        const isSame =
          labelLower === catLower ||
          (catLower === 'tech' && (labelLower === 'teknologi' || labelLower === 'tech')) ||
          (catLower === 'sport' && (labelLower === 'olahraga' || labelLower === 'sport')) ||
          (catLower === 'science' && (labelLower === 'sains' || labelLower === 'science' || labelLower === 'sains & lingkungan')) ||
          (catLower === 'health' && (labelLower === 'kesehatan' || labelLower === 'health')) ||
          (catLower === 'berita' && labelLower === 'berita') ||
          (catLower === 'lifestyle' && labelLower === 'lifestyle') ||
          (catLower === 'loker' && (labelLower === 'loker' || labelLower === 'lowongan kerja'))
        if (!isSame) return item.categoryLabel
      }
      return undefined
    })(),
    publishedDate: item.publishedDate || new Date(item.createdAt).toLocaleDateString('id-ID'),
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
  }
}

// Server-side in-memory cache untuk memotong latensi API artikel
let serverArticlesCache: { data: any[]; timestamp: number } | null = null
const SERVER_ARTICLES_CACHE_TTL_MS = 10000 // 10 detik memory cache

// Circuit breaker (Fast-Fail): Mencegah antrean timeout jika database cloud lambat
let lastArticlesDbFailureTimestamp = 0
const ARTICLES_DB_RETRY_MS = 15 * 1000

function invalidateArticlesCache() {
  serverArticlesCache = null
  lastArticlesDbFailureTimestamp = 0
}

// 1. GET: Ambil semua artikel dari database
export async function GET(request: NextRequest) {
  let category: string | null = null
  let limit: number | undefined = undefined
  let slug: string | null = null

  try {
    const { searchParams } = new URL(request.url)
    category = searchParams.get('category')
    limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    slug = searchParams.get('slug')

    // Respons instan (<1ms) jika permintaan umum tanpa filter (Murni memory cache, TANPA s-maxage agar kuota ISR Vercel 0 pemborosan)
    if (!category && !slug && !limit && serverArticlesCache && Date.now() - serverArticlesCache.timestamp < SERVER_ARTICLES_CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        source: 'server-memory-cache',
        data: serverArticlesCache.data,
      }, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      })
    }

    // 1. Jika mencari berdasarkan slug spesifik (Lookup Tunggal untuk Halaman Detail)
    if (slug) {
      const cleanSlug = slug.trim().toLowerCase()
      // Coba dari Database jika circuit breaker tidak aktif
      if (Date.now() - lastArticlesDbFailureTimestamp >= ARTICLES_DB_RETRY_MS) {
        try {
          const article = await prisma.article.findUnique({
            where: { slug },
          })
          if (article) {
            return NextResponse.json({ success: true, data: mapArticleFromDb(article) })
          }
        } catch (dbErr: any) {
          lastArticlesDbFailureTimestamp = Date.now()
          console.warn('DB findUnique by slug error:', dbErr?.message || dbErr)
        }
      }

      // Fallback seketika ke memory cache atau INITIAL_ARTICLES
      const pool = serverArticlesCache ? serverArticlesCache.data : INITIAL_ARTICLES
      const fallback = pool.find(
        (a) =>
          a.slug === slug ||
          a.slug.toLowerCase() === cleanSlug ||
          String(a.id) === slug ||
          String(a.id).toLowerCase() === cleanSlug
      )
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback })
      }
      return NextResponse.json({ success: false, message: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    // Circuit Breaker: Jika database baru saja timeout < 15 detik lalu, langsung kembalikan cache/fallback (0ms)
    if (Date.now() - lastArticlesDbFailureTimestamp < ARTICLES_DB_RETRY_MS) {
      const baseData = serverArticlesCache ? serverArticlesCache.data : INITIAL_ARTICLES;
      let circuitFiltered = baseData;
      if (category && category !== 'semua') {
        const catKey = category.toLowerCase().trim();
        circuitFiltered = baseData.filter((a) => {
          const aCat = a.category.toLowerCase().trim();
          if (catKey === 'science' || catKey === 'sains' || catKey === 'sains & lingkungan') return aCat === 'science' || aCat === 'sains';
          if (catKey === 'health' || catKey === 'kesehatan') return aCat === 'health' || aCat === 'kesehatan';
          return aCat === catKey;
        });
      }
      return NextResponse.json({
        success: true,
        source: 'fallback-cache',
        data: circuitFiltered,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (category && category !== 'semua') {
      const catKey = category.toLowerCase().trim()
      if (catKey === 'science' || catKey === 'sains' || catKey === 'sains & lingkungan') {
        where.category = { in: ['science', 'sains'] }
      } else if (catKey === 'health' || catKey === 'kesehatan') {
        where.category = { in: ['health', 'kesehatan'] }
      } else {
        where.category = category
      }
    }

    const dbArticles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    let mapped: any[] = dbArticles.map(mapArticleFromDb);
    if (mapped.length === 0) {
      if (category && category !== 'semua') {
        const catKey = category.toLowerCase().trim();
        mapped = INITIAL_ARTICLES.filter((a) => {
          const aCat = a.category.toLowerCase().trim();
          if (catKey === 'science' || catKey === 'sains' || catKey === 'sains & lingkungan') {
            return aCat === 'science' || aCat === 'sains';
          }
          if (catKey === 'health' || catKey === 'kesehatan') {
            return aCat === 'health' || aCat === 'kesehatan';
          }
          return aCat === catKey;
        });
      } else {
        mapped = INITIAL_ARTICLES;
      }
    }

    if (!category && !slug && !limit) {
      serverArticlesCache = {
        data: mapped,
        timestamp: Date.now(),
      }
    }

    return NextResponse.json({
      success: true,
      source: 'database',
      data: mapped,
    })
  } catch (error: any) {
    lastArticlesDbFailureTimestamp = Date.now()
    console.warn('API Articles GET notice (using fallback):', error?.message || error)

    if (slug) {
      const cleanSlug = slug.trim().toLowerCase()
      const fallback = INITIAL_ARTICLES.find(
        (a) =>
          a.slug === slug ||
          a.slug.toLowerCase() === cleanSlug ||
          String(a.id) === slug ||
          String(a.id).toLowerCase() === cleanSlug
      )
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback })
      }
      return NextResponse.json({ success: false, message: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    const fallbackData = serverArticlesCache ? serverArticlesCache.data : INITIAL_ARTICLES;
    let filteredFallback = fallbackData;
    if (category && category !== 'semua') {
      const catKey = category.toLowerCase().trim();
      filteredFallback = fallbackData.filter((a) => {
        const aCat = a.category.toLowerCase().trim();
        if (catKey === 'science' || catKey === 'sains' || catKey === 'sains & lingkungan') return aCat === 'science' || aCat === 'sains';
        if (catKey === 'health' || catKey === 'kesehatan') return aCat === 'health' || aCat === 'kesehatan';
        return aCat === catKey;
      });
    }
    return NextResponse.json({
      success: true,
      source: 'fallback-cache',
      data: filteredFallback,
    }, { status: 200 })
  }
}

// 2. POST: Tambah artikel baru ke database (Wajib Login Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Anda harus login sebagai admin untuk menerbitkan berita.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ success: false, message: 'Judul berita wajib diisi' }, { status: 400 })
    }

    const trimmedTitle = body.title.trim()

    // Cek duplikasi submit ganda (jika judul yang sama persis dikirim dalam 15 detik terakhir)
    const recentDuplicate = await prisma.article.findFirst({
      where: { title: trimmedTitle },
      orderBy: { createdAt: 'desc' },
    })

    if (recentDuplicate) {
      const timeDiff = Date.now() - new Date(recentDuplicate.createdAt).getTime()
      if (timeDiff < 15000) {
        return NextResponse.json(
          {
            success: true,
            message: 'Berita sudah berhasil disimpan sebelumnya.',
            data: mapArticleFromDb(recentDuplicate),
          },
          { status: 200 }
        )
      }
    }

    let slug = body.slug || trimmedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // Cek apakah slug sudah ada, jika ada tambahkan suffix unik
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    let rawCategory = (body.category || 'berita').toLowerCase().trim()
    let rawCategoryLabel = (body.categoryLabel || '').trim()

    if (rawCategory === 'sains' || rawCategory === 'sains & lingkungan') {
      rawCategory = 'science'
    } else if (rawCategory === 'kesehatan') {
      rawCategory = 'health'
    }

    if (rawCategory === 'infrastruktur' || rawCategoryLabel.toUpperCase() === 'INFRASTRUKTUR' || !rawCategory) {
      rawCategory = 'berita'
      rawCategoryLabel = 'BERITA'
    } else if (rawCategory === 'science' && (!rawCategoryLabel || rawCategoryLabel.toLowerCase() === 'sains' || rawCategoryLabel.toLowerCase() === 'sains & lingkungan')) {
      rawCategoryLabel = 'Science'
    } else if (rawCategory === 'health' && (!rawCategoryLabel || rawCategoryLabel.toLowerCase() === 'kesehatan')) {
      rawCategoryLabel = 'Health'
    } else if (!rawCategoryLabel) {
      rawCategoryLabel = rawCategory.toUpperCase()
    }

    const safeImageUrl = await sanitizeArticleImage(body.imageUrl)

    let finalContent = body.content?.trim() || body.excerpt?.trim() || body.title.trim()
    if (Array.isArray(body.tags) && body.tags.length > 0 && !finalContent.includes('<!--TAGS:')) {
      finalContent = `${finalContent}\n\n<!--TAGS: ${body.tags.join(', ')}-->`
    }

    const created = await prisma.article.create({
      data: {
        title: body.title.trim(),
        slug,
        excerpt: body.excerpt?.trim() || body.title.trim(),
        content: finalContent,
        category: rawCategory,
        categoryLabel: rawCategoryLabel,
        imageUrl: safeImageUrl,
        imageAlt: body.imageCaption?.trim() || body.imageAlt?.trim() || body.title.trim(),
        author: body.author || 'Tim Redaksi',
        reporter: body.reporter?.trim() || 'Redaksi Jurnal Wave',
        redaktur: body.redaktur?.trim() || 'Redaksi Pelaksana',
        readTime: body.readTime || '3 min read',
        isHero: Boolean(body.isHero),
        isEditorsPick: Boolean(body.isEditorsPick),
        badge: body.subCategory || body.badge || (body.isHero ? 'HEADLINE' : undefined),
        publishedDate: body.publishedDate || new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      },
    })

    clearServerArticlesCache()
    invalidateArticlesCache()

    try {
      revalidatePath('/')
      revalidatePath('/berita')
      revalidatePath(`/artikel/${slug}`)
      if (rawCategory) revalidatePath(`/${rawCategory}`)
    } catch (e) {
      console.warn('revalidatePath notice:', e)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Berita berhasil disimpan ke database!',
        data: mapArticleFromDb(created),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('API Articles POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan berita: ' + error.message },
      { status: 500 }
    )
  }
}

// 3. PUT: Edit / Perbarui artikel di database (Wajib Login Admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Anda harus login sebagai admin untuk mengedit berita.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ success: false, message: 'ID artikel wajib disertakan' }, { status: 400 })
    }

    const updateData: any = {}

    if (typeof body.isHero !== 'undefined') {
      updateData.isHero = Boolean(body.isHero)
    }
    if (typeof body.isEditorsPick !== 'undefined') {
      updateData.isEditorsPick = Boolean(body.isEditorsPick)
    }
    if (typeof body.title === 'string' && body.title.trim()) {
      updateData.title = body.title.trim()
    }
    if (typeof body.excerpt === 'string' && body.excerpt.trim()) {
      updateData.excerpt = body.excerpt.trim()
    }
    if (typeof body.content === 'string' && body.content.trim()) {
      updateData.content = body.content.trim()
    }
    if (typeof body.reporter === 'string') {
      updateData.reporter = body.reporter.trim()
    }
    if (typeof body.redaktur === 'string') {
      updateData.redaktur = body.redaktur.trim()
    }
    if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      updateData.imageUrl = await sanitizeArticleImage(body.imageUrl)
    }
    if (typeof body.imageCaption === 'string' || typeof body.imageAlt === 'string') {
      updateData.imageAlt = (body.imageCaption || body.imageAlt || '').trim()
    }
    if (typeof body.badge !== 'undefined') {
      updateData.badge = body.badge
    }
    // FIX BUG #9: subCategory (tersimpan di kolom badge) sekarang bisa diupdate via edit
    if (typeof body.subCategory !== 'undefined') {
      // subCategory menggantikan badge hanya jika bukan HOT/VIRAL/HEADLINE
      const sc = body.subCategory || ''
      if (sc && sc !== 'HOT' && sc !== 'VIRAL' && sc !== 'HEADLINE') {
        updateData.badge = sc
      }
    }
    if (typeof body.category === 'string') {
      let editCategory = body.category.toLowerCase().trim()
      let editCategoryLabel = (body.categoryLabel || '').trim()

      if (editCategory === 'sains' || editCategory === 'sains & lingkungan') {
        editCategory = 'science'
      } else if (editCategory === 'kesehatan') {
        editCategory = 'health'
      }

      if (editCategory === 'infrastruktur' || editCategoryLabel.toUpperCase() === 'INFRASTRUKTUR') {
        editCategory = 'berita'
        editCategoryLabel = 'BERITA'
      } else if (editCategory === 'science' && (!editCategoryLabel || editCategoryLabel.toLowerCase() === 'sains' || editCategoryLabel.toLowerCase() === 'sains & lingkungan')) {
        editCategoryLabel = 'Science'
      } else if (editCategory === 'health' && (!editCategoryLabel || editCategoryLabel.toLowerCase() === 'kesehatan')) {
        editCategoryLabel = 'Health'
      } else if (!editCategoryLabel) {
        editCategoryLabel = editCategory.toUpperCase()
      }

      updateData.category = editCategory
      updateData.categoryLabel = editCategoryLabel
    }

    const updated = await prisma.article.update({
      where: { id: body.id },
      data: updateData,
    })

    clearServerArticlesCache()
    invalidateArticlesCache()

    try {
      revalidatePath('/')
      revalidatePath('/berita')
      if (updated.slug) revalidatePath(`/artikel/${updated.slug}`)
      if (updated.category) revalidatePath(`/${updated.category}`)
    } catch (e) {
      console.warn('revalidatePath notice:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil diperbarui!',
      data: mapArticleFromDb(updated),
    })
  } catch (error: any) {
    console.error('API Articles PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui berita: ' + error.message },
      { status: 500 }
    )
  }
}

// 4. DELETE: Hapus artikel dari database (Wajib Login Admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Anda harus login sebagai admin untuk menghapus berita.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID artikel tidak ditemukan' }, { status: 400 })
    }

    const deleted = await prisma.article.delete({
      where: { id },
    })

    clearServerArticlesCache()
    invalidateArticlesCache()

    try {
      revalidatePath('/')
      revalidatePath('/berita')
      if (deleted.slug) revalidatePath(`/artikel/${deleted.slug}`)
      if (deleted.category) revalidatePath(`/${deleted.category}`)
    } catch (e) {
      console.warn('revalidatePath notice:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil dihapus!',
    })
  } catch (error: any) {
    console.error('API Articles DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus berita: ' + error.message },
      { status: 500 }
    )
  }
}
