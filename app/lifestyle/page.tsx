import type { Metadata } from 'next';
import { LifestyleClient } from './LifestyleClient';

export const metadata: Metadata = {
  title: 'Lifestyle & Culture',
  description: 'Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru pemuda Sukabumi.',
  openGraph: {
    title: 'Lifestyle & Culture Sukabumi | Jurnal Vibes',
    description: 'Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru pemuda Sukabumi.',
  },
};

export default function LifestylePage() {
  return <LifestyleClient />;
}
