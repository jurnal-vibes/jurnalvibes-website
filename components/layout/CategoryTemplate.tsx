'use client';

import React from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

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
  allArticles = DUMMY_ARTICLES
}) => {
  return (
    <div className="flex flex-1 mx-auto max-w-container-max w-full px-margin-mobile md:px-margin-desktop gap-gutter py-stack-lg">
      <LeftSidebar articles={allArticles} />

      <main className="w-full md:w-3/4 flex flex-col min-w-0 pr-0 md:pr-12 pb-24 md:pb-stack-lg">
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            {title}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            {description}
          </p>
        </header>

        {articles.length > 0 ? (
          <div className="flex flex-col gap-6">
            {articles.map(article => (
              <NewsCard key={article.id} article={article} variant="row" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant">
            <p className="text-on-surface-variant font-medium">
              Belum ada artikel untuk kategori <span className="font-bold text-primary">{categoryName}</span>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
