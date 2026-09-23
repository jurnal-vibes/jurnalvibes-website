'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Memproses kelengkapan profil Anda...')

  useEffect(() => {
    async function completeRegistration() {
      try {
        const sb = createClient()

        // 1. Check user
        const {
          data: { user },
        } = await sb.auth.getUser()
        if (!user) {
          setError('Sesi tidak ditemukan. Silakan login kembali.')
          return
        }

        // 2. Read from localStorage
        const regDataStr = localStorage.getItem('halo_jurnal_registration')
        const ktpBase64 = localStorage.getItem('halo_jurnal_ktp_base64')

        if (!regDataStr || !ktpBase64) {
          const { data: profile } = await sb
            .from('profiles')
            .select('id, ktp_photo_url')
            .eq('id', user.id)
            .single()

          if (profile && profile.ktp_photo_url) {
            const next = searchParams.get('next') ?? '/halo-jurnal/beranda'
            router.push(next)
            return
          } else {
            // Auto complete with fallback profile
            await sb.from('profiles').upsert(
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || 'Warga Sukabumi',
                role: 'citizen',
                ktp_verified: false,
              },
              { onConflict: 'id', ignoreDuplicates: true }
            )
            const next = searchParams.get('next') ?? '/halo-jurnal/beranda'
            router.push(next)
            return
          }
        }

        const regData = JSON.parse(regDataStr)
        setStatus('Mengunggah dokumen verifikasi KTP...')

        // 3. Upload KTP
        const res = await fetch(ktpBase64)
        const blob = await res.blob()
        const fileExt = regData.ktp_file_name.split('.').pop()
        const filePath = `${user.id}/ktp.${fileExt}`

        const { error: uploadError } = await sb.storage
          .from('ktp-photos')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
          })

        let ktpPhotoUrl = null
        if (!uploadError) {
          const { data: publicUrlData } = sb.storage.from('ktp-photos').getPublicUrl(filePath)
          ktpPhotoUrl = publicUrlData.publicUrl
        }

        setStatus('Menyimpan data profil...')

        // 4. Update profile in database
        const { error: profileError } = await sb.from('profiles').upsert(
          {
            id: user.id,
            full_name: regData.full_name,
            phone_number: regData.phone || null,
            ktp_photo_url: ktpPhotoUrl,
            role: 'citizen',
            ktp_verified: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

        if (profileError) {
          console.error('Profile upsert error:', profileError)
        }

        // Clean up localStorage
        localStorage.removeItem('halo_jurnal_registration')
        localStorage.removeItem('halo_jurnal_ktp_base64')

        setStatus('Pendaftaran selesai! Mengalihkan ke dashboard...')
        const next = searchParams.get('next') ?? '/halo-jurnal/beranda'
        router.push(next)
      } catch (err: any) {
        console.error('Error completing registration:', err)
        setError('Terjadi kendala saat menyelesaikan registrasi.')
      }
    }

    completeRegistration()
  }, [router, searchParams])

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 bg-surface-container-lowest">
      <div className="max-w-md w-full bg-surface border border-outline-variant/80 rounded-3xl p-8 text-center shadow-md">
        {error ? (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-extrabold text-xl text-on-surface">Pendaftaran Terkendala</h2>
            <p className="text-xs text-secondary leading-relaxed">{error}</p>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
            >
              Menuju Halaman Masuk
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <h2 className="font-heading font-bold text-lg text-on-surface">Menyiapkan Akun Anda</h2>
            <p className="text-xs text-secondary">{status}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  )
}
