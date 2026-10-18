import type { Metadata } from 'next';
import { HubungiKamiClient } from './HubungiKamiClient';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan Jurnal Wave Sukabumi.',
  openGraph: {
    title: 'Hubungi Kami | Jurnal Wave',
    description: 'Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan Jurnal Wave Sukabumi.',
  },
};

export default function HubungiKamiPage() {
  return <HubungiKamiClient />;
}
