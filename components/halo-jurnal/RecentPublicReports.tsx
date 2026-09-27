'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, CheckCircle2, Clock, ShieldCheck, AlertTriangle } from 'lucide-react'
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

        // Filter ketat: HANYA yang berstatus publik (is_public !== false)
        return allReports.filter((r) => r.is_public !== false).slice(0, 3)
      } catch (err) {
        console.error('Error loading public reports on client:', err)
      }
    }

    // SSR fallback: pastikan hanya is_public !== false
    return source.filter((r: any) => r.is_public !== false).slice(0, 3)
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {reports.map((report) => (
        <Link
          key={report.id}
          href={`/halo-jurnal/laporan/${report.id}`}
          className="group bg-surface border border-outline-variant/80 hover:border-primary/40 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="p-5 flex-1">
            <div className="flex justify-between items-start gap-2 mb-3">
              {report.status === 'selesai' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                  <CheckCircle2 className="w-3 h-3" />
                  {report.jenis === 'inspirasi' ? 'Tayang' : 'Selesai'}
                </span>
              )}
              {report.status === 'diproses' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                  <Clock className="w-3 h-3" />
                  Diproses
                </span>
              )}
              {report.status === 'diterima' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/50">
                  <Clock className="w-3 h-3" />
                  Diterima
                </span>
              )}
              {report.status === 'ditindaklanjuti' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200/50">
                  <ShieldCheck className="w-3 h-3" />
                  Ditindaklanjuti
                </span>
              )}

              <span className="text-[11px] font-medium text-secondary flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {report.created_at ? new Date(report.created_at).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>

            <h3 className="font-heading font-bold text-base text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {report.judul}
            </h3>
            <p className="text-secondary text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
              {report.deskripsi}
            </p>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{report.lokasi || 'Sukabumi'}</span>
            </div>
          </div>

          {report.laporan_lampiran &&
            report.laporan_lampiran.length > 0 &&
            report.laporan_lampiran[0].file_url && (
              <div className="h-44 relative overflow-hidden bg-surface-container-high">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={report.judul}
                  src={report.laporan_lampiran[0].file_url}
                />
              </div>
            )}
        </Link>
      ))}
    </div>
  )
}
