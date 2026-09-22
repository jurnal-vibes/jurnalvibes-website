'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Catat error ke monitoring console
    console.error('Unhandled App Router Error:', error);
  }, [error]);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-16 md:py-24 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-primary flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 stroke-[2.2px]" />
      </div>

      <h1 className="text-2xl sm:text-4xl font-bold font-headline-xl text-on-surface dark:text-white tracking-tight mb-3">
        Terjadi Kendala Teknis
      </h1>

      <p className="max-w-md text-sm sm:text-base text-on-surface-variant/80 dark:text-neutral-400 mb-8 leading-relaxed">
        Mohon maaf, halaman ini mengalami gangguan sementara saat memuat konten. Silakan coba muat ulang atau kembali ke halaman utama.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Muat Ulang Halaman</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-variant/60 hover:bg-surface-variant text-on-surface dark:text-white font-semibold text-sm transition-all border border-black/5 dark:border-white/10 cursor-pointer active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
