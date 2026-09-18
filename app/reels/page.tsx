'use client';

import React from 'react';
import { Film } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { DUMMY_REELS } from '@/data/dummyPolls';

export default function ReelsPage() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col gap-stack-md pr-0 md:pr-12">
        <header className="flex flex-col gap-3 mb-2">
          <div className="inline-flex">
            <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              VIBES REELS
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-on-surface leading-tight">
            Vibes Reels Sukabumi
          </h1>
          <p className="text-on-surface-variant font-body-lg text-base md:text-lg">
            Kumpulan video pendek dan cerita visual seputar kuliner, event, dan sudut kota Sukabumi. Klik video untuk menonton layar penuh!
          </p>
        </header>

        {/* Clean Unified Reels Section with Category Filter Pills */}
        <ReelsSection
          reels={DUMMY_REELS}
          hideHeader={true}
          showCategoryFilter={true}
        />

      </main>
    </div>
  );
}
