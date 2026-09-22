'use client';

import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'footer';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  imgClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', imgClassName = '' }) => {
  const heights = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-9 md:h-10',
    lg: 'h-10 sm:h-12 md:h-14'
  };

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      {/* eslint-disable-next-img-element */}
      <img
        src="/logo.webp"
        alt="Jurnal Vibes"
        className={`${heights[size]} w-auto object-contain transition-transform duration-200 group-hover:scale-102 shrink-0 ${imgClassName}`}
      />
    </div>
  );
};
