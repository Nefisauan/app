"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    checkInvite();
  }, [code]);

  const checkInvite = async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to signup with invite code
      router.push(`/signup?invite=${code}`);
      return;
    }

    // Check if conversation exists
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("invite_code", code)
      .single();

    if (error || !conversation) {
      setError("Invalid invite link. Please check and try again.");
      setLoading(false);
      return;
    }

    // Check if user is already part of this conversation
    if (conversation.partner1_id === user.id || conversation.partner2_id === user.id) {
      router.push(`/chat/${conversation.id}`);
      return;
    }

    // Check if conversation already has two partners
    if (conversation.partner2_id) {
      setError("This conversation already has two partners.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const joinConversation = async () => {
    setJoining(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/signup?invite=${code}`);
      return;
    }

    // Get the conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("invite_code", code)
      .single();

    if (!conversation) {
      setError("Conversation not found");
      setJoining(false);
      return;
    }

    // Join the conversation
    const { error } = await supabase
      .from("conversations")
      .update({ partner2_id: user.id })
      .eq("id", conversation.id);

    if (error) {
      setError("Failed to join conversation. Please try again.");
      setJoining(false);
      return;
    }

    router.push(`/chat/${conversation.id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-6">
            {error}
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary-600 hover:underline"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            You've Been Invited!
          </h1>
          <p className="text-gray-500 mb-6">
            Your partner has invited you to start a conversation through CoupleConnect.
            Join to communicate with AI-assisted understanding.
          </p>
          <button
            onClick={joinConversation}
            disabled={joining}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Conversation"}
          </button>
        </div>
      </div>
    </main>
  );
}
