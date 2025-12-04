export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AgencySidebar } from '@/components/agency/sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

import { ThemeProvider } from '@/components/shared/theme-provider'

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user has completed onboarding
  const { data: agencyOwner } = await supabase
    .from('agency_owners')
    .select('*, agencies(*)')
    .eq('user_id', user.id)
    .single()

  if (!agencyOwner) {
    redirect('/onboarding')
  }

  const agency = agencyOwner.agencies as any

  // Debug: Log agency colors
  console.log('AgencyLayout - Agency colors:', {
    theme: agency?.theme,
    primary_color: agency?.primary_color,
    secondary_color: agency?.secondary_color,
    fullAgency: agency
  })

  // Create a key based on colors and theme to force re-render when they change
  const themeKey = `${agency?.theme || 'dark'}-${agency?.primary_color || ''}-${agency?.secondary_color || ''}`

  return (
    <ThemeProvider 
      key={themeKey}
      theme={agency?.theme || 'dark'} 
      primaryColor={agency?.primary_color || undefined} 
      secondaryColor={agency?.secondary_color || undefined}
    >
      <SidebarProvider>
        <AgencySidebar agency={agency} user={agencyOwner} />
        <SidebarInset>
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto max-w-7xl p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}

