"use client";

import { useSelectedModel } from "@/contexts/chat/hooks";
import { WebSearchData } from "@/models/search";
import { useEffect, useState } from "react";
import "./loading_indicator.css";

interface LoadingIndicatorWithMessageProps {
  webSearchData?: WebSearchData;
}

const LoadingIndicatorWithMessage = ({
  webSearchData,
}: LoadingIndicatorWithMessageProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messagePhase, setMessagePhase] = useState(0);
  const selectedModel = useSelectedModel();
  const isWebSearch = !!webSearchData;
  const isReasoningModel = [
    "deepseek",
    "qwen",
    "thinking",
    "reasoning",
    "maestro",
    "phi-4-reasoning",
    "sonar-reasoning",
  ].some((term) => selectedModel.toLowerCase().includes(term));

  // Define different message sequences based on context
  const webSearchMessages = [
    "Searching the web for information",
    "Collecting relevant search results",
    "Analyzing data from multiple sources",
    "Extracting key information",
    "Formatting search results for readability",
    "Integrating search data with response",
    "Almost ready with your answer",
  ];

  const reasoningModelMessages = [
    "Analyzing your request thoroughly",
    "Breaking down the problem step-by-step",
    "Applying logical reasoning methods",
    "Considering different perspectives",
    "Evaluating potential solutions",
    "Formulating a well-reasoned response",
    "Almost ready with your answer",
  ];

  const standardMessages = [
    "Processing your request",
    "Generating a thoughtful response",
    "Evaluating the context",
    "Crafting your answer",
    "Refining the content",
    "Almost ready with your answer",
  ];

  // Select the appropriate message list
  let messages = standardMessages;
  if (isWebSearch) {
    messages = webSearchMessages;
  } else if (isReasoningModel) {
    messages = reasoningModelMessages;
  }

  // Cycle through messages with a progression feel
  useEffect(() => {
    // Phase 0: First message stays longer (initial processing)
    // Phase 1: Middle messages cycle at normal speed
    // Phase 2: Last message stays longer (finalizing)

    const interval = setInterval(
      () => {
        if (messagePhase === 0 && messageIndex === 0) {
          // Move to next phase after showing first message longer
          setMessagePhase(1);
          setMessageIndex(1);
        } else if (messagePhase === 1) {
          // Cycle through middle messages
          const nextIndex = messageIndex + 1;
          if (nextIndex >= messages.length - 1) {
            setMessagePhase(2); // Move to last phase
            setMessageIndex(messages.length - 1);
          } else {
            setMessageIndex(nextIndex);
          }
        }
        // Phase 2: Just keep showing the last message
      },
      messagePhase === 1 ? 2800 : 4000
    ); // Different timing based on phase

    return () => clearInterval(interval);
  }, [messageIndex, messagePhase, messages.length]);

  // Determine indicator class based on mode
  const indicatorClass = isWebSearch
    ? "web-search-indicator"
    : isReasoningModel
    ? "reasoning-indicator"
    : "standard-indicator";

  return (
    <div className="flex items-center py-2">
      {/* Styled indicator based on task type */}
      <div className="flex items-center mr-3 bg-gray-800 rounded-full px-2 py-1">
        {isWebSearch && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
        {isReasoningModel && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        )}
        {!isWebSearch && !isReasoningModel && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )}
        <div className="flex items-center">
          <span
            className={`typing-dot h-1.5 w-1.5 rounded-full mx-px ${indicatorClass}`}
          ></span>
          <span
            className={`typing-dot h-1.5 w-1.5 rounded-full mx-px ${indicatorClass}`}
          ></span>
          <span
            className={`typing-dot h-1.5 w-1.5 rounded-full mx-px ${indicatorClass}`}
          ></span>
        </div>
      </div>

      {/* Animated message with fade in/out effect */}
      <div className="loading-message text-gray-300 text-sm">
        {messages[messageIndex]}
      </div>
    </div>
  );
};

export default LoadingIndicatorWithMessage;
