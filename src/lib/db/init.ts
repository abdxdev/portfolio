import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Database = {
  public: {
    Tables: {
      feedbacks: {
        Row: {
          id: number;
          content: string;
          sentiment: string;
          created_at: string;
          session_id: string;
        };
        Insert: {
          content: string;
          sentiment: string;
          created_at: string;
          session_id: string;
        };
        Update: Partial<{
          content: string;
          sentiment: string;
          created_at: string;
          session_id: string;
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