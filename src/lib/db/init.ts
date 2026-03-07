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
        };
        Insert: {
          session_id: string;
          message: string;
          is_admin?: boolean;
          created_at: string;
        };
        Update: Partial<{
          session_id: string;
          message: string;
          is_admin: boolean;
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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

let client: SupabaseClient<Database> | null = null;

export const getSupabase = () => {
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseKey);
  }
  return client;
};