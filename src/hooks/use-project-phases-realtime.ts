import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProjectPhase } from '@/types'

interface UseProjectPhasesRealtimeProps {
  projectId: string
  initialPhases: ProjectPhase[]
}

export const useProjectPhasesRealtime = ({
  projectId,
  initialPhases,
}: UseProjectPhasesRealtimeProps) => {
  const [phases, setPhases] = useState<ProjectPhase[]>(initialPhases)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Update local state when initialPhases change
    setPhases(initialPhases)
  }, [initialPhases])

  useEffect(() => {
    // Subscribe to changes in project_phases table
    const channel = supabase
      .channel(`project-phases-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_phases',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPhase = payload.new as ProjectPhase
            setPhases((prev) => {
              const exists = prev.some((p) => p.id === newPhase.id)
              if (exists) return prev
              return [...prev, newPhase].sort((a, b) => a.order - b.order)
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedPhase = payload.new as ProjectPhase
            setPhases((prev) =>
              prev
                .map((p) => (p.id === updatedPhase.id ? updatedPhase : p))
                .sort((a, b) => a.order - b.order)
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedPhase = payload.old as ProjectPhase
            setPhases((prev) => prev.filter((p) => p.id !== deletedPhase.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  const calculateProgress = () => {
    if (phases.length === 0) return 0
    const completed = phases.filter((p) => p.status === 'completed').length
    return Math.round((completed / phases.length) * 100)
  }

  return {
    phases,
    progress: calculateProgress(),
  }
}

