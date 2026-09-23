import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export const metadata: Metadata = {
  title: 'Sport & E-Sport',
  description: 'Kabar seputar olahraga, kompetisi lokal, dan turnamen E-Sport Sukabumi.',
  openGraph: {
    title: 'Sport & E-Sport | Jurnal Vibes',
    description: 'Kabar seputar olahraga, kompetisi lokal, dan turnamen E-Sport Sukabumi.',
  },
};

export default function SportPage() {
  const sportArticles = DUMMY_ARTICLES.filter(
    a => a.category === 'sport' || a.categoryLabel.toUpperCase() === 'SPORT'
  );

  const articlesToDisplay = sportArticles.length > 0 ? sportArticles : DUMMY_ARTICLES.slice(0, 4);

  return (
    <CategoryTemplate
      title="Sport & E-Sport"
      description="Kabar seputar olahraga, kompetisi lokal, dan turnamen E-Sport Sukabumi"
      articles={articlesToDisplay}
      categoryName="Sport"
      allArticles={DUMMY_ARTICLES}
    />
  );
}
