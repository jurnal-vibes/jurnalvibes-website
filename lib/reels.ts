import { prisma } from '@/lib/prisma';
import { Reel } from '@/types';

// In-memory cache server-side agar query Neon DB instan (0ms delay)
let serverReelsCache: { data: Reel[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 detik

export function clearServerReelsCache() {
  serverReelsCache = null;
}

/**
 * Mengambil daftar Video Reels langsung dari Database Server (Neon PostgreSQL)
 * Menggunakan in-memory cache untuk performa kilat tanpa lag
 */
export async function fetchReels(limit?: number): Promise<Reel[]> {
  const now = Date.now();
  if (serverReelsCache && now - serverReelsCache.timestamp < CACHE_TTL_MS) {
    return limit && limit > 0 ? serverReelsCache.data.slice(0, limit) : serverReelsCache.data;
  }

  try {
    const raw = await prisma.reel.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const mapped: Reel[] = raw.map((r) => ({
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

    serverReelsCache = { data: mapped, timestamp: now };
    return mapped;
  } catch (error) {
    console.error('Error fetching reels in lib/reels:', error);
    if (serverReelsCache) return serverReelsCache.data;
    return [];
  }
}
