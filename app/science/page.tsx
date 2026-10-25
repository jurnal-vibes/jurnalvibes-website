import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Science & Environment',
  description: 'Riset ilmiah, sains populer, dan isu lingkungan terkini seputar Sukabumi.',
  openGraph: {
    title: 'Science & Environment | Jurnal Wave',
    description: 'Riset ilmiah, sains populer, dan isu lingkungan terkini seputar Sukabumi.',
  },
};

export default async function SciencePage() {
  const allArticles = await fetchArticles();
  const scienceArticles = allArticles.filter(
    a =>
      a.category === 'science' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'SCIENCE') ||
      ((a.subCategory || '').toUpperCase() === 'SCIENCE')
  );

  return (
    <CategoryTemplate
      title="Science & Environment"
      description="Riset ilmiah, sains populer, dan isu lingkungan terkini seputar Sukabumi"
      articles={scienceArticles}
      categoryName="Science"
      allArticles={allArticles}
    />
  );
}
