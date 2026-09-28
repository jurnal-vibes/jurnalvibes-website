'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, CheckCircle2, Clock, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'

interface RecentPublicReportsProps {
  initialReports?: any[]
}

export default function RecentPublicReports({ initialReports = [] }: RecentPublicReportsProps) {
  // Ambil hanya laporan yang publik dari awal
  const getFilteredPublicReports = () => {
    let source = initialReports && initialReports.length > 0 ? initialReports : DUMMY_REPORTS

    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        const userReports = JSON.parse(
          localStorage.getItem('halo_jurnal_user_reports') || '[]'
        )

        // Gabungkan semua laporan
        const combined = [...userReports, ...source]
        const uniqueMap = new Map<string, any>()
        combined.forEach((item) => {
          const key = item.id || item.nomor_tiket || item.ticket_number
          if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, item)
          }
        })

        const allReports = Array.from(uniqueMap.values()).map((r) => {
          const saved = overrides[r.id] || (r.nomor_tiket ? overrides[r.nomor_tiket] : null)
          if (saved) {
            return {
              ...r,
              status: saved.status || r.status,
              is_public: saved.is_public !== undefined ? saved.is_public : r.is_public,
              status_log: saved.status_log || r.status_log,
            }
          }
          return r
        })

        // Filter ketat: HANYA yang berstatus publik (is_public !== false) - Ambil 4 agar sejajar sempurna 4 kolom
        return allReports.filter((r) => r.is_public !== false).slice(0, 4)
      } catch (err) {
        console.error('Error loading public reports on client:', err)
      }
    }

    // SSR fallback: pastikan hanya is_public !== false
    return source.filter((r: any) => r.is_public !== false).slice(0, 4)
  }

  const [reports, setReports] = useState<any[]>(getFilteredPublicReports())

  // Sinkronisasi realtime saat beralih tab dari Admin atau saat storage berubah
  useEffect(() => {
    const syncReports = () => {
      setReports(getFilteredPublicReports())
    }

    // Eksekusi langsung saat mount untuk membaca localStorage
    syncReports()

    window.addEventListener('storage', syncReports)
    window.addEventListener('focus', syncReports)

    return () => {
      window.removeEventListener('storage', syncReports)
      window.removeEventListener('focus', syncReports)
    }
  }, [])

  if (!reports || reports.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-secondary bg-surface rounded-2xl border border-outline-variant/60">
        Belum ada laporan publik saat ini. Jadilah yang pertama menyampaikan laporan!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {reports.map((report) => {
        const imageUrl =
          report.laporan_lampiran &&
          report.laporan_lampiran.length > 0 &&
          report.laporan_lampiran[0].file_url
            ? report.laporan_lampiran[0].file_url
            : null

        const status = (report.status || 'diterima').toLowerCase()
        const formattedDate = report.created_at
          ? new Date(report.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Baru saja'

        return (
          <Link
            key={report.id}
            href={`/halo-jurnal/laporan/${report.id}`}
            className="group bg-surface border border-outline-variant/70 hover:border-primary/50 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
          >
            {/* Top Media Thumbnail */}
            <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-surface-container-high shrink-0">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={report.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low flex flex-col items-center justify-center p-3 text-center border-b border-outline-variant/40">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider font-heading">
                    {report.kategori || 'Pengaduan Publik'}
                  </span>
                </div>
              )}

              {/* Floating Status Badge (Top-Left) */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide capitalize">
                  {status === 'selesai'
                    ? (report.jenis === 'inspirasi' ? 'Tayang' : 'Selesai')
                    : status}
                </span>
              </div>

              {/* Floating Date Badge (Top-Right) */}
              <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-white flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-xs sm:text-sm text-on-surface mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {report.judul}
                </h3>
                <p className="text-secondary text-[11px] sm:text-xs line-clamp-2 leading-relaxed mb-2.5">
                  {report.deskripsi}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-outline-variant/40 text-[11px] text-secondary mt-auto">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{report.lokasi || 'Sukabumi'}</span>
                </div>
                <span className="text-primary font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform text-[11px]">
                  Detail &rarr;
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
