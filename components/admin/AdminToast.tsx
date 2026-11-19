'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export interface AdminToastProps {
  message: string | null
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function AdminToast({
  message,
  type = 'success',
  onClose,
}: AdminToastProps) {
  if (!message) return null

  const isError = type === 'error'
  const isInfo = type === 'info'

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[100] max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
      <div
        className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-semibold backdrop-blur-md bg-white/98 text-slate-800 border ${
          isError
            ? 'border-red-300 shadow-red-950/5'
            : isInfo
            ? 'border-blue-300 shadow-blue-950/5'
            : 'border-emerald-300 shadow-emerald-950/5'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            isError
              ? 'bg-red-50 text-[#c00015]'
              : isInfo
              ? 'bg-blue-50 text-blue-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {isError ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : isInfo ? (
            <Info className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="flex-1 leading-snug text-slate-800 font-medium">
          {message}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0 ml-1"
          title="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
