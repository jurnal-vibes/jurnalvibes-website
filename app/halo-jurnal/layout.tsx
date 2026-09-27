import type { Metadata } from 'next'
import HaloJurnalShell from '@/components/halo-jurnal/HaloJurnalShell'

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
  return <HaloJurnalShell>{children}</HaloJurnalShell>
}
