import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleDetailView } from './ArticleDetailView';
import { fetchArticleById } from '@/lib/wordpress';

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  let article = null;

  try {
    const wpArticle = await fetchArticleById(id);
    if (wpArticle) {
      article = wpArticle;
    }
  } catch {}

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan - Jurnal Wave',
      description: 'Artikel yang Anda cari tidak ditemukan atau telah dihapus.',
    };
  }

  const title = `${article.title} - Jurnal Wave`;
  const description =
    article.excerpt || article.content.slice(0, 160).replace(/\n/g, ' ');
  const imageUrl = article.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedDate,
      authors: [article.author || 'Tim Redaksi'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
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
  let article = null;

  try {
    const wpArticle = await fetchArticleById(id);
    if (wpArticle) {
      article = wpArticle;
    }
  } catch {}

  if (!article) {
    notFound();
  }

  return <ArticleDetailView id={id} initialData={article} />;
}
