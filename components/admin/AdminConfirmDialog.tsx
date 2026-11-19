'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { AlertTriangle, Trash2, HelpCircle, Check, X } from 'lucide-react'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
}

type ConfirmContextType = (options: ConfirmOptions | string) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider')
  }
  return context
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    options: ConfirmOptions
  }>({
    isOpen: false,
    options: { message: '' },
  })

  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      const parsedOptions: ConfirmOptions =
        typeof options === 'string'
          ? { message: options, title: 'Konfirmasi Tindakan' }
          : options

      setDialogState({
        isOpen: true,
        options: parsedOptions,
      })
    })
  }, [])

  const handleClose = useCallback((result: boolean) => {
    setDialogState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }, [])

  // Keyboard navigation: Escape untuk batal
  useEffect(() => {
    if (!dialogState.isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogState.isOpen, handleClose])

  const { isOpen, options } = dialogState
  const variant = options.variant || 'danger'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => handleClose(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden p-5 space-y-3.5 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Icon */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                  variant === 'danger'
                    ? 'bg-red-50 text-[#c00015] border-red-100'
                    : variant === 'warning'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : variant === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}
              >
                {variant === 'danger' ? (
                  <Trash2 className="w-4.5 h-4.5" />
                ) : variant === 'warning' ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : variant === 'success' ? (
                  <Check className="w-4.5 h-4.5" />
                ) : (
                  <HelpCircle className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                  {options.title || 'Konfirmasi'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal whitespace-pre-line">
                  {options.message}
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {options.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                  variant === 'danger'
                    ? 'bg-[#c00015] hover:bg-[#a00012]'
                    : variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <span>{options.confirmText || (variant === 'danger' ? 'Hapus' : 'Ya, Lanjut')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
