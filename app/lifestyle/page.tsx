import type { Metadata } from 'next';
import { LifestyleClient } from './LifestyleClient';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lifestyle & Culture',
  description: 'Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru pemuda Sukabumi.',
  openGraph: {
    title: 'Lifestyle & Culture Sukabumi | Jurnal Wave',
    description: 'Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru pemuda Sukabumi.',
  },
};

export default async function LifestylePage() {
  const articles = await fetchArticles();
  return <LifestyleClient initialArticles={articles} />;
}
