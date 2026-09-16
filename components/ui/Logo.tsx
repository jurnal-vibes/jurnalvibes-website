'use client';

import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'footer';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const heights = {
    sm: 'h-10 sm:h-12',
    md: 'h-12 sm:h-14 md:h-[68px]',
    lg: 'h-16 sm:h-20'
  };

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      {/* eslint-disable-next-img-element */}
      <img
        src="/logo.webp"
        alt="Jurnal Vibes"
        className={`${heights[size]} w-auto object-contain transition-transform duration-200 group-hover:scale-102 shrink-0`}
      />
    </div>
  );
};
