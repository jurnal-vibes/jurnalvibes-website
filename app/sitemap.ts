import type { MetadataRoute } from 'next';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { fetchArticlesFromSupabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jurnalvibes.com';

  // Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/berita',
    '/tech',
    '/sport',
    '/otomotif',
    '/health',
    '/science',
    '/lifestyle',
    '/loker',
    '/cuaca',
    '/bookmark',
    '/reels',
    '/tentang-kami',
    '/hubungi-kami',
    '/kebijakan-privasi',
    '/pedoman-media-siber',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/berita' ? ('hourly' as const) : ('daily' as const),
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic Article Pages
  let articles = DUMMY_ARTICLES;
  try {
    const supabaseData = await fetchArticlesFromSupabase();
    if (supabaseData && supabaseData.length > 0) {
      articles = supabaseData;
    }
  } catch (err) {
    console.warn('Error fetching articles for sitemap, using fallback:', err);
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/artikel/${article.slug || article.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
