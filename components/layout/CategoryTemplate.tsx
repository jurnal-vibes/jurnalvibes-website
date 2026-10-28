'use client';

import React from 'react';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';

interface CategoryTemplateProps {
  title: string;
  description: string;
  articles: Article[];
  categoryName: string;
  allArticles?: Article[];
}

export const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  title,
  description,
  articles,
  categoryName,
}) => {
  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      <header className="flex flex-col gap-2.5 mb-8 pb-4 border-b border-outline-variant/50">
        <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
          {title}
        </h1>
      </header>

      {articles.length > 0 ? (
        <div className="flex flex-col gap-6">
          {articles.map(article => (
            <NewsCard key={article.id} article={article} variant="row" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface-container rounded-2xl border border-outline-variant/60 my-4">
          <p className="text-on-surface-variant font-medium text-sm">
            Belum ada artikel untuk kategori <span className="font-bold text-primary">{categoryName}</span>.
          </p>
        </div>
      )}
    </div>
  );
};
