'use client';

import React from 'react';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export default function SciencePage() {
  const scienceArticles = DUMMY_ARTICLES.filter(
    a =>
      a.category === 'science' ||
      a.categoryLabel.toUpperCase() === 'SCIENCE' ||
      (a.subCategory || '').toUpperCase() === 'SCIENCE'
  );

  return (
    <CategoryTemplate
      title="Science & Environment"
      description="Riset ilmiah, sains populer, dan isu lingkungan terkini seputar Sukabumi"
      articles={scienceArticles}
      categoryName="Science"
      allArticles={DUMMY_ARTICLES}
    />
  );
}
