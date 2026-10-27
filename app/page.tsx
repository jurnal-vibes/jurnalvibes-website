import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: {
    absolute: 'Jurnal Wave - Portal Berita & Lifestyle Sukabumi',
  },
  description: 'Portal berita terkini, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi. Kabar terpercaya dari Kota dan Kabupaten Sukabumi.',
  openGraph: {
    title: 'Jurnal Wave - Portal Berita & Lifestyle Sukabumi',
    description: 'Portal berita terkini, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi.',
  },
};

export default async function HomePage() {
  const articles = await fetchArticles();
  return <HomeClient initialArticles={articles} />;
}
