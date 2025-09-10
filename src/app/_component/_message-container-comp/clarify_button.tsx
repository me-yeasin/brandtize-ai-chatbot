"use client";

import { useSelectedModel } from "@/contexts/chat/hooks";
import { usePuter } from "@/hooks/puter/usePuter";
import { Message } from "@/models/message";
import { AI_MODELS } from "@/utils/model_lists";
import { useState } from "react";
import FormattedMessage from "./formatted_message";
import LoadingIndicatorWithMessage from "./loading_indicator_with_message";

// SVG icon for question/clarify functionality
const QuestionMarkIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

type ClarifyButtonProps = {
  message: Message;
  previousMessage: Message | null;
};

const ClarifyButton = ({ message }: ClarifyButtonProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [clarificationResponse, setClarificationResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentModel = useSelectedModel();
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const { puter } = usePuter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !puter) return;

    setIsLoading(true);

    try {
      // Context includes the original AI response
      const prompt = `Original AI response: ${message.content}\n\nClarification question: ${question}\n\nPlease provide a clear explanation to help clarify the original response based on the user's question.`;

      // Use the Puter.js service for generating a response
      const response = await puter.ai.chat(prompt, { model: selectedModel });

      // Handle the different possible response formats from Puter AI
      if (typeof response === "object") {
        // Format 1: Direct text property
        if ("text" in response) {
          setClarificationResponse(response.text as string);
        }
        // Format 2: Message with content array
        else if (
          "message" in response &&
          response.message &&
          typeof response.message === "object" &&
          "content" in response.message
        ) {
          const content = response.message.content;

          // Check if content is an array of objects with text properties
          if (Array.isArray(content) && content.length > 0) {
            // Check for text property in the first content item
            if ("text" in content[0]) {
              setClarificationResponse(content[0].text as string);
            } else {
              setClarificationResponse(JSON.stringify(content));
            }
          }
          // Handle string content
          else if (typeof content === "string") {
            setClarificationResponse(content);
          } else {
            setClarificationResponse("Received response in unknown format.");
          }
        }
        // Format 3: Direct conversion using toString (if implemented by Puter)
        else if (typeof response.toString === "function") {
          const textContent = response.toString();
          if (
            textContent &&
            typeof textContent === "string" &&
            textContent !== "[object Object]"
          ) {
            setClarificationResponse(textContent);
          } else {
            setClarificationResponse("Unable to extract text from response.");
          }
        } else {
          console.error("Unexpected response format:", response);
          setClarificationResponse(
            "Error: Received an unexpected response format."
          );
        }
      } else if (typeof response === "string") {
        setClarificationResponse(response);
      } else {
        console.error("Unexpected response type:", typeof response);
        setClarificationResponse(
          "Error: Received an unexpected response type."
        );
      }
    } catch (error) {
      console.error("Error generating clarification:", error);
      setClarificationResponse(
        "Sorry, there was an error generating a clarification."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save selected model when changed
  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    // Optionally update global model selection
    // setModel(modelName);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-white p-1 rounded"
        title="Ask for clarification"
      >
        <QuestionMarkIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-[600px] max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
              <h2 className="text-white font-semibold">
                Ask for Clarification
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="max-h-[30vh] overflow-y-auto opacity-75 bg-gray-800 m-4 rounded p-3">
              <FormattedMessage
                content={message.content}
                reasoning={message.reasoning}
                hasReasoningCapability={message.hasReasoningCapability}
                webSearchData={message.webSearchData}
              />
            </div>

            <div className="flex-1 overflow-y-auto m-4 mb-0">
              {isLoading ? (
                <div className="bg-gray-800 p-3 rounded mb-3">
                  <LoadingIndicatorWithMessage />
                </div>
              ) : clarificationResponse ? (
                <div className="bg-gray-800 p-3 rounded mb-3">
                  <FormattedMessage
                    content={clarificationResponse}
                    reasoning={undefined}
                    hasReasoningCapability={false}
                    webSearchData={undefined}
                  />
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-gray-800 mt-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="relative w-[180px]">
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {AI_MODELS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this response..."
                  className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Send" : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClarifyButton;
