'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import LogoutButton from '@/components/halo-jurnal/LogoutButton'
import {
  User,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Loader2,
  MapPin,
  CheckCircle2,
  PlusCircle,
  FileText,
  Phone,
  Mail,
} from 'lucide-react'

export default function HaloJurnalProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Edit fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [kelurahan, setKelurahan] = useState('')
  const [rtRw, setRtRw] = useState('')
  const [detailAlamat, setDetailAlamat] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = () => {
    setLoading(true)
    try {
      let localUser: any = null
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            localUser = JSON.parse(stored)
          } catch {}
        }
      }

      if (!localUser) {
        localUser = {
          id: 'warga-demo',
          email: 'warga@sukabumi.com',
          full_name: 'Warga Sukabumi',
          phone: '081234567890',
          kecamatan: 'Cisaat',
          kelurahan: 'Cibatu',
          rt_rw: 'RT 02 / RW 05',
          detail_alamat: 'Jl. Raya Cisaat No. 120',
          alamat_domisili: 'Jl. Raya Cisaat No. 120, RT/RW 02/05, Kel. Cibatu, Kec. Cisaat, Sukabumi',
          is_verified: true,
          role: 'warga',
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('halo_jurnal_current_user', JSON.stringify(localUser))
          window.dispatchEvent(new Event('storage'))
        }
      }

      setUser(localUser)
      setFullName(localUser.full_name || localUser.name || 'Warga Sukabumi')
      setPhone(localUser.phone || localUser.phone_number || '081234567890')
      setKecamatan(localUser.kecamatan || 'Cisaat')
      setKelurahan(localUser.kelurahan || 'Cibatu')
      setRtRw(localUser.rt_rw || 'RT 02 / RW 05')
      setDetailAlamat(localUser.detail_alamat || localUser.alamat_domisili || 'Jl. Raya Cisaat No. 120')
    } catch (err) {
      console.error('Fetch profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const fullDomisili = `${detailAlamat.trim()}, RT/RW ${rtRw.trim()}, Kel. ${kelurahan.trim()}, Kec. ${kecamatan.trim()}, Sukabumi`

    const updated = {
      ...(user || {}),
      full_name: fullName.trim(),
      name: fullName.trim(),
      phone: phone.trim(),
      phone_number: phone.trim(),
      kecamatan: kecamatan.trim(),
      kelurahan: kelurahan.trim(),
      rt_rw: rtRw.trim(),
      detail_alamat: detailAlamat.trim(),
      alamat_domisili: fullDomisili,
      user_metadata: {
        ...(user?.user_metadata || {}),
        full_name: fullName.trim(),
        phone: phone.trim(),
        alamat_domisili: fullDomisili,
      },
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('halo_jurnal_current_user', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    }

    setUser(updated)
    setSaving(false)
    setEditing(false)
    setNotice('Data profil berhasil diperbarui!')
    setTimeout(() => setNotice(null), 4000)
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Notifikasi Sukses */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. Header Profil Warga (Unified After UX Style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
          <UserAvatar name={user?.full_name || 'Warga Sukabumi'} size="lg" />

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">
                {user?.full_name || 'Warga Sukabumi'}
              </h1>
              <div
                title="Warga Terverifikasi Sukabumi"
                className="inline-flex items-center text-sky-500 hover:text-sky-600 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 fill-sky-500/15 stroke-[2.2px]" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{user?.email}</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
              Warga Aktif Terverifikasi Halo Jurnal Sukabumi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            {editing ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profil</span>
              </>
            )}
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* 2. Mode Edit Form */}
      {editing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            Perbarui Informasi Profil
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap <span className="text-slate-400 font-normal">(Sesuai KTP)</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c00015]/20 focus:border-[#c00015] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nomor WhatsApp Aktif
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c00015]/20 focus:border-[#c00015] transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kecamatan</label>
              <input
                type="text"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c00015]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kelurahan / Desa</label>
              <input
                type="text"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c00015]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">RT / RW</label>
              <input
                type="text"
                value={rtRw}
                onChange={(e) => setRtRw(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c00015]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Detail Jalan &amp; Patokan Rumah</label>
            <textarea
              value={detailAlamat}
              onChange={(e) => setDetailAlamat(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c00015] resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      ) : (
        /* 3. Tampilan Detail Data Profil Resmi (Unified After UX Card) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
          {/* Section: Kontak & Identitas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 stroke-[2px]" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  Kontak &amp; Identitas Pelapor
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Data resmi untuk verifikasi pengaduan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">Nama Lengkap (KTP)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block truncate">{user?.full_name || '-'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">Nomor WhatsApp</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block">
                  {user?.phone || user?.phone_number || '-'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">Alamat Email</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block truncate">{user?.email || '-'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80" />

          {/* Section: Domisili Resmi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 stroke-[2px]" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  Domisili Resmi Pelapor
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Wilayah domisili tempat tinggal saat ini</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-0.5">Kecamatan</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{user?.kecamatan || 'Cisaat'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-0.5">Kelurahan / Desa</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{user?.kelurahan || 'Cibatu'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-0.5">RT / RW</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{user?.rt_rw || 'RT 02 / RW 05'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">Alamat Lengkap</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
                {user?.alamat_domisili || user?.detail_alamat || 'Sukabumi, Jawa Barat'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Menu Cepat */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href="/halo-jurnal/lapor"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white font-heading font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </Link>
        <Link
          href="/halo-jurnal/laporan-saya"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-heading font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Riwayat Laporan Saya</span>
        </Link>
      </div>
    </div>
  )
}
