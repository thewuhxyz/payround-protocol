export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      account: {
        Row: {
          account_created: boolean
          account_key: string | null
          created_at: string
          degen: boolean
          email: string | null
          id: string
          nickname: string | null
          stripe_id: string | null
          user_id: string | null
        }
        Insert: {
          account_created?: boolean
          account_key?: string | null
          created_at?: string
          degen?: boolean
          email?: string | null
          id: string
          nickname?: string | null
          stripe_id?: string | null
          user_id?: string | null
        }
        Update: {
          account_created?: boolean
          account_key?: string | null
          created_at?: string
          degen?: boolean
          email?: string | null
          id?: string
          nickname?: string | null
          stripe_id?: string | null
          user_id?: string | null
        }
      }
      address_book: {
        Row: {
          account_id: string | null
          address: string | null
          created_at: string | null
          id: number
          name: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          address?: string | null
          created_at?: string | null
          id?: number
          name?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          address?: string | null
          created_at?: string | null
          id?: number
          name?: string | null
          user_id?: string
        }
      }
      task: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          cron: boolean
          name: string | null
          recipient: string
          schedule: string
          task_group: string | null
          task_key: string
          thread_key: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          cron: boolean
          name?: string | null
          recipient: string
          schedule: string
          task_group?: string | null
          task_key: string
          thread_key: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          cron?: boolean
          name?: string | null
          recipient?: string
          schedule?: string
          task_group?: string | null
          task_key?: string
          thread_key?: string
          user_id?: string
        }
      }
      task_group: {
        Row: {
          account_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          user_id?: string
        }
      }
      user: {
        Row: {
          account_created: boolean
          account_id: string | null
          account_key: string
          created_at: string
          degen: boolean
          name: string | null
          user_id: string
        }
        Insert: {
          account_created: boolean
          account_id?: string | null
          account_key: string
          created_at?: string
          degen: boolean
          name?: string | null
          user_id: string
        }
        Update: {
          account_created?: boolean
          account_id?: string | null
          account_key?: string
          created_at?: string
          degen?: boolean
          name?: string | null
          user_id?: string
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
