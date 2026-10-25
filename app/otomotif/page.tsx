import type { Metadata } from 'next';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Otomotif',
  description: 'Ulasan kendaraan, modifikasi, touring, dan berita dunia otomotif Sukabumi.',
  openGraph: {
    title: 'Otomotif | Jurnal Wave',
    description: 'Ulasan kendaraan, modifikasi, touring, dan berita dunia otomotif Sukabumi.',
  },
};

export default async function OtomotifPage() {
  const allArticles = await fetchArticles();
  const otoArticles = allArticles.filter(
    a =>
      a.category === 'otomotif' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'OTOMOTIF') ||
      ((a.subCategory || '').toUpperCase() === 'OTOMOTIF')
  );

  return (
    <CategoryTemplate
      title="Otomotif"
      description="Ulasan kendaraan, modifikasi, touring, dan berita dunia otomotif Sukabumi"
      articles={otoArticles}
      categoryName="Otomotif"
      allArticles={allArticles}
    />
  );
}
