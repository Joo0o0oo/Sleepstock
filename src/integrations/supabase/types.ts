export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dream_categories: {
        Row: {
          color: string
          description: string | null
          emoji: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color: string
          description?: string | null
          emoji: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string
          description?: string | null
          emoji?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      dream_reactions: {
        Row: {
          created_at: string
          dream_id: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_id: string
          id?: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_id?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_reactions_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dreams: {
        Row: {
          author_name: string | null
          body: string
          category_id: string | null
          created_at: string
          emotion: string | null
          id: string
          keywords: string[]
          lat: number | null
          lng: number | null
          neighborhood_id: string | null
          place_id: string | null
          source: Database["public"]["Enums"]["dream_source"]
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          body: string
          category_id?: string | null
          created_at?: string
          emotion?: string | null
          id?: string
          keywords?: string[]
          lat?: number | null
          lng?: number | null
          neighborhood_id?: string | null
          place_id?: string | null
          source?: Database["public"]["Enums"]["dream_source"]
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          body?: string
          category_id?: string | null
          created_at?: string
          emotion?: string | null
          id?: string
          keywords?: string[]
          lat?: number | null
          lng?: number | null
          neighborhood_id?: string | null
          place_id?: string | null
          source?: Database["public"]["Enums"]["dream_source"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dreams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dream_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dreams_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dreams_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      external_sources: {
        Row: {
          id: string
          last_synced_at: string | null
          name: string
        }
        Insert: {
          id?: string
          last_synced_at?: string | null
          name: string
        }
        Update: {
          id?: string
          last_synced_at?: string | null
          name?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      place_stats: {
        Row: {
          dreams_last_7d: number
          dreams_prev_7d: number
          featured_dream_id: string | null
          most_liked_dream_id: string | null
          most_recent_dream_id: string | null
          place_id: string
          top_category_id: string | null
          top_keywords: string[]
          total_dreams: number
          updated_at: string
        }
        Insert: {
          dreams_last_7d?: number
          dreams_prev_7d?: number
          featured_dream_id?: string | null
          most_liked_dream_id?: string | null
          most_recent_dream_id?: string | null
          place_id: string
          top_category_id?: string | null
          top_keywords?: string[]
          total_dreams?: number
          updated_at?: string
        }
        Update: {
          dreams_last_7d?: number
          dreams_prev_7d?: number
          featured_dream_id?: string | null
          most_liked_dream_id?: string | null
          most_recent_dream_id?: string | null
          place_id?: string
          top_category_id?: string | null
          top_keywords?: string[]
          total_dreams?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_stats_featured_dream_id_fkey"
            columns: ["featured_dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_stats_most_liked_dream_id_fkey"
            columns: ["most_liked_dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_stats_most_recent_dream_id_fkey"
            columns: ["most_recent_dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_stats_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_stats_top_category_id_fkey"
            columns: ["top_category_id"]
            isOneToOne: false
            referencedRelation: "dream_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean
          lat: number
          lng: number
          name: string
          neighborhood_id: string | null
          slug: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          lat: number
          lng: number
          name: string
          neighborhood_id?: string | null
          slug: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          lat?: number
          lng?: number
          name?: string
          neighborhood_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_place_stats: { Args: { _place_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      dream_source: "user" | "reddit" | "external" | "seed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      dream_source: ["user", "reddit", "external", "seed"],
    },
  },
} as const
