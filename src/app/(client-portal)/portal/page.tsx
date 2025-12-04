import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, EmptyState } from '@/components/shared'
import { ClientProjectCard } from '@/components/client-portal/project-card'
import { FolderKanban } from 'lucide-react'

export default async function ClientPortalPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, agency_id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/dashboard')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*, project_phases(*)')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Mis Proyectos"
        description="Visualiza el progreso de tus proyectos en tiempo real"
      />

      {projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ClientProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No tienes proyectos asignados"
          description="Contacta a tu agencia para más información sobre tus proyectos"
        />
      )}
    </div>
  )
}

