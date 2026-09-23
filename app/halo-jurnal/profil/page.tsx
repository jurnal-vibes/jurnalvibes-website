'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import LogoutButton from '@/components/halo-jurnal/LogoutButton'
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Loader2,
  CreditCard,
  AlertCircle,
} from 'lucide-react'

export default function HaloJurnalProfilPage() {
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        // Demo fallback
        setUser({ id: 'demo-user-id', email: 'warga@sukabumi.com' })
        setProfile({
          full_name: 'Warga Sukabumi',
          role: 'citizen',
          phone_number: '081234567890',
          ktp_verified: true,
        })
        setFullName('Warga Sukabumi')
        setPhone('081234567890')
        setLoading(false)
        return
      }

      setUser(authUser)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (prof) {
        setProfile(prof)
        setFullName(prof.full_name || authUser.user_metadata?.full_name || '')
        setPhone(prof.phone_number || '')
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.id === 'demo-user-id') {
      setProfile((prev: any) => ({ ...prev, full_name: fullName, phone_number: phone }))
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) => ({ ...prev, full_name: fullName, phone_number: phone }))
      setEditing(false)
      alert('Profil berhasil diperbarui!')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      alert(`Gagal memperbarui profil: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-secondary">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs">Memuat profil akun...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-6 pt-8 pb-16">
      <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-outline-variant/60 text-center sm:text-left">
          <UserAvatar
            name={profile?.full_name || user?.email}
            size="xl"
            bgColor="primary"
            className="w-20 h-20 text-2xl font-black shadow-md border-2 border-white/50 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight">
                {profile?.full_name || 'Pengguna Halo Jurnal'}
              </h1>
              {profile?.ktp_verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                  <ShieldCheck className="w-3 h-3" />
                  KTP Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                  <AlertCircle className="w-3 h-3" />
                  Belum Verifikasi KTP
                </span>
              )}
            </div>

            <p className="text-xs text-secondary mb-4">
              Peran Akun:{' '}
              <span className="font-semibold text-primary capitalize">{profile?.role || 'Warga'}</span>
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Profile Info Form / Details */}
        <div className="pt-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Alamat Email
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold truncate mt-0.5">
                    {user?.email || '-'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Nomor WhatsApp
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold truncate mt-0.5">
                    {profile?.phone_number || '-'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Status Verifikasi KTP
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold mt-0.5">
                    {profile?.ktp_verified ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-start gap-3">
                <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    ID Warga
                  </p>
                  <p className="text-xs sm:text-sm text-on-surface font-mono font-semibold truncate mt-0.5">
                    {user?.id ? `USR-${user.id.substring(0, 8)}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
