'use client'

import React, { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] flex font-sans antialiased selection:bg-[#c00015] selection:text-white">
      {/* Sidebar Navigasi Kiri */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Konten Utama Kanan */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-200">
        {/* Topbar Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer Kecil Admin */}
        <footer className="px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white/50">
          © 2026 <strong className="text-slate-800 font-semibold">Jurnal Vibes</strong> &amp;{' '}
          <strong className="text-slate-800 font-semibold">Halo Jurnal</strong> — Portal Redaksi &amp;
          Pusat Kendali Laporan Warga.
        </footer>
      </div>
    </div>
  )
}
