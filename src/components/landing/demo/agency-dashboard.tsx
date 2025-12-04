"use client"

import { useMemo } from "react"
import { Activity, ChevronRight, FileText, FolderKanban, Plus, Users } from "lucide-react"

import type { LandingAgencyStats, LandingProject } from "@/types/landing"
import { cn } from "@/lib/utils"
import { LandingBadge } from "../ui/landing-badge"
import { LandingButton } from "../ui/landing-button"

interface AgencyDashboardProps {
  stats: LandingAgencyStats
  projects: LandingProject[]
  onUpdateStatus: (projectId: string, phaseId: string) => void
}

const chartData = [
  { name: "Lun", value: 4 },
  { name: "Mar", value: 3 },
  { name: "Mie", value: 7 },
  { name: "Jue", value: 5 },
  { name: "Vie", value: 8 },
]

export function AgencyDashboard({ stats, projects, onUpdateStatus }: AgencyDashboardProps) {
  const chartMax = useMemo(() => Math.max(...chartData.map((point) => point.value)), [])

  return (
    <div className="flex h-full flex-col bg-[#0A0A0A] text-gray-200">
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <DashboardStat label="Total Clientes" value={stats.totalClients} icon={Users} />
          <DashboardStat label="Proyectos" value={stats.totalProjects} icon={FolderKanban} />
          <div className="col-span-1 rounded-lg border border-white/5 bg-[#111] p-5 md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Rendimiento
              </span>
              <span className="text-xs font-mono text-green-500">+12%</span>
            </div>
            <div className="flex h-24 items-end justify-between gap-3">
              {chartData.map((point) => (
                <div key={point.name} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex flex-col items-center text-[10px] font-mono text-gray-500">
                    <span>{point.value}h</span>
                  </div>
                  <div className="relative flex h-full w-full items-end">
                    <div
                      className="w-full rounded border border-white/5 bg-[#0A0A0A]"
                      style={{ height: `${(point.value / chartMax) * 100}%` }}
                    >
                      <div className="h-full w-full rounded bg-gradient-to-t from-[#333] to-white/30" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
                    {point.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/5 bg-[#111]">
          <div className="flex items-center justify-between border-b border-white/5 bg-[#151515] p-4">
            <h2 className="flex items-center gap-2 font-medium text-gray-200">
              <Activity className="h-4 w-4 text-gray-500" />
              Flujos de Trabajo Activos
            </h2>
            <LandingButton size="sm" className="h-8 gap-2">
              <Plus className="h-3 w-3" />
              Nuevo
            </LandingButton>
          </div>
          <div className="divide-y divide-white/5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group p-5 transition-colors hover:bg-[#151515]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-medium text-white">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.clientName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                    <span className="rounded border border-white/5 bg-[#222] px-2 py-1">
                      <FileText className="mr-1 inline-block h-3 w-3" />
                      DOCX PROCESADO
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <p className="ml-1 text-[10px] font-mono uppercase text-gray-600">
                    Etapas del Proceso
                  </p>
                  {project.phases.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => onUpdateStatus(project.id, phase.id)}
                      className="flex items-center justify-between rounded border border-white/5 bg-[#0A0A0A] p-3 text-left transition-all hover:border-white/20 hover:bg-[#111]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.15)]',
                            phase.status === 'completed'
                              ? 'bg-green-500'
                              : phase.status === 'in_progress'
                                ? 'bg-yellow-500'
                                : 'bg-gray-700'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-mono',
                            phase.status === 'completed'
                              ? 'text-gray-500 line-through'
                              : 'text-gray-300'
                          )}
                        >
                          {phase.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <LandingBadge status={phase.status} />
                        <ChevronRight className="h-4 w-4 text-gray-700" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DashboardStatProps {
  label: string
  value: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function DashboardStat({ label, value, icon: Icon }: DashboardStatProps) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#111] p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <p className="font-mono text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
