import React from 'react';

export default function ArticleLoading() {
  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 flex flex-col relative animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="h-3 w-12 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-2 bg-surface-variant/40 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-14 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-2 bg-surface-variant/40 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-16 bg-surface-variant/70 dark:bg-neutral-800 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Content Article Skeleton */}
        <main className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Title & Byline Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-7 sm:h-9 w-11/12 bg-surface-variant/80 dark:bg-neutral-800 rounded-lg" />
            <div className="h-6 sm:h-8 w-4/5 bg-surface-variant/70 dark:bg-neutral-800 rounded-lg" />

            {/* Standfirst / Excerpt */}
            <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-1">
              <div className="h-4 w-full bg-surface-variant/60 dark:bg-neutral-800 rounded mb-1.5" />
              <div className="h-4 w-3/4 bg-surface-variant/60 dark:bg-neutral-800 rounded" />
            </div>

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
          <div className="w-full h-11 rounded-xl bg-surface-variant/50 dark:bg-neutral-800/60" />

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

        {/* Right Sidebar Skeleton (Terpopuler, dsb) */}
        <aside className="lg:col-span-4 min-w-0 flex flex-col gap-6">
          <div className="border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-4">
            <div className="h-5 w-32 bg-surface-variant/80 dark:bg-neutral-800 rounded" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-20 h-16 rounded-lg bg-surface-variant/70 dark:bg-neutral-800 shrink-0" />
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <div className="h-3 w-16 bg-surface-variant/50 dark:bg-neutral-800 rounded" />
                  <div className="h-3.5 w-full bg-surface-variant/70 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
