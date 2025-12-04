import { cn } from '@/lib/utils'
import type { LandingProjectStatus } from '@/types/landing'

type ExtraStatus = 'active' | 'inactive'

const LABELS: Record<LandingProjectStatus | ExtraStatus, string> = {
  completed: 'Completado',
  in_progress: 'En Proceso',
  pending: 'Pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
}

const STYLES: Record<LandingProjectStatus | ExtraStatus, string> = {
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export type LandingBadgeStatus = LandingProjectStatus | ExtraStatus

interface LandingBadgeProps {
  status: LandingBadgeStatus
  className?: string
}

export function LandingBadge({ status, className }: LandingBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider',
        STYLES[status],
        className
      )}
    >
      {LABELS[status] ?? status}
    </span>
  )
}
