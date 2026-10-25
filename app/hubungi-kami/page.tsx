import type { Metadata } from 'next';
import { HubungiKamiClient } from './HubungiKamiClient';
import { fetchArticles } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan Jurnal Wave Sukabumi.',
  openGraph: {
    title: 'Hubungi Kami | Jurnal Wave',
    description: 'Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan Jurnal Wave Sukabumi.',
  },
};

export default async function HubungiKamiPage() {
  const articles = await fetchArticles();
  return <HubungiKamiClient articles={articles} />;
}
