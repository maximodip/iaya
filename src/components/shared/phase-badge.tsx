'use client'

import { Badge } from '@/components/ui/badge'
import type { PhaseStatus } from '@/types'
import { cn } from '@/lib/utils'

interface PhaseBadgeProps {
  status: PhaseStatus
  className?: string
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    icon: '🔵',
  },
  in_progress: {
    label: 'En Proceso',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    icon: '🟡',
  },
  completed: {
    label: 'Terminada',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
    icon: '🟢',
  },
}

export const PhaseBadge = ({ status, className }: PhaseBadgeProps) => {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  )
}

