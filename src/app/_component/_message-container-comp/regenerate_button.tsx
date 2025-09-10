"use client";

import { useChatActions } from "@/contexts/chat/hooks";
import { Message } from "@/models/message";

interface RegenerateButtonProps {
  previousMessage: Message; // The user message that generated the AI response
}

const RegenerateButton = ({ previousMessage }: RegenerateButtonProps) => {
  const { sendMessage } = useChatActions();

  const handleRegenerate = () => {
    if (previousMessage && previousMessage.content) {
      // Respect Web Search toggle saved in localStorage
      let useWebSearch = false;
      try {
        useWebSearch =
          typeof window !== "undefined" &&
          localStorage.getItem("webSearchEnabled") === "true";
      } catch {}
      sendMessage(previousMessage.content, useWebSearch);
    }
  };

  return (
    <button
      onClick={handleRegenerate}
      className="text-gray-400 hover:text-white p-1 rounded"
      title="Regenerate response"
      aria-label="Regenerate response"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
      </svg>
    </button>
  );
};

export default RegenerateButton;
