'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LogIn,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from './LogoutButton'

export default function HaloJurnalHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogoClick = (e: React.MouseEvent) => {
    const haloHome = user ? '/halo-jurnal/beranda' : '/halo-jurnal'
    if (pathname === haloHome || pathname === '/halo-jurnal' || pathname === '/halo-jurnal/beranda') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(haloHome)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          setUser(data.user)
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single()
          if (prof?.full_name) {
            setFullName(prof.full_name)
          }
        } else if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('halo_jurnal_current_user')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              setUser(parsed)
              setFullName(parsed.full_name || parsed.user_metadata?.full_name || 'Warga Sukabumi')
            } catch {}
          } else {
            setUser(null)
            setFullName(null)
          }
        }
      } catch (err) {
        console.error('Error fetching user for header:', err)
      } finally {
        setCheckedAuth(true)
      }
    }

    checkUser()
    window.addEventListener('storage', checkUser)
    window.addEventListener('focus', checkUser)
    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('focus', checkUser)
    }
  }, [])

  const navLinks = [
    {
      href: user ? '/halo-jurnal/beranda' : '/halo-jurnal',
      label: 'Beranda',
      exact: true,
    },
    {
      href: '/halo-jurnal/lapor',
      label: 'Buat Laporan',
    },
    {
      href: '/halo-jurnal/feed-publik',
      label: 'Feed Publik',
    },
    {
      href: '/halo-jurnal/laporan-saya',
      label: 'Laporan Saya',
    },
    {
      href: '/halo-jurnal/profil',
      label: 'Profil',
    },
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href || (href === '/halo-jurnal' && pathname === '/halo-jurnal/beranda')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/60 transition-colors duration-300">
      <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 gap-2 md:gap-4">
        {/* Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link
            href={user ? '/halo-jurnal/beranda' : '/halo-jurnal'}
            onClick={handleLogoClick}
            className="flex items-center gap-2.5"
            title="Halo Jurnal - Layanan Aspirasi & Pengaduan Warga"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-2xs overflow-hidden shrink-0">
              <img
                src="/halo-jurnal-icon.webp"
                alt="Halo Jurnal Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg sm:text-xl leading-none text-on-surface tracking-tight">
                Halo Jurnal
              </span>
              <span className="text-[10px] sm:text-[11px] text-secondary font-medium tracking-tight mt-0.5">
                Aspirasi &amp; Aduan Sukabumi
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex flex-1 items-center justify-center min-w-0">
          <div className="flex items-center gap-6 text-sm font-medium text-on-surface">
            {navLinks.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-primary transition-colors py-1 ${
                    active
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Right Controls: Portal Back Button & User Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
          {/* Quick Link back to News Portal */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-outline-variant/60 hover:border-primary/40 bg-surface-container-low hover:bg-surface-variant/80 text-on-surface text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-2xs group"
            title="Kembali ke Portal Jurnal Vibes"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary group-hover:-translate-x-0.5 transition-transform" />
            <span>Portal Jurnal Vibes</span>
          </Link>

          {/* Auth Button / Profile */}
          {checkedAuth ? (
            user ? (
              <div className="flex items-center gap-2">
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            )
          ) : null}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Full-Screen Menu - sibling of header to avoid stacking context clipping */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-[9999] flex flex-col bg-surface animate-in slide-in-from-top-2 duration-200">
        {/* Top bar */}
        <div className="flex justify-between items-center px-4 h-16 border-b border-outline-variant/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
              <img src="/halo-jurnal-icon.webp" alt="Halo Jurnal Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-none text-on-surface tracking-tight">Halo Jurnal</span>
              <span className="text-[10px] text-secondary font-medium tracking-tight mt-0.5">Aspirasi & Aduan Sukabumi</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-on-surface hover:bg-surface-variant/80 transition-colors cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1">
          {/* Back to portal */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-surface-container-low border border-outline-variant text-xs font-bold text-primary mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Kembali ke Portal Jurnal Vibes</span>
          </Link>

          {/* Main nav */}
          {navLinks.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'text-primary font-bold bg-primary/10 border border-primary/30'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Secondary links */}
          <div className="mt-4 pt-4 border-t border-outline-variant/60 flex flex-col gap-1">
            <Link
              href="/halo-jurnal/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              Tentang Halo Jurnal
            </Link>
            <Link
              href="/halo-jurnal/syarat-ketentuan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              Syarat & Ketentuan
            </Link>
            <Link
              href="/halo-jurnal/kebijakan-privasi"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/halo-jurnal/hubungi-kami"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>

        {/* Auth button at bottom */}
        <div className="px-4 py-4 border-t border-outline-variant/60 shrink-0">
          {checkedAuth && (
            user ? (
              <LogoutButton />
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Halo Jurnal</span>
              </Link>
            )
          )}
        </div>
      </div>
    )}
    </>
  )
}
