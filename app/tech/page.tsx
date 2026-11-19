import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tech & Game',
  description: 'Kabar dunia teknologi, game, E-Sport, AI, gadget terbaru, dan tren digital anak muda.',
  openGraph: {
    title: 'Tech & Game | Jurnal Wave',
    description: 'Kabar dunia teknologi, game, E-Sport, AI, gadget terbaru, dan tren digital anak muda.',
  },
};

export default async function TechPage() {
  const allArticles = await fetchArticles();
  const techArticles = allArticles.filter(
    a =>
      a.category === 'tech' ||
      a.category === 'game' ||
      (a.categoryLabel && (
        a.categoryLabel.toUpperCase() === 'TECH' ||
        a.categoryLabel.toUpperCase() === 'TEKNOLOGI' ||
        a.categoryLabel.toUpperCase() === 'GAME'
      )) ||
      ((a.subCategory || '').toUpperCase() === 'TECH')
  );

  return (
    <CategoryTemplate
      title="Tech & Game"
      description="Kabar seputar teknologi, gadget, game, E-Sport, dan tren digital anak muda"
      articles={techArticles}
      categoryName="Tech & Game"
      allArticles={allArticles}
    />
  );
}
