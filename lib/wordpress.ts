import { Article, ArticleCategory } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
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
  if (!post) return DUMMY_ARTICLES[0];

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

/**
 * Fetches all articles from WordPress REST API (/wp-json/wp/v2/posts?_embed=1).
 * Fallbacks to localStorage ('jurnal_wave_articles') or DUMMY_ARTICLES if WordPress is not yet connected or offline.
 */
export async function fetchArticlesFromWordPress(): Promise<Article[]> {
  if (WORDPRESS_URL) {
    try {
      const cleanUrl = WORDPRESS_URL.replace(/\/+$/, '');
      const response = await fetch(`${cleanUrl}/wp-json/wp/v2/posts?_embed=1&per_page=20`, {
        next: { revalidate: 60 },
      });

      if (response.ok) {
        const posts = await response.json();
        if (Array.isArray(posts) && posts.length > 0) {
          return posts.map(mapWordPressPost);
        }
      }
    } catch (err) {
      console.warn('WordPress API connection notice:', err);
    }
  }

  // Client-side fallback to localStorage first
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('jurnal_wave_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  return DUMMY_ARTICLES;
}

/**
 * Fetches a single article by ID or slug from WordPress REST API.
 */
export async function fetchArticleByIdFromWordPress(idOrSlug: string): Promise<Article> {
  if (WORDPRESS_URL) {
    try {
      const cleanUrl = WORDPRESS_URL.replace(/\/+$/, '');
      const isNumeric = /^\d+$/.test(idOrSlug);
      const url = isNumeric
        ? `${cleanUrl}/wp-json/wp/v2/posts/${idOrSlug}?_embed=1`
        : `${cleanUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(idOrSlug)}&_embed=1`;

      const response = await fetch(url, {
        next: { revalidate: 60 },
      });

      if (response.ok) {
        const data = await response.json();
        const post = Array.isArray(data) ? data[0] : data;
        if (post) {
          return mapWordPressPost(post);
        }
      }
    } catch (err) {
      console.warn('WordPress single article lookup notice:', err);
    }
  }

  // Fallback to local storage if running in browser
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('jurnal_wave_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foundInLocal = parsed.find(
            (a: any) => String(a.id) === String(idOrSlug) || a.slug === idOrSlug
          );
          if (foundInLocal) return foundInLocal;
        }
      }
    } catch {}
  }

  // Fallback to local dummy data search
  const found = DUMMY_ARTICLES.find(a => String(a.id) === String(idOrSlug) || a.slug === idOrSlug);
  return found || DUMMY_ARTICLES[0];
}

// Aliases for backward compatibility and clean naming
export const fetchArticles = fetchArticlesFromWordPress;
export const fetchArticleById = fetchArticleByIdFromWordPress;
export const fetchArticlesFromSupabase = fetchArticlesFromWordPress;
export const fetchArticleByIdFromSupabase = fetchArticleByIdFromWordPress;
