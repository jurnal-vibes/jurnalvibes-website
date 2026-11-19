import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Hiburan',
  description: 'Kabar musik, jadwal dan review film bioskop, konser, dan pop culture anak muda terkini.',
  openGraph: {
    title: 'Hiburan | Jurnal Wave',
    description: 'Kabar musik, jadwal dan review film bioskop, konser, dan pop culture anak muda terkini.',
  },
};

export default async function HiburanPage() {
  const allArticles = await fetchArticles();
  const hiburanArticles = allArticles.filter(
    a =>
      a.category === 'hiburan' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'HIBURAN') ||
      a.title.toLowerCase().includes('musik') ||
      a.title.toLowerCase().includes('film') ||
      a.title.toLowerCase().includes('konser') ||
      a.title.toLowerCase().includes('hiburan')
  );

  return (
    <CategoryTemplate
      title="Hiburan"
      description="Kabar seputar musik, film bioskop, konser, dan pop culture anak muda terkini"
      articles={hiburanArticles}
      categoryName="Hiburan"
      allArticles={allArticles}
    />
  );
}
