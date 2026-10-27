import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/reels - Ambil seluruh video reels dari database server
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const where: any = {};
    if (category && category !== 'Semua') {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    const reels = await prisma.reel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(
      { success: true, count: reels.length, data: reels },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching reels:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat video reels dari database.' },
      { status: 500 }
    );
  }
}

// POST /api/reels - Tambah video reels baru ke database server
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category = 'Berita',
      creator = '@jurnalwave',
      platform = 'tiktok',
      socialUrl = '',
      videoUrl = '',
      location = 'Sukabumi',
      thumbnailUrl,
      imageAlt,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Judul video wajib diisi.' },
        { status: 400 }
      );
    }

    const newReel = await prisma.reel.create({
      data: {
        title: title.trim(),
        category: category.trim() || 'Berita',
        creator: creator.trim() || '@jurnalwave',
        platform: platform || 'tiktok',
        socialUrl: socialUrl.trim(),
        videoUrl: videoUrl.trim() || undefined,
        location: location.trim() || 'Sukabumi',
        thumbnailUrl: thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
        imageAlt: imageAlt?.trim() || title.trim(),
        viewsCount: '0',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video reels berhasil ditambahkan ke database server.',
      data: newReel,
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan video reels ke database.' },
      { status: 500 }
    );
  }
}
