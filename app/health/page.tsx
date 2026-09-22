'use client';

import React from 'react';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export default function HealthPage() {
  const healthArticles = DUMMY_ARTICLES.filter(
    a =>
      a.category === 'health' ||
      a.categoryLabel.toUpperCase() === 'HEALTH' ||
      (a.subCategory || '').toUpperCase() === 'HEALTH'
  );

  return (
    <CategoryTemplate
      title="Health & Wellness"
      description="Tips kesehatan harian, medis, pola hidup seimbang, dan kebugaran"
      articles={healthArticles}
      categoryName="Health"
      allArticles={DUMMY_ARTICLES}
    />
  );
}
