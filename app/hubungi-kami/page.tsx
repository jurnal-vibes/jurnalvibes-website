import type { Metadata } from 'next';
import { HubungiKamiClient } from './HubungiKamiClient';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan Jurnal Vibes Sukabumi.',
  openGraph: {
    title: 'Hubungi Kami | Jurnal Vibes',
    description: 'Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan Jurnal Vibes Sukabumi.',
  },
};

export default function HubungiKamiPage() {
  return <HubungiKamiClient />;
}
