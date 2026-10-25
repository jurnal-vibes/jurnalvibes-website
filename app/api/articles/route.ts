import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'

// Helper format artikel dari Prisma ke format Frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArticleFromDb(item: any) {
  const cat = (item.category || '').toLowerCase().trim()
  const rawLabel = (item.categoryLabel || '').trim()
  const upperLabel = rawLabel.toUpperCase()

  const isInvalid = cat === 'infrastruktur' || upperLabel === 'INFRASTRUKTUR' || cat === 'lingkungan' || cat === 'pelayanan'
  const finalCategory = isInvalid ? 'berita' : (item.category || 'berita')
  const finalLabel = isInvalid ? 'BERITA' : (rawLabel && upperLabel !== 'INFRASTRUKTUR' ? rawLabel : finalCategory.toUpperCase())

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
    subCategory:
      item.badge && item.badge !== 'HOT' && item.badge !== 'VIRAL'
        ? item.badge
        : item.categoryLabel &&
          item.categoryLabel.toLowerCase() !== finalCategory.toLowerCase() &&
          item.categoryLabel !== 'HOT' &&
          item.categoryLabel !== 'VIRAL'
        ? item.categoryLabel
        : undefined,
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
      where.category = category
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

    if (rawCategory === 'infrastruktur' || rawCategoryLabel.toUpperCase() === 'INFRASTRUKTUR' || !rawCategory) {
      rawCategory = 'berita'
      rawCategoryLabel = 'BERITA'
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
        imageAlt: body.imageAlt || body.title.trim(),
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
    if (typeof body.badge !== 'undefined') {
      updateData.badge = body.badge
    }
    if (typeof body.category === 'string') {
      let editCategory = body.category.toLowerCase().trim()
      let editCategoryLabel = (body.categoryLabel || '').trim()

      if (editCategory === 'infrastruktur' || editCategoryLabel.toUpperCase() === 'INFRASTRUKTUR') {
        editCategory = 'berita'
        editCategoryLabel = 'BERITA'
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
