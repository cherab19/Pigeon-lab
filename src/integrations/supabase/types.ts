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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string
          classroom_id: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          author_id: string
          classroom_id: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          author_id?: string
          classroom_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          classroom_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          experiment_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          experiment_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          experiment_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_quiz_results: {
        Row: {
          answers: Json
          chapter_id: string
          completed_at: string
          id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          chapter_id: string
          completed_at?: string
          id?: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          chapter_id?: string
          completed_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_quiz_results_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "textbook_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_quizzes: {
        Row: {
          chapter_id: string
          created_at: string
          generated_by_ai: boolean
          id: string
          questions: Json
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          generated_by_ai?: boolean
          id?: string
          questions?: Json
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          generated_by_ai?: boolean
          id?: string
          questions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_quizzes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "textbook_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_students: {
        Row: {
          classroom_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          classroom_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          classroom_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          grade: number
          id: string
          name: string | null
          school_id: string
          section: string | null
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          name?: string | null
          school_id: string
          section?: string | null
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          name?: string | null
          school_id?: string
          section?: string | null
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          experiment_id: string
          grade: number
          id: string
          started_at: string
          status: string
          subject: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          experiment_id: string
          grade: number
          id?: string
          started_at?: string
          status?: string
          subject: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          experiment_id?: string
          grade?: number
          id?: string
          started_at?: string
          status?: string
          subject?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          applied_at: string | null
          chapa_response: Json | null
          created_at: string
          currency: string
          id: string
          school_id: string
          status: string
          student_seats: number
          teacher_seats: number
          tx_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          applied_at?: string | null
          chapa_response?: Json | null
          created_at?: string
          currency?: string
          id?: string
          school_id: string
          status?: string
          student_seats?: number
          teacher_seats?: number
          tx_ref: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          applied_at?: string | null
          chapa_response?: Json | null
          created_at?: string
          currency?: string
          id?: string
          school_id?: string
          status?: string
          student_seats?: number
          teacher_seats?: number
          tx_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          school_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string
          created_at: string
          experiment_id: string
          id: string
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          created_at?: string
          experiment_id: string
          id?: string
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          created_at?: string
          experiment_id?: string
          id?: string
          quiz_type?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          last_page: number
          last_read_at: string
          textbook_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_page?: number
          last_read_at?: string
          textbook_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_page?: number
          last_read_at?: string
          textbook_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_textbook_id_fkey"
            columns: ["textbook_id"]
            isOneToOne: false
            referencedRelation: "textbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      school_subscriptions: {
        Row: {
          activated_at: string | null
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          notes: string | null
          price_per_student: number
          school_id: string
          status: string
          student_count: number
          student_seats: number
          suspended_at: string | null
          teacher_seats: number
          total_seats: number | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          notes?: string | null
          price_per_student?: number
          school_id: string
          status?: string
          student_count?: number
          student_seats?: number
          suspended_at?: string | null
          teacher_seats?: number
          total_seats?: number | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          notes?: string | null
          price_per_student?: number
          school_id?: string
          status?: string
          student_count?: number
          student_seats?: number
          suspended_at?: string | null
          teacher_seats?: number
          total_seats?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      student_gamification: {
        Row: {
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      student_reflections: {
        Row: {
          created_at: string
          id: string
          user_id: string
          week_of: string
          what_to_improve: string | null
          what_went_well: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          week_of: string
          what_to_improve?: string | null
          what_went_well?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          week_of?: string
          what_to_improve?: string | null
          what_went_well?: string | null
        }
        Relationships: []
      }
      student_routines: {
        Row: {
          id: string
          schedule: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          schedule?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          schedule?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      textbook_chapters: {
        Row: {
          chapter_number: number
          created_at: string
          end_page: number
          id: string
          start_page: number
          textbook_id: string
          title: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          end_page?: number
          id?: string
          start_page?: number
          textbook_id: string
          title: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          end_page?: number
          id?: string
          start_page?: number
          textbook_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "textbook_chapters_textbook_id_fkey"
            columns: ["textbook_id"]
            isOneToOne: false
            referencedRelation: "textbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      textbooks: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string
          grade: number
          id: string
          language: string
          subject: string
          title: string
          total_pages: number
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url: string
          grade: number
          id?: string
          language?: string
          subject: string
          title: string
          total_pages?: number
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string
          grade?: number
          id?: string
          language?: string
          subject?: string
          title?: string
          total_pages?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      apply_seat_topup: { Args: { _tx_ref: string }; Returns: Json }
      can_invite_member: {
        Args: { _role: string; _school_id: string }
        Returns: Json
      }
      check_subscription_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      get_my_school_id: { Args: never; Returns: string }
      get_public_stats: { Args: never; Returns: Json }
      get_school_members_with_roles: { Args: never; Returns: Json }
      get_subscription_stats: { Args: never; Returns: Json }
      get_super_admin_all_users: { Args: never; Returns: Json }
      get_super_admin_analytics: { Args: never; Returns: Json }
      get_super_admin_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_classroom_member: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_classroom_teacher: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      update_school_subscription: {
        Args: {
          _notes?: string
          _school_id: string
          _status?: string
          _student_count?: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "super_admin" | "school_admin" | "teacher" | "student"
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
      app_role: ["super_admin", "school_admin", "teacher", "student"],
    },
  },
} as const
