import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Wisata',
  description: 'Spot wisata alam, pantai, curug, camping ground, dan destinasi healing terbaik di Sukabumi.',
  openGraph: {
    title: 'Wisata | Jurnal Wave',
    description: 'Spot wisata alam, pantai, curug, camping ground, dan destinasi healing terbaik di Sukabumi.',
  },
};

export default async function WisataPage() {
  const allArticles = await fetchArticles();
  const wisataArticles = allArticles.filter(
    a =>
      a.category === 'wisata' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'WISATA') ||
      ((a.subCategory || '').toUpperCase() === 'TRAVELING') ||
      a.title.toLowerCase().includes('wisata') ||
      a.title.toLowerCase().includes('pantai') ||
      a.title.toLowerCase().includes('curug') ||
      a.title.toLowerCase().includes('healing')
  );

  return (
    <CategoryTemplate
      title="Wisata"
      description="Spot wisata alam, destinasi jalan-jalan, dan tempat healing terbaik di Sukabumi"
      articles={wisataArticles}
      categoryName="Wisata"
      allArticles={allArticles}
    />
  );
}
