'use client'

import { useProjectPhasesRealtime } from '@/hooks/use-project-phases-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhaseBadge } from '@/components/shared'
import { CheckCircle2, Circle, Clock, FileText } from 'lucide-react'
import type { ProjectPhase } from '@/types'

interface ProjectPhasesTimelineRealtimeProps {
  projectId: string
  initialPhases: ProjectPhase[]
}

export const ProjectPhasesTimelineRealtime = ({
  projectId,
  initialPhases,
}: ProjectPhasesTimelineRealtimeProps) => {
  const { phases } = useProjectPhasesRealtime({ projectId, initialPhases })

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground/50" />
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Fases del Proyecto</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {phases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Las fases del proyecto se mostrarán aquí
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line - background (full length) */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-muted" />

            <div className="relative space-y-0">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === 'completed'
                const isInProgress = phase.status === 'in_progress'
                const isLast = index === phases.length - 1
                const previousPhaseCompleted =
                  index > 0 && phases[index - 1].status === 'completed'

                return (
                  <div key={phase.id} className="relative flex gap-6 pb-8 last:pb-0">
                    {/* Icon container with background circle */}
                    <div className="relative z-10 flex shrink-0 items-start pt-0.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? 'border-green-500 bg-green-500/10 shadow-sm shadow-green-500/20'
                            : isInProgress
                            ? 'border-yellow-500 bg-yellow-500/10 shadow-sm shadow-yellow-500/20'
                            : 'border-muted-foreground/30 bg-muted'
                        }`}
                      >
                        {getPhaseIcon(phase.status)}
                      </div>

                      {/* Connector line between circles - shows progress */}
                      {!isLast && (
                        <div
                          className={`absolute left-[15px] top-8 h-full w-0.5 transition-colors duration-300 ${
                            isCompleted
                              ? 'bg-green-500'
                              : previousPhaseCompleted && isInProgress
                              ? 'bg-green-500'
                              : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base leading-tight">
                            {phase.phase_name}
                          </h4>
                          {phase.phase_description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                              {phase.phase_description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <PhaseBadge status={phase.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

