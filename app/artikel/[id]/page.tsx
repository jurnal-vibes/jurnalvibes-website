import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ArticleDetailView } from './ArticleDetailView';
import { fetchArticleById, fetchArticles } from '@/lib/wordpress';

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jurnalwave.com';
  const articleUrl = `${siteUrl}/artikel/${article.slug || article.id}`;
  const title = `${article.title} - Jurnal Wave`;
  const cleanContentText = (article.excerpt || article.content || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\r?\n+/g, ' ')
    .trim();
  const description = cleanContentText.slice(0, 160) || article.title;
  const safeImageUrl =
    article.imageUrl && !article.imageUrl.startsWith('data:')
      ? (article.imageUrl.startsWith('/') ? `${siteUrl}${article.imageUrl}` : article.imageUrl)
      : `${siteUrl}/logo_jurnal_wave.webp`;
  const keywordsList = Array.isArray(article.tags) && article.tags.length > 0
    ? article.tags.map((t: string) => t.replace(/^#+/, ''))
    : ['Jurnal Wave', 'Sukabumi', article.category, 'Berita Terkini'];

  return {
    title,
    description,
    keywords: keywordsList,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title,
      description,
      url: articleUrl,
      type: 'article',
      publishedTime: article.createdAt || article.publishedDate,
      modifiedTime: article.createdAt || article.publishedDate,
      section: article.categoryLabel || article.category,
      tags: keywordsList,
      authors: [article.reporter || article.author || 'Tim Redaksi'],
      images: [
        {
          url: safeImageUrl,
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
      images: [safeImageUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = await params;
  let article = null;
  let allArticles: any[] = [];

  try {
    const [wpArticle, wpArticles] = await Promise.all([
      fetchArticleById(id),
      fetchArticles()
    ]);
    if (wpArticle) {
      article = wpArticle;
    }
    if (wpArticles && wpArticles.length > 0) {
      allArticles = wpArticles;
    }
  } catch {}

  if (!article) {
    notFound();
  }

  // Canonical redirect: jika diakses menggunakan ID acak (CUID), otomatis redirect ke URL slug SEO resminya
  if (article.slug && id !== article.slug) {
    redirect(`/artikel/${article.slug}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jurnalwave.com';
  const articleUrl = `${siteUrl}/artikel/${article.slug || article.id}`;

  const safeJsonLdImage =
    article.imageUrl && !article.imageUrl.startsWith('data:')
      ? (article.imageUrl.startsWith('/') ? `${siteUrl}${article.imageUrl}` : article.imageUrl)
      : `${siteUrl}/logo_jurnal_wave.webp`;

  const cleanJsonLdDescription = (article.excerpt || article.content || article.title)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\r?\n+/g, ' ')
    .trim()
    .slice(0, 200);

  // Structured Data Schema.org NewsArticle resmi standar Google News & Discover
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    description: cleanJsonLdDescription || article.title,
    image: [safeJsonLdImage],
    datePublished: article.createdAt || new Date().toISOString(),
    dateModified: article.createdAt || new Date().toISOString(),
    author: [
      {
        '@type': 'Person',
        name: article.reporter || article.author || 'Redaksi Jurnal Wave',
      },
    ],
    editor: {
      '@type': 'Person',
      name: article.redaktur || 'Redaksi Pelaksana',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Jurnal Wave',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo_jurnal_wave.webp`,
      },
    },
    articleSection: article.categoryLabel || article.category,
    keywords: Array.isArray(article.tags) && article.tags.length > 0
      ? article.tags.map((t: string) => t.replace(/^#+/, '')).join(', ')
      : `${article.category}, Berita Sukabumi, Jurnal Wave`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailView id={id} initialData={article} initialAllArticles={allArticles} />
    </>
  );
}
