'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'

export default function LogoutButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/halo-jurnal'
    } catch (err) {
      console.error(err)
      window.location.href = '/halo-jurnal'
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/50 hover:border-transparent px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${className}`}
      title="Keluar dari akun"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Keluar...</span>
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </>
      )}
    </button>
  )
}
