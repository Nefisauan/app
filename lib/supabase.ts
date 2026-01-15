import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a placeholder client that will work during build time
// The actual client will be created with real values at runtime
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  original_content: string;
  interpreted_content: string;
  emotion_summary: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  partner1_id: string;
  partner2_id: string | null;
  invite_code: string;
  created_at: string;
};
