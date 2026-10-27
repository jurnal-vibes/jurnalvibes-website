import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Health',
  description: 'Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran.',
  openGraph: {
    title: 'Health | Jurnal Wave',
    description: 'Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran.',
  },
};

export default async function HealthPage() {
  const allArticles = await fetchArticles();
  const healthArticles = allArticles.filter(
    a =>
      a.category === 'health' ||
      (a.category as string) === 'kesehatan' ||
      (a.categoryLabel && (a.categoryLabel.toUpperCase() === 'HEALTH' || a.categoryLabel.toUpperCase() === 'KESEHATAN')) ||
      ((a.subCategory || '').toUpperCase() === 'HEALTH' || (a.subCategory || '').toUpperCase() === 'KESEHATAN')
  );

  return (
    <CategoryTemplate
      title="Health"
      description="Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran"
      articles={healthArticles}
      categoryName="Health"
      allArticles={allArticles}
    />
  );
}
