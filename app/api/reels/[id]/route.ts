import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearServerReelsCache } from '@/lib/reels';

export const dynamic = 'force-dynamic';

// PUT /api/reels/[id] - Perbarui video reels di database server
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      category,
      creator,
      platform,
      socialUrl,
      videoUrl,
      location,
      thumbnailUrl,
      viewsCount,
    } = body;

    const existing = await prisma.reel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Video reels tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updated = await prisma.reel.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim(), imageAlt: title.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(creator !== undefined && { creator: creator.trim() }),
        ...(platform !== undefined && { platform }),
        ...(socialUrl !== undefined && { socialUrl: socialUrl.trim() }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl: thumbnailUrl.trim() }),
        ...(viewsCount !== undefined && { viewsCount: String(viewsCount) }),
      },
    });

    clearServerReelsCache();

    return NextResponse.json({
      success: true,
      message: 'Video reels berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating reel:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui video reels.' },
      { status: 500 }
    );
  }
}

// DELETE /api/reels/[id] - Hapus video reels dari database server
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.reel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Video reels tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.reel.delete({ where: { id } });

    clearServerReelsCache();

    return NextResponse.json({
      success: true,
      message: 'Video reels berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus video reels.' },
      { status: 500 }
    );
  }
}
