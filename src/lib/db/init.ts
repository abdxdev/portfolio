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
        };
        Insert: {
          session_id: string;
          message: string;
          is_admin?: boolean;
          created_at: string;
          reply_to?: number | null;
          is_deleted?: boolean;
        };
        Update: Partial<{
          session_id: string;
          message: string;
          is_admin: boolean;
          created_at: string;
          reply_to: number | null;
          is_deleted: boolean;
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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

let client: SupabaseClient<Database> | null = null;

export const getSupabase = () => {
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseKey);
  }
  return client;
};