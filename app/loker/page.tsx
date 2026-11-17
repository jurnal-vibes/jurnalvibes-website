import type { Metadata } from 'next';
import { LokerClient } from './LokerClient';
import { fetchArticles } from '@/lib/wordpress';
import { fetchJobs } from '@/lib/jobs';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lowongan Kerja Sukabumi',
  description: 'Temukan peluang karir dan pekerjaan terkini di Kota & Kabupaten Sukabumi.',
  openGraph: {
    title: 'Lowongan Kerja Sukabumi | Jurnal Wave',
    description: 'Temukan peluang karir dan pekerjaan terkini di Kota & Kabupaten Sukabumi.',
  },
};

export default async function LokerPage() {
  const [articles, jobs] = await Promise.all([
    fetchArticles(),
    fetchJobs(),
  ]);
  return <LokerClient articles={articles} initialJobs={jobs} />;
}
