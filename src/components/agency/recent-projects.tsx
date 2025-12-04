'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FolderKanban, ArrowRight, Plus } from 'lucide-react'
import { EmptyState } from '@/components/shared'

interface RecentProjectsProps {
  projects: Array<{
    id: string
    name: string
    clients: { name: string } | null
    project_phases: Array<{ status: string }>
    created_at: string
  }>
}

export const RecentProjects = ({ projects }: RecentProjectsProps) => {
  const calculateProgress = (phases: Array<{ status: string }>) => {
    if (phases.length === 0) return 0
    const completed = phases.filter((p) => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Proyectos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FolderKanban}
            title="Sin proyectos"
            description="Crea tu primer proyecto para comenzar"
          >
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear Proyecto
              </Link>
            </Button>
          </EmptyState>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Proyectos Recientes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => {
            const progress = calculateProgress(project.project_phases)
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.clients?.name || 'Sin cliente asignado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                </div>
                <Progress value={progress} className="mt-3 h-2" />
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

