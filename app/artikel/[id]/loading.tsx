import React from 'react';

export default function ArticleLoading() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-6 lg:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative animate-pulse">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-1/4 sticky top-28 self-start overflow-y-auto pr-4 gap-6 h-[calc(100vh-7.25rem)] no-scrollbar shrink-0">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded-xl" />
          <div className="h-10 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded-xl" />
          <div className="h-10 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded-xl" />
        </div>
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

      {/* Main Content Article Skeleton */}
      <main className="w-full md:w-3/4 flex flex-col gap-6 pr-0 md:pr-6 lg:pr-12">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-12 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-3 bg-surface-variant/40 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-16 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-3 bg-surface-variant/40 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-20 bg-surface-variant/70 dark:bg-neutral-800 rounded" />
        </div>

        {/* Title & Byline Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-8 sm:h-10 w-11/12 bg-surface-variant/80 dark:bg-neutral-800 rounded-lg" />
          <div className="h-6 sm:h-8 w-4/5 bg-surface-variant/70 dark:bg-neutral-800 rounded-lg" />

          <div className="flex items-center justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-variant/70 dark:bg-neutral-800" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-24 bg-surface-variant/80 dark:bg-neutral-800 rounded" />
                <div className="h-2.5 w-28 bg-surface-variant/50 dark:bg-neutral-800 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-variant/70 dark:bg-neutral-800" />
              <div className="w-8 h-8 rounded-full bg-surface-variant/70 dark:bg-neutral-800" />
              <div className="w-8 h-8 rounded-full bg-surface-variant/70 dark:bg-neutral-800" />
            </div>
          </div>
        </div>

        {/* Main Image Skeleton */}
        <div className="w-full aspect-video rounded-2xl bg-surface-variant/70 dark:bg-neutral-800" />

        {/* Listen / Utility Bar Skeleton */}
        <div className="w-full h-12 rounded-xl bg-surface-variant/50 dark:bg-neutral-800/60" />

        {/* Body Paragraphs Skeleton */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-4 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-11/12 bg-surface-variant/70 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-3/4 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-4 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-5/6 bg-surface-variant/70 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded" />
        </div>
      </main>
    </div>
  );
}
