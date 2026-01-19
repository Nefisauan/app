import { createClient } from '@supabase/supabase-js';

// Hardcoded for now to debug - will use env vars later
const supabaseUrl = 'https://svruinryzyblnlhngggj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cnVpbnJ5enlibG5saG5nZ2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTg3ODEsImV4cCI6MjA4NDA5NDc4MX0.ATyEiAkiU9A7WmE0D1Zk9MBgtXULzsdmYw880EHyF2k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
