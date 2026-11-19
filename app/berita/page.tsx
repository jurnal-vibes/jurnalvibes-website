import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Berita',
  description: 'Kumpulan liputan berita terkini, peristiwa, kebijakan daerah, dan informasi publik seputar Sukabumi dan sekitarnya.',
  openGraph: {
    title: 'Berita Sukabumi | Jurnal Wave',
    description: 'Kumpulan liputan berita terkini, peristiwa, kebijakan daerah, dan informasi publik seputar Sukabumi dan sekitarnya.',
  },
};

export default async function BeritaPage() {
  const allArticles = await fetchArticles();
  const beritaArticles = allArticles.filter(
    a => a.category === 'berita' || (a.categoryLabel && a.categoryLabel.toUpperCase() === 'BERITA')
  );

  return (
    <CategoryTemplate
      title="Berita"
      description="Kumpulan liputan berita terkini, peristiwa, kebijakan daerah, dan informasi publik seputar Sukabumi"
      articles={beritaArticles}
      categoryName="Berita"
      allArticles={allArticles}
    />
  );
}
