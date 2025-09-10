"use client";

import { useChatActions, useSelectedModel } from "@/contexts/chat/hooks";
import { Message } from "@/models/message";
import {
  AI_MODELS,
  POPULAR_MODELS,
  REASONING_MODELS,
} from "@/utils/model_lists";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ModelDropdownButtonProps {
  previousMessage: Message; // The user message that generated the AI response
}

const ModelDropdownButton = ({ previousMessage }: ModelDropdownButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userPreferredModels, setUserPreferredModels] =
    useState<string[]>(POPULAR_MODELS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentModel = useSelectedModel();
  const { sendMessage, setModel } = useChatActions();
  const router = useRouter();

  // Load user preferred models from localStorage
  useEffect(() => {
    try {
      const savedModels = localStorage.getItem("userSelectedModels");
      if (savedModels) {
        setUserPreferredModels(JSON.parse(savedModels));
      }
    } catch (error) {
      console.error("Error loading saved models:", error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRegenerateWithModel = (modelName: string) => {
    // Set the selected model
    setModel(modelName);

    // Regenerate message with the new model
    if (previousMessage && previousMessage.content) {
      let useWebSearch = false;
      try {
        useWebSearch =
          typeof window !== "undefined" &&
          localStorage.getItem("webSearchEnabled") === "true";
      } catch {}
      sendMessage(previousMessage.content, useWebSearch);
    }

    // Close the dropdown
    setIsOpen(false);
  };

  // Filter models by search term and show user's preferred models first when no search
  const filteredModels = searchTerm
    ? AI_MODELS.filter((model) =>
        model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : userPreferredModels.length > 0
    ? userPreferredModels
    : POPULAR_MODELS;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-white p-1 rounded"
        aria-label="Change model"
        title="Try with different model"
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
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-96 flex flex-col">
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models..."
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-y-auto flex-1 max-h-60">
            {filteredModels.map((model) => {
              const hasReasoning = REASONING_MODELS.includes(model);
              return (
                <div
                  key={model}
                  onClick={() => handleRegenerateWithModel(model)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-700 text-sm ${
                    currentModel === model ? "bg-gray-700" : ""
                  } ${
                    hasReasoning ? "text-purple-300" : "text-white"
                  } flex justify-between items-center`}
                >
                  <span className="truncate flex items-center gap-1">
                    {model}
                    {hasReasoning && (
                      <span
                        className="bg-purple-700 text-white text-[9px] px-1 rounded"
                        title="This model has reasoning capabilities"
                      >
                        REASONING
                      </span>
                    )}
                  </span>
                  {currentModel === model && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                    </svg>
                  )}
                </div>
              );
            })}

            {filteredModels.length === 0 && (
              <div className="p-4 text-xs text-gray-400 text-center">
                No models found matching &ldquo;{searchTerm}&rdquo;
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-700 text-xs bg-gray-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-gray-400">
              <span>Current model:</span>
              <span className="font-medium text-blue-400 truncate max-w-[200px]">
                {currentModel}
              </span>
            </div>
            <button
              onClick={() => {
                router.push("/settings");
                setIsOpen(false);
              }}
              className="w-full py-2 text-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors text-xs"
            >
              Customize Model List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDropdownButton;
