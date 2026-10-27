import type { Metadata } from 'next';
import { BeritaClient } from './BeritaClient';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Semua Berita',
  description: 'Kumpulan liputan berita terkini dan terlengkap seputar Sukabumi dan sekitarnya.',
  openGraph: {
    title: 'Semua Berita Sukabumi | Jurnal Wave',
    description: 'Kumpulan liputan berita terkini dan terlengkap seputar Sukabumi dan sekitarnya.',
  },
};

export default async function BeritaPage() {
  const articles = await fetchArticles();
  return <BeritaClient initialArticles={articles} />;
}
