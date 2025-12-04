'use client'

import { useProjectPhasesRealtime } from '@/hooks/use-project-phases-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ProjectPhase } from '@/types'

interface ProjectProgressRealtimeProps {
  projectId: string
  initialPhases: ProjectPhase[]
}

export const ProjectProgressRealtime = ({
  projectId,
  initialPhases,
}: ProjectProgressRealtimeProps) => {
  const { phases, progress } = useProjectPhasesRealtime({ projectId, initialPhases })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progreso General</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{progress}%</span>
            <Badge variant={progress === 100 ? 'default' : 'secondary'}>
              {progress === 100 ? 'Completado' : 'En progreso'}
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {phases.filter((p) => p.status === 'completed').length} de {phases.length} fases
            completadas
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

