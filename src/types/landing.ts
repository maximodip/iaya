export type LandingProjectStatus = 'pending' | 'in_progress' | 'completed'

export interface LandingPhase {
  id: string
  name: string
  description: string
  status: LandingProjectStatus
}

export interface LandingProject {
  id: string
  title: string
  clientName: string
  description: string
  progress: number
  phases: LandingPhase[]
}

export interface LandingAgencyStats {
  totalClients: number
  totalProjects: number
  pendingProjects: number
  completedProjects: number
}
