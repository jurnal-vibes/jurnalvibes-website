import type { Metadata } from 'next';
import { BeritaClient } from './BeritaClient';

export const metadata: Metadata = {
  title: 'Berita Terkini',
  description: 'Informasi terhangat seputar Sukabumi dan sekitarnya — kampus, sekolah, komunitas, dan event lokal.',
  openGraph: {
    title: 'Berita Terkini Sukabumi | Jurnal Vibes',
    description: 'Informasi terhangat seputar Sukabumi dan sekitarnya — kampus, sekolah, komunitas, dan event lokal.',
  },
};

export default function BeritaPage() {
  return <BeritaClient />;
}
