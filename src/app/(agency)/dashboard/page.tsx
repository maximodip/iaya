import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared'
import { DashboardStats } from '@/components/agency/dashboard-stats'
import { RecentProjects } from '@/components/agency/recent-projects'
import { RecentClients } from '@/components/agency/recent-clients'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get agency owner info with agency data
  const { data: agencyOwner } = await supabase
    .from('agency_owners')
    .select('agency_id, agencies(*)')
    .eq('user_id', user.id)
    .single()

  if (!agencyOwner) {
    redirect('/onboarding')
  }

  const agencyId = agencyOwner.agency_id
  const agency = agencyOwner.agencies as AgencyOwner['agencies']

  interface AgencyOwner {
    agencies: {
      main_objective: string
    }
  }

  // Fetch stats in parallel
  const [clientsResult, projectsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('agency_id', agencyId),
    supabase
      .from('projects')
      .select('id, project_phases(status)')
      .eq('agency_id', agencyId),
  ])

  const totalClients = clientsResult.count || 0
  const projects = projectsResult.data || []
  const totalProjects = projects.length

  // Calculate project status based on phases
  let completedProjects = 0
  let inProgressProjects = 0
  let pendingProjects = 0

  projects.forEach((project) => {
    const phases = project.project_phases || []
    if (phases.length === 0) {
      pendingProjects++
    } else if (phases.every((p: { status: string }) => p.status === 'completed')) {
      completedProjects++
    } else if (phases.some((p: { status: string }) => p.status === 'in_progress' || p.status === 'completed')) {
      inProgressProjects++
    } else {
      pendingProjects++
    }
  })

  // Fetch recent data
  const [recentProjectsResult, recentClientsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('*, clients(name), project_phases(status)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('clients')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={agency?.main_objective || "Resumen de tu agencia y proyectos"}
      />
      <DashboardStats
        totalClients={totalClients}
        totalProjects={totalProjects}
        pendingProjects={pendingProjects}
        inProgressProjects={inProgressProjects}
        completedProjects={completedProjects}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentProjects projects={recentProjectsResult.data || []} />
        <RecentClients clients={recentClientsResult.data || []} />
      </div>
    </div>
  )
}

