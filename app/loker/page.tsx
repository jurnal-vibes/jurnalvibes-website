import type { Metadata } from 'next';
import { LokerClient } from './LokerClient';

export const metadata: Metadata = {
  title: 'Lowongan Kerja Sukabumi',
  description: 'Temukan peluang karir dan pekerjaan terkini di Kota & Kabupaten Sukabumi.',
  openGraph: {
    title: 'Lowongan Kerja Sukabumi | Jurnal Vibes',
    description: 'Temukan peluang karir dan pekerjaan terkini di Kota & Kabupaten Sukabumi.',
  },
};

export default function LokerPage() {
  return <LokerClient />;
}
