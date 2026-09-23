import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/halo-jurnal/beranda'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin

  let redirectTo = `${redirectBase}${next}`

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ? parseCookies(request.headers.get('cookie')!)
            : []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  let authenticated = false

  // Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      authenticated = true

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Warga',
            role: 'citizen',
            ktp_verified: false,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )
      }
    } else {
      console.error('exchangeCodeForSession error:', error.message)
    }
  }

  // Handle token_hash flow
  if (!authenticated && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery',
    })
    if (!error) {
      authenticated = true

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Warga',
            role: 'citizen',
            ktp_verified: false,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )
      }
    } else {
      console.error('verifyOtp error:', error.message)
    }
  }

  if (authenticated) {
    if ((next === '/beranda' || next === '/halo-jurnal/beranda') && !token_hash) {
      redirectTo = `${redirectBase}/auth/complete-profile?next=/halo-jurnal/beranda`
    } else {
      redirectTo = `${redirectBase}${next}`
    }
  } else {
    redirectTo = `${redirectBase}/login?error=auth`
  }

  const finalResponse = NextResponse.redirect(redirectTo)
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return finalResponse
}

function parseCookies(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    return { name: name.trim(), value: rest.join('=').trim() }
  })
}
