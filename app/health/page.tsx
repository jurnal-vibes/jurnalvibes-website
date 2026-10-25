import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Health & Wellness',
  description: 'Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran.',
  openGraph: {
    title: 'Health & Wellness | Jurnal Wave',
    description: 'Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran.',
  },
};

export default async function HealthPage() {
  const allArticles = await fetchArticles();
  const healthArticles = allArticles.filter(
    a =>
      a.category === 'health' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'HEALTH') ||
      ((a.subCategory || '').toUpperCase() === 'HEALTH')
  );

  return (
    <CategoryTemplate
      title="Health & Wellness"
      description="Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran"
      articles={healthArticles}
      categoryName="Health"
      allArticles={allArticles}
    />
  );
}
