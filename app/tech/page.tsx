import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export const metadata: Metadata = {
  title: 'Technology & Innovation',
  description: 'Kabar dunia teknologi, AI, gadget terbaru, dan lanskap startup digital Sukabumi.',
  openGraph: {
    title: 'Technology & Innovation | Jurnal Vibes',
    description: 'Kabar dunia teknologi, AI, gadget terbaru, dan lanskap startup digital Sukabumi.',
  },
};

export default function TechPage() {
  const techArticles = DUMMY_ARTICLES.filter(
    a =>
      a.category === 'tech' ||
      a.categoryLabel.toUpperCase() === 'TECH' ||
      (a.subCategory || '').toUpperCase() === 'TECH'
  );

  return (
    <CategoryTemplate
      title="Technology & Innovation"
      description="Kabar dunia teknologi, AI, gadget terbaru, dan lanskap startup digital Sukabumi"
      articles={techArticles}
      categoryName="Tech"
      allArticles={DUMMY_ARTICLES}
    />
  );
}
