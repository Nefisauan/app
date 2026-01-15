"use client";

import { useState } from "react";
import { Message } from "@/lib/supabase";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  senderName: string;
}

export default function ChatMessage({ message, isOwnMessage, senderName }: ChatMessageProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} mb-4`}>
      <span className="text-xs text-gray-500 mb-1">
        {isOwnMessage ? "You" : senderName}
      </span>

      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isOwnMessage
            ? "bg-primary-600 text-white"
            : "bg-white shadow-md"
        }`}
      >
        {/* Main message content */}
        <p className={isOwnMessage ? "text-white" : "text-gray-800"}>
          {isOwnMessage
            ? message.original_content
            : (showOriginal ? message.original_content : message.interpreted_content)
          }
        </p>

        {/* For received messages, show emotion summary and toggle */}
        {!isOwnMessage && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Emotion Summary */}
            <div className="bg-primary-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-primary-700 mb-1">
                Understanding their feelings:
              </p>
              <p className="text-sm text-primary-600">
                {message.emotion_summary}
              </p>
            </div>

            {/* Toggle Original */}
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showOriginal ? "Show interpreted version" : "Show original message"}
            </button>
          </div>
        )}
      </div>

      <span className="text-xs text-gray-400 mt-1">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
