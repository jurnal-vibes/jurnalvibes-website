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
    },
    {
      type: 'aspirasi' as const,
      title: 'Aspirasi',
      desc: 'Sampaikan gagasan, usulan konstruktif, atau harapan demi kemajuan Sukabumi.',
      actionText: 'Kirim Aspirasi',
    },
    {
      type: 'informasi' as const,
      title: 'Informasi',
      desc: 'Ajukan permohonan keterbukaan informasi dan data publik instansi daerah.',
      actionText: 'Minta Informasi',
    },
    {
      type: 'inspirasi' as const,
      title: 'Inspirasi',
      desc: 'Ceritakan kisah inspiratif dan karya gotong royong warga untuk dipublikasikan.',
      actionText: 'Bagikan Cerita',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {cards.map((card) => {
        return (
          <div
            key={card.type}
            onClick={(e) => handleCategoryClick(card.type, e)}
            className="group relative bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between select-none overflow-hidden"
          >
            {/* Top Accent Line on Hover */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#c00015]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-100 mb-1 sm:mb-2 tracking-tight group-hover:text-[#c00015] dark:group-hover:text-rose-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2.5 sm:mb-5">
                {card.desc}
              </p>
            </div>

            <div className="pt-2 sm:pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs font-semibold tracking-tight text-slate-600 dark:text-slate-400 group-hover:text-[#c00015] dark:group-hover:text-rose-400 transition-colors">
              <span className="truncate pr-1">{card.actionText}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
