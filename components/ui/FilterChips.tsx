'use client';

import React from 'react';

interface FilterChipsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="relative w-full mb-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x">
        {categories.map((cat, idx) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-primary text-white font-bold shadow-xs scale-[1.02]'
                  : 'bg-surface-variant/60 text-on-surface-variant hover:bg-surface-variant hover:text-primary border border-outline-variant/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-r from-transparent to-background pointer-events-none" />
    </div>
  );
};
