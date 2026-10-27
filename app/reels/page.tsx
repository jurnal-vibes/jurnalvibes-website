import type { Metadata } from 'next';
import { ReelsSection } from '@/components/cards/ReelsSection';

export const metadata: Metadata = {
  title: 'Wave Reels Sukabumi',
  description: 'Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota & Kabupaten Sukabumi.',
  openGraph: {
    title: 'Wave Reels Sukabumi | Jurnal Wave',
    description: 'Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota & Kabupaten Sukabumi.',
  },
};

export default function ReelsPage() {
  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      {/* Header */}
      <header className="flex flex-col gap-2.5 mb-8 pb-4 border-b border-outline-variant/50">
        <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
          Wave Reels Sukabumi
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
          Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota &amp; Kabupaten Sukabumi.
        </p>
      </header>

      {/* Unified Gallery Grid Reels */}
      <ReelsSection
        reels={[]}
        hideHeader={true}
        showCategoryFilter={true}
        isGalleryPage={true}
      />
    </div>
  );
}
