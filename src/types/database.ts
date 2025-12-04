export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PhaseStatus = 'pending' | 'in_progress' | 'completed'

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          theme: string
          primary_color: string
          secondary_color: string
          main_objective: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          theme?: string
          primary_color?: string
          secondary_color?: string
          main_objective?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          theme?: string
          primary_color?: string
          secondary_color?: string
          main_objective?: string | null
          created_at?: string
        }
        Relationships: []
      }
      agency_owners: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          user_id?: string
          email?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_owners_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          user_id?: string
          email?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          agency_id: string
          client_id: string
          name: string
          description: string | null
          document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          client_id: string
          name: string
          description?: string | null
          document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          client_id?: string
          name?: string
          description?: string | null
          document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      project_phases: {
        Row: {
          id: string
          project_id: string
          phase_name: string
          phase_description: string | null
          status: PhaseStatus
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          phase_name: string
          phase_description?: string | null
          status?: PhaseStatus
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          phase_name?: string
          phase_description?: string | null
          status?: PhaseStatus
          order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      phase_status: PhaseStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Agency = Database['public']['Tables']['agencies']['Row']
export type AgencyInsert = Database['public']['Tables']['agencies']['Insert']
export type AgencyUpdate = Database['public']['Tables']['agencies']['Update']

export type AgencyOwner = Database['public']['Tables']['agency_owners']['Row']
export type AgencyOwnerInsert = Database['public']['Tables']['agency_owners']['Insert']
export type AgencyOwnerUpdate = Database['public']['Tables']['agency_owners']['Update']

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type ProjectPhase = Database['public']['Tables']['project_phases']['Row']
export type ProjectPhaseInsert = Database['public']['Tables']['project_phases']['Insert']
export type ProjectPhaseUpdate = Database['public']['Tables']['project_phases']['Update']

// Extended types with relations
export type ProjectWithPhases = Project & {
  project_phases: ProjectPhase[]
}

export type ProjectWithClient = Project & {
  clients: Client
}

export type ProjectFull = Project & {
  project_phases: ProjectPhase[]
  clients: Client
}
