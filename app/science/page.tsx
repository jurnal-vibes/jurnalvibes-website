import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Science',
  description: 'Riset ilmiah, sains populer, dan perkembangan teknologi seputar Sukabumi.',
  openGraph: {
    title: 'Science | Jurnal Wave',
    description: 'Riset ilmiah, sains populer, dan perkembangan teknologi seputar Sukabumi.',
  },
};

export default async function SciencePage() {
  const allArticles = await fetchArticles();
  const scienceArticles = allArticles.filter(
    a =>
      a.category === 'science' ||
      (a.category as string) === 'sains' ||
      (a.categoryLabel && (a.categoryLabel.toUpperCase() === 'SCIENCE' || a.categoryLabel.toUpperCase() === 'SAINS')) ||
      ((a.subCategory || '').toUpperCase() === 'SCIENCE' || (a.subCategory || '').toUpperCase() === 'SAINS')
  );

  return (
    <CategoryTemplate
      title="Science"
      description="Riset ilmiah, sains populer, eksplorasi alam, dan isu lingkungan terkini"
      articles={scienceArticles}
      categoryName="Science"
      allArticles={allArticles}
    />
  );
}
