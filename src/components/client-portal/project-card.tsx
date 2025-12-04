'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { Project, ProjectPhase } from '@/types'

interface ClientProjectCardProps {
  project: Project & {
    project_phases: ProjectPhase[]
  }
}

export const ClientProjectCard = ({ project }: ClientProjectCardProps) => {
  const phases = [...project.project_phases].sort((a, b) => a.order - b.order)

  const calculateProgress = () => {
    if (phases.length === 0) return 0
    const completed = phases.filter((p) => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  const progress = calculateProgress()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusInfo = () => {
    if (phases.length === 0) {
      return { label: 'Sin fases', color: 'bg-gray-500' }
    }
    if (progress === 100) {
      return { label: 'Completado', color: 'bg-green-500' }
    }
    if (phases.some((p) => p.status === 'in_progress')) {
      return { label: 'En progreso', color: 'bg-yellow-500' }
    }
    return { label: 'Pendiente', color: 'bg-blue-500' }
  }

  const status = getStatusInfo()

  return (
    <Link href={`/portal/projects/${project.id}`}>
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            <div className={`h-3 w-3 rounded-full ${status.color}`} />
          </div>
          {project.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso general</span>
              <Badge variant="secondary">{progress}%</Badge>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Mini phase list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Fases ({phases.filter((p) => p.status === 'completed').length}/{phases.length})
            </p>
            <div className="space-y-1">
              {phases.slice(0, 3).map((phase) => (
                <div
                  key={phase.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      phase.status === 'completed'
                        ? 'text-green-500'
                        : phase.status === 'in_progress'
                        ? 'text-yellow-500'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                  <span
                    className={
                      phase.status === 'completed'
                        ? 'text-muted-foreground line-through'
                        : ''
                    }
                  >
                    {phase.phase_name}
                  </span>
                </div>
              ))}
              {phases.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{phases.length - 3} más...
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(project.created_at)}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            Ver detalles
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

