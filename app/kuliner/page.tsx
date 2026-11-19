import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Kuliner',
  description: 'Rekomendasi kafe estetik, tempat nongkrong, jajanan hits, dan kuliner terbaik Sukabumi.',
  openGraph: {
    title: 'Kuliner | Jurnal Wave',
    description: 'Rekomendasi kafe estetik, tempat nongkrong, jajanan hits, dan kuliner terbaik Sukabumi.',
  },
};

export default async function KulinerPage() {
  const allArticles = await fetchArticles();
  const kulinerArticles = allArticles.filter(
    a =>
      a.category === 'kuliner' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'KULINER') ||
      ((a.subCategory || '').toUpperCase() === 'CULINARY') ||
      a.title.toLowerCase().includes('kuliner') ||
      a.title.toLowerCase().includes('kafe') ||
      a.title.toLowerCase().includes('kopi') ||
      a.title.toLowerCase().includes('jajan')
  );

  return (
    <CategoryTemplate
      title="Kuliner"
      description="Rekomendasi kafe estetik, tempat nongkrong, jajanan hits, dan kuliner terbaik Sukabumi"
      articles={kulinerArticles}
      categoryName="Kuliner"
      allArticles={allArticles}
    />
  );
}
