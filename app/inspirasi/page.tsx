import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Inspirasi',
  description: 'Kisah anak muda berprestasi, atlet, kreator konten, dan wirausaha muda sukses Sukabumi.',
  openGraph: {
    title: 'Inspirasi | Jurnal Wave',
    description: 'Kisah anak muda berprestasi, atlet, kreator konten, dan wirausaha muda sukses Sukabumi.',
  },
};

export default async function InspirasiPage() {
  const allArticles = await fetchArticles();
  const inspirasiArticles = allArticles.filter(
    a =>
      a.category === 'inspirasi' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'INSPIRASI') ||
      a.title.toLowerCase().includes('inspirasi') ||
      a.title.toLowerCase().includes('sukses') ||
      a.title.toLowerCase().includes('prestasi')
  );

  return (
    <CategoryTemplate
      title="Inspirasi"
      description="Kisah sosok muda berprestasi, kreator, dan wirausaha muda sukses Sukabumi"
      articles={inspirasiArticles}
      categoryName="Inspirasi"
      allArticles={allArticles}
    />
  );
}
