'use client'

import { useProjectPhasesRealtime } from '@/hooks/use-project-phases-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ProjectPhase } from '@/types'

interface ClientProjectProgressRealtimeProps {
  projectId: string
  initialPhases: ProjectPhase[]
}

export const ClientProjectProgressRealtime = ({
  projectId,
  initialPhases,
}: ClientProjectProgressRealtimeProps) => {
  const { phases, progress } = useProjectPhasesRealtime({ projectId, initialPhases })

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Progreso del Proyecto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold">{progress}%</span>
            <Badge
              variant={progress === 100 ? 'default' : 'secondary'}
              className="text-sm"
            >
              {progress === 100 ? 'Completado' : 'En progreso'}
            </Badge>
          </div>
          <Progress value={progress} className="h-4" />
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fases completadas</span>
            <span className="font-medium">
              {phases.filter((p) => p.status === 'completed').length}/{phases.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">En proceso</span>
            <span className="font-medium">
              {phases.filter((p) => p.status === 'in_progress').length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pendientes</span>
            <span className="font-medium">
              {phases.filter((p) => p.status === 'pending').length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

