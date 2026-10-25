import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Abaikan rute admin resmi dan API agar tidak terjadi redirect loop
  if (pathname.startsWith('/halo-jurnal/admin') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 2. Tangkap jika user mengetik /admin di URL manapun (misal: /reels/admin, /berita/admin, atau /admin langsung)
  const adminMatch = pathname.match(/\/(admin)(?:$|\/)(.*)/)
  if (adminMatch) {
    const subPath = adminMatch[2] ? `/${adminMatch[2]}` : ''
    return NextResponse.redirect(new URL(`/halo-jurnal/admin${subPath}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, webp, svg, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
