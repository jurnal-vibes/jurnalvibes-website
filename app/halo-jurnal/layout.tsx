import type { Metadata } from 'next'
import HaloJurnalHeader from '@/components/halo-jurnal/HaloJurnalHeader'
import HaloJurnalFooter from '@/components/halo-jurnal/HaloJurnalFooter'
import HaloJurnalBottomNav from '@/components/halo-jurnal/HaloJurnalBottomNav'

export const metadata: Metadata = {
  title: {
    default: 'Halo Jurnal - Aspirasi & Pengaduan Warga Sukabumi',
    template: '%s | Halo Jurnal Sukabumi',
  },
  description:
    'Layanan aspirasi dan pengaduan online rakyat Sukabumi. Sampaikan aduan infrastruktur, fasilitas publik, dan aspirasi pembangunan secara cepat dan transparan.',
}

export default function HaloJurnalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-surface-container-lowest text-on-surface">
      <HaloJurnalHeader />
      <div className="flex-1 pb-16 lg:pb-0">{children}</div>
      <HaloJurnalFooter />
      <HaloJurnalBottomNav />
    </div>
  )
}
