export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'employee' | 'manager' | 'admin'
          team: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          role?: 'employee' | 'manager' | 'admin'
          team?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: 'employee' | 'manager' | 'admin'
          team?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      daily_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          sleep: Json
          focus: Json
          tasks: Json
          wellbeing: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          sleep: Json
          focus: Json
          tasks: Json
          wellbeing: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          sleep?: Json
          focus?: Json
          tasks?: Json
          wellbeing?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_metrics: {
        Row: {
          id: string
          team: string
          date: string
          avg_energy: number
          avg_sleep: number
          avg_fatigue: number
          avg_hv_ratio: number
          participant_count: number
          risk_level: 'low' | 'medium' | 'high'
          created_at: string
        }
        Insert: {
          id?: string
          team: string
          date: string
          avg_energy: number
          avg_sleep: number
          avg_fatigue: number
          avg_hv_ratio: number
          participant_count: number
          risk_level?: 'low' | 'medium' | 'high'
          created_at?: string
        }
        Update: {
          id?: string
          team?: string
          date?: string
          avg_energy?: number
          avg_sleep?: number
          avg_fatigue?: number
          avg_hv_ratio?: number
          participant_count?: number
          risk_level?: 'low' | 'medium' | 'high'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_team_stats: {
        Args: {
          team_name: string
          period_type: 'week' | 'month' | 'quarter'
        }
        Returns: {
          team: string
          avg_energy: number
          avg_sleep: number
          avg_fatigue: number
          avg_hv_ratio: number
          participant_count: number
          risk_level: string
          date_range: string
        }[]
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      get_all_users_data: {
        Args: {
          period_type: 'week' | 'month' | 'quarter'
        }
        Returns: {
          user_id: string
          email: string
          team: string
          avg_energy: number
          avg_sleep: number
          avg_fatigue: number
          avg_hv_ratio: number
          entries_count: number
          last_entry_date: string
        }[]
      }
      calculate_wellbeing_score: {
        Args: {
          sleep_data: Json
          focus_data: Json
          wellbeing_data: Json
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Interface utilisateur avec authentification
export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team?: string;
} 