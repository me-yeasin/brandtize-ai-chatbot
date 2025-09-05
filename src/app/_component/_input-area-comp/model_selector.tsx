"use client";

import { useChatActions, useSelectedModel } from "@/contexts/chat/hooks";
import { useEffect, useRef, useState } from "react";

// Models list

// Models list
const AI_MODELS = [
  "gpt-5-2025-08-07",
  "gpt-5",
  "gpt-5-mini-2025-08-07",
  "gpt-5-mini",
  "gpt-5-nano-2025-08-07",
  "gpt-5-nano",
  "gpt-5-chat-latest",
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "o1-mini",
  "o1-pro",
  "o3",
  "o3-mini",
  "o4-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4.5-preview",
  "claude-opus-4-1-20250805",
  "claude-opus-4-1",
  "claude-opus-4-20250514",
  "claude-opus-4",
  "claude-opus-4-latest",
  "claude-sonnet-4-20250514",
  "claude-sonnet-4",
  "claude-sonnet-4-latest",
  "claude-3-7-sonnet-20250219",
  "claude-3-7-sonnet-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20240620",
  "claude-3-haiku-20240307",
  "deepseek-ai/DeepSeek-R1",
  "cartesia/sonic",
  "deepseek-ai/DeepSeek-R1-DE",
  "cartesia/sonic-2",
  "togethercomputer/MoA-1",
  "meta-llama/Meta-Llama-Guard-3-8B",
  "meta-llama/LlamaGuard-2-8b",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
  "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "moonshotai/Kimi-K2-Instruct",
  "openai/gpt-oss-20b",
  "moonshotai/Kimi-K2-Instruct-0905",
  "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
  "meta-llama/Llama-3.2-3B-Instruct-Turbo",
  "Salesforce/Llama-Rank-V1",
  "mistralai/Mistral-Small-24B-Instruct-2501",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "openai/whisper-large-v3",
  "mistral-large-latest",
  "mistral-medium-2508",
  "mistral-medium-latest",
  "mistral-medium",
  "mistral-small",
  "mistral-small-2312",
  "grok-beta",
  "grok-vision-beta",
  "grok-3",
  "grok-3-fast",
  "grok-3-mini",
  "grok-3-mini-fast",
  "grok-2-vision",
  "grok-2",
  "deepseek-chat",
  "deepseek-reasoner",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
];

const ModelSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedModel = useSelectedModel();
  const { setModel } = useChatActions();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter models based on search term
  const filteredModels = AI_MODELS.filter((model) =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // We no longer need to load from localStorage here as it's handled in the provider
  // This ensures we don't have duplicate logic and potential conflicts

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle model selection
  const handleModelSelect = (model: string) => {
    setModel(model); // Update the model in the global state (which also saves to localStorage)
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className="flex items-center text-xs cursor-pointer hover:text-blue-400 transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="mr-1 group-hover:animate-pulse"
        >
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
        </svg>
        <span>
          Model:{" "}
          <span className="text-blue-400 truncate max-w-[60px] inline-block align-bottom">
            {selectedModel.split("/").pop()}
          </span>
        </span>
      </div>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-72 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-2 bg-gray-800 sticky top-0 z-10">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search models..."
                autoFocus
                className="w-full p-2 pl-8 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="currentColor"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {filteredModels.map((model) => (
              <div
                key={model}
                onClick={() => handleModelSelect(model)}
                className={`p-2 text-xs cursor-pointer hover:bg-gray-700 ${
                  selectedModel === model
                    ? "bg-blue-600 text-white"
                    : "text-white"
                } flex justify-between items-center`}
              >
                <span className="truncate">{model}</span>
                {selectedModel === model && (
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
            ))}

            {filteredModels.length === 0 && (
              <div className="p-4 text-xs text-gray-400 text-center">
                No models found matching &ldquo;{searchTerm}&rdquo;
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-700 text-xs text-gray-400 bg-gray-800 flex items-center justify-between">
            <span>Selected:</span>
            <span className="font-medium text-blue-400 truncate max-w-[200px]">
              {selectedModel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
