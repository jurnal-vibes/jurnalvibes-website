import type { Metadata } from 'next';
import { ArticleDetailView } from './ArticleDetailView';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { fetchArticleByIdFromSupabase } from '@/lib/supabase';

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  let article = DUMMY_ARTICLES.find(a => a.id === id || a.slug === id);

  try {
    const supabaseArticle = await fetchArticleByIdFromSupabase(id);
    if (supabaseArticle) {
      article = supabaseArticle;
    }
  } catch {
    // Fallback to dummy article
  }

  const currentArticle = article || DUMMY_ARTICLES[0];
  const title = `${currentArticle.title} - Jurnal Vibes`;
  const description =
    currentArticle.excerpt || currentArticle.content.slice(0, 160).replace(/\n/g, ' ');
  const imageUrl = currentArticle.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: currentArticle.publishedDate,
      authors: [currentArticle.author || 'Tim Redaksi'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: currentArticle.imageAlt || currentArticle.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = await params;
  return <ArticleDetailView id={id} />;
}
