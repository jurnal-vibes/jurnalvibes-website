'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

interface CategoryCardsProps {
  isLoggedIn?: boolean
}

export default function CategoryCards({ isLoggedIn: _isLoggedIn }: CategoryCardsProps) {
  const router = useRouter()

  const handleCategoryClick = (type: 'pengaduan' | 'aspirasi' | 'informasi' | 'inspirasi', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/halo-jurnal/lapor?type=${type}`)
  }

  const cards = [
    {
      type: 'pengaduan' as const,
      title: 'Pengaduan',
      desc: 'Laporkan masalah pelayanan publik, jalan rusak, fasilitas, atau ketertiban.',
      actionText: 'Buat Laporan',
      actionColor: 'text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300',
      hoverBorder: 'hover:border-rose-400/50',
      hoverGlow: 'via-rose-500/60',
    },
    {
      type: 'aspirasi' as const,
      title: 'Aspirasi',
      desc: 'Sampaikan gagasan, usulan konstruktif, atau harapan demi kemajuan Sukabumi.',
      actionText: 'Kirim Aspirasi',
      actionColor: 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300',
      hoverBorder: 'hover:border-amber-400/50',
      hoverGlow: 'via-amber-500/60',
    },
    {
      type: 'informasi' as const,
      title: 'Informasi',
      desc: 'Ajukan permohonan keterbukaan informasi dan data publik instansi daerah.',
      actionText: 'Minta Informasi',
      actionColor: 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300',
      hoverBorder: 'hover:border-blue-400/50',
      hoverGlow: 'via-blue-500/60',
    },
    {
      type: 'inspirasi' as const,
      title: 'Inspirasi',
      desc: 'Ceritakan kisah inspiratif dan karya gotong royong warga untuk dipublikasikan.',
      actionText: 'Bagikan Cerita',
      actionColor: 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
      hoverBorder: 'hover:border-emerald-400/50',
      hoverGlow: 'via-emerald-500/60',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card) => {
        return (
          <div
            key={card.type}
            onClick={(e) => handleCategoryClick(card.type, e)}
            className={`group relative bg-surface/90 dark:bg-slate-900/90 backdrop-blur-md border border-outline-variant/70 ${card.hoverBorder} rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between select-none overflow-hidden`}
          >
            {/* Top Accent Glow on Hover */}
            <div className={`absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent ${card.hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface mb-2 tracking-tight group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed line-clamp-3 mb-5">
                {card.desc}
              </p>
            </div>

            <div className={`pt-3.5 border-t border-outline-variant/40 flex items-center justify-between text-xs font-semibold tracking-tight transition-all ${card.actionColor}`}>
              <span>{card.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
