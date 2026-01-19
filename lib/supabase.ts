import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  });
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

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
