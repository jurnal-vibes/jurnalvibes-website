'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Film } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home, isActive: pathname === '/' },
    { href: '/berita', label: 'Explore', icon: Compass, isActive: pathname === '/berita' },
    { href: '/reels', label: 'Vibes', icon: Film, isActive: pathname === '/reels' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface/90 backdrop-blur-md shadow-lg border-t border-outline-variant/60">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center rounded-2xl px-5 py-1.5 transition-all duration-200 active:scale-95 ${
              item.isActive
                ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/60 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
