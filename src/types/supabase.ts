export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          difficulty: string;
          width: number;
          height: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          owner_id?: string | null;
          name: string;
          difficulty: string;
          width: number;
          height: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          difficulty?: string;
          width?: number;
          height?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "levels_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      play_sessions: {
        Row: {
          id: string;
          user_id: string;
          level_id: string;
          score: number;
          moves: number;
          time_seconds: number;
          completed_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          level_id: string;
          score: number;
          moves: number;
          time_seconds: number;
          completed_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          level_id?: string;
          score?: number;
          moves?: number;
          time_seconds?: number;
          completed_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "play_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "play_sessions_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          },
        ];
      };
      best_scores: {
        Row: {
          id: string;
          user_id: string;
          level_id: string;
          best_score: number;
          moves: number;
          time_seconds: number;
          play_session_id: string | null;
          achieved_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level_id: string;
          best_score: number;
          moves: number;
          time_seconds: number;
          play_session_id?: string | null;
          achieved_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level_id?: string;
          best_score?: number;
          moves?: number;
          time_seconds?: number;
          play_session_id?: string | null;
          achieved_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "best_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "best_scores_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "best_scores_play_session_id_fkey";
            columns: ["play_session_id"];
            isOneToOne: false;
            referencedRelation: "play_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      global_rankings: {
        Row: {
          user_id: string;
          global_score: number;
          completed_maps: number;
          username: string | null;
          display_name: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "best_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      record_completed_run: {
        Args: {
          p_user_id: string;
          p_level_id: string;
          p_moves: number;
          p_time_seconds: number;
          p_completed_at?: string;
          p_metadata?: Json;
          p_completion_status?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
