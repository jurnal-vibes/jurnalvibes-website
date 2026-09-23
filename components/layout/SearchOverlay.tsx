'use client';

import React, { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, ChevronRight } from 'lucide-react';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { fetchArticlesFromSupabase } from '@/lib/supabase';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery
}) => {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES);

  // Fetch latest articles for live search index
  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await fetchArticlesFromSupabase();
        if (data && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Error fetching articles in SearchOverlay:', err);
      }
    }
    loadArticles();
  }, []);

  // Handle ESC key press & body scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const trendingTags = [
    { label: '#Sukabumi', query: 'Sukabumi' },
    { label: '#KulinerCikole', query: 'Cikole' },
    { label: '#WisataAlam', query: 'Wisata' },
    { label: '#LokerSMI', query: 'Loker' },
    { label: '#FestivalKuliner', query: 'Festival' },
    { label: '#Kampus', query: 'Kampus' }
  ];

  // Perform instant live filtering
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return articles.filter(
      article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.categoryLabel.toLowerCase().includes(query) ||
        (article.subCategory && article.subCategory.toLowerCase().includes(query)) ||
        article.content.toLowerCase().includes(query) ||
        (article.tags && article.tags.some(t => t.toLowerCase().includes(query)))
    );
  }, [searchQuery, articles]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dropdown Panel - Mounts directly beneath the Header */}
      <div className="absolute top-full left-0 w-full bg-surface dark:bg-slate-900 border-b border-outline-variant/60 dark:border-slate-800 shadow-2xl z-40 max-h-[75vh] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="max-w-container-max mx-auto px-4 md:px-6 lg:px-margin-desktop py-4 sm:py-5 flex flex-col gap-4">
          {/* Default State: Trending Tags only */}
          {!searchQuery.trim() ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trending Sekarang</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSearchQuery(tag.query)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-variant/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-outline-variant/50 dark:border-slate-800 text-on-surface dark:text-gray-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <span className="text-primary font-bold">#</span>
                    <span>{tag.label.replace(/^#/, '')}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Active Search Results */}
          {searchQuery.trim() ? (
            <div className="flex flex-col gap-3">
              {/* Results Summary Header */}
              <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant/80 border-b border-outline-variant/40 dark:border-slate-800 pb-2">
                <span>
                  Hasil untuk <strong className="text-on-surface dark:text-white font-bold">&quot;{searchQuery}&quot;</strong>
                </span>
                <span className="text-primary font-bold">
                  {searchResults.length} artikel ditemukan
                </span>
              </div>

              {/* Result Items */}
              {searchResults.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
                  {searchResults.map(article => (
                    <Link
                      key={article.id}
                      href={`/artikel/${article.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl hover:bg-surface-variant/50 dark:hover:bg-slate-800/60 border border-transparent hover:border-outline-variant/40 transition-all group cursor-pointer"
                    >
                      {/* Left Thumbnail */}
                      <div className="relative w-20 sm:w-24 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-surface-variant border border-outline-variant/40">
                        {/* eslint-disable-next-img-element */}
                        <img
                          src={article.imageUrl}
                          alt={article.imageAlt || article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right Details */}
                      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1 justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">
                            {article.categoryLabel || article.category}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/60 font-normal hidden sm:inline">
                            • {article.createdAt || article.publishedDate}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-on-surface dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                        <span className="text-[10px] text-on-surface-variant/60 font-normal sm:hidden">
                          {article.createdAt || article.publishedDate}
                        </span>
                      </div>

                      {/* Arrow Indicator */}
                      <ChevronRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                /* Empty Results State */
                <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2.5">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-on-surface dark:text-white mb-1">
                    Tidak ada artikel ditemukan
                  </p>
                  <p className="text-xs text-on-surface-variant/70 max-w-xs mb-3">
                    Tidak ditemukan artikel yang cocok dengan kata kunci &quot;<span className="text-primary font-semibold">{searchQuery}</span>&quot;.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <span className="text-xs text-on-surface-variant/60 self-center mr-1">Coba cari:</span>
                    {['Kuliner', 'Wisata', 'Sukabumi', 'Loker'].map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSearchQuery(s)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-variant/70 hover:bg-primary hover:text-white text-on-surface transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Dimmed Backdrop Overlay (Starts below header height) */}
      <div
        onClick={onClose}
        className="fixed inset-0 top-16 md:top-20 bg-black/50 backdrop-blur-xs z-30 transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />
    </>
  );
};
