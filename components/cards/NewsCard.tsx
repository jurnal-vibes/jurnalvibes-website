'use client';

import React from 'react';
import Link from 'next/link';
import { Article } from '@/types';

interface NewsCardProps {
  article: Article;
  variant?: 'row' | 'grid';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';

export const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'row' }) => {
  const rawLabel = (article.categoryLabel || article.category || 'BERITA').toUpperCase();
  const displayCategory = rawLabel === 'INFRASTRUKTUR' ? 'BERITA' : rawLabel;

  const validImage =
    article.imageUrl &&
    (article.imageUrl.startsWith('http') ||
      article.imageUrl.startsWith('/') ||
      article.imageUrl.startsWith('data:image/'))
      ? article.imageUrl
      : FALLBACK_IMAGE;

  if (variant === 'grid') {
    return (
      <article className="group bg-surface rounded-2xl border border-outline-variant/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
        <Link href={`/artikel/${article.id}`} className="relative h-48 overflow-hidden block bg-slate-100 dark:bg-slate-800">
          {/* eslint-disable-next-img-element */}
          <img
            src={validImage}
            alt={article.imageAlt || article.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="p-5 flex flex-col flex-1">
          <span className="text-primary font-bold text-xs uppercase tracking-wider mb-2">
            {displayCategory}
          </span>
          <Link href={`/artikel/${article.id}`}>
            <h3 className="font-bold text-on-surface text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </Link>
          <span className="text-xs text-on-surface-variant/70 font-normal mt-auto">
            {article.createdAt}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-row gap-3.5 sm:gap-6 group cursor-pointer border-t border-outline-variant/60 pt-3.5 sm:pt-6 w-full items-center">
      <Link
        href={`/artikel/${article.id}`}
        className="relative w-28 sm:w-48 md:w-52 aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-2xl overflow-hidden shrink-0 block bg-slate-100 dark:bg-slate-800"
      >
        {/* eslint-disable-next-img-element */}
        <img
          src={validImage}
          alt={article.imageAlt || article.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="flex flex-col gap-1 sm:gap-1.5 justify-center flex-1 min-w-0">
        <span className="text-primary font-bold text-[11px] sm:text-xs uppercase tracking-wider">
          {displayCategory}
        </span>
        <Link href={`/artikel/${article.id}`}>
          <h3 className="text-sm sm:text-lg md:text-xl font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>
        <span className="text-on-surface-variant/70 text-[11px] sm:text-xs font-normal">
          {article.createdAt}
        </span>
      </div>
    </article>
  );
};
