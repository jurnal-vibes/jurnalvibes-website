'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  Save,
  Check,
  Globe,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Shield,
  RotateCcw,
} from 'lucide-react'

interface SiteSettings {
  portalName: string
  haloJurnalName: string
  tagline: string
  whatsappHotline: string
  emailContact: string
  officeAddress: string
  announcementText: string
  isAnnouncementActive: boolean
  isMaintenanceMode: boolean
}

const DEFAULT_SETTINGS: SiteSettings = {
  portalName: 'Jurnal Wave',
  haloJurnalName: 'Halo Jurnal Sukabumi',
  tagline: 'Suara Anda, Wadah Kami — Media Aspirasi & Advokasi Publik Sukabumi',
  whatsappHotline: '0812-3456-7890',
  emailContact: 'redaksi@jurnalwave.id',
  officeAddress: 'Jl. R.E. Martadinata No. 45, Cikole, Kota Sukabumi, Jawa Barat',
  announcementText: 'Redaksi Halo Jurnal menerima laporan warga 24 jam. Setiap aduan fisik diverifikasi maksimal 1x24 jam kerja.',
  isAnnouncementActive: true,
  isMaintenanceMode: false,
}

export default function AdminPengaturanWebPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Muat data dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_site_settings')
        if (saved) {
          setSettings(JSON.parse(saved))
          return
        }
        localStorage.setItem('jurnal_wave_site_settings', JSON.stringify(DEFAULT_SETTINGS))
      } catch (err) {
        console.error('Error loading site settings:', err)
      }
    }
  }, [])

  // Simpan pengaturan
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_site_settings', JSON.stringify(settings))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving site settings:', err)
      }
    }
    setToastMessage('Pengaturan web dan identitas redaksi berhasil disimpan!')
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Reset ke default
  const handleReset = () => {
    if (confirm('Kembalikan seluruh pengaturan ke standar bawaan?')) {
      setSettings(DEFAULT_SETTINGS)
      if (typeof window !== 'undefined') {
        localStorage.setItem('jurnal_wave_site_settings', JSON.stringify(DEFAULT_SETTINGS))
        window.dispatchEvent(new Event('storage'))
      }
      setToastMessage('Pengaturan dikembalikan ke standar awal.')
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Pengaturan Umum Portal &amp; Redaksi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas media, kontak hotline aduan warga, dan status operasional sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:underline font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Bagian 1: Identitas Media */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-[#c00015]" />
            <h2 className="text-sm font-heading font-bold text-slate-900">
              Identitas &amp; Slogan Media
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Portal Berita Utama:
              </label>
              <input
                type="text"
                value={settings.portalName}
                onChange={(e) => setSettings({ ...settings, portalName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Kanal Aduan Warga:
              </label>
              <input
                type="text"
                value={settings.haloJurnalName}
                onChange={(e) => setSettings({ ...settings, haloJurnalName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline / Slogan Redaksi:
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>
          </div>
        </div>

        {/* Bagian 2: Kontak Resmi & Hotline Aduan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-heading font-bold text-slate-900">
              Hotline Redaksi &amp; Layanan Pengaduan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Hotline Warga:
              </label>
              <input
                type="text"
                value={settings.whatsappHotline}
                onChange={(e) => setSettings({ ...settings, whatsappHotline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Pengaduan &amp; Kerjasama:
              </label>
              <input
                type="email"
                value={settings.emailContact}
                onChange={(e) => setSettings({ ...settings, emailContact: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Kantor Redaksi:
              </label>
              <input
                type="text"
                value={settings.officeAddress}
                onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
              />
            </div>
          </div>
        </div>

        {/* Bagian 3: Pengumuman Redaksi (Running Text) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-heading font-bold text-slate-900">
                Pita Pengumuman Berjalan (Running Text)
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isAnnouncementActive}
                onChange={(e) =>
                  setSettings({ ...settings, isAnnouncementActive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#c00015]"></div>
            </label>
          </div>

          <div className="text-xs space-y-2">
            <label className="block font-semibold text-slate-700">
              Isi Pesan Pengumuman:
            </label>
            <textarea
              rows={2}
              value={settings.announcementText}
              onChange={(e) =>
                setSettings({ ...settings, announcementText: e.target.value })
              }
              placeholder="Ketik teks pengumuman penting yang akan tampil di atas portal..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
            />
            <p className="text-[11px] text-slate-500">
              Status pita pengumuman:{' '}
              <strong className={settings.isAnnouncementActive ? 'text-emerald-700' : 'text-slate-500'}>
                {settings.isAnnouncementActive ? '🟢 Aktif Tayang' : '⚪ Dinonaktifkan'}
              </strong>
            </p>
          </div>
        </div>

        {/* Tombol Simpan Utama */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  )
}
