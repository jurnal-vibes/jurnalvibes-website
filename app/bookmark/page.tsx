import type { Metadata } from 'next';
import { BookmarkClient } from './BookmarkClient';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Artikel Tersimpan',
  description: 'Daftar berita, ulasan, dan artikel menarik yang telah Anda tandai untuk dibaca nanti.',
  openGraph: {
    title: 'Artikel Tersimpan | Jurnal Wave',
    description: 'Daftar berita, ulasan, dan artikel menarik yang telah Anda tandai untuk dibaca nanti.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BookmarkPage() {
  const articles = await fetchArticles();
  return <BookmarkClient initialArticles={articles} />;
}
