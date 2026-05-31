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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          sources?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          course_id: string | null
          created_at: string
          document_id: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          title?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      concepts: {
        Row: {
          created_at: string
          definition: string | null
          id: string
          name: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          definition?: string | null
          id?: string
          name: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          definition?: string | null
          id?: string
          name?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concepts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          course_id: string
          created_at: string
          error_message: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          page_count: number | null
          processed_at: string | null
          processing_progress: number | null
          status: Database["public"]["Enums"]["doc_status"]
          text_content: string | null
          title: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          page_count?: number | null
          processed_at?: string | null
          processing_progress?: number | null
          status?: Database["public"]["Enums"]["doc_status"]
          text_content?: string | null
          title: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          page_count?: number | null
          processed_at?: string | null
          processing_progress?: number | null
          status?: Database["public"]["Enums"]["doc_status"]
          text_content?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_reviews: {
        Row: {
          flashcard_id: string
          id: string
          rating: Database["public"]["Enums"]["flashcard_rating"]
          reviewed_at: string
          user_id: string
        }
        Insert: {
          flashcard_id: string
          id?: string
          rating: Database["public"]["Enums"]["flashcard_rating"]
          reviewed_at?: string
          user_id: string
        }
        Update: {
          flashcard_id?: string
          id?: string
          rating?: Database["public"]["Enums"]["flashcard_rating"]
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          course_id: string | null
          created_at: string
          document_id: string | null
          due_date: string
          ease: number
          front: string
          id: string
          interval_days: number
          last_rating: Database["public"]["Enums"]["flashcard_rating"] | null
          review_count: number
          topic_id: string | null
          type: Database["public"]["Enums"]["flashcard_type"]
          user_id: string
        }
        Insert: {
          back: string
          course_id?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string
          ease?: number
          front: string
          id?: string
          interval_days?: number
          last_rating?: Database["public"]["Enums"]["flashcard_rating"] | null
          review_count?: number
          topic_id?: string | null
          type?: Database["public"]["Enums"]["flashcard_type"]
          user_id: string
        }
        Update: {
          back?: string
          course_id?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string
          ease?: number
          front?: string
          id?: string
          interval_days?: number
          last_rating?: Database["public"]["Enums"]["flashcard_rating"] | null
          review_count?: number
          topic_id?: string | null
          type?: Database["public"]["Enums"]["flashcard_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_scores: {
        Row: {
          flashcard_performance: number
          id: string
          level: Database["public"]["Enums"]["mastery_level"]
          quiz_accuracy: number
          revision_frequency: number
          score: number
          study_time_score: number
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          flashcard_performance?: number
          id?: string
          level?: Database["public"]["Enums"]["mastery_level"]
          quiz_accuracy?: number
          revision_frequency?: number
          score?: number
          study_time_score?: number
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          flashcard_performance?: number
          id?: string
          level?: Database["public"]["Enums"]["mastery_level"]
          quiz_accuracy?: number
          revision_frequency?: number
          score?: number
          study_time_score?: number
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_scores_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_goal_minutes: number
          exam_date: string | null
          full_name: string | null
          id: string
          last_active_date: string | null
          onboarded: boolean
          program: string | null
          streak_count: number
          study_goal: string | null
          subjects_list: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_goal_minutes?: number
          exam_date?: string | null
          full_name?: string | null
          id: string
          last_active_date?: string | null
          onboarded?: boolean
          program?: string | null
          streak_count?: number
          study_goal?: string | null
          subjects_list?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_goal_minutes?: number
          exam_date?: string | null
          full_name?: string | null
          id?: string
          last_active_date?: string | null
          onboarded?: boolean
          program?: string | null
          streak_count?: number
          study_goal?: string | null
          subjects_list?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          answer: string | null
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          time_spent_seconds: number
          user_id: string
        }
        Insert: {
          answer?: string | null
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id: string
          time_spent_seconds?: number
          user_id: string
        }
        Update: {
          answer?: string | null
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          time_spent_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          accuracy: number
          completed_at: string | null
          id: string
          quiz_id: string
          score: number
          started_at: string
          time_spent_seconds: number
          total: number
          user_id: string
        }
        Insert: {
          accuracy?: number
          completed_at?: string | null
          id?: string
          quiz_id: string
          score?: number
          started_at?: string
          time_spent_seconds?: number
          total?: number
          user_id: string
        }
        Update: {
          accuracy?: number
          completed_at?: string | null
          id?: string
          quiz_id?: string
          score?: number
          started_at?: string
          time_spent_seconds?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          explanation: string | null
          id: string
          options: Json | null
          position: number
          question: string
          quiz_id: string
          topic_id: string | null
          type: Database["public"]["Enums"]["question_type"]
          user_id: string
        }
        Insert: {
          correct_answer: string
          explanation?: string | null
          id?: string
          options?: Json | null
          position?: number
          question: string
          quiz_id: string
          topic_id?: string | null
          type: Database["public"]["Enums"]["question_type"]
          user_id: string
        }
        Update: {
          correct_answer?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          position?: number
          question?: string
          quiz_id?: string
          topic_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          document_id: string | null
          id: string
          mode: Database["public"]["Enums"]["quiz_mode"]
          size: number
          title: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          document_id?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["quiz_mode"]
          size?: number
          title: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          document_id?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["quiz_mode"]
          size?: number
          title?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_tasks: {
        Row: {
          completed: boolean
          course_id: string | null
          created_at: string
          due_date: string
          id: string
          priority: number
          task_type: string
          title: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          priority?: number
          task_type: string
          title: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          priority?: number
          task_type?: string
          title?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_tasks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_tasks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          activity: string | null
          course_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          session_date: string
          user_id: string
        }
        Insert: {
          activity?: string | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          session_date?: string
          user_id: string
        }
        Update: {
          activity?: string | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          session_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          content: string
          created_at: string
          document_id: string | null
          extras: Json | null
          id: string
          topic_id: string | null
          type: Database["public"]["Enums"]["summary_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id?: string | null
          extras?: Json | null
          id?: string
          topic_id?: string | null
          type: Database["public"]["Enums"]["summary_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string | null
          extras?: Json | null
          id?: string
          topic_id?: string | null
          type?: Database["public"]["Enums"]["summary_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summaries_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          course_id: string
          created_at: string
          document_id: string | null
          id: string
          name: string
          summary: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          document_id?: string | null
          id?: string
          name: string
          summary?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          document_id?: string | null
          id?: string
          name?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
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
      doc_status: "uploading" | "processing" | "ready" | "failed"
      flashcard_rating: "easy" | "medium" | "hard" | "again"
      flashcard_type: "qa" | "definition" | "cloze" | "formula" | "concept"
      mastery_level: "weak" | "learning" | "strong" | "mastered"
      notification_type: "revision" | "weak_topic" | "daily_goal" | "system"
      question_type: "mcq" | "short" | "truefalse"
      quiz_difficulty: "easy" | "medium" | "hard" | "adaptive"
      quiz_mode: "practice" | "exam"
      summary_type: "quick" | "detailed" | "exam" | "bullet" | "concept_map"
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
      doc_status: ["uploading", "processing", "ready", "failed"],
      flashcard_rating: ["easy", "medium", "hard", "again"],
      flashcard_type: ["qa", "definition", "cloze", "formula", "concept"],
      mastery_level: ["weak", "learning", "strong", "mastered"],
      notification_type: ["revision", "weak_topic", "daily_goal", "system"],
      question_type: ["mcq", "short", "truefalse"],
      quiz_difficulty: ["easy", "medium", "hard", "adaptive"],
      quiz_mode: ["practice", "exam"],
      summary_type: ["quick", "detailed", "exam", "bullet", "concept_map"],
    },
  },
} as const
