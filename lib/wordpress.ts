import { Article, ArticleCategory } from '@/types';
import { formatIndoDateTime } from '@/lib/utils';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

/**
 * Helper to strip HTML tags from WordPress rendered strings
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Maps raw WordPress REST API post data to the application's Article interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapWordPressPost(post: any): Article {
  if (!post) return null as any;

  // Featured image resolution from _embedded
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const imageUrl =
    featuredMedia?.source_url ||
    post.featured_image_url ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';

  // Author resolution from _embedded
  const authorName = post._embedded?.author?.[0]?.name || 'Tim Redaksi';

  // Categories resolution
  const categoriesList = post._embedded?.['wp:term']?.[0] || [];
  const primaryCategory = categoriesList[0]?.name?.toLowerCase() || 'berita';

  return {
    id: String(post.id ?? ''),
    title: stripHtml(post.title?.rendered ?? post.title ?? ''),
    slug: post.slug ?? (post.title?.rendered ? stripHtml(post.title.rendered).toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
    excerpt: stripHtml(post.excerpt?.rendered ?? post.excerpt ?? ''),
    content: post.content?.rendered ?? post.content ?? '',
    category: (primaryCategory as ArticleCategory) || 'berita',
    categoryLabel: primaryCategory.toUpperCase(),
    imageUrl,
    imageAlt: stripHtml(post.title?.rendered ?? ''),
    author: authorName,
    readTime: '5 min read',
    isHero: Boolean(post.is_hero || post.sticky),
    isEditorsPick: Boolean(post.is_editors_pick),
    badge: post.sticky ? 'HOT' : undefined,
    isSaved: false,
    createdAt: formatIndoDateTime(post.date || new Date().toISOString()),
    publishedDate: post.date ? new Date(post.date).toLocaleDateString('id-ID') : '2026'
  };
}

export function normalizeArticleCategory(category?: string, categoryLabel?: string): { category: ArticleCategory; categoryLabel: string } {
  let cat = (category || '').toLowerCase().trim();
  const rawLabel = (categoryLabel || '').trim();
  const upperLabel = rawLabel.toUpperCase();

  // Kategori aduan dari Halo Jurnal (infrastruktur, lingkungan, dll) harus dinormalisasi ke BERITA
  if (cat === 'infrastruktur' || upperLabel === 'INFRASTRUKTUR' || cat === 'lingkungan' || cat === 'pelayanan' || !cat) {
    return {
      category: 'berita',
      categoryLabel: 'BERITA',
    };
  }

  if (cat === 'sains' || cat === 'sains & lingkungan') {
    cat = 'science';
  } else if (cat === 'kesehatan') {
    cat = 'health';
  }

  const validCategories: Record<string, string> = {
    berita: 'BERITA',
    ekonomi: 'EKONOMI',
    bisnis: 'EKONOMI',
    lifestyle: 'LIFESTYLE',
    kuliner: 'KULINER',
    wisata: 'WISATA',
    otomotif: 'OTOMOTIF',
    sport: 'SPORT',
    loker: 'LOKER',
    hiburan: 'HIBURAN',
    tech: 'TEKNOLOGI',
    science: 'SCIENCE',
    health: 'HEALTH',
  };

  if (validCategories[cat]) {
    return {
      category: cat as ArticleCategory,
      categoryLabel: upperLabel && upperLabel !== 'INFRASTRUKTUR' && upperLabel !== 'SAINS' && upperLabel !== 'KESEHATAN' ? rawLabel : validCategories[cat],
    };
  }

  return {
    category: 'berita',
    categoryLabel: upperLabel && upperLabel !== 'INFRASTRUKTUR' ? rawLabel : 'BERITA',
  };
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';

export function getSafeImageUrl(url?: string | null): string {
  if (!url) return DEFAULT_FALLBACK_IMAGE;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  return DEFAULT_FALLBACK_IMAGE;
}

// In-memory cache server-side agar tidak bolak-balik query Neon DB jika data masih segar (mengurangi delay)
let serverArticlesCache: { data: Article[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 detik

export function clearServerArticlesCache() {
  serverArticlesCache = null;
}

/**
 * Fetches all articles from Database/WordPress.
 * Fallbacks to localStorage ('jurnal_wave_articles') or empty array [] if not yet populated.
 */
export async function fetchArticlesFromWordPress(): Promise<Article[]> {
  // 1. Server-side fetch from MySQL/PostgreSQL via Prisma
  if (typeof window === 'undefined') {
    const now = Date.now();
    if (serverArticlesCache && now - serverArticlesCache.timestamp < CACHE_TTL_MS) {
      return serverArticlesCache.data;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const dbPosts = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbPosts.length > 0) {
        const mapped = dbPosts.map((item) => {
          const { category, categoryLabel } = normalizeArticleCategory(item.category, item.categoryLabel || undefined);
          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            content: item.content,
            category,
            categoryLabel,
            imageUrl: getSafeImageUrl(item.imageUrl),
            imageAlt: item.imageAlt || item.title,
            author: item.author || 'Tim Redaksi',
            reporter: item.reporter || 'Redaksi Jurnal Wave',
            redaktur: item.redaktur || 'Redaksi Pelaksana',
            readTime: item.readTime || '5 min read',
            isHero: Boolean(item.isHero),
            isEditorsPick: Boolean(item.isEditorsPick),
            badge: item.badge || undefined,
            isSaved: false,
            publishedDate: item.publishedDate || new Date(item.createdAt).toLocaleDateString('id-ID'),
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          };
        });

        // Simpan ke cache memori server
        serverArticlesCache = { data: mapped, timestamp: now };
        return mapped;
      }
    } catch (err) {
      console.warn('Database server-side article fetch notice:', err);
      if (serverArticlesCache) return serverArticlesCache.data;
    }
  }

  // 2. Client-side fetch from /api/articles (MySQL API)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sanitized = json.data.map((item: Article) => {
            const { category, categoryLabel } = normalizeArticleCategory(item.category, item.categoryLabel);
            return {
              ...item,
              category,
              categoryLabel,
              imageUrl: getSafeImageUrl(item.imageUrl),
            };
          });
          localStorage.setItem('jurnal_wave_articles', JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch {}

    // Client-side fallback to localStorage
    try {
      const saved = localStorage.getItem('jurnal_wave_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: Article) => {
            const { category, categoryLabel } = normalizeArticleCategory(item.category, item.categoryLabel);
            return {
              ...item,
              category,
              categoryLabel,
              imageUrl: getSafeImageUrl(item.imageUrl),
            };
          });
        }
      }
    } catch {}
  }

  return [];
}

/**
 * Fetches a single article by ID or slug from MySQL API / Prisma with fallbacks.
 */
export async function fetchArticleByIdFromWordPress(idOrSlug: string): Promise<Article> {
  // 1. Server-side fetch from MySQL via Prisma
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/prisma');
      const item = await prisma.article.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      });
      if (item) {
        const { category, categoryLabel } = normalizeArticleCategory(item.category, item.categoryLabel || undefined);
        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          category,
          categoryLabel,
          imageUrl: getSafeImageUrl(item.imageUrl),
          imageAlt: item.imageAlt || item.title,
          author: item.author || 'Tim Redaksi',
          reporter: item.reporter || 'Redaksi Jurnal Wave',
          redaktur: item.redaktur || 'Redaksi Pelaksana',
          readTime: item.readTime || '5 min read',
          isHero: Boolean(item.isHero),
          isEditorsPick: Boolean(item.isEditorsPick),
          badge: item.badge || undefined,
          isSaved: false,
          publishedDate: item.publishedDate || new Date(item.createdAt).toLocaleDateString('id-ID'),
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('MySQL server-side single article lookup notice:', err);
    }
  }

  // 2. Client-side fetch from /api/articles?slug=...
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(idOrSlug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { category, categoryLabel } = normalizeArticleCategory(json.data.category, json.data.categoryLabel);
          return {
            ...json.data,
            category,
            categoryLabel,
            imageUrl: getSafeImageUrl(json.data.imageUrl),
          };
        }
      }
    } catch {}

    // Fallback to local storage if running in browser
    try {
      const saved = localStorage.getItem('jurnal_wave_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foundInLocal = parsed.find(
            (a: any) => String(a.id) === String(idOrSlug) || a.slug === idOrSlug
          );
          if (foundInLocal) {
            const { category, categoryLabel } = normalizeArticleCategory(foundInLocal.category, foundInLocal.categoryLabel);
            return {
              ...foundInLocal,
              category,
              categoryLabel,
              imageUrl: getSafeImageUrl(foundInLocal.imageUrl),
            };
          }
        }
      }
    } catch {}
  }

  return null as any;
}

// Aliases for backward compatibility and clean naming
export const fetchArticles = fetchArticlesFromWordPress;
export const fetchArticleById = fetchArticleByIdFromWordPress;
export const fetchArticlesFromSupabase = fetchArticlesFromWordPress;
export const fetchArticleByIdFromSupabase = fetchArticleByIdFromWordPress;
