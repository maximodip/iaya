import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Mail, Calendar, FolderKanban, Pencil } from 'lucide-react'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
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

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agencyOwner.agency_id)
    .single()

  if (!client) {
    notFound()
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*, project_phases(id, status)')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

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

  const calculateProgress = (phases: Array<{ status: string }>) => {
    if (phases.length === 0) return 0
    const completed = phases.filter((p) => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
      </div>

      <PageHeader title={client.name}>
        <Button variant="outline" asChild>
          <Link href={`/clients/${client.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">Cliente</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Fecha de registro</p>
                  <p className="font-medium">{formatDate(client.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Total de proyectos</p>
                  <p className="font-medium">{projects?.length || 0} proyecto(s)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Proyectos del Cliente</CardTitle>
            <Button size="sm" asChild>
              <Link href={`/projects/new?client=${client.id}`}>
                Nuevo Proyecto
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => {
                  const progress = calculateProgress(project.project_phases || [])
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="mt-3 h-2" />
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{project.project_phases?.length || 0} fases</span>
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderKanban className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground">
                  Este cliente no tiene proyectos asignados
                </p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href={`/projects/new?client=${client.id}`}>
                    Crear Primer Proyecto
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

