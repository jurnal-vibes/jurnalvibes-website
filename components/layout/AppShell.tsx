'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { HeaderNav } from './HeaderNav'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { ChatbotButton } from '../ui/ChatbotButton'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Full-screen distraction-free layout for auth pages
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/daftar') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth')

  // Dedicated sub-portal layout for Halo Jurnal
  const isHaloJurnal = pathname.startsWith('/halo-jurnal')

  if (isAuthPage || isHaloJurnal) {
    return <main className="min-h-screen flex flex-col">{children}</main>
  }

  return (
    <>
      <HeaderNav />
      {children}
      <Footer />
      <BottomNav />
      <ChatbotButton />
    </>
  )
}
