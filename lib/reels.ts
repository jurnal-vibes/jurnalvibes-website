import { prisma } from '@/lib/prisma';
import { Reel } from '@/types';

export const DEFAULT_FALLBACK_REELS: Reel[] = [
  {
    id: 'reel-default-1',
    title: 'Spot Kuliner & Senja Hits Sukabumi',
    category: 'Kuliner',
    creator: '@jurnalwave',
    platform: 'tiktok',
    socialUrl: 'https://tiktok.com',
    location: 'Kota Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
    viewsCount: '1.2K',
  },
  {
    id: 'reel-default-2',
    title: 'Suasana Akhir Pekan Alun-Alun Sukabumi',
    category: 'Wisata',
    creator: '@jurnalwave',
    platform: 'instagram',
    socialUrl: 'https://instagram.com',
    location: 'Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80',
    viewsCount: '2.5K',
  },
  {
    id: 'reel-default-3',
    title: 'Update Jalur Wisata & Transportasi Sukabumi',
    category: 'Berita',
    creator: '@jurnalwave',
    platform: 'youtube',
    socialUrl: 'https://youtube.com',
    location: 'Kab. Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80',
    viewsCount: '980',
  },
  {
    id: 'reel-default-4',
    title: 'Tren Nongkrong & Fashion Pemuda Sukabumi',
    category: 'Lifestyle',
    creator: '@jurnalwave',
    platform: 'tiktok',
    socialUrl: 'https://tiktok.com',
    location: 'Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80',
    viewsCount: '3.1K',
  },
];

// In-memory cache server-side agar query Neon DB instan (0ms delay)
let serverReelsCache: { data: Reel[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 detik

let lastReelsFailureTimestamp = 0;
const REELS_RETRY_INTERVAL_MS = 15 * 1000;

export function clearServerReelsCache() {
  serverReelsCache = null;
  lastReelsFailureTimestamp = 0;
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

  // Circuit Breaker: Jika database baru saja timeout < 15 detik lalu, respon seketika (0ms)
  if (now - lastReelsFailureTimestamp < REELS_RETRY_INTERVAL_MS) {
    const list = serverReelsCache ? serverReelsCache.data : DEFAULT_FALLBACK_REELS;
    return limit && limit > 0 ? list.slice(0, limit) : list;
  }

  try {
    const raw = await prisma.reel.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    if (raw.length > 0) {
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
    }
  } catch (error) {
    lastReelsFailureTimestamp = Date.now();
    console.warn('Reels database connection notice (using graceful fallback):', (error as any)?.message || error);
  }

  const fallback = serverReelsCache ? serverReelsCache.data : DEFAULT_FALLBACK_REELS;
  return limit && limit > 0 ? fallback.slice(0, limit) : fallback;
}
