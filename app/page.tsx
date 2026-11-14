import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';
import { fetchArticles } from '@/lib/wordpress';
import { fetchReels } from '@/lib/reels';
import { getActivePoll } from '@/lib/polls';

export const revalidate = 60;

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
  const [articles, reels, activePoll] = await Promise.all([
    fetchArticles(),
    fetchReels(8),
    getActivePoll(),
  ]);
  return <HomeClient initialArticles={articles} initialReels={reels} initialPoll={activePoll} />;
}
