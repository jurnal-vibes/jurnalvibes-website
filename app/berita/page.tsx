import type { Metadata } from 'next';
import { BeritaClient } from './BeritaClient';

export const metadata: Metadata = {
  title: 'Semua Berita',
  description: 'Kumpulan liputan berita terkini dan terlengkap seputar Sukabumi dan sekitarnya.',
  openGraph: {
    title: 'Semua Berita Sukabumi | Jurnal Wave',
    description: 'Kumpulan liputan berita terkini dan terlengkap seputar Sukabumi dan sekitarnya.',
  },
};

export default function BeritaPage() {
  return <BeritaClient />;
}
