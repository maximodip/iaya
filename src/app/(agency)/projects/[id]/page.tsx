import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProjectPhases } from '@/components/agency/project-phases'
import { ProjectProgressRealtime } from '@/components/agency/project-progress-realtime'
import { ArrowLeft, Calendar, User, FileText, ExternalLink } from 'lucide-react'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
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

  const { data: project } = await supabase
    .from('projects')
    .select('*, clients(id, name, email), project_phases(*)')
    .eq('id', id)
    .eq('agency_id', agencyOwner.agency_id)
    .single()

  if (!project) {
    notFound()
  }

  // Sort phases by order
  const sortedPhases = [...(project.project_phases || [])].sort(
    (a, b) => a.order - b.order
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a proyectos
          </Link>
        </Button>
      </div>

      <PageHeader title={project.name} description={project.description || undefined} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Info Sidebar */}
        <div className="space-y-6">
          <ProjectProgressRealtime projectId={project.id} initialPhases={sortedPhases} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {project.clients ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(project.clients.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.clients.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.clients.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Sin cliente asignado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium">{formatDate(project.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Total de fases</p>
                  <p className="font-medium">{sortedPhases.length} fases</p>
                </div>
              </div>
              {project.document_url && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-muted-foreground">Documento</p>
                    <a
                      href={`/api/projects/${project.id}/document`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Ver documento
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phases */}
        <div className="lg:col-span-2">
          <ProjectPhases projectId={project.id} phases={sortedPhases} />
        </div>
      </div>
    </div>
  )
}

