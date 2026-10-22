import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DUMMY_ARTICLES } from '@/data/dummyArticles'
import { getAdminSession } from '@/lib/auth'

// Helper format artikel dari Prisma ke format Frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArticleFromDb(item: any) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    category: item.category,
    categoryLabel: item.categoryLabel || item.category?.toUpperCase() || 'BERITA',
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt || item.title,
    author: item.author || 'Tim Redaksi',
    reporter: item.reporter || 'Redaksi Jurnal Wave',
    redaktur: item.redaktur || 'Redaksi Pelaksana',
    readTime: item.readTime || '5 min read',
    isHero: Boolean(item.isHero),
    isEditorsPick: Boolean(item.isEditorsPick),
    badge: item.badge || undefined,
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

    if (dbArticles.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: dbArticles.map(mapArticleFromDb),
      })
    }

    // Jika tabel masih kosong, kembalikan dummy
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: DUMMY_ARTICLES,
    })
  } catch (error: any) {
    console.error('API Articles GET error:', error)
    // Fallback aman jika database offline/kendala
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: DUMMY_ARTICLES,
      warning: 'Menggunakan data cadangan: ' + error.message,
    })
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

    const created = await prisma.article.create({
      data: {
        title: body.title.trim(),
        slug,
        excerpt: body.excerpt?.trim() || body.title.trim(),
        content: body.content?.trim() || body.excerpt?.trim() || body.title.trim(),
        category: body.category || 'berita',
        categoryLabel: body.categoryLabel || (body.category ? body.category.toUpperCase() : 'BERITA'),
        imageUrl:
          body.imageUrl?.trim() ||
          'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
        imageAlt: body.imageAlt || body.title.trim(),
        author: body.author || 'Tim Redaksi',
        reporter: body.reporter?.trim() || 'Redaksi Jurnal Wave',
        redaktur: body.redaktur?.trim() || 'Redaksi Pelaksana',
        readTime: body.readTime || '3 min read',
        isHero: Boolean(body.isHero),
        isEditorsPick: Boolean(body.isEditorsPick),
        badge: body.badge || (body.isHero ? 'HEADLINE' : undefined),
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

    const updated = await prisma.article.update({
      where: { id: body.id },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        categoryLabel: body.categoryLabel || body.category?.toUpperCase(),
        imageUrl: body.imageUrl,
        reporter: body.reporter,
        isHero: Boolean(body.isHero),
        isEditorsPick: Boolean(body.isEditorsPick),
      },
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
