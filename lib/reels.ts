import { prisma } from '@/lib/prisma';
import { Reel } from '@/types';

export const DEFAULT_FALLBACK_REELS: Reel[] = [
  {
    id: 'reel-001',
    title: 'Spot Hidden Gem Air Terjun Curug Cimarinjung Geopark Ciletuh',
    category: 'Wisata',
    creator: '@jurnalwave',
    platform: 'tiktok',
    socialUrl: 'https://tiktok.com/@jurnalwave',
    location: 'Geopark Ciletuh, Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Curug Cimarinjung Geopark Ciletuh',
    viewsCount: '18.4K',
  },
  {
    id: 'reel-002',
    title: 'Mencoba Mochi Lampion Kaswari Legendaris Khas Sukabumi Sejak 1983',
    category: 'Kuliner',
    creator: '@kuliner.sukabumi',
    platform: 'instagram',
    socialUrl: 'https://instagram.com',
    location: 'Kec. Cikole, Kota Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Mochi Lampion Kaswari Sukabumi',
    viewsCount: '24.1K',
  },
  {
    id: 'reel-003',
    title: 'Sensasi Dingin Menembus Kabut Situgunung Suspension Bridge',
    category: 'Wisata',
    creator: '@jurnalwave',
    platform: 'tiktok',
    socialUrl: 'https://tiktok.com/@jurnalwave',
    location: 'Kadudampit, Sukabumi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Jembatan Gantung Situgunung',
    viewsCount: '31.5K',
  },
  {
    id: 'reel-004',
    title: 'Update Pembangunan Tol Bocimi Seksi 3 Menuju Sukabumi Barat',
    category: 'Berita',
    creator: '@redaksi.jurnalwave',
    platform: 'youtube',
    socialUrl: 'https://youtube.com',
    location: 'Cibadak - Cisaat',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Proyek Tol Bocimi Seksi 3',
    viewsCount: '42.9K',
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
