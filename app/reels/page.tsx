'use client';

import React from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { DUMMY_REELS } from '@/data/dummyPolls';

export default function ReelsPage() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col min-w-0 pr-0 md:pr-8">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Vibes Reels Sukabumi
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Kumpulan video pendek seputar kuliner, wisata, dan sudut menarik Kota &amp; Kabupaten Sukabumi.
          </p>
        </header>

        {/* Unified Gallery Grid Reels */}
        <ReelsSection
          reels={DUMMY_REELS}
          hideHeader={true}
          showCategoryFilter={true}
          isGalleryPage={true}
        />
      </main>
    </div>
  );
}
