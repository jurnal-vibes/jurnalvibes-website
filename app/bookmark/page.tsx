import type { Metadata } from 'next';
import { BookmarkClient } from './BookmarkClient';
import { fetchArticles } from '@/lib/wordpress';
import { DUMMY_JOBS } from '@/data/dummyJobs';

export const metadata: Metadata = {
  title: 'Konten Tersimpan',
  description: 'Daftar berita, artikel, dan lowongan kerja yang telah Anda simpan untuk dibaca atau dilamar nanti.',
  openGraph: {
    title: 'Konten Tersimpan | Jurnal Wave',
    description: 'Daftar berita, artikel, dan lowongan kerja yang telah Anda simpan untuk dibaca atau dilamar nanti.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BookmarkPage() {
  const articles = await fetchArticles();
  return <BookmarkClient initialArticles={articles} initialJobs={DUMMY_JOBS} />;
}
