'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Newspaper } from 'lucide-react';
import { Article } from '@/types';
import { formatIndoDate } from '@/lib/utils';

interface HomeCategorySectionProps {
  title: string;
  href: string;
  articles: Article[];
  reverseLayout?: boolean;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';

export const HomeCategorySection: React.FC<HomeCategorySectionProps> = ({
  title,
  href,
  articles,
  reverseLayout = false,
}) => {
  const getValidImg = (art: Article) => {
    if (
      art.imageUrl &&
      (art.imageUrl.startsWith('http') ||
        art.imageUrl.startsWith('/') ||
        art.imageUrl.startsWith('data:image/'))
    ) {
      return art.imageUrl;
    }
    return DEFAULT_IMAGE;
  };

  const getCategoryLabel = (art: Article) => {
    const raw = (art.categoryLabel || art.category || 'BERITA').toUpperCase();
    if (raw === 'INFRASTRUKTUR') return 'BERITA';
    if (raw === 'WISATA') return 'TRAVELING';
    return raw;
  };

  // Gunakan murni artikel yang ada di database/sistem
  const hasArticles = articles && articles.length > 0;
  const featured = hasArticles ? articles[0] : null;
  const listItems = hasArticles ? articles.slice(1, 4) : [];

  return (
    <section className="w-full flex flex-col pt-1 sm:pt-2">
      {/* Editorial Section Header: | NAMA KATEGORI            Lihat Semua > */}
      <div className="flex items-center justify-between pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 sm:h-5 bg-[#c00015] rounded-full" />
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100 tracking-wider uppercase">
            {title}
          </h3>
        </div>
        <Link
          href={href}
          className="text-xs font-semibold text-[#c00015] hover:text-[#a00012] flex items-center gap-0.5 group transition-colors"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Outer Card Container Sesuai Gambar 1 */}
      {!featured ? (
        <div className="w-full flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <Newspaper className="w-5 h-5 text-slate-400 dark:text-zinc-500 mb-1.5 opacity-60" />
          <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
            Belum ada berita di kategori {title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 max-w-sm">
            Berita akan otomatis tampil di sini setelah diterbitkan melalui Meja Redaksi.
          </p>
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start w-full">
            {/* Kolom Featured Besar: Kiri jika reverseLayout=false, KANAN jika reverseLayout=true */}
            <article className={`w-full flex flex-col group cursor-pointer min-w-0 ${reverseLayout ? 'md:order-2' : 'md:order-1'}`}>
              <Link
                href={`/artikel/${featured.slug || featured.id}`}
                className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 mb-2 sm:mb-2.5 block shadow-2xs"
              >
                {/* eslint-disable-next-img-element */}
                <img
                  src={getValidImg(featured)}
                  alt={featured.imageAlt || featured.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="flex flex-col gap-0.5">
                <span className="text-[#c00015] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                  {getCategoryLabel(featured)}
                </span>
                <Link href={`/artikel/${featured.slug || featured.id}`}>
                  <h4 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 group-hover:text-[#c00015] transition-colors leading-snug mt-0.5">
                    {featured.title}
                  </h4>
                </Link>
                <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  {formatIndoDate(featured.createdAt || featured.publishedDate)}
                </span>
              </div>
            </article>

            {/* Kolom Kartu Kecil: Kanan jika reverseLayout=false, KIRI jika reverseLayout=true */}
            {listItems.length > 0 ? (
              <div className={`w-full flex flex-col gap-2.5 sm:gap-3 min-w-0 ${reverseLayout ? 'md:order-1' : 'md:order-2'}`}>
                {listItems.map((item) => (
                  <article
                    key={item.id}
                    className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-2.5 sm:p-3 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
                  >
                    <Link
                      href={`/artikel/${item.slug || item.id}`}
                      className="relative w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 block"
                    >
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={getValidImg(item)}
                        alt={item.imageAlt || item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1 justify-center">
                      <Link href={`/artikel/${item.slug || item.id}`}>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 group-hover:text-[#c00015] transition-colors leading-snug">
                          {item.title}
                        </h5>
                      </Link>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                        {formatIndoDate(item.createdAt || item.publishedDate)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Spacer di Desktop agar posisi sisi satunya tetap terjaga dan kartu besar tetap di posisinya */
              <div className={`hidden md:block w-full min-w-0 ${reverseLayout ? 'md:order-1' : 'md:order-2'}`} />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
