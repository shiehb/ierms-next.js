export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          password_hash: string
          first_name: string | null
          last_name: string | null
          middle_name: string | null
          user_level: string
          is_active: boolean
          force_password_change: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          password_hash: string
          first_name?: string | null
          last_name?: string | null
          middle_name?: string | null
          user_level?: string
          is_active?: boolean
          force_password_change?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          password_hash?: string
          first_name?: string | null
          last_name?: string | null
          middle_name?: string | null
          user_level?: string
          is_active?: boolean
          force_password_change?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      password_reset_tokens: {
        Row: {
          id: number
          user_id: number
          token: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          token: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          token?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
