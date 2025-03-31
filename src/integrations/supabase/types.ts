export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_statistics: {
        Row: {
          created_at: string | null
          date: string
          groups_count: number
          id: string
          people_count: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          groups_count?: number
          id?: string
          people_count?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          groups_count?: number
          id?: string
          people_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      waiting_customers: {
        Row: {
          called_at: string | null
          created_at: string
          id: string
          name: string
          party_size: number
          phone: string
          preferences: Json
          status: string
          timestamp: number
        }
        Insert: {
          called_at?: string | null
          created_at?: string
          id?: string
          name: string
          party_size: number
          phone: string
          preferences: Json
          status: string
          timestamp: number
        }
        Update: {
          called_at?: string | null
          created_at?: string
          id?: string
          name?: string
          party_size?: number
          phone?: string
          preferences?: Json
          status?: string
          timestamp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_statistics: {
        Args: {
          limit_param: number
        }
        Returns: {
          date: string
          groups_count: number
          people_count: number
        }[]
      }
      get_daily_statistics_by_date: {
        Args: {
          date_param: string
        }
        Returns: {
          date: string
          groups_count: number
          people_count: number
        }[]
      }
      get_daily_statistics_for_today: {
        Args: Record<PropertyKey, never>
        Returns: {
          date: string
          groups_count: number
          people_count: number
        }[]
      }
      get_or_create_daily_stats: {
        Args: {
          stats_date: string
        }
        Returns: string
      }
      increment_daily_stats: {
        Args: {
          stats_date: string
          group_increment?: number
          people_increment?: number
        }
        Returns: undefined
      }
      insert_daily_statistics: {
        Args: {
          date_param: string
          groups_count_value: number
          people_count_value: number
        }
        Returns: undefined
      }
      update_daily_statistics: {
        Args: {
          date_param: string
          groups_count_increment: number
          people_count_increment: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
