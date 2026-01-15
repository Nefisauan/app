# CoupleConnect Setup Guide

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in the details
3. Wait for the project to be created

### Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon) > **API**
2. Copy the **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy the **anon public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste this SQL, then click **Run**:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner1_id UUID REFERENCES auth.users(id) NOT NULL,
  partner2_id UUID REFERENCES auth.users(id),
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  original_content TEXT NOT NULL,
  interpreted_content TEXT NOT NULL,
  emotion_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = partner1_id OR auth.uid() = partner2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = partner1_id);

CREATE POLICY "Users can update conversations they're part of" ON conversations
  FOR UPDATE USING (auth.uid() = partner1_id OR auth.uid() = partner2_id);

-- Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.partner1_id = auth.uid() OR conversations.partner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.partner1_id = auth.uid() OR conversations.partner2_id = auth.uid())
    )
  );

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Enable Email Auth (Optional but Recommended)

By default, Supabase requires email confirmation. For testing, you can disable this:

1. Go to **Authentication** > **Providers**
2. Click on **Email**
3. Toggle OFF "Confirm email"
4. Save

## Step 2: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign in with your account
3. Go to **API Keys**
4. Create a new key and copy it

## Step 3: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ANTHROPIC_API_KEY=sk-ant-your-actual-key
   ```

## Step 4: Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add your environment variables in Vercel's settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
6. Deploy!

## Testing the App

1. Sign up as User A
2. Create a conversation and copy the invite link
3. Open an incognito window
4. Sign up as User B using the invite link
5. Start chatting!

When User A sends a message like "You never listen to me!", User B will see something like:
- **Interpreted**: "I've been feeling unheard lately, and it's making me sad. I really value when you give me your full attention."
- **Emotions**: "Feeling frustrated, lonely, and seeking connection."
