'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';

export function LifestyleClient({ initialArticles = [] }: { initialArticles?: Article[] }) {
  const searchParams = useSearchParams();
  const sub = searchParams.get('sub')?.toLowerCase() || '';

  const [articles] = useState<Article[]>(initialArticles);

  const allLifestyleArticles = articles.filter(
    a =>
      a.category === 'lifestyle' ||
      ['KULINER', 'WISATA', 'MUSIK', 'EVENT LOKAL', 'FASHION', 'KOMUNITAS'].includes(
        (a.categoryLabel || '').toUpperCase()
      ) ||
      ['KULINER', 'WISATA', 'MUSIK', 'EVENT LOKAL', 'FASHION'].includes(
        (a.subCategory || '').toUpperCase()
      )
  );

  const filteredArticles = allLifestyleArticles.filter(article => {
    if (!sub || sub === 'semua') return true;

    if (sub === 'style' || sub === 'fashion') {
      return (
        (article.categoryLabel || '').toUpperCase() === 'FASHION' ||
        (article.subCategory || '').toUpperCase() === 'FASHION' ||
        article.title.toLowerCase().includes('fashion') ||
        article.title.toLowerCase().includes('style') ||
        article.title.toLowerCase().includes('outfit')
      );
    }
    if (sub === 'culinary' || sub === 'kuliner') {
      return (
        (article.categoryLabel || '').toUpperCase() === 'KULINER' ||
        (article.subCategory || '').toUpperCase() === 'KULINER' ||
        article.title.toLowerCase().includes('kuliner') ||
        article.title.toLowerCase().includes('makanan') ||
        article.title.toLowerCase().includes('jajanan') ||
        article.title.toLowerCase().includes('kopi') ||
        article.title.toLowerCase().includes('cafe')
      );
    }
    if (sub === 'traveling' || sub === 'wisata') {
      return (
        (article.categoryLabel || '').toUpperCase() === 'WISATA' ||
        (article.subCategory || '').toUpperCase() === 'WISATA' ||
        article.title.toLowerCase().includes('wisata') ||
        article.title.toLowerCase().includes('curug') ||
        article.title.toLowerCase().includes('pantai') ||
        article.title.toLowerCase().includes('ciletuh')
      );
    }
    return true;
  });

  let pageTitle = 'Semua Lifestyle';
  let pageSubtitle = 'Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru di Sukabumi';

  if (sub === 'style' || sub === 'fashion') {
    pageTitle = 'Style';
    pageSubtitle = 'Tren busana, gaya hidup anak muda, dan inspirasi outfit Sukabumi';
  } else if (sub === 'culinary' || sub === 'kuliner') {
    pageTitle = 'Culinary';
    pageSubtitle = 'Eksplorasi rasa, kuliner legendaris, kafe aesthetic, dan jajanan lezat Sukabumi';
  } else if (sub === 'traveling' || sub === 'wisata') {
    pageTitle = 'Traveling';
    pageSubtitle = 'Destinasi wisata alam Geopark Ciletuh, pantai, curug, dan spot healing Sukabumi';
  }

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      {/* Header dengan Sub-Kategori Aktif */}
      <header className="flex flex-col gap-2.5 mb-8 pb-4 border-b border-outline-variant/50">
        {sub && (
          <Link
            href="/lifestyle"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1 self-start cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Lifestyle</span>
          </Link>
        )}

        <div>
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg mt-1">
            {pageSubtitle}
          </p>
        </div>
      </header>

      {/* Sub-Kategori Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 mb-6">
        {[
          { label: 'Semua Lifestyle', href: '/lifestyle', active: !sub },
          { label: 'Style', href: '/lifestyle?sub=style', active: sub === 'style' || sub === 'fashion' },
          { label: 'Culinary', href: '/lifestyle?sub=culinary', active: sub === 'culinary' || sub === 'kuliner' },
          { label: 'Traveling', href: '/lifestyle?sub=traveling', active: sub === 'traveling' || sub === 'wisata' },
        ].map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              item.active
                ? 'bg-primary text-white shadow-2xs font-bold'
                : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant border border-outline-variant/40'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {filteredArticles.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredArticles.map(article => (
            <NewsCard key={article.id} article={article} variant="row" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface-container rounded-2xl border border-outline-variant/60 my-4 space-y-3">
          <Sparkles className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
          <h3 className="font-bold text-sm sm:text-base text-on-surface">
            Belum ada artikel untuk sub-kategori ini
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Artikel baru untuk rubrik ini akan segera diterbitkan oleh redaksi Jurnal Wave.
          </p>
          {sub && (
            <div className="pt-2">
              <Link
                href="/lifestyle"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-2xs"
              >
                Lihat Semua Lifestyle
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
