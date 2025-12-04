export * from './database'

// User role types
export type UserRole = 'agency_owner' | 'client'

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  agency_id: string
  name: string
}

// OpenAI response types
export interface ExtractedPhase {
  name: string
  description: string
}

export interface OpenAIPhaseResponse {
  phases: ExtractedPhase[]
}

// Form types
export interface OnboardingFormData {
  agencyName: string
  primaryColor: string
  secondaryColor: string
  mainObjective: string
}

export interface CreateClientFormData {
  name: string
  email: string
  password: string
}

export interface CreateProjectFormData {
  name: string
  description: string
  clientId: string
  document?: File
}

// Dashboard stats
export interface DashboardStats {
  totalClients: number
  totalProjects: number
  pendingProjects: number
  inProgressProjects: number
  completedProjects: number
}

