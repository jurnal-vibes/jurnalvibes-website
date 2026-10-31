'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'

export default function HaloJurnalHubungiKamiPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lastWaUrl, setLastWaUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setLoading(true)

    const targetPhone = '6282111651470'
    const lines = [
      `*Halo Tim Hallo Jurnal / Redaksi,*`,
      `Saya ingin mengirim pesan/pertanyaan melalui formulir Hallo Jurnal:`,
      ``,
      `• *Nama Lengkap:* ${name}`,
      `• *Alamat Email:* ${email}`,
      phone ? `• *No. WhatsApp:* ${phone}` : null,
      ``,
      `*Isi Pesan:*`,
      message,
    ].filter(Boolean)

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`
    setLastWaUrl(waUrl)
    setLoading(false)
    setSuccess(true)

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 md:pb-16 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
        <Link href="/halo-jurnal" className="hover:text-primary transition-colors">
          Hallo Jurnal
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
          Saluran komunikasi resmi tim redaksi Hallo Jurnal untuk kendala teknis, verifikasi akun, dan tindak lanjut aduan warga Sukabumi.
        </p>
      </header>

      {/* Grid Informasi & Formulir Pesan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
        {/* Kolom Kiri: Informasi Kantor & Saluran Resmi */}
        <div className="space-y-4">
          <div className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-outline-variant dark:border-slate-800 pb-2 mb-3">
              Kantor Redaksi &amp; Sekretariat
            </h2>
            <p className="text-xs sm:text-sm text-on-surface/90 dark:text-gray-300 leading-relaxed">
              <strong>PT Media Jurnal Sukabumi</strong><br />
              Perum Bukit Randu Asri, Blok K, Nomor 14, RT 07 RW 22 Kelurahan/Kecamatan Cibadak, Kabupaten Sukabumi, Jawa Barat.<br />
              <strong>Kode Pos: 43351</strong>
            </p>
            <div className="mt-4 pt-3 border-t border-outline-variant/60 dark:border-slate-800 space-y-2 text-xs text-on-surface-variant dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  WhatsApp Hotline:{' '}
                  <a href="tel:082111651470" className="text-on-surface dark:text-white font-bold hover:text-primary hover:underline">
                    0821-1165-1470
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  Email Redaksi:{' '}
                  <a href="mailto:redaksi@jurnalsukabumi.com" className="text-on-surface dark:text-white font-bold hover:text-primary hover:underline">
                    redaksi@jurnalsukabumi.com
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Cakupan Wilayah: <strong className="text-on-surface dark:text-white">Kota &amp; Kab. Sukabumi</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 text-xs text-secondary dark:text-gray-400 space-y-2">
            <h3 className="font-bold text-on-surface dark:text-white text-xs uppercase tracking-wider">
              Jam Layanan Verifikasi Aduan
            </h3>
            <p className="leading-relaxed">
              Tim moderator meninjau laporan warga setiap hari kerja (Senin - Sabtu) pukul <strong>08.00 - 17.00 WIB</strong>. Laporan yang masuk di luar jam operasional akan diverifikasi pada hari kerja berikutnya.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Formulir Kirim Pesan */}
        <div className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-outline-variant dark:border-slate-800 pb-2 mb-4">
            Kirim Pesan atau Pertanyaan
          </h2>

          {success ? (
            <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base text-emerald-800 dark:text-emerald-300">Pesan Disiapkan ke WhatsApp Redaksi</h3>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed max-w-sm mx-auto">
                WhatsApp tim redaksi Hallo Jurnal (<strong>0821-1165-1470</strong>) telah disiapkan. Klik tombol di bawah jika jendela chat belum terbuka:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                {lastWaUrl && (
                  <a
                    href={lastWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buka Chat WhatsApp Redaksi</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false)
                    setName('')
                    setEmail('')
                    setPhone('')
                    setMessage('')
                  }}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer py-1"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface dark:text-gray-300 mb-1">
                    WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface dark:text-gray-300 mb-1">
                  Isi Pesan
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan kendala atau pertanyaan Anda..."
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Kirim Pesan ke WhatsApp Redaksi</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
