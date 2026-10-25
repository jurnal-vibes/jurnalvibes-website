import type { Metadata } from 'next';
import { LokerClient } from './LokerClient';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Lowongan Kerja Sukabumi',
  description: 'Temukan peluang karir dan pekerjaan terkini di Kota & Kabupaten Sukabumi.',
  openGraph: {
    title: 'Lowongan Kerja Sukabumi | Jurnal Wave',
    description: 'Temukan peluang karir dan pekerjaan terkini di Kota & Kabupaten Sukabumi.',
  },
};

export default async function LokerPage() {
  const articles = await fetchArticles();
  return <LokerClient articles={articles} />;
}
