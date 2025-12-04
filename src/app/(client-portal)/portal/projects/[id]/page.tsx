import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClientProjectProgressRealtime } from '@/components/client-portal/project-progress-realtime'
import { ProjectPhasesTimelineRealtime } from '@/components/client-portal/project-phases-timeline-realtime'
import { ArrowLeft, Calendar, FileText, ExternalLink } from 'lucide-react'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/dashboard')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*, project_phases(*)')
    .eq('id', id)
    .eq('client_id', client.id)
    .single()

  if (!project) {
    notFound()
  }

  const phases = [...project.project_phases].sort((a, b) => a.order - b.order)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a proyectos
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Card */}
        <div className="lg:col-span-1 space-y-6">
          <ClientProjectProgressRealtime projectId={project.id} initialPhases={phases} />

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Creado el</span>
                </div>
                <p className="font-medium">{formatDate(project.created_at)}</p>
              </div>

              {project.document_url && (
                <div className="border-t pt-4">
                  <a
                    href={`/api/projects/${project.id}/document`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Ver documento del proyecto
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phases Timeline */}
        <ProjectPhasesTimelineRealtime projectId={project.id} initialPhases={phases} />
      </div>
    </div>
  )
}

