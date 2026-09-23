'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export function HubungiKamiClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col gap-6 pr-0 md:pr-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Hubungi Kami</span>
        </nav>

        {/* Header Dokumen */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-5">
          <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-2">
            Kontak Redaksi &amp; Iklan
          </span>
          <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface dark:text-white leading-tight">
            Hubungi Kami
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-2">
            Saluran komunikasi resmi redaksi, pengaduan pemberitaan, dan layanan kemitraan PT Media Jurnal Sukabumi.
          </p>
        </header>

        {/* Informasi Kontak Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-outline-variant dark:border-slate-800 pb-2 mb-3">
              Kantor Redaksi
            </h2>
            <p className="text-xs sm:text-sm text-on-surface/90 dark:text-gray-300 leading-relaxed">
              <strong>PT Media Jurnal Sukabumi</strong><br />
              Perum Bukit Randu Asri, Blok K, Nomor 14, RT 07 RW 22 Kelurahan/Kecamatan Cibadak, Kabupaten Sukabumi, Jawa Barat.<br />
              <span className="text-on-surface-variant dark:text-gray-400">Kode Pos: 43351</span>
            </p>
          </div>

          <div className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-outline-variant dark:border-slate-800 pb-2 mb-3">
              Kontak &amp; Korespondensi
            </h2>
            <div className="text-xs sm:text-sm space-y-1.5 text-on-surface/90 dark:text-gray-300">
              <p>Telepon / WhatsApp: <strong>082111651470</strong> / <strong>081572738335</strong></p>
              <p>Email Redaksi: <strong>redaksi@jurnalsukabumi.com</strong></p>
              <p>Email Iklan &amp; Bisnis: <strong>iklan@jurnalsukabumi.com</strong></p>
              <p>Email Umum: <strong>jurnal.smi@gmail.com</strong></p>
            </div>
          </div>
        </div>

        {/* Form Kontak Editorial */}
        <section className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 md:p-6">
          <h2 className="text-base font-bold text-on-surface dark:text-white mb-1">
            Kirim Pesan / Pengaduan Redaksi
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-gray-400 mb-5">
            Silakan kirimkan pertanyaan, hak jawab, rilis berita, atau informasi publik melalui formulir berikut.
          </p>

          {submitted ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm">
              <p className="font-bold mb-1">Pesan Anda Berhasil Terkirim</p>
              <p className="text-xs">Terima kasih atas korespondensi Anda. Tim redaksi akan menindaklanjuti pesan Anda secepatnya.</p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                }}
                className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
              >
                Kirim pesan baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-on-surface dark:text-gray-200 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface dark:text-gray-200 mb-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-on-surface dark:text-gray-200 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface dark:text-gray-200 mb-1">
                    Subjek / Kategori
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Pilih Kategori Pesan...</option>
                    <option value="Redaksi">Redaksi / Liputan Berita</option>
                    <option value="Hak Jawab">Pengaduan Konten &amp; Hak Jawab</option>
                    <option value="Iklan">Iklan &amp; Advertorial</option>
                    <option value="Kerja Sama">Kerja Sama &amp; Media Partner</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface dark:text-gray-200 mb-1">
                  Pesan Anda <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan keterangan lengkap pesan Anda..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Kirim Pesan
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
