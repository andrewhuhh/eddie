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
      interactions: {
        Row: {
          created_at: string | null
          custom_platform: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          mood_rating: number | null
          occurred_at: string | null
          person_id: string | null
          platform: Database["public"]["Enums"]["platform_type"] | null
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_platform?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          mood_rating?: number | null
          occurred_at?: string | null
          person_id?: string | null
          platform?: Database["public"]["Enums"]["platform_type"] | null
          type: Database["public"]["Enums"]["interaction_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_platform?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          mood_rating?: number | null
          occurred_at?: string | null
          person_id?: string | null
          platform?: Database["public"]["Enums"]["platform_type"] | null
          type?: Database["public"]["Enums"]["interaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_private: boolean | null
          mood: string | null
          person_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          mood?: string | null
          person_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          mood?: string | null
          person_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          activity_enabled: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          milestone_enabled: boolean | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_enabled: boolean | null
          reminder_frequency_days: number | null
          system_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_enabled?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          milestone_enabled?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_enabled?: boolean | null
          reminder_frequency_days?: number | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_enabled?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          milestone_enabled?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_enabled?: boolean | null
          reminder_frequency_days?: number | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          created_at: string | null
          description_template: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: string | null
          title_template: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description_template?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: string | null
          title_template: string
          type: string
        }
        Update: {
          created_at?: string | null
          description_template?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string | null
          title_template?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_actionable: boolean | null
          is_read: boolean | null
          metadata: Json | null
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_actionable?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_actionable?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          closeness: number | null
          created_at: string | null
          custom_platform: string | null
          email: string | null
          health: Database["public"]["Enums"]["relationship_health"] | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferred_platform:
            | Database["public"]["Enums"]["platform_type"]
            | null
          relationship: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          closeness?: number | null
          created_at?: string | null
          custom_platform?: string | null
          email?: string | null
          health?: Database["public"]["Enums"]["relationship_health"] | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferred_platform?:
            | Database["public"]["Enums"]["platform_type"]
            | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          closeness?: number | null
          created_at?: string | null
          custom_platform?: string | null
          email?: string | null
          health?: Database["public"]["Enums"]["relationship_health"] | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_platform?:
            | Database["public"]["Enums"]["platform_type"]
            | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          custom_days: number | null
          description: string | null
          frequency: Database["public"]["Enums"]["reminder_frequency"] | null
          id: string
          is_active: boolean | null
          next_reminder_date: string
          person_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_days?: number | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["reminder_frequency"] | null
          id?: string
          is_active?: boolean | null
          next_reminder_date: string
          person_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_days?: number | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["reminder_frequency"] | null
          id?: string
          is_active?: boolean | null
          next_reminder_date?: string
          person_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      interaction_type:
        | "call"
        | "text"
        | "email"
        | "in_person"
        | "social_media"
        | "video_call"
      platform_type:
        | "whatsapp"
        | "instagram"
        | "facebook"
        | "twitter"
        | "linkedin"
        | "phone"
        | "email"
        | "in_person"
        | "custom"
      relationship_health: "healthy" | "attention" | "inactive"
      reminder_frequency:
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "quarterly"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      interaction_type: [
        "call",
        "text",
        "email",
        "in_person",
        "social_media",
        "video_call",
      ],
      platform_type: [
        "whatsapp",
        "instagram",
        "facebook",
        "twitter",
        "linkedin",
        "phone",
        "email",
        "in_person",
        "custom",
      ],
      relationship_health: ["healthy", "attention", "inactive"],
      reminder_frequency: [
        "daily",
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "custom",
      ],
    },
  },
} as const

// Convenience types for notifications
export type NotificationType = 'reminder' | 'activity' | 'milestone' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high'

// Convenience types for easier usage
export type Person = Tables<'people'>
export type Interaction = Tables<'interactions'>
export type JournalEntry = Tables<'journal_entries'>
export type Reminder = Tables<'reminders'>

export type PersonInsert = TablesInsert<'people'>
export type InteractionInsert = TablesInsert<'interactions'>
export type JournalEntryInsert = TablesInsert<'journal_entries'>
export type ReminderInsert = TablesInsert<'reminders'>

export type RelationshipHealth = Enums<'relationship_health'>
export type InteractionType = Enums<'interaction_type'>
export type PlatformType = Enums<'platform_type'>
export type ReminderFrequency = Enums<'reminder_frequency'> 