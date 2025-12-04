import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ProjectsGrid } from '@/components/agency/projects-grid'
import { Plus, FolderKanban } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: agencyOwner } = await supabase
    .from('agency_owners')
    .select('agency_id')
    .eq('user_id', user.id)
    .single()

  if (!agencyOwner) {
    redirect('/onboarding')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(name), project_phases(id, status)')
    .eq('agency_id', agencyOwner.agency_id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Proyectos"
        description="Gestiona los proyectos de tu agencia"
      >
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Link>
        </Button>
      </PageHeader>

      {projects && projects.length > 0 ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No hay proyectos"
          description="Crea tu primer proyecto para comenzar a gestionar fases"
        >
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear Proyecto
            </Link>
          </Button>
        </EmptyState>
      )}
    </div>
  )
}

