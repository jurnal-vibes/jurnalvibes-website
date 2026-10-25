import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Sport & E-Sport',
  description: 'Kabar seputar olahraga, kompetisi lokal, dan turnamen E-Sport Sukabumi.',
  openGraph: {
    title: 'Sport & E-Sport | Jurnal Wave',
    description: 'Kabar seputar olahraga, kompetisi lokal, dan turnamen E-Sport Sukabumi.',
  },
};

export default async function SportPage() {
  const allArticles = await fetchArticles();
  const sportArticles = allArticles.filter(
    a => a.category === 'sport' || (a.categoryLabel && a.categoryLabel.toUpperCase() === 'SPORT')
  );

  return (
    <CategoryTemplate
      title="Sport & E-Sport"
      description="Kabar seputar olahraga, kompetisi lokal, dan turnamen E-Sport Sukabumi"
      articles={sportArticles}
      categoryName="Sport"
      allArticles={allArticles}
    />
  );
}
