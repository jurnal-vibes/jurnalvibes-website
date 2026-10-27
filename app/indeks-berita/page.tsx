import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { IndeksBeritaClient } from './IndeksBeritaClient';

export const metadata: Metadata = {
  title: 'Indeks Berita',
  description: 'Telusuri arsip publikasi berita Jurnal Wave berdasarkan rentang tanggal dan kategori.',
  openGraph: {
    title: 'Indeks Berita | Jurnal Wave',
    description: 'Telusuri arsip publikasi berita Jurnal Wave berdasarkan rentang tanggal dan kategori.',
  },
};

export default function IndeksBeritaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16 flex items-center justify-center text-sm text-slate-400">Memuat Indeks Berita...</div>}>
      <IndeksBeritaClient />
    </Suspense>
  );
}
