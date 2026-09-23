import type { Metadata } from 'next';
import { BookmarkClient } from './BookmarkClient';

export const metadata: Metadata = {
  title: 'Artikel Tersimpan',
  description: 'Daftar berita, ulasan, dan artikel menarik yang telah Anda tandai untuk dibaca nanti.',
  openGraph: {
    title: 'Artikel Tersimpan | Jurnal Vibes',
    description: 'Daftar berita, ulasan, dan artikel menarik yang telah Anda tandai untuk dibaca nanti.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookmarkPage() {
  return <BookmarkClient />;
}
