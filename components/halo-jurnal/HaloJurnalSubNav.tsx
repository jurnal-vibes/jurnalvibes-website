'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Megaphone, PlusCircle, Compass, ListChecks, User, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import UserAvatar from './UserAvatar'
import LogoutButton from './LogoutButton'

export default function HaloJurnalSubNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)

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
        }
      } catch (err) {
        console.error('Error fetching user for subnav:', err)
      } finally {
        setCheckedAuth(true)
      }
    }
    checkUser()
  }, [])

  const navLinks = [
    {
      href: user ? '/halo-jurnal/beranda' : '/halo-jurnal',
      label: 'Beranda',
      icon: Megaphone,
      exact: true,
    },
    {
      href: '/halo-jurnal/lapor',
      label: 'Buat Laporan',
      icon: PlusCircle,
      highlight: true,
    },
    {
      href: '/halo-jurnal/feed-publik',
      label: 'Feed Publik',
      icon: Compass,
    },
    {
      href: '/halo-jurnal/laporan-saya',
      label: 'Laporan Saya',
      icon: ListChecks,
    },
    {
      href: '/halo-jurnal/profil',
      label: 'Profil',
      icon: User,
    },
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href || (href === '/halo-jurnal' && pathname === '/halo-jurnal/beranda')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-outline-variant/60 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo / Badge */}
          <Link
            href="/halo-jurnal"
            className="flex items-center gap-2 group shrink-0"
            title="Halo Jurnal - Aspirasi & Pengaduan Warga"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <img
                src="/halo-jurnal-icon.webp"
                alt="Halo Jurnal Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm sm:text-base leading-none text-on-surface tracking-tight group-hover:text-primary transition-colors">
                Halo Jurnal
              </span>
              <span className="text-[10px] text-secondary font-medium tracking-tight">
                Aspirasi & Aduan Warga
              </span>
            </div>
          </Link>

          {/* Navigation Links - Horizontal scroll on mobile */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {navLinks.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all duration-200 select-none ${
                    active
                      ? 'bg-primary text-white shadow-xs'
                      : item.highlight
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Auth Info */}
          <div className="flex items-center gap-2 shrink-0">
            {checkedAuth ? (
              user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/halo-jurnal/profil"
                    className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                    title="Profil Saya"
                  >
                    <UserAvatar
                      name={fullName || user.user_metadata?.full_name || user.email}
                      size="sm"
                      bgColor="primary"
                    />
                    <span className="hidden md:inline-block text-xs font-semibold text-on-surface max-w-[100px] truncate">
                      {fullName || user.user_metadata?.full_name || 'Profil'}
                    </span>
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
