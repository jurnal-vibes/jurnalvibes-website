'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import HaloJurnalHeader from './HaloJurnalHeader'
import HaloJurnalFooter from './HaloJurnalFooter'
import HaloJurnalBottomNav from './HaloJurnalBottomNav'

export default function HaloJurnalShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/halo-jurnal/admin')

  // Jika di halaman admin, tampilkan dengan latar surface bersih khas Jurnal Wave
  if (isAdmin) {
    return <div className="min-h-screen w-full bg-[#fbf9f9] text-slate-900 antialiased">{children}</div>
  }

  // Jika di halaman warga publik, tampilkan layout portal warga lengkap
  return (
    <div className="min-h-screen flex flex-col w-full bg-surface-container-lowest text-on-surface">
      <HaloJurnalHeader />
      <div className="flex-1 pb-10 md:pb-0">{children}</div>
      <HaloJurnalFooter />
      <HaloJurnalBottomNav />
    </div>
  )
}
