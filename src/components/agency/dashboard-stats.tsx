'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderKanban, Clock, Loader2, CheckCircle } from 'lucide-react'

interface DashboardStatsProps {
  totalClients: number
  totalProjects: number
  pendingProjects: number
  inProgressProjects: number
  completedProjects: number
}

export const DashboardStats = ({
  totalClients,
  totalProjects,
  pendingProjects,
  inProgressProjects,
  completedProjects,
}: DashboardStatsProps) => {
  const stats = [
    {
      title: 'Total Clientes',
      value: totalClients,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Proyectos',
      value: totalProjects,
      icon: FolderKanban,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pendientes',
      value: pendingProjects,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'En Proceso',
      value: inProgressProjects,
      icon: Loader2,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Completados',
      value: completedProjects,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

