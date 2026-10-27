import { prisma } from '@/lib/prisma';
import { Reel } from '@/types';

/**
 * Mengambil daftar Video Reels langsung dari Database Server (Neon PostgreSQL)
 * Dapat dipanggil langsung dari Server Component untuk kecepatan instan (SSR)
 */
export async function fetchReels(limit?: number): Promise<Reel[]> {
  try {
    const raw = await prisma.reel.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return raw.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category || 'Berita',
      creator: r.creator || '@jurnalwave',
      platform: r.platform || 'tiktok',
      socialUrl: r.socialUrl || '',
      videoUrl: r.videoUrl || undefined,
      location: r.location || 'Sukabumi',
      thumbnailUrl: r.thumbnailUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
      imageAlt: r.imageAlt || r.title,
      viewsCount: r.viewsCount || '0',
    }));
  } catch (error) {
    console.error('Error fetching reels in lib/reels:', error);
    return [];
  }
}
