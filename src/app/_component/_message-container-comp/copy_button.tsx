"use client";

import { Message } from "@/models/message";
import { useState } from "react";

interface CopyButtonProps {
  message: Message; // The AI message to copy
}

const CopyButton = ({ message }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (message && message.content) {
      navigator.clipboard
        .writeText(message.content)
        .then(() => {
          setIsCopied(true);
          // Reset the copied state after 1 second
          setTimeout(() => {
            setIsCopied(false);
          }, 1000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-gray-400 hover:text-white p-1 rounded"
      title={isCopied ? "Copied!" : "Copy response"}
      aria-label="Copy response"
    >
      {isCopied ? (
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
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      ) : (
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
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
};

export default CopyButton;
