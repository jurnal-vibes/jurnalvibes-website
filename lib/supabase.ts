import { createClient } from '@supabase/supabase-js';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { formatIndoDateTime } from '@/lib/utils';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqxinsqdgkjbudmpgurr.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_-OcCMd6NVo-VufNqga40-A_X1_0RLyj';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Maps raw row data from Supabase (whether stored in snake_case or camelCase)
 * to the application's Article interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSupabaseArticle(row: any): Article {
  if (!row) return DUMMY_ARTICLES[0];

  return {
    id: String(row.id ?? ''),
    title: row.title ?? '',
    slug: row.slug ?? (row.title ? row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    category: row.category ?? 'berita',
    categoryLabel: row.category_label ?? row.categoryLabel ?? row.category?.toUpperCase() ?? 'BERITA',
    imageUrl: row.image_url ?? row.imageUrl ?? 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    imageAlt: row.image_alt ?? row.imageAlt ?? row.title ?? '',
    author: row.author ?? 'Tim Redaksi',
    readTime: row.read_time ?? row.readTime ?? '5 min read',
    isHero: row.is_hero ?? row.isHero ?? false,
    isEditorsPick: row.is_editors_pick ?? row.isEditorsPick ?? false,
    badge: row.badge ?? undefined,
    isSaved: row.is_saved ?? row.isSaved ?? false,
    subCategory: row.sub_category ?? row.subCategory ?? undefined,
    createdAt: formatIndoDateTime(row.created_at ?? row.createdAt),
    publishedDate: row.published_date ?? row.publishedDate ?? '2026'
  };
}

/**
 * Fetches all articles from the Supabase `articles` table.
 * Fallbacks to DUMMY_ARTICLES if the table is empty or an error occurs.
 */
export async function fetchArticlesFromSupabase(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('Supabase fetch query notice:', error.message);
      return DUMMY_ARTICLES;
    }

    if (data && data.length > 0) {
      return data.map(mapSupabaseArticle);
    }
  } catch (err) {
    console.warn('Supabase connection notice:', err);
  }

  return DUMMY_ARTICLES;
}

/**
 * Fetches a single article by ID or slug from Supabase.
 */
export async function fetchArticleByIdFromSupabase(idOrSlug: string): Promise<Article> {
  try {
    // Try matching id first
    let { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', idOrSlug)
      .maybeSingle();

    if (!data) {
      // Try matching slug if id was not matched
      const res = await supabase
        .from('articles')
        .select('*')
        .eq('slug', idOrSlug)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.warn('Supabase fetch single article notice:', error.message);
    }

    if (data) {
      return mapSupabaseArticle(data);
    }
  } catch (err) {
    console.warn('Supabase article lookup notice:', err);
  }

  // Fallback to local dummy data search
  const found = DUMMY_ARTICLES.find(a => a.id === idOrSlug || a.slug === idOrSlug);
  return found || DUMMY_ARTICLES[0];
}
