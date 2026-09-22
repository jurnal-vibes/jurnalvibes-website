'use client';

import React from 'react';

interface FilterChipsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  counts?: Record<string, number>;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 mb-6">
      {categories.map((cat, idx) => {
        const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
        const count = counts ? counts[cat] : undefined;

        return (
          <button
            key={idx}
            onClick={() => onSelectCategory(cat)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-primary text-on-primary shadow-2xs'
                : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant border border-outline-variant/40'
            }`}
          >
            <span>{cat}</span>
            {count !== undefined && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-colors ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-on-surface/10 text-on-surface-variant'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

