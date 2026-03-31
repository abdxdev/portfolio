import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Database = {
  public: {
    Tables: {
      portfolio_conversations: {
        Row: {
          id: number;
          session_id: string;
          message: string;
          is_admin: boolean;
          created_at: string;
          reply_to: number | null;
          is_deleted: boolean;
          last_seen_at: string | null;
        };
        Insert: {
          session_id: string;
          message: string;
          is_admin?: boolean;
          created_at: string;
          reply_to?: number | null;
          is_deleted?: boolean;
          last_seen_at?: string | null;
        };
        Update: Partial<{
          session_id: string;
          message: string;
          is_admin: boolean;
          created_at: string;
          reply_to: number | null;
          is_deleted: boolean;
          last_seen_at: string | null;
        }>;
        Relationships: [];
      };
      portfolio_cache: {
        Row: {
          key: string;
          data: any;
          updated_at: string;
        };
        Insert: {
          key: string;
          data: any;
          updated_at?: string;
        };
        Update: Partial<{
          key: string;
          data: any;
          updated_at: string;
        }>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: number;
          email: string;
          first_name: string;
          last_name: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          email: string;
          first_name: string;
          last_name?: string | null;
          message: string;
          created_at?: string;
        };
        Update: Partial<{
          email: string;
          first_name: string;
          last_name: string | null;
          message: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      conversation_push_subscriptions: {
        Row: {
          session_id: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          session_id: string;
          player_id: string;
          created_at?: string;
        };
        Update: Partial<{
          player_id: string;
          created_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

let client: SupabaseClient<Database> | null = null;

export const getSupabase = () => {
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseKey);
  }
  return client;
};