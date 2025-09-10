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
      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded flex items-center gap-1 mt-1 transition-colors"
      aria-label="Regenerate response"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
        <path
          fillRule="evenodd"
          d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
        />
      </svg>
    </button>
  );
};

export default RegenerateButton;
