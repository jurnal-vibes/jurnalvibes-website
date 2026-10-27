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
} from 'lucide-react'

// Helper untuk mengekstrak komponen alamat terstruktur dari kalimat domisili gabungan
function parseDomisili(domisiliStr: string) {
  if (!domisiliStr || typeof domisiliStr !== 'string') {
    return { detailAlamat: '', rtRw: '', kelurahan: '', kecamatan: '' }
  }

  const raw = domisiliStr.trim()

  // Format baku pendaftaran: "${detail}, RT/RW ${rtRw}, Kel. ${kelurahan}, Kec. ${kecamatan}, Sukabumi"
  const kecMatch = raw.match(/Kec\.?\s*([^,]+)/i)
  const kelMatch = raw.match(/Kel\.?\s*([^,]+)/i)
  const rtRwMatch = raw.match(/RT\/?RW\s*([^,]+)/i)

  const kecamatan = kecMatch ? kecMatch[1].trim() : ''
  const kelurahan = kelMatch ? kelMatch[1].trim() : ''
  const rtRw = rtRwMatch ? rtRwMatch[1].trim() : ''

  // Ambil detail alamat awal sebelum ", RT/RW" atau ", Kel." atau ", Kec."
  let detailAlamat = raw
  const splitIdx = raw.search(/,\s*RT\/?RW/i)
  if (splitIdx !== -1) {
    detailAlamat = raw.substring(0, splitIdx).trim()
  } else {
    const splitKel = raw.search(/,\s*Kel\.?/i)
    if (splitKel !== -1) {
      detailAlamat = raw.substring(0, splitKel).trim()
    } else {
      const splitKec = raw.search(/,\s*Kec\.?/i)
      if (splitKec !== -1) {
        detailAlamat = raw.substring(0, splitKec).trim()
      }
    }
  }

  return { detailAlamat, rtRw, kelurahan, kecamatan }
}

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
    const handleStorage = () => fetchProfile()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const fetchProfile = () => {
    setLoading(true)
    try {
      let localUser: any = null
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            // Bersihkan data dummy warga lama jika ada
            if (
              parsed &&
              (parsed.id === 'warga-demo' ||
                parsed.id === 'demo-user-id' ||
                parsed.email === 'warga@sukabumi.com' ||
                (typeof parsed.id === 'string' && parsed.id.startsWith('warga-17')))
            ) {
              localStorage.removeItem('halo_jurnal_current_user')
              localUser = null
            } else {
              localUser = parsed
            }
          } catch {}
        }
      }

      if (!localUser) {
        setUser(null)
        setFullName('')
        setPhone('')
        setKecamatan('')
        setKelurahan('')
        setRtRw('')
        setDetailAlamat('')
        return
      }

      // Smart Parser: jika kecamatan/kelurahan/rt_rw belum ada di objek user, ekstrak dari alamat_domisili
      let resolvedKec = localUser.kecamatan || ''
      let resolvedKel = localUser.kelurahan || ''
      let resolvedRtRw = localUser.rt_rw || ''
      let resolvedDetail = localUser.detail_alamat || ''

      const domisiliSource = localUser.alamat_domisili || localUser.domisili || ''
      if ((!resolvedKec || !resolvedKel || !resolvedRtRw || !resolvedDetail) && domisiliSource) {
        const parsed = parseDomisili(domisiliSource)
        if (!resolvedKec) resolvedKec = parsed.kecamatan
        if (!resolvedKel) resolvedKel = parsed.kelurahan
        if (!resolvedRtRw) resolvedRtRw = parsed.rtRw
        if (!resolvedDetail) resolvedDetail = parsed.detailAlamat
      }

      const syncedUser = {
        ...localUser,
        kecamatan: resolvedKec,
        kelurahan: resolvedKel,
        rt_rw: resolvedRtRw,
        detail_alamat: resolvedDetail,
      }

      // Sinkronkan kembali ke localStorage agar terstruktur permanen
      if (
        localUser.kecamatan !== resolvedKec ||
        localUser.kelurahan !== resolvedKel ||
        localUser.rt_rw !== resolvedRtRw ||
        localUser.detail_alamat !== resolvedDetail
      ) {
        try {
          localStorage.setItem('halo_jurnal_current_user', JSON.stringify(syncedUser))
        } catch {}
      }

      setUser(syncedUser)
      setFullName(syncedUser.full_name || syncedUser.name || '')
      setPhone(syncedUser.phone || syncedUser.phone_number || '')
      setKecamatan(resolvedKec)
      setKelurahan(resolvedKel)
      setRtRw(resolvedRtRw)
      setDetailAlamat(resolvedDetail)
    } catch (err) {
      console.error('Fetch profile error:', err)
      setUser(null)
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

    // Sinkronisasi data ke database jika terdaftar
    if (user?.email) {
      try {
        fetch('/api/auth/citizen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-profile',
            email: user.email,
            fullName: fullName.trim(),
            phone: phone.trim(),
            domisili: fullDomisili,
          }),
        }).catch(() => {})
      } catch {}
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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs max-w-md mx-auto w-full">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
            Anda Belum Masuk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Silakan masuk ke akun Anda untuk melihat dan mengelola informasi identitas profil warga.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?redirect=/halo-jurnal/profil"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs text-center"
            >
              Masuk ke Akun
            </Link>
            <Link
              href="/halo-jurnal"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
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

        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
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
              Nama Lengkap
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
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">Nama Lengkap</span>
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
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm capitalize">{user?.kecamatan || '-'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-0.5">Kelurahan / Desa</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm capitalize">{user?.kelurahan || '-'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-0.5">RT / RW</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{user?.rt_rw || '-'}</span>
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
    </div>
  )
}
