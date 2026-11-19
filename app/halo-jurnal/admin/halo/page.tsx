'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminHaloJurnalRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/halo-jurnal/admin')
  }, [router])

  return (
    <div className="py-20 text-center text-xs text-slate-400">
      Mengalihkan ke Dashboard Terpadu...
    </div>
  )
}
