/**
 * Database types for Supabase
 * These types should match your Supabase database schema
 */

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
          full_name: string | null
          email: string | null
          phone: string | null
          role: 'buyer' | 'provider' | 'both'
          avatar_url: string | null
          location: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role: 'buyer' | 'provider' | 'both'
          avatar_url?: string | null
          location?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: 'buyer' | 'provider' | 'both'
          avatar_url?: string | null
          location?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      provider_profiles: {
        Row: {
          user_id: string
          skills: string[]
          hourly_rate: number | null
          bio: string | null
          portfolio_items: Json[]
          certifications: Json[]
          rating: number
          total_reviews: number
        }
        Insert: {
          user_id: string
          skills?: string[]
          hourly_rate?: number | null
          bio?: string | null
          portfolio_items?: Json[]
          certifications?: Json[]
          rating?: number
          total_reviews?: number
        }
        Update: {
          user_id?: string
          skills?: string[]
          hourly_rate?: number | null
          bio?: string | null
          portfolio_items?: Json[]
          certifications?: Json[]
          rating?: number
          total_reviews?: number
        }
      }
      service_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          max_distance_km: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          max_distance_km?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          max_distance_km?: number | null
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          buyer_id: string
          category_id: string
          title: string
          description: string
          budget_min: number | null
          budget_max: number | null
          timeline: string | null
          deadline: string | null
          location: Json | null
          attachments: string[]
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          category_id: string
          title: string
          description: string
          budget_min?: number | null
          budget_max?: number | null
          timeline?: string | null
          deadline?: string | null
          location?: Json | null
          attachments?: string[]
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          category_id?: string
          title?: string
          description?: string
          budget_min?: number | null
          budget_max?: number | null
          timeline?: string | null
          deadline?: string | null
          location?: Json | null
          attachments?: string[]
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          request_id: string
          provider_id: string
          price: number
          timeline_estimate: string | null
          cover_letter: string | null
          portfolio_samples: string[]
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          provider_id: string
          price: number
          timeline_estimate?: string | null
          cover_letter?: string | null
          portfolio_samples?: string[]
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          provider_id?: string
          price?: number
          timeline_estimate?: string | null
          cover_letter?: string | null
          portfolio_samples?: string[]
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          request_id: string
          proposal_id: string
          buyer_id: string
          provider_id: string
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          proposal_id: string
          buyer_id: string
          provider_id: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          proposal_id?: string
          buyer_id?: string
          provider_id?: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          completed_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          request_id: string | null
          buyer_id: string
          provider_id: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id?: string | null
          buyer_id: string
          provider_id: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string | null
          buyer_id?: string
          provider_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          attachments: string[]
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          attachments?: string[]
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          attachments?: string[]
          read?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
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
  }
}
