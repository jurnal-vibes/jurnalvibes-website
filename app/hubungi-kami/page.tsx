import type { Metadata } from 'next';
import { HubungiKamiClient } from './HubungiKamiClient';

export const metadata: Metadata = {
  title: 'Kontak Kami',
  description: 'Informasi alamat kantor sekretariat dan kontak email resmi redaksi PT Media Jurnal Sukabumi.',
  openGraph: {
    title: 'Kontak Kami | Jurnal Wave',
    description: 'Informasi alamat kantor sekretariat dan kontak email resmi redaksi PT Media Jurnal Sukabumi.',
  },
};

export default function HubungiKamiPage() {
  return <HubungiKamiClient />;
}
