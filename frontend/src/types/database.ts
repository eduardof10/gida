/**
 * Minimal Supabase typings for entity + security schemas.
 * Regenerate with `supabase gen types` when schema changes.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
  entity: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          published_at: string | null
          sort_order: number
          metadata: Json
          is_hidden: boolean
          created_by: string | null
          modified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          published_at?: string | null
          sort_order?: number
          metadata?: Json
          is_hidden?: boolean
          created_by?: string | null
          modified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          published_at?: string | null
          sort_order?: number
          metadata?: Json
          is_hidden?: boolean
          created_by?: string | null
          modified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_contents: {
        Row: {
          id: string
          project_id: string
          sort_order: number
          placement: Json | null
          width_px: number | null
          height_px: number | null
          caption: string | null
          storage_path: string
          is_hidden: boolean
          created_by: string | null
          modified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sort_order?: number
          placement?: Json | null
          width_px?: number | null
          height_px?: number | null
          caption?: string | null
          storage_path: string
          is_hidden?: boolean
          created_by?: string | null
          modified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sort_order?: number
          placement?: Json | null
          width_px?: number | null
          height_px?: number | null
          caption?: string | null
          storage_path?: string
          is_hidden?: boolean
          created_by?: string | null
          modified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_texts: {
        Row: {
          project_content_id: string
          body: string
          is_hidden: boolean
          created_by: string | null
          modified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          project_content_id: string
          body: string
          is_hidden?: boolean
          created_by?: string | null
          modified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_content_id?: string
          body?: string
          is_hidden?: boolean
          created_by?: string | null
          modified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
  security: {
    Tables: {
      users: {
        Row: {
          id: string
          display_name: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type ProjectRow = Database['entity']['Tables']['projects']['Row']
export type ProjectContentRow = Database['entity']['Tables']['project_contents']['Row']
export type ProjectTextRow = Database['entity']['Tables']['project_texts']['Row']
/** Auth profile row (table security.users) */
export type ProfileRow = Database['security']['Tables']['users']['Row']

export type ProjectWithContents = ProjectRow & {
  project_contents: (ProjectContentRow & {
    project_texts: ProjectTextRow | ProjectTextRow[] | null
  })[]
}
