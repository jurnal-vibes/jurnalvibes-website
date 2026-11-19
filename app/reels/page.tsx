import type { Metadata } from 'next';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { fetchReels } from '@/lib/reels';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Wave Reels Sukabumi',
  description: 'Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota & Kabupaten Sukabumi.',
  openGraph: {
    title: 'Wave Reels Sukabumi | Jurnal Wave',
    description: 'Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota & Kabupaten Sukabumi.',
  },
};

export default async function ReelsPage() {
  const initialReels = await fetchReels();

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      {/* Header */}
      <header className="flex flex-col gap-1.5 mb-6 pb-3 border-b border-outline-variant/40">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-headline-xl text-on-surface tracking-tight">
          Wave Reels Sukabumi
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant font-normal">
          Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota &amp; Kabupaten Sukabumi.
        </p>
      </header>

      {/* Unified Gallery Grid Reels */}
      <ReelsSection
        reels={initialReels}
        hideHeader={true}
        showCategoryFilter={false}
        isGalleryPage={true}
      />
    </div>
  );
}
