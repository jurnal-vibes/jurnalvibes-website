import React from 'react';

export default function Loading() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-6 lg:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative animate-pulse">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-1/4 sticky top-28 self-start overflow-y-auto pr-4 gap-6 h-[calc(100vh-7.25rem)] no-scrollbar shrink-0">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded-xl" />
          <div className="h-10 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded-xl" />
          <div className="h-10 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded-xl" />
        </div>

        {/* Editor's Pick Skeleton */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="h-5 w-32 bg-surface-variant/80 dark:bg-neutral-800 rounded-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-surface-variant/70 dark:bg-neutral-800 shrink-0" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="h-3.5 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-2/3 bg-surface-variant/50 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="w-full md:w-3/4 flex flex-col gap-stack-lg pr-0 md:pr-6 lg:pr-12">
        {/* Hero Carousel Skeleton */}
        <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl bg-surface-variant/70 dark:bg-neutral-800 flex flex-col justify-end p-6 gap-3">
          <div className="h-4 w-24 bg-surface-variant/90 dark:bg-neutral-700 rounded-full" />
          <div className="h-7 sm:h-8 w-3/4 bg-surface-variant/90 dark:bg-neutral-700 rounded-lg" />
          <div className="h-4 w-1/2 bg-surface-variant/80 dark:bg-neutral-700 rounded" />
        </div>

        {/* Section Heading Skeleton */}
        <div className="flex flex-col gap-1 pt-2">
          <div className="h-4 w-28 bg-surface-variant/70 dark:bg-neutral-800 rounded" />
          <div className="w-10 h-[2.5px] bg-primary/40 rounded-full mt-0.5" />
        </div>

        {/* Feed Articles Skeleton */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-row gap-3.5 sm:gap-6 p-2.5 sm:p-4 rounded-2xl bg-surface/50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 items-center"
            >
              <div className="w-28 sm:w-48 md:w-52 aspect-[4/3] sm:aspect-video rounded-xl bg-surface-variant/70 dark:bg-neutral-800 shrink-0" />
              <div className="flex-1 flex flex-col justify-center py-1 gap-2">
                <div className="flex flex-col gap-2">
                  <div className="h-3.5 sm:h-4 w-20 bg-surface-variant/60 dark:bg-neutral-800 rounded-full" />
                  <div className="h-4 sm:h-5 w-11/12 bg-surface-variant/80 dark:bg-neutral-800 rounded" />
                  <div className="h-3.5 sm:h-4 w-4/5 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-3 w-20 bg-surface-variant/50 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
