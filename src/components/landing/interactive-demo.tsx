"use client"

import { useState } from "react"
import { LayoutDashboard, UserCheck } from "lucide-react"

import type { LandingAgencyStats, LandingProject, LandingProjectStatus } from "@/types/landing"
import { AgencyDashboard } from "./demo/agency-dashboard"
import { ProjectCard } from "./demo/project-card"

const INITIAL_PROJECTS: LandingProject[] = [
  {
    id: "1",
    title: "Implementación Chatbot RAG",
    clientName: "MaximizeIA S.R.L",
    description: "Chatbot de atención al cliente con base de conocimiento documental.",
    progress: 35,
    phases: [
      {
        id: "p1",
        name: "Análisis de Documentación",
        description: "Extracción de PDFs y limpieza de datos.",
        status: "completed",
      },
      {
        id: "p2",
        name: "Entrenamiento de Embeddings",
        description: "Generación de vectores en base de datos.",
        status: "in_progress",
      },
      {
        id: "p3",
        name: "Desarrollo de Interfaz",
        description: "Frontend en React para el widget.",
        status: "pending",
      },
      {
        id: "p4",
        name: "Pruebas de Integración",
        description: "Validación de respuestas con usuarios reales.",
        status: "pending",
      },
    ],
  },
]

const AGENCY_STATS: LandingAgencyStats = {
  totalClients: 12,
  totalProjects: 5,
  pendingProjects: 2,
  completedProjects: 15,
}

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"agency" | "client">("agency")
  const [projects, setProjects] = useState<LandingProject[]>(INITIAL_PROJECTS)

  const handleUpdateStatus = (projectId: string, phaseId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project
        const updatedPhases = project.phases.map((phase) => {
          if (phase.id !== phaseId) return phase
          const nextStatus: LandingProjectStatus =
            phase.status === "pending"
              ? "in_progress"
              : phase.status === "in_progress"
                ? "completed"
                : "pending"
          return { ...phase, status: nextStatus }
        })
        const completed = updatedPhases.filter((phase) => phase.status === "completed").length
        const progress = Math.round((completed / updatedPhases.length) * 100)
        return { ...project, phases: updatedPhases, progress }
      })
    )
  }

  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 opacity-20 blur" />
      <div className="relative flex h-[700px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0A0A0A] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#333]" />
              <span className="h-3 w-3 rounded-full bg-[#333]" />
              <span className="h-3 w-3 rounded-full bg-[#333]" />
            </div>
            <div className="ml-4 flex gap-1 rounded-md border border-white/5 bg-[#111] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("agency")}
                className={`flex items-center gap-2 rounded px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "agency"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <LayoutDashboard className="h-3 w-3" />
                Panel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("client")}
                className={`flex items-center gap-2 rounded px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "client"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <UserCheck className="h-3 w-3" />
                Portal Cliente
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Conexión en Tiempo Real Activa
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {activeTab === "agency" ? (
            <AgencyDashboard
              stats={AGENCY_STATS}
              projects={projects}
              onUpdateStatus={handleUpdateStatus}
            />
          ) : (
            <div className="h-full overflow-y-auto bg-[#050505]">
              <div className="sticky top-0 z-10 border-b border-white/5 bg-[#050505]/80 px-6 py-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-600 font-mono font-bold text-white">
                      M
                    </div>
                    <div>
                      <h2 className="font-bold leading-tight text-white">Maximo Dip Aparicio</h2>
                      <p className="text-xs text-gray-500">Portal de Clientes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-300">MaximizeIA S.R.L</p>
                    <p className="text-xs text-gray-600">Cliente Verificado</p>
                  </div>
                </div>
              </div>
              <div className="mx-auto max-w-3xl space-y-8 p-8">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} brandingColor="#4f46e5" />
                ))}
                <div className="flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/5 p-4">
                  <p className="text-center font-mono text-sm text-gray-500">
                    &lt;!-- Cambia el estado en el Dashboard para ver la animación aquí --&gt;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
