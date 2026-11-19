import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Sport',
  description: 'Kabar sepak bola Persib, Timnas Indonesia, liga top dunia, dan olahraga anak muda.',
  openGraph: {
    title: 'Sport | Jurnal Wave',
    description: 'Kabar sepak bola Persib, Timnas Indonesia, liga top dunia, dan olahraga anak muda.',
  },
};

export default async function SportPage() {
  const allArticles = await fetchArticles();
  const sportArticles = allArticles.filter(
    a => a.category === 'sport' || (a.categoryLabel && a.categoryLabel.toUpperCase() === 'SPORT')
  );

  return (
    <CategoryTemplate
      title="Sport"
      description="Kabar seputar sepak bola Persib, Timnas Indonesia, kompetisi lokal, dan olahraga anak muda"
      articles={sportArticles}
      categoryName="Sport"
      allArticles={allArticles}
    />
  );
}
