import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  // Skip middleware if Supabase credentials are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname.startsWith('/api/')

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    // For API routes, return JSON error instead of HTML redirect
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If logged in and trying to access auth pages
  if (user && (pathname === '/login' || pathname === '/register') && !isApiRoute) {
    // Check if user is a client or agency owner
    const { data: agencyOwner } = await supabase
      .from('agency_owners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const url = request.nextUrl.clone()
    
    if (agencyOwner) {
      url.pathname = '/dashboard'
    } else {
      // Check if they're a client
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (client) {
        url.pathname = '/portal'
      } else {
        // New user, go to onboarding
        url.pathname = '/onboarding'
      }
    }
    
    return NextResponse.redirect(url)
  }

  // Redirect clients trying to access agency routes
  const isAgencyRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/clients') || pathname.startsWith('/projects') || pathname.startsWith('/settings')
  if (user && isAgencyRoute && !isApiRoute) {
    const { data: agencyOwner } = await supabase
      .from('agency_owners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agencyOwner) {
      // Check if they're a client
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const url = request.nextUrl.clone()
      if (client) {
        url.pathname = '/portal'
      } else {
        // New user without agency or client, redirect to onboarding
        url.pathname = '/onboarding'
      }
      return NextResponse.redirect(url)
    }
  }

  // Redirect agency owners trying to access client portal
  if (user && pathname.startsWith('/portal') && !isApiRoute) {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!client) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
