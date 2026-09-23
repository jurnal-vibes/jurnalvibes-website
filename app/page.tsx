import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Jurnal Vibes - Portal Berita & Lifestyle Sukabumi',
  },
  description: 'Portal berita terkini, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi. Kabar terpercaya dari Kota dan Kabupaten Sukabumi.',
  openGraph: {
    title: 'Jurnal Vibes - Portal Berita & Lifestyle Sukabumi',
    description: 'Portal berita terkini, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi.',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
