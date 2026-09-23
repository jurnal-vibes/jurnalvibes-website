'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Lightbulb, Info, Sparkles, ArrowRight } from 'lucide-react'

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
      icon: AlertTriangle,
      iconBg: 'bg-rose-500/10 text-primary border border-rose-500/20',
      title: 'Pengaduan',
      desc: 'Laporkan masalah pelayanan publik, jalan rusak, fasilitas, atau ketertiban.',
      actionText: 'Buat Laporan',
      actionColor: 'text-primary group-hover:text-primary-dark',
    },
    {
      type: 'aspirasi' as const,
      icon: Lightbulb,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      title: 'Aspirasi',
      desc: 'Sampaikan gagasan, usulan konstruktif, atau harapan demi kemajuan Sukabumi.',
      actionText: 'Kirim Aspirasi',
      actionColor: 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700',
    },
    {
      type: 'informasi' as const,
      icon: Info,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      title: 'Informasi',
      desc: 'Ajukan permohonan keterbukaan informasi dan data publik instansi daerah.',
      actionText: 'Minta Informasi',
      actionColor: 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700',
    },
    {
      type: 'inspirasi' as const,
      icon: Sparkles,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      title: 'Inspirasi',
      desc: 'Ceritakan kisah inspiratif dan karya gotong royong warga untuk dipublikasikan.',
      actionText: 'Bagikan Cerita',
      actionColor: 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.type}
            onClick={(e) => handleCategoryClick(card.type, e)}
            className="group relative bg-surface/90 dark:bg-slate-900/90 backdrop-blur-md border border-outline-variant/70 hover:border-primary/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between select-none overflow-hidden"
          >
            {/* Top Accent Glow on Hover */}
            <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div>
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xs ${card.iconBg}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2px]" />
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface mb-1.5 tracking-tight group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="text-secondary text-xs leading-relaxed line-clamp-2 mb-4">
                {card.desc}
              </p>
            </div>

            <div className={`pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-semibold tracking-tight transition-all ${card.actionColor}`}>
              <span>{card.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
