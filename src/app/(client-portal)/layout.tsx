export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientPortalHeader } from '@/components/client-portal/header'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/shared/theme-provider'

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Verify user is a client and get agency data with all theme/color fields
  const { data: client } = await supabase
    .from('clients')
    .select('*, agencies(*)')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    // If not a client, might be an agency owner
    redirect('/dashboard')
  }

  const agency = client.agencies as any

  // Create a key based on colors and theme to force re-render when they change
  const themeKey = `${agency?.theme || 'dark'}-${agency?.primary_color || ''}-${agency?.secondary_color || ''}`

  return (
    <ThemeProvider 
      key={themeKey}
      theme={agency?.theme || 'dark'} 
      primaryColor={agency?.primary_color || undefined} 
      secondaryColor={agency?.secondary_color || undefined}
    >
      <div className="min-h-screen bg-background">
        <ClientPortalHeader client={client} agency={agency} />
        <main className="container mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

