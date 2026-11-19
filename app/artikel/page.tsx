import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BeritaClient } from '../berita/BeritaClient';
import { fetchArticles } from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Semua Artikel',
  description: 'Kumpulan liputan artikel terkini dan terlengkap seputar Sukabumi dan sekitarnya.',
  openGraph: {
    title: 'Semua Artikel Sukabumi | Jurnal Wave',
    description: 'Kumpulan liputan artikel terkini dan terlengkap seputar Sukabumi dan sekitarnya.',
  },
};

export default async function ArtikelPage() {
  const articles = await fetchArticles();
  return (
    <Suspense fallback={<div className="min-h-screen py-12 text-center text-sm text-slate-400">Memuat artikel...</div>}>
      <BeritaClient initialArticles={articles} />
    </Suspense>
  );
}
