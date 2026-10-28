'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LogIn,
  Menu,
  X,
  Home,
  PlusCircle,
  Rss,
  FileText,
  User,
  Info,
  Scale,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import LogoutButton from './LogoutButton'
import UserAvatar from './UserAvatar'

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
    const checkUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('halo_jurnal_current_user')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (
                parsed &&
                (parsed.id === 'warga-demo' ||
                  parsed.id === 'demo-user-id' ||
                  parsed.id === 'warga-demo-sukabumi' ||
                  parsed.email === 'warga@sukabumi.com' ||
                  (typeof parsed.id === 'string' && parsed.id.startsWith('warga-17')))
              ) {
                localStorage.removeItem('halo_jurnal_current_user')
                setUser(null)
                setFullName(null)
              } else {
                setUser((prev: any) => {
                  if (prev && parsed && prev.id === parsed.id && prev.email === parsed.email) return prev
                  return parsed
                })
                const newName = parsed.full_name || parsed.user_metadata?.full_name || 'Warga Sukabumi'
                setFullName((prev: any) => (prev === newName ? prev : newName))
              }
            } catch {
              setUser(null)
              setFullName(null)
            }
          } else {
            setUser((prev: any) => (prev === null ? prev : null))
            setFullName((prev: any) => (prev === null ? prev : null))
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

  // Pembersihan otomatis sisa-sisa cache laporan/chat dummy lama di browser warga
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('halo_jurnal_dummy_purged_v1')
        if (!hasPurged) {
          localStorage.removeItem('halo_jurnal_user_reports')
          localStorage.removeItem('halo_jurnal_status_overrides')
          localStorage.removeItem('halo_jurnal_read_chats')
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i)
            if (k && k.startsWith('halo_jurnal_chat_')) {
              localStorage.removeItem(k)
            }
          }
          localStorage.setItem('halo_jurnal_dummy_purged_v1', 'true')
        }
      } catch {}
    }
  }, [])

  const navLinks = [
    {
      href: user ? '/halo-jurnal/beranda' : '/halo-jurnal',
      label: 'Beranda',
      icon: Home,
      exact: true,
    },
    {
      href: '/halo-jurnal/lapor',
      label: 'Buat Laporan',
      icon: PlusCircle,
    },
    {
      href: '/halo-jurnal/feed-publik',
      label: 'Feed Publik',
      icon: Rss,
    },
    {
      href: '/halo-jurnal/laporan-saya',
      label: 'Laporan Saya',
      icon: FileText,
    },
    {
      href: '/halo-jurnal/profil',
      label: 'Profil',
      icon: User,
    },
  ]

  const secondaryLinks = [
    {
      href: '/halo-jurnal/tentang',
      label: 'Tentang Hallo Jurnal',
      icon: Info,
    },
    {
      href: '/halo-jurnal/syarat-ketentuan',
      label: 'Syarat & Ketentuan',
      icon: Scale,
    },
    {
      href: '/halo-jurnal/kebijakan-privasi',
      label: 'Kebijakan Privasi',
      icon: ShieldCheck,
    },
    {
      href: '/halo-jurnal/hubungi-kami',
      label: 'Hubungi Kami',
      icon: HelpCircle,
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
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-6 h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 gap-2 md:gap-4">
        {/* Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link
            href={user ? '/halo-jurnal/beranda' : '/halo-jurnal'}
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
            title="Hallo Jurnal - Layanan Aspirasi & Pengaduan Warga"
          >
            {/* Ikon Megafon Asli (Tanpa Efek AI / Ping / Gradien) */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-2xs overflow-hidden shrink-0">
              <img
                src="/halo-jurnal-icon.webp?v=original"
                alt="Hallo Jurnal Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>

            {/* Teks Hallo Jurnal - Tipografi Solid & Natural */}
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl sm:text-[22px] tracking-tight text-on-surface leading-none">
                Hallo Jurnal
              </span>
              <span className="text-[10px] sm:text-[11px] text-secondary font-medium tracking-tight mt-1 leading-tight">
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
            title="Kembali ke Portal Jurnal Wave"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary group-hover:-translate-x-0.5 transition-transform" />
            <span>Portal Jurnal Wave</span>
          </Link>

          {/* Auth Button / Profile (Desktop Only) */}
          {checkedAuth ? (
            user ? (
              <div className="hidden md:flex items-center gap-2">
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
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
            className="md:hidden p-2 rounded-xl text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-transform active:scale-90 touch-manipulation select-none cursor-pointer"
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
        <div className="flex justify-between items-center px-4 h-16 border-b border-outline-variant/60 shrink-0 bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-2xs">
              <img src="/halo-jurnal-icon.webp?v=original" alt="Halo Jurnal Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-none text-on-surface tracking-tight">Halo Jurnal</span>
              <span className="text-[10px] text-secondary font-medium tracking-tight mt-0.5">Aspirasi &amp; Aduan Sukabumi</span>
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
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {/* User profile simpel (tanpa badge hijau) */}
          {checkedAuth && (
            user ? (
              <Link
                href="/halo-jurnal/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60 hover:bg-surface-container-high transition-colors mb-1"
              >
                <UserAvatar
                  name={fullName || user?.full_name || user?.email}
                  size="sm"
                  bgColor="primary"
                  className="w-9 h-9 text-xs font-bold shrink-0 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-on-surface truncate capitalize leading-tight">
                    {fullName || user.full_name || 'Warga Sukabumi'}
                  </p>
                  <p className="text-[11px] text-secondary truncate mt-0.5">
                    {user.email || 'Akun Warga'}
                  </p>
                </div>
              </Link>
            ) : null
          )}

          {/* Back to portal */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-surface-container-low border border-outline-variant text-xs font-bold text-primary mb-2 transition-colors hover:bg-surface-container"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Kembali ke Portal Jurnal Wave</span>
          </Link>

          {/* Main nav - hanya teks tanpa icon & tanpa wadah kotak */}
          <div className="flex flex-col gap-0.5">
            {navLinks.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'text-primary font-bold border-l-2 border-primary bg-primary/5 pl-3.5'
                      : 'text-on-surface font-medium hover:text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Secondary links - hanya teks tanpa icon */}
          <div className="mt-3 pt-3 border-t border-outline-variant/60 flex flex-col gap-0.5">
            {secondaryLinks.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container-high transition-all"
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
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
                <span>Masuk ke Hallo Jurnal</span>
              </Link>
            )
          )}
        </div>
      </div>
    )}
    </>
  )
}
