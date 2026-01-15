"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Conversation } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
    await loadConversation(user.id);
    setLoading(false);
  };

  const loadConversation = async (userId: string) => {
    // Check if user is part of any conversation
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`partner1_id.eq.${userId},partner2_id.eq.${userId}`)
      .single();

    if (data) {
      setConversation(data);
    }
  };

  const createConversation = async () => {
    if (!user) return;
    setCreating(true);

    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        partner1_id: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      setCreating(false);
      return;
    }

    setConversation(data);
    setCreating(false);
  };

  const copyInviteLink = () => {
    if (!conversation) return;
    const link = `${window.location.origin}/invite/${conversation.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.user_metadata?.name || "there"}!
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </button>
        </div>

        {!conversation ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Start a Conversation
            </h2>
            <p className="text-gray-500 mb-6">
              Create a new conversation space and invite your partner to join.
            </p>
            <button
              onClick={createConversation}
              disabled={creating}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Conversation"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conversation Status */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Your Conversation
              </h2>

              {!conversation.partner2_id ? (
                <div>
                  <p className="text-gray-500 mb-4">
                    Waiting for your partner to join. Share this invite link:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${conversation.invite_code}`}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-green-600 mb-4">
                    Your partner has joined! You can start communicating.
                  </p>
                </div>
              )}

              <button
                onClick={() => router.push(`/chat/${conversation.id}`)}
                className="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Open Chat
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-primary-50 rounded-2xl p-6">
              <h3 className="font-semibold text-primary-800 mb-2">
                How it works
              </h3>
              <p className="text-primary-700 text-sm">
                When you send a message, our AI therapist will help rephrase it
                in a clearer, more compassionate way. Your partner will see the
                interpreted version, helping them understand your feelings
                better. They can also view your original message if they want.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
