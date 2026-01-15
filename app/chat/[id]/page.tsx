"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, Message, Conversation } from "@/lib/supabase";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ id: string; user_metadata?: { name?: string } } | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [partnerName, setPartnerName] = useState<string>("Partner");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initChat();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initChat = async () => {
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    // Load conversation
    const { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (!conv) {
      router.push("/dashboard");
      return;
    }

    // Verify user is part of this conversation
    if (conv.partner1_id !== user.id && conv.partner2_id !== user.id) {
      router.push("/dashboard");
      return;
    }

    setConversation(conv);

    // Get partner name
    const partnerId = conv.partner1_id === user.id ? conv.partner2_id : conv.partner1_id;
    if (partnerId) {
      const { data: partnerData } = await supabase.auth.admin.getUserById(partnerId).catch(() => ({ data: null }));
      if (partnerData?.user?.user_metadata?.name) {
        setPartnerName(partnerData.user.user_metadata.name);
      }
    }

    // Load messages
    await loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    setLoading(false);

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversation) return;

    // Call API to interpret the message
    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        senderName: user.user_metadata?.name || "Your partner",
      }),
    });

    if (!response.ok) {
      console.error("Failed to interpret message");
      return;
    }

    const interpretation = await response.json();

    // Save message to database
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      original_content: content,
      interpreted_content: interpretation.interpretedMessage,
      emotion_summary: interpretation.emotionSummary,
    });

    if (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading conversation...</div>
      </main>
    );
  }

  const partnerJoined = conversation?.partner2_id !== null;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-semibold text-gray-800">CoupleConnect</h1>
            <p className="text-xs text-gray-500">
              {partnerJoined ? `Chatting with ${partnerName}` : "Waiting for partner..."}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${partnerJoined ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {partnerJoined ? "Connected" : "Waiting"}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">No messages yet.</p>
            <p className="text-sm">
              {partnerJoined
                ? "Start the conversation by sharing how you feel."
                : "Share the invite link with your partner to get started."}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === user?.id}
              senderName={partnerName}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <ChatInput onSend={sendMessage} disabled={!partnerJoined} />
        {!partnerJoined && (
          <p className="text-xs text-center text-gray-500 mt-2">
            Your partner needs to join before you can start chatting.
          </p>
        )}
      </div>
    </main>
  );
}
