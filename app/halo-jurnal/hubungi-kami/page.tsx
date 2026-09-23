'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'

export default function HaloJurnalHubungiKamiPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    }, 1200)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-6 pt-8 pb-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          Hubungi Tim Halo Jurnal
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed">
          Punya pertanyaan seputar verifikasi akun, kendala teknis, atau kemitraan publik? Tim kami siap membantu Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="bg-gradient-to-br from-primary to-[#8b1e2c] text-white rounded-3xl p-6 sm:p-8 shadow-md">
          <h2 className="font-heading font-bold text-xl mb-4">Informasi Kontak Redaksi</h2>
          <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-6">
            Layanan dukungan Halo Jurnal dikelola oleh tim PT Media Jurnal Sukabumi.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-rose-200">Email Resmi</p>
                <p className="text-sm font-medium mt-0.5">redaksi@jurnalsukabumi.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-rose-200">Hotline WhatsApp</p>
                <p className="text-sm font-medium mt-0.5">+62 812-3456-7890</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-rose-200">Kantor Redaksi</p>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5 leading-relaxed">
                  Jl. RE Martadinata No. 12, Kota Sukabumi, Jawa Barat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-on-surface mb-4">Kirim Pesan</h2>

          {success ? (
            <div className="p-6 text-center bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-sm">Pesan Berhasil Terkirim!</p>
              <p className="text-xs text-emerald-700 mt-1">
                Terima kasih, tim kami akan menanggapi pesan Anda secepatnya.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Nama Anda
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Pesan / Pertanyaan
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan pesan Anda..."
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Kirim Pesan</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
