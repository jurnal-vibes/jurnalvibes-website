import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Technology & Innovation',
  description: 'Kabar dunia teknologi, AI, gadget terbaru, dan lanskap startup digital Sukabumi.',
  openGraph: {
    title: 'Technology & Innovation | Jurnal Wave',
    description: 'Kabar dunia teknologi, AI, gadget terbaru, dan lanskap startup digital Sukabumi.',
  },
};

export default async function TechPage() {
  const allArticles = await fetchArticles();
  const techArticles = allArticles.filter(
    a =>
      a.category === 'tech' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'TECH') ||
      ((a.subCategory || '').toUpperCase() === 'TECH')
  );

  return (
    <CategoryTemplate
      title="Technology & Innovation"
      description="Kabar dunia teknologi, AI, gadget terbaru, dan lanskap startup digital Sukabumi"
      articles={techArticles}
      categoryName="Tech"
      allArticles={allArticles}
    />
  );
}
