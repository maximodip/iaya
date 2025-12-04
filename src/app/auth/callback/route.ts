import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user to determine redirect
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user is a client or agency owner
        const { data: agencyOwner } = await supabase
          .from('agency_owners')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (agencyOwner) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Check if they're a client
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (client) {
          return NextResponse.redirect(new URL('/portal', request.url))
        }

        // New user, go to onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    // If there's an error or no user, redirect to login
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}

