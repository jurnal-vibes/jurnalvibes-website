'use client';

import React from 'react';
import { CategoryTemplate } from '@/components/layout/CategoryTemplate';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export default function OtomotifPage() {
  const otoArticles = DUMMY_ARTICLES.filter(
    a =>
      a.category === 'otomotif' ||
      a.categoryLabel.toUpperCase() === 'OTOMOTIF' ||
      (a.subCategory || '').toUpperCase() === 'OTOMOTIF'
  );

  return (
    <CategoryTemplate
      title="Otomotif"
      description="Ulasan kendaraan, modifikasi, touring, dan berita dunia otomotif Sukabumi"
      articles={otoArticles}
      categoryName="Otomotif"
      allArticles={DUMMY_ARTICLES}
    />
  );
}
