'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { Article } from '@/types';

export function HubungiKamiClient({ articles = [] }: { articles?: Article[] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastWaUrl, setLastWaUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const targetPhone = '6282111651470';
    const lines = [
      `*Halo Tim Redaksi Jurnal Wave,*`,
      `Saya ingin mengirim pesan/korespondensi melalui formulir website:`,
      ``,
      `• *Nama Lengkap:* ${formData.name}`,
      `• *Alamat Email:* ${formData.email}`,
      formData.phone ? `• *No. Telepon/WA:* ${formData.phone}` : null,
      formData.subject ? `• *Kategori/Subjek:* ${formData.subject}` : null,
      ``,
      `*Isi Pesan:*`,
      formData.message,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
    setLastWaUrl(waUrl);
    setSubmitted(true);

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col gap-6">
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
            <div className="text-xs sm:text-sm space-y-2 text-on-surface/90 dark:text-gray-300">
              <p>
                Telepon / WhatsApp:{' '}
                <a href="tel:082111651470" className="font-bold text-on-surface dark:text-white hover:text-primary hover:underline">
                  082111651470
                </a>
                {' '}/{' '}
                <a href="tel:081572738335" className="font-bold text-on-surface dark:text-white hover:text-primary hover:underline">
                  081572738335
                </a>
              </p>
              <p>
                Email Redaksi:{' '}
                <a href="mailto:redaksi@jurnalsukabumi.com" className="font-bold text-primary hover:underline">
                  redaksi@jurnalsukabumi.com
                </a>
              </p>
              <p>
                Email Iklan &amp; Bisnis:{' '}
                <a href="mailto:iklan@jurnalsukabumi.com" className="font-bold text-primary hover:underline">
                  iklan@jurnalsukabumi.com
                </a>
              </p>
              <p>
                Email Umum:{' '}
                <a href="mailto:jurnal.smi@gmail.com" className="font-bold text-primary hover:underline">
                  jurnal.smi@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Form Kontak Editorial */}
        <section className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 md:p-6">
          <h2 className="text-base font-bold text-on-surface dark:text-white mb-1">
            Kirim Pesan / Pengaduan Redaksi
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-gray-400 mb-5">
            Silakan kirimkan pertanyaan, hak jawab, rilis berita, atau informasi publik. Pesan akan diteruskan langsung ke WhatsApp resmi redaksi.
          </p>

          {submitted ? (
            <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base">Pesan Disiapkan ke WhatsApp Redaksi</h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                WhatsApp resmi redaksi (<strong>0821-1165-1470</strong>) telah disiapkan dengan draf pesan Anda. Jika jendela chat belum terbuka secara otomatis, silakan klik tombol di bawah untuk melanjutkan:
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {lastWaUrl && (
                  <a
                    href={lastWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Lanjutkan Chat di WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  Tulis pesan baru
                </button>
              </div>
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer text-center"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesan ke WhatsApp Redaksi</span>
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
