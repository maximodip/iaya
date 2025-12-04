"use client"

import { CheckCircle2, Circle, Loader2 } from "lucide-react"

import type { LandingProject } from "@/types/landing"
import { LandingBadge } from "../ui/landing-badge"

interface ProjectCardProps {
  project: LandingProject
  brandingColor?: string
}

export function ProjectCard({ project, brandingColor = "#6366f1" }: ProjectCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">{project.title}</h3>
            <p className="mt-1 font-mono text-sm text-gray-500">{project.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-3xl font-bold text-white">{project.progress}%</span>
          </div>
        </div>

        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-[#222]">
          <div
            className="relative h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${project.progress}%`, backgroundColor: brandingColor }}
          >
            <div className="absolute inset-0 bg-white/20" />
          </div>
        </div>

        <div className="space-y-0">
          {project.phases.map((phase, index) => (
            <div key={phase.id} className="relative flex gap-5 pb-8 last:pb-0">
              {index !== project.phases.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-0 w-px bg-[#222]" />
              )}
              <div className="relative z-10 mt-0.5 flex-shrink-0">
                {phase.status === "completed" ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-green-900 bg-[#111]">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                ) : phase.status === "in_progress" ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-yellow-900 bg-[#111]">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#333] bg-[#111]">
                    <Circle className="h-4 w-4 text-gray-700" />
                  </div>
                )}
              </div>
              <div className="-mt-1 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4
                    className={`text-sm font-medium ${
                      phase.status === "pending" ? "text-gray-500" : "text-gray-200"
                    }`}
                  >
                    {phase.name}
                  </h4>
                  <LandingBadge status={phase.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-gray-500">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
