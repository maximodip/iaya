'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, FileText, ArrowRight } from 'lucide-react'
import type { Project } from '@/types'

interface ProjectsGridProps {
  projects: Array<
    Project & {
      clients: { name: string } | null
      project_phases: Array<{ id: string; status: string }>
    }
  >
}

export const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
  const calculateProgress = (phases: Array<{ status: string }>) => {
    if (phases.length === 0) return 0
    const completed = phases.filter((p) => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  const getProjectStatus = (phases: Array<{ status: string }>) => {
    if (phases.length === 0) return { label: 'Sin fases', variant: 'outline' as const }
    if (phases.every((p) => p.status === 'completed')) {
      return { label: 'Completado', variant: 'default' as const }
    }
    if (phases.some((p) => p.status === 'in_progress' || p.status === 'completed')) {
      return { label: 'En proceso', variant: 'secondary' as const }
    }
    return { label: 'Pendiente', variant: 'outline' as const }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const progress = calculateProgress(project.project_phases)
        const status = getProjectStatus(project.project_phases)

        return (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1 text-lg">
                    {project.name}
                  </CardTitle>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                {project.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {project.clients ? getInitials(project.clients.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {project.clients?.name || 'Sin cliente'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {project.project_phases.length} fases
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.created_at)}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardFooter>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

