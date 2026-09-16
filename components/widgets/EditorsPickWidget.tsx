'use client';

import React from 'react';
import Link from 'next/link';
import { Article } from '@/types';

interface EditorsPickWidgetProps {
  articles: Article[];
}

export const EditorsPickWidget: React.FC<EditorsPickWidgetProps> = ({ articles }) => {
  const editorsPicks = articles.filter(a => a.isEditorsPick).slice(0, 2);

  return (
    <div>
      <h3 className="text-label-caps text-on-surface-variant mb-4 px-4 uppercase tracking-wider">
        Editor&apos;s Pick
      </h3>
      <div className="flex flex-col gap-4 px-4">
        {editorsPicks.map(article => (
          <Link
            key={article.id}
            href={`/artikel/${article.id}`}
            className="group cursor-pointer block"
          >
            <p className="font-button text-on-surface group-hover:text-primary transition-colors line-clamp-2 text-sm font-medium">
              {article.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
