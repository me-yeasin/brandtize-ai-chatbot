"use client";

import { useChat } from "@/contexts/chat/hooks";
import { Message } from "@/models/message";
import { WebSearchData } from "@/models/search";
import { AI_MODELS } from "@/utils/model_lists";
import { useEffect, useRef, useState } from "react";
import "./custom_scrollbar.css";
import FormattedMessage from "./formatted_message";
import LoadingIndicatorWithMessage from "./loading_indicator_with_message";
import "./search_results.css";

interface CompareButtonProps {
  message: Message; // The AI message to compare
  previousMessage?: Message; // The user message that triggered this response
}

// Function to generate a consistent color based on a string
const getColorFromString = (str: string) => {
  // List of vibrant colors
  const colors = [
    "text-blue-400",
    "text-green-400",
    "text-purple-400",
    "text-pink-400",
    "text-red-400",
    "text-yellow-400",
    "text-indigo-400",
    "text-teal-400",
    "text-orange-400",
    "text-lime-400",
    "text-sky-400",
    "text-amber-400",
    "text-emerald-400",
    "text-violet-400",
    "text-rose-400",
  ];

  // Get a simple hash of the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the hash to get a color from the list
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

const CompareButton = ({ message, previousMessage }: CompareButtonProps) => {
  const { updateMessage, puterState } = useChat();
  const puter = puterState?.puter;

  // Function to remove a response box
  const removeResponseBox = (modelToRemove: string) => {
    // Don't trigger auto-scroll when removing items
    setAlternativeResponses((prev) => {
      const updatedResponses = prev.filter(
        (item) => item.model !== modelToRemove
      );

      // Update the database with the new filtered responses
      setTimeout(() => {
        saveResponsesToDatabase(updatedResponses);
      }, 100);

      return updatedResponses;
    });
  };

  // Function to save specific responses to database (used by removeResponseBox)
  const saveResponsesToDatabase = async (
    responses: Array<{
      model: string;
      response: Message | null;
      isLoading: boolean;
    }>
  ) => {
    try {
      // Convert responses to the format needed for the database
      const compareResponses = responses
        .filter((item) => !item.isLoading && item.response) // Only include loaded responses
        .map((item) => ({
          model: item.model,
          content: item.response?.content || "",
          timestamp: item.response?.timestamp || new Date(),
          reasoning: item.response?.reasoning,
          hasReasoningCapability: item.response?.hasReasoningCapability,
        }));

      // Send to the API to update the message
      if (message.id) {
        const response = await fetch(`/api/messages/${message.id}/compare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compareResponses }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(
            "Successfully saved compare responses to database:",
            result
          );
        } else {
          console.error("Failed to save compare responses:", result);
        }
      }
    } catch (error) {
      console.error("Error saving compare responses:", error);
    }
  };

  // Function to generate real API response for a specific model
  const generateRealResponse = async (
    selectedModel: string,
    userPrompt: string,
    useWebSearch: boolean = false
  ): Promise<Message> => {
    if (!puter) {
      throw new Error("Puter AI service not available");
    }

    try {
      // Variables for web search
      let webSearchData: WebSearchData | undefined = undefined;
      let finalPrompt = userPrompt;

      // Perform web search if enabled
      if (useWebSearch) {
        try {
          console.log("Compare Dialog: Performing web search for:", userPrompt);

          // Check if this looks like a specific website browsing request
          const websiteRegex =
            /(?:browse|visit|check|fetch|get|search|get data from|data from|information from|content from|read|view|go to)\s+(?:the\s+)?(?:website|webpage|page|site|url|link)?\s*(?:at|from|on|of|:)?\s*(?:https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(?:\/\S*)?)/i;

          const isWebsiteRequest = websiteRegex.test(userPrompt);
          if (isWebsiteRequest) {
            console.log("CompareDialog: Detected website browsing request");
          }

          const searchResponse = await fetch(
            `/api/search?q=${encodeURIComponent(userPrompt)}`
          );

          if (searchResponse.ok) {
            webSearchData = await searchResponse.json();

            if (
              webSearchData &&
              webSearchData.results &&
              webSearchData.results.length > 0
            ) {
              // Format search results for the AI prompt
              const formattedResults = webSearchData.results
                .map(
                  (result, index) =>
                    `[${index + 1}] "${result.title}": ${result.snippet} (${
                      result.link
                    })`
                )
                .join("\n");

              // Check if this is a specific website request
              const isSpecificWebsite = webSearchData.queries.some((q) =>
                q.query.startsWith("Fetching data from:")
              );

              // Extract website URL if this is a specific website request
              let websiteUrl = "";
              if (isSpecificWebsite) {
                const fetchQuery = webSearchData.queries.find((q) =>
                  q.query.startsWith("Fetching data from:")
                );
                if (fetchQuery) {
                  websiteUrl = fetchQuery.query.replace(
                    "Fetching data from: ",
                    ""
                  );
                }
              }

              // Set the enhanced prompt based on the type of search
              finalPrompt = isSpecificWebsite
                ? `${userPrompt}\n\nWebsite content results from ${websiteUrl}:\n${formattedResults}\n\nI've fetched data from the specific website you requested. Please use this information to provide an accurate and detailed answer based on the website content. Cite sources when appropriate using their numbers like [1], [2], etc.`
                : `${userPrompt}\n\nWeb search results:\n${formattedResults}\n\nPlease use these search results to provide an up-to-date and accurate answer. Cite the sources in your response by referring to their numbers like [1], [2], etc. If the search results aren't relevant, rely on your training data.`;
            }
          }
        } catch (error) {
          console.error(
            "Error performing web search in compare dialog:",
            error
          );
        }
      }

      // Check if the selected model supports reasoning
      const supportsReasoning = [
        "deepseek-reasoner",
        "deepseek-ai/DeepSeek-R1",
        "openrouter:deepseek/deepseek-r1:free",
        "openrouter:deepseek-ai/deepseek-v2.5-reasoner",
        "openrouter:qwen/qwen3-30b-a3b-thinking-2507",
        "openrouter:qwen/qwen3-235b-a22b-thinking-2507",
        "openrouter:thudm/glm-4.1v-9b-thinking",
        "openrouter:mistralai/magistral-medium-2506:thinking",
        "openrouter:arcee-ai/maestro-reasoning",
        "openrouter:microsoft/phi-4-reasoning-plus",
        "openrouter:perplexity/sonar-reasoning-pro",
        "openrouter:perplexity/sonar-reasoning",
      ].some((model) => selectedModel.includes(model));

      // Enhanced prompt for reasoning-capable models
      let enhancedPrompt = finalPrompt;
      if (supportsReasoning && !useWebSearch) {
        enhancedPrompt = `${finalPrompt}\n\nNote: Please respond in English. For this response, first think step-by-step about how to answer this question (this thinking won't be shown to the user), and then provide your final answer.`;
      }

      const maybeStream = puter.ai.chat(
        enhancedPrompt,
        {
          model: selectedModel,
          stream: true,
        },
        false
      );

      // Handle the response (same logic as in chat_provider.tsx)
      const stream =
        maybeStream &&
        typeof (maybeStream as unknown as Promise<unknown>).then === "function"
          ? await (maybeStream as Promise<unknown>)
          : (maybeStream as unknown);

      let fullContent = "";
      let reasoning: string | undefined;

      // Optimized content extraction (same as chat_provider.tsx)
      const extractChunkContent = (
        chunk: unknown
      ): { content: string; reasoning?: string } => {
        if (!chunk) return { content: "" };
        if (typeof chunk === "string") return { content: chunk };

        // Handle binary data
        const dec = new TextDecoder();
        if (chunk instanceof Uint8Array) {
          return { content: dec.decode(chunk) };
        }
        if (chunk instanceof ArrayBuffer) {
          return { content: dec.decode(new Uint8Array(chunk)) };
        }

        // Handle object format
        if (typeof chunk === "object") {
          const obj = chunk as Record<string, unknown>;

          // Check for reasoning fields (expanded for different models)
          let foundReasoning: string | undefined;
          const reasoningFields = [
            "reasoning",
            "thinking",
            "thought_process",
            "thoughts",
            "internal_thoughts",
            "step_by_step",
            "analysis",
            "chain_of_thought",
            "rationale",
          ];

          for (const field of reasoningFields) {
            if (
              typeof obj[field] === "string" &&
              (obj[field] as string).trim() !== ""
            ) {
              foundReasoning = obj[field] as string;
              break;
            }
          }

          // Extract content
          if (typeof obj.content === "string") {
            return {
              content: obj.content,
              ...(foundReasoning && { reasoning: foundReasoning }),
            };
          }

          // Handle nested message format
          if (obj.message && typeof obj.message === "object") {
            const message = obj.message as Record<string, unknown>;
            if (typeof message.content === "string") {
              return {
                content: message.content,
                ...(foundReasoning && { reasoning: foundReasoning }),
              };
            }
          }

          // Handle text property
          if (typeof obj.text === "string") return { content: obj.text };

          // Handle OpenAI streaming format
          if (Array.isArray(obj.choices) && obj.choices[0]) {
            const delta = (obj.choices[0] as Record<string, unknown>).delta;
            if (delta && typeof delta === "object") {
              const deltaContent = (delta as Record<string, unknown>).content;
              if (typeof deltaContent === "string") {
                return { content: deltaContent };
              }
            }
          }
        }

        return { content: "" };
      };

      // Handle streaming response
      const maybeIterable = stream as unknown;
      let handled = false;

      try {
        // Check if it's an async iterable (streaming)
        if (
          maybeIterable &&
          typeof (maybeIterable as { [Symbol.asyncIterator]?: unknown })[
            Symbol.asyncIterator
          ] === "function"
        ) {
          handled = true;
          for await (const chunk of maybeIterable as AsyncIterable<unknown>) {
            const chunkContent = extractChunkContent(chunk);
            if (chunkContent.content) {
              fullContent += chunkContent.content;
            }
            if (chunkContent.reasoning) {
              reasoning = chunkContent.reasoning;
            }
          }
        }
      } catch (e) {
        console.log("Streaming failed, trying fallback:", e);
      }

      // Fallback for non-streaming response
      if (!handled) {
        const response = stream as unknown;

        console.log(
          "Compare dialog - Raw response:",
          JSON.stringify(response, null, 2)
        );

        if (response && typeof response === "object") {
          const r = response as Record<string, unknown>;

          // Handle reasoning extraction (same as main chat)
          if (selectedModel.includes("deepseek")) {
            if (r.thinking && typeof r.thinking === "string") {
              reasoning = r.thinking as string;
            } else if (r.reasoning && typeof r.reasoning === "string") {
              reasoning = r.reasoning as string;
            }
          }

          // Extract content using the same logic as main chat
          if (typeof r.content === "string") {
            fullContent = r.content;
          } else if (r.message && typeof r.message === "object") {
            const message = r.message as Record<string, unknown>;
            if (typeof message.content === "string") {
              fullContent = message.content;
            }
            if (!reasoning && typeof message.reasoning === "string") {
              reasoning = message.reasoning;
            }
          } else if (Array.isArray(r.choices) && r.choices[0]) {
            const choice = r.choices[0] as Record<string, unknown>;
            if (choice.message && typeof choice.message === "object") {
              const message = choice.message as Record<string, unknown>;
              if (typeof message.content === "string") {
                fullContent = message.content;
              }
            }
          } else {
            // Try to extract any text-like content
            const possibleContent = Object.values(r).find(
              (value) => typeof value === "string" && value.length > 10
            );
            if (possibleContent) {
              fullContent = possibleContent as string;
            } else {
              fullContent = "No response content found";
            }
          }
        } else if (typeof response === "string") {
          fullContent = response;
        } else {
          fullContent = "No response from AI - invalid response format";
        }
      }

      // Log for debugging
      console.log("Compare dialog - Extracted content:", {
        content: fullContent.substring(0, 100),
        reasoning: reasoning?.substring(0, 50),
        model: selectedModel,
      });

      return {
        id: `alternative-${Date.now()}`,
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
        reasoning: reasoning,
        hasReasoningCapability: supportsReasoning,
        webSearchData: useWebSearch ? webSearchData : undefined,
      };
    } catch (error) {
      console.error(`Error generating response for ${selectedModel}:`, error);
      return {
        id: `alternative-${Date.now()}`,
        role: "assistant",
        content: `Error generating response from ${selectedModel}. Please try again.`,
        timestamp: new Date(),
        hasReasoningCapability: false,
      };
    }
  };

  // Function to select an alternative response as the main response
  const selectResponse = async (
    selectedResponse: Message,
    selectedModel: string
  ) => {
    try {
      if (!message.id) {
        console.error("No message ID available");
        return;
      }

      // Update the message content in the database
      const response = await fetch(`/api/messages/${message.id}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: selectedResponse.content,
          model: selectedModel,
          reasoning: selectedResponse.reasoning,
          hasReasoningCapability: selectedResponse.hasReasoningCapability,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Successfully updated main message:", result);

        // Update the message in the context to reflect the change immediately
        updateMessage(
          message.id,
          selectedResponse.content,
          selectedResponse.reasoning,
          selectedResponse.hasReasoningCapability
        );

        // Remove the selected response from the alternative responses
        setAlternativeResponses((prev) => {
          const updatedResponses = prev.filter(
            (item) => item.model !== selectedModel
          );

          // Update the database with the remaining responses
          setTimeout(() => {
            saveResponsesToDatabase(updatedResponses);
          }, 100);

          return updatedResponses;
        });

        // Close the dialog after successful update
        setIsDialogOpen(false);
      } else {
        console.error("Failed to update main message:", result);
        alert("Failed to select response. Please try again.");
      }
    } catch (error) {
      console.error("Error selecting response:", error);
      alert("Error selecting response. Please try again.");
    }
  };

  // Function to regenerate responses for existing models with new content
  const regenerateResponses = async () => {
    if (!hasContentChanged || !editedContent.trim() || !previousMessage?.id)
      return;

    try {
      // Mark that the prompt was edited and responses were regenerated
      setWasPromptEdited(true);
      // First, update the original user message in the database
      const updateUserMessageResponse = await fetch(
        `/api/messages/${previousMessage.id}/content`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: editedContent,
          }),
        }
      );

      if (!updateUserMessageResponse.ok) {
        console.error("Failed to update user message in database");
        alert("Failed to update the question. Please try again.");
        return;
      }

      console.log("Successfully updated user message in database");

      // Update the user message in the chat context as well
      updateMessage(previousMessage.id, editedContent);

      // Set all existing responses to loading state
      setAlternativeResponses((prev) =>
        prev.map((item) => ({
          ...item,
          isLoading: true,
          response: null,
        }))
      );

      // Regenerate each response with the new content
      alternativeResponses.forEach(async (item) => {
        try {
          // Generate real response using the API
          const realResponse = await generateRealResponse(
            item.model,
            editedContent,
            useWebSearch
          );

          // Update the specific response
          setAlternativeResponses((prev) => {
            const newResponses = prev.map((prevItem) =>
              prevItem.model === item.model
                ? {
                    ...prevItem,
                    response: realResponse,
                    isLoading: false,
                  }
                : prevItem
            );

            // Save to database after all responses are updated
            setTimeout(() => {
              saveResponsesToDatabase(newResponses);
            }, 200);

            return newResponses;
          });
        } catch (error) {
          console.error(
            `Error regenerating response for ${item.model}:`,
            error
          );

          // Set error state for this specific model
          setAlternativeResponses((prev) =>
            prev.map((prevItem) =>
              prevItem.model === item.model
                ? {
                    ...prevItem,
                    response: {
                      id: `error-${Date.now()}`,
                      role: "assistant",
                      content: `Error generating response from ${item.model}. Please try again.`,
                      timestamp: new Date(),
                      hasReasoningCapability: false,
                    },
                    isLoading: false,
                  }
                : prevItem
            )
          );
        }
      });

      // Reset the content changed flag and exit edit mode
      setHasContentChanged(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user message:", error);
      alert("Error updating the question. Please try again.");
    }
  };

  // Function to scroll to the end of the horizontal list
  const scrollToEnd = () => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [alternativeResponses, setAlternativeResponses] = useState<
    Array<{ model: string; response: Message | null; isLoading: boolean }>
  >([]);

  // Edit functionality states
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(
    previousMessage?.content || ""
  );
  const [hasContentChanged, setHasContentChanged] = useState(false);
  const [wasPromptEdited, setWasPromptEdited] = useState(false);

  // Copy functionality states
  const [copiedResponseId, setCopiedResponseId] = useState<string | null>(null);

  // Function to copy text to clipboard and show feedback
  const copyToClipboard = (text: string, responseId: string) => {
    navigator.clipboard.writeText(text).then(
      function () {
        // Set the copied state to show feedback
        setCopiedResponseId(responseId);
        // Reset after 2 seconds
        setTimeout(() => {
          setCopiedResponseId(null);
        }, 2000);
      },
      function (err) {
        console.error("Could not copy text: ", err);
        alert("Failed to copy text to clipboard");
      }
    );
  };

  // Load existing alternative responses if available
  useEffect(() => {
    if (message.compareResponses && message.compareResponses.length > 0) {
      // Convert stored responses to our component's format
      const loadedResponses = message.compareResponses.map((item) => ({
        model: item.model,
        isLoading: false,
        response: {
          id: `alt-${Date.now()}-${item.model}`,
          role: "assistant",
          content: item.content,
          timestamp: item.timestamp || new Date(),
          reasoning: item.reasoning,
          hasReasoningCapability: item.hasReasoningCapability,
        } as Message,
      }));

      setAlternativeResponses(loadedResponses);
    } else {
      console.log("No saved compare responses found in message");
    }
  }, [message, message.compareResponses]);

  // Reference to the horizontal scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset edit state when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setIsEditing(false);
      setEditedContent(previousMessage?.content || "");
      // Reset copying state
      setCopiedResponseId(null);

      // Don't reset wasPromptEdited flag - keep it for persistent header state
      // Don't reset hasContentChanged if content was changed
    }
  }, [isDialogOpen, previousMessage?.content]);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDialogOpen) {
        setIsDialogOpen(false);
      }
    };

    if (isDialogOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent scrolling on the body when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [isDialogOpen, message]);

  // We no longer need this effect since we'll call scrollToEnd directly

  const handleCompare = () => {
    // Show button feedback
    setIsButtonActive(true);
    setTimeout(() => {
      setIsButtonActive(false);
    }, 300);
    // Open the dialog
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleCompare}
        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded flex items-center gap-1 mt-1 ml-2 transition-colors"
        aria-label="Compare response"
      >
        {isButtonActive ? (
          // Active state icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M9.5 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          </svg>
        ) : (
          // Default icon - compare/split view icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
            <path d="M8 8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 8zm-1.5-1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-.5.5z" />
          </svg>
        )}
      </button>

      {/* Full-screen dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-900 border border-gray-500 w-[calc(100%-40px)] h-[calc(100%-40px)] rounded-lg flex flex-col overflow-hidden relative custom-scrollbar">
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Close dialog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>

            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Compare View With
                </h2>

                {/* Web Search Toggle */}
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={useWebSearch}
                      onChange={() => setUseWebSearch(!useWebSearch)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-white">
                      Web Search
                    </span>
                  </label>
                </div>

                {/* Model Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded flex items-center justify-between min-w-[200px]"
                  >
                    <span>{selectedModel}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ml-2 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto custom-scrollbar">
                      {AI_MODELS.map((model) => {
                        // Check if this model already has a response
                        const hasExistingResponse = alternativeResponses.some(
                          (item) => item.model === model
                        );

                        return (
                          <button
                            key={model}
                            disabled={hasExistingResponse}
                            className={`w-full text-left px-4 py-2 transition-colors ${
                              hasExistingResponse
                                ? "text-gray-500 bg-gray-800 cursor-not-allowed opacity-50"
                                : "text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                            }`}
                            onClick={() => {
                              if (hasExistingResponse) return;
                              setSelectedModel(model);
                              setIsDropdownOpen(false);

                              // Check if we already have a response for this model
                              const existingResponseIndex =
                                alternativeResponses.findIndex(
                                  (item) => item.model === model
                                );

                              // Only add a new response if we don't already have one for this model
                              if (existingResponseIndex === -1) {
                                // Add a new loading response
                                setAlternativeResponses((prev) => [
                                  ...prev,
                                  { model, response: null, isLoading: true },
                                ]);

                                // Scroll to end after adding a new box
                                scrollToEnd();

                                // Generate real API response
                                (async () => {
                                  try {
                                    // Get the user's question for the API call
                                    const userQuestion =
                                      editedContent ||
                                      previousMessage?.content ||
                                      "";

                                    // Generate real response using the API
                                    const realResponse =
                                      await generateRealResponse(
                                        model,
                                        userQuestion,
                                        useWebSearch
                                      );

                                    // Update the response in the array and then save to database
                                    setAlternativeResponses((prev) => {
                                      // Create the updated array first
                                      const newResponses = prev.map((item) =>
                                        item.model === model
                                          ? {
                                              ...item,
                                              response: realResponse,
                                              isLoading: false,
                                            }
                                          : item
                                      );

                                      // Log the updated responses for debugging
                                      console.log(
                                        "Updated responses array:",
                                        newResponses
                                      );

                                      // Schedule save after state update is complete
                                      setTimeout(() => {
                                        // Calculate the responses to save directly from the current state
                                        const responsesToSave = newResponses
                                          .filter(
                                            (item) =>
                                              !item.isLoading && item.response
                                          )
                                          .map((item) => ({
                                            model: item.model,
                                            content:
                                              item.response?.content || "",
                                            timestamp:
                                              item.response?.timestamp ||
                                              new Date(),
                                            reasoning: item.response?.reasoning,
                                            hasReasoningCapability:
                                              item.response
                                                ?.hasReasoningCapability,
                                          }));

                                        // Send directly to API without using the saveCompareResponsesToDatabase function
                                        if (
                                          message.id &&
                                          responsesToSave.length > 0
                                        ) {
                                          fetch(
                                            `/api/messages/${message.id}/compare`,
                                            {
                                              method: "POST",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                compareResponses:
                                                  responsesToSave,
                                              }),
                                            }
                                          )
                                            .then((response) => response.json())
                                            .then((result) => {
                                              console.log(
                                                "Save result:",
                                                result
                                              );
                                            })
                                            .catch((error) => {
                                              console.error(
                                                "Error saving responses:",
                                                error
                                              );
                                            });
                                        }
                                      }, 200);

                                      return newResponses;
                                    });

                                    // Force scroll after response is loaded
                                    setTimeout(() => {
                                      if (scrollContainerRef.current) {
                                        scrollContainerRef.current.scrollTo({
                                          left: scrollContainerRef.current
                                            .scrollWidth,
                                          behavior: "smooth",
                                        });
                                      }
                                    }, 100);
                                  } catch (error) {
                                    console.error(
                                      `Error generating response for ${model}:`,
                                      error
                                    );

                                    // Set error state for this specific model
                                    setAlternativeResponses((prev) =>
                                      prev.map((item) =>
                                        item.model === model
                                          ? {
                                              ...item,
                                              response: {
                                                id: `error-${Date.now()}`,
                                                role: "assistant",
                                                content: `Error generating response from ${model}. Please try again.`,
                                                timestamp: new Date(),
                                                hasReasoningCapability: false,
                                              },
                                              isLoading: false,
                                            }
                                          : item
                                      )
                                    );
                                  }
                                })();
                              }
                            }}
                          >
                            {model}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Question */}
            {previousMessage && (
              <>
                <div className="px-6 py-4 border-b border-gray-700 bg-gray-850">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-400">
                      User Question:
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedContent}
                        onChange={(e) => {
                          setEditedContent(e.target.value);
                          setHasContentChanged(
                            e.target.value !== previousMessage.content
                          );
                        }}
                        className="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar"
                        placeholder="Enter your question..."
                      />
                      <div className="flex gap-2">
                        {hasContentChanged &&
                          alternativeResponses.length > 0 && (
                            <button
                              onClick={regenerateResponses}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                            >
                              Generate New Responses
                            </button>
                          )}
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedContent(previousMessage.content);
                            setHasContentChanged(false);
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white text-lg font-semibold">
                      {editedContent}
                    </div>
                  )}
                </div>

                {/* Horizontal Scroll View List */}
                <div
                  ref={scrollContainerRef}
                  className="px-6 py-4 overflow-x-auto overflow-y-auto max-h-full custom-scrollbar"
                >
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 max-w-[500px] relative">
                      <div className="flex justify-between items-center sticky -top-4 bg-gray-900 py-2 z-10 border-b border-gray-700 shadow-sm">
                        <h3 className="text-sm font-bold text-blue-400 mb-0">
                          {wasPromptEdited ||
                          editedContent !== previousMessage?.content
                            ? "Original Response (Before Edit)"
                            : "Current Response"}
                        </h3>
                        <div className="flex items-center gap-1">
                          {/* Copy button */}
                          <button
                            onClick={() =>
                              copyToClipboard(message.content, "main-response")
                            }
                            className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-700 transition-colors"
                            aria-label="Copy response"
                            title="Copy response to clipboard"
                          >
                            {copiedResponseId === "main-response" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="text-green-500"
                                viewBox="0 0 16 16"
                              >
                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg rounded-bl-none px-2 py-1 custom-scrollbar">
                        <FormattedMessage
                          content={message.content}
                          reasoning={message.reasoning}
                          hasReasoningCapability={
                            message.hasReasoningCapability
                          }
                          webSearchData={message.webSearchData}
                        />
                      </div>
                    </div>

                    {/* Alternative Model Responses */}
                    {alternativeResponses.map((item, index) => (
                      <div
                        key={item.model + index}
                        className="flex-shrink-0 max-w-[500px] relative"
                      >
                        <div className="flex justify-between items-center sticky -top-4 bg-gray-900 py-2 z-10 border-b border-gray-700 shadow-sm">
                          <h3
                            className={`text-sm font-bold ${getColorFromString(
                              item.model
                            )} mb-0`}
                          >
                            {item.model}
                          </h3>
                          <div className="flex items-center gap-1">
                            {/* Select button - only show if response is loaded */}
                            {!item.isLoading && item.response && (
                              <button
                                onClick={() =>
                                  selectResponse(item.response!, item.model)
                                }
                                className="text-gray-400 hover:text-green-500 p-1 rounded-full hover:bg-gray-700 transition-colors"
                                aria-label="Select this response"
                                title="Select this response as the main answer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                                </svg>
                              </button>
                            )}
                            {/* Copy button */}
                            {!item.isLoading && item.response && (
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    item.response!.content,
                                    `alt-${item.model}`
                                  )
                                }
                                className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-700 transition-colors"
                                aria-label="Copy response"
                                title="Copy response to clipboard"
                              >
                                {copiedResponseId === `alt-${item.model}` ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="text-green-500"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                                  </svg>
                                )}
                              </button>
                            )}
                            {/* Remove button */}
                            <button
                              onClick={() => removeResponseBox(item.model)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-700 transition-colors"
                              aria-label="Remove response"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg rounded-bl-none px-2 py-1 custom-scrollbar">
                          {item.isLoading ? (
                            <div className="p-2">
                              <LoadingIndicatorWithMessage
                                webSearchData={item.response?.webSearchData}
                              />
                            </div>
                          ) : (
                            item.response && (
                              <FormattedMessage
                                content={item.response.content}
                                reasoning={item.response.reasoning}
                                hasReasoningCapability={
                                  item.response.hasReasoningCapability
                                }
                                webSearchData={item.response.webSearchData}
                              />
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CompareButton;
