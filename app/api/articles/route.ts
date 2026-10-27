import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'

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

// 1. GET: Ambil semua artikel dari database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const slug = searchParams.get('slug')

    // Jika mencari berdasarkan slug spesifik
    if (slug) {
      const article = await prisma.article.findUnique({
        where: { slug },
      })
      if (!article) {
        return NextResponse.json({ success: false, message: 'Artikel tidak ditemukan' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: mapArticleFromDb(article) })
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

    return NextResponse.json({
      success: true,
      source: 'database',
      data: dbArticles.map(mapArticleFromDb),
    })
  } catch (error: any) {
    console.error('API Articles GET error:', error)
    return NextResponse.json({
      success: false,
      data: [],
      error: error.message,
    }, { status: 500 })
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

    let slug = body.slug || body.title
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

    const created = await prisma.article.create({
      data: {
        title: body.title.trim(),
        slug,
        excerpt: body.excerpt?.trim() || body.title.trim(),
        content: body.content?.trim() || body.excerpt?.trim() || body.title.trim(),
        category: rawCategory,
        categoryLabel: rawCategoryLabel,
        imageUrl:
          body.imageUrl?.trim() ||
          DEFAULT_FALLBACK_IMAGE,
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
      updateData.imageUrl = body.imageUrl.trim()
    }
    if (typeof body.imageCaption === 'string' || typeof body.imageAlt === 'string') {
      updateData.imageAlt = (body.imageCaption || body.imageAlt || '').trim()
    }
    if (typeof body.badge !== 'undefined') {
      updateData.badge = body.badge
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

    await prisma.article.delete({
      where: { id },
    })

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
