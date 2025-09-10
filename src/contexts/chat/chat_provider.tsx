import {
  ChatContext,
  ChatContextType,
  chatReducer,
  initialState,
} from "@/contexts/chat/chat_context";
import { usePuter } from "@/hooks/puter/usePuter"; // Import your Puter hook
import { usePuterAuth } from "@/hooks/puter/usePuterAuth"; // Import your Puter hook
// AiResponse typing intentionally omitted — responses can be many shapes; handle as unknown/iterable
import { Message } from "@/models/message";
import { WebSearchData } from "@/models/search";
import { ReactNode, useEffect, useReducer, useRef, useState } from "react";

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  // Initialize with default state
  const [state, dispatch] = useReducer(chatReducer, initialState);
  // Add state for current conversation
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );

  // Load saved model from localStorage on client-side only
  useEffect(() => {
    try {
      const savedModel =
        typeof window !== "undefined"
          ? localStorage.getItem("selectedAIModel")
          : null;

      if (savedModel) {
        dispatch({ type: "SET_MODEL", payload: savedModel });
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    // We only want this effect to run once on initial client-side render
  }, []);
  const { puter, isLoading: puterLoading, error: puterError } = usePuter();
  const { user } = usePuterAuth();

  // Ref to track streaming
  const streamingRef = useRef<{
    messageId: string | null;
    isStreaming: boolean;
  }>({ messageId: null, isStreaming: false });

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      streamingRef.current = { messageId: null, isStreaming: false };
    };
  }, []);

  const sendMessage = async (
    content: string,
    useWebSearch?: boolean,
    fileInfo?: { name: string; size: number; type: string }
  ) => {
    if (!content.trim() || !puter) return;
    console.log(user);
    // Clear any existing streaming
    streamingRef.current = { messageId: null, isStreaming: false };

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
    ].some((model) => state.selectedModel.includes(model));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      file: fileInfo,
    };

    // Add user message
    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_INPUT_VALUE", payload: "" });

    // Variables for web search
    let webSearchData: WebSearchData | undefined = undefined;
    let enhancedPrompt = content;

    // Perform web search if enabled
    if (useWebSearch) {
      try {
        console.log("ChatProvider: Performing web search for:", content);

        // Check if this looks like a specific website browsing request
        const websiteRegex =
          /(?:browse|visit|check|fetch|get|search|get data from|data from|information from|content from|read|view|go to)\s+(?:the\s+)?(?:website|webpage|page|site|url|link)?\s*(?:at|from|on|of|:)?\s*(?:https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(?:\/\S*)?)/i;

        const isWebsiteRequest = websiteRegex.test(content);
        if (isWebsiteRequest) {
          console.log("ChatProvider: Detected website browsing request");
        }

        const searchResponse = await fetch(
          `/api/search?q=${encodeURIComponent(content)}`
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

            console.log("Is specific website request:", isSpecificWebsite);

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
            enhancedPrompt = isSpecificWebsite
              ? `${content}\n\nWebsite content results from ${websiteUrl}:\n${formattedResults}\n\nI've fetched data from the specific website you requested. Please use this information to provide an accurate and detailed answer based on the website content. Cite sources when appropriate using their numbers like [1], [2], etc.`
              : `${content}\n\nWeb search results:\n${formattedResults}\n\nPlease use these search results to provide an up-to-date and accurate answer. Cite the sources in your response by referring to their numbers like [1], [2], etc. If the search results aren't relevant, rely on your training data.`;
          }
        }
      } catch (error) {
        console.error("Error performing web search:", error);
      }
    }

    // Create a new conversation if we don't have one
    // Track the conversation ID directly for immediate use
    let currentConversationId = currentConversation;

    const saveUserMessage = async (
      retries = 3
    ): Promise<{ success: boolean; conversationId: string | null }> => {
      if (!currentConversationId) {
        try {
          // Create conversation with initial user message
          const title =
            content.length > 30 ? content.substring(0, 30) + "..." : content;
          const response = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, initialMessage: userMessage }),
          });

          if (!response.ok) {
            console.error(
              `Failed to create conversation: ${response.status} ${response.statusText}`
            );
            if (retries > 0) {
              console.log(`Retrying (${retries} attempts left)...`);
              await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
              return saveUserMessage(retries - 1);
            }
            return { success: false, conversationId: null };
          }

          const data = await response.json();
          // Store the ID for immediate use but DON'T update React state yet
          // We'll update the state after the first AI response is saved
          currentConversationId = data._id;
          console.log(
            "New conversation created and user message saved, ID:",
            data._id,
            "(not showing in sidebar until AI response is saved)"
          );
          return { success: true, conversationId: data._id };
        } catch (error) {
          console.error("Error creating conversation:", error);
          if (retries > 0) {
            console.log(`Retrying (${retries} attempts left)...`);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
            return saveUserMessage(retries - 1);
          }
          return { success: false, conversationId: null };
        }
      } else {
        // Add message to existing conversation
        try {
          const response = await fetch(
            `/api/conversations/${currentConversationId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userMessage),
            }
          );

          if (!response.ok) {
            console.error(
              `Failed to add message: ${response.status} ${response.statusText}`
            );
            if (retries > 0) {
              console.log(`Retrying (${retries} attempts left)...`);
              await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
              return saveUserMessage(retries - 1);
            }
            return { success: false, conversationId: currentConversationId };
          }

          console.log("User message saved to existing conversation");
          return { success: true, conversationId: currentConversationId };
        } catch (error) {
          console.error("Error adding message to conversation:", error);
          if (retries > 0) {
            console.log(`Retrying (${retries} attempts left)...`);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
            return saveUserMessage(retries - 1);
          }
          return { success: false, conversationId: currentConversationId };
        }
      }
    };

    // Try to save the message and get the conversation ID
    let savedConversationId: string | null = null;
    const saveMessagePromise = saveUserMessage().then((result) => {
      savedConversationId = result.conversationId;
      if (!result.success) {
        console.error("Failed to save user message after all retries");
      }
    });

    // Create AI message (empty content) so the UI shows the normal loading indicator while streaming begins
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      hasReasoningCapability: supportsReasoning,
      webSearchData: useWebSearch ? webSearchData : undefined,
    };
    dispatch({ type: "ADD_MESSAGE", payload: aiMessage });

    try {
      // Set up streaming reference
      streamingRef.current = {
        messageId: aiMessageId,
        isStreaming: true,
      };

      // Buffer for incoming chunks with optimized immediate display
      let fullContent = "";

      // Log to track what's happening with the AI response
      console.log(
        "Starting AI response processing with model:",
        state.selectedModel
      );

      // Special debugging for Qwen models
      if (state.selectedModel.includes("qwen")) {
        console.log(
          "Processing Qwen reasoning model - enhanced debugging enabled"
        );
      } // Enhanced extraction with better chunk handling and debugging
      const extractChunkContent = (
        chunk: unknown
      ): { content: string; reasoning?: string } => {
        // Log all chunks in non-test mode for debugging
        console.log("Received chunk:", chunk);

        // Fast path for common cases
        if (!chunk) return { content: "" };
        if (typeof chunk === "string") return { content: chunk };

        // Log chunk for debugging specific reasoning models
        if (typeof chunk === "object" && supportsReasoning) {
          if (state.selectedModel.includes("deepseek")) {
            console.log(
              "Deepseek model chunk:",
              JSON.stringify(chunk, null, 2)
            );
          } else if (state.selectedModel.includes("qwen")) {
            console.log("Qwen model chunk:", JSON.stringify(chunk, null, 2));
          } else {
            console.log(
              "Reasoning model chunk:",
              JSON.stringify(chunk, null, 2)
            );
          }
        }

        // Handle binary data with single TextDecoder instance
        const dec = new TextDecoder();

        // Process binary data efficiently
        if (chunk instanceof Uint8Array) {
          return { content: dec.decode(chunk) };
        }
        if (chunk instanceof ArrayBuffer) {
          return { content: dec.decode(new Uint8Array(chunk)) };
        }

        // Handle object format with enhanced logging and property detection
        if (typeof chunk === "object" && chunk !== null) {
          const obj = chunk as Record<string, unknown>;

          // Log all object keys for better debugging
          console.log("Object keys in chunk:", Object.keys(obj));

          // Special handling for Puter AI response format
          // The actual format might be different, log to see the structure
          if (obj.data && typeof obj.data === "string") {
            console.log("Found data property in chunk");
            return { content: obj.data as string };
          }

          // Check for reasoning in multiple possible fields
          let foundReasoning: string | undefined;

          // Check common reasoning field names (expanded for Qwen models)
          const reasoningFields = [
            "reasoning",
            "thinking",
            "thought_process",
            "thoughts",
            "internal_thoughts", // Qwen specific
            "step_by_step", // Qwen specific
            "analysis", // Qwen specific
            "chain_of_thought", // Common alternative
            "rationale", // Common alternative
          ];
          for (const field of reasoningFields) {
            if (
              typeof obj[field] === "string" &&
              (obj[field] as string).trim() !== ""
            ) {
              foundReasoning = obj[field] as string;
              console.log(
                `Found reasoning in '${field}' field:`,
                foundReasoning.substring(0, 50) + "..."
              );
              break;
            }
          }

          // Direct access for common patterns (OpenAI, custom formats)
          if (typeof obj.content === "string") {
            return {
              content: obj.content,
              ...(foundReasoning && { reasoning: foundReasoning }),
            };
          }

          // Handle nested message format with reasoning
          if (obj.message && typeof obj.message === "object") {
            const message = obj.message as Record<string, unknown>;
            const msgContent = message.content;

            // Check for reasoning in nested message
            if (!foundReasoning) {
              for (const field of reasoningFields) {
                if (
                  typeof message[field] === "string" &&
                  (message[field] as string).trim() !== ""
                ) {
                  foundReasoning = message[field] as string;
                  console.log(
                    `Found reasoning in message.${field}:`,
                    foundReasoning.substring(0, 50) + "..."
                  );
                  break;
                }
              }
            }

            if (typeof msgContent === "string") {
              return {
                content: msgContent,
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
              const deltaReasoning = (delta as Record<string, unknown>)
                .reasoning;

              if (typeof deltaContent === "string") {
                if (
                  typeof deltaReasoning === "string" &&
                  deltaReasoning.trim() !== ""
                ) {
                  return { content: deltaContent, reasoning: deltaReasoning };
                }
                return { content: deltaContent };
              }
            }
          }
        }

        // Last resort: try generic regex extraction for common reasoning pattern
        try {
          const jsonStr = JSON.stringify(chunk);

          // Look for reasoning in JSON string with expanded patterns
          const reasoningPatterns = [
            /"reasoning":\s*"([^"]+)"/i,
            /"thinking":\s*"([^"]+)"/i,
            /"thought_process":\s*"([^"]+)"/i,
            /"thoughts":\s*"([^"]+)"/i,
            /"internal_thoughts":\s*"([^"]+)"/i,
            /"step_by_step":\s*"([^"]+)"/i,
            /"analysis":\s*"([^"]+)"/i,
            /"chain_of_thought":\s*"([^"]+)"/i,
            /"rationale":\s*"([^"]+)"/i,
          ];

          for (const pattern of reasoningPatterns) {
            const match = jsonStr.match(pattern);
            if (match && match[1]) {
              return { content: "", reasoning: match[1] };
            }
          }
        } catch (e) {
          console.error("Error in regex extraction:", e);
        }

        return { content: "" };
      };

      // Variables for manual reasoning extraction
      let manuallyExtractedReasoning = "";
      let manualResponseContent = "";

      // Optimized update function that directly updates the message without buffer delays
      const updateMessage = (data: { content: string; reasoning?: string }) => {
        // Continue even with empty content - this ensures we update the UI
        // Add to full content
        fullContent += data.content || "";

        // For models that need manual extraction, try to extract reasoning and response
        if (needsManualReasoningExtraction) {
          // Parse incoming chunks for reasoning/response markers
          const reasoningMatch = fullContent.match(
            /<reasoning>([\s\S]*?)(?:<\/reasoning>|$)/
          );
          if (reasoningMatch && reasoningMatch[1]) {
            manuallyExtractedReasoning = reasoningMatch[1].trim();
          }

          // Extract the actual response content
          const responseMatch = fullContent.match(
            /<response>([\s\S]*?)(?:<\/response>|$)/
          );
          if (responseMatch && responseMatch[1]) {
            manualResponseContent = responseMatch[1].trim();

            // Use the extracted response instead of the full content
            if (manualResponseContent) {
              // Update with the clean response (without the tags) and the extracted reasoning
              dispatch({
                type: "UPDATE_STREAMING_MESSAGE",
                payload: {
                  id: aiMessageId,
                  content: manualResponseContent,
                  reasoning: manuallyExtractedReasoning || data.reasoning,
                },
              });
              return; // Skip the normal update below
            }
          }
        }

        // Store reasoning across chunks (standard flow)
        if (data.reasoning) {
          console.log(
            `Updating message with reasoning: ${data.reasoning.substring(
              0,
              50
            )}...`
          );
        }

        dispatch({
          type: "UPDATE_STREAMING_MESSAGE",
          payload: {
            id: aiMessageId,
            content: fullContent,
            reasoning: data.reasoning,
          },
        });

        // Verify the message state after dispatch
        setTimeout(() => {
          const message = state.messages.find((msg) => msg.id === aiMessageId);
          if (message) {
            console.log(
              `Message state after update - has reasoning: ${!!message.reasoning}`
            );
            if (message.reasoning) {
              console.log(
                `Current reasoning: ${message.reasoning.substring(0, 50)}...`
              );
            }
          }
        }, 100);
      };

      // No filler here — keep normal loading indicator until real chunks arrive

      // Skip unnecessary logging to speed up processing

      // Check if the selected model supports reasoning
      const supportsReasoning = [
        "deepseek-reasoner",
        "deepseek-ai/DeepSeek-R1",
        "openrouter:deepseek/deepseek-r1:free",
        "openrouter:qwen/qwen3-30b-a3b-thinking-2507",
        "openrouter:qwen/qwen3-235b-a22b-thinking-2507",
        "openrouter:thudm/glm-4.1v-9b-thinking",
        "openrouter:mistralai/magistral-medium-2506:thinking",
      ].some((model) => state.selectedModel.includes(model));

      // For models where we know the API doesn't return reasoning directly,
      // we can use a special prompt format to extract reasoning manually
      const needsManualReasoningExtraction =
        state.selectedModel.includes("deepseek") ||
        state.selectedModel.includes("qwen") ||
        state.selectedModel.includes(
          "openrouter:deepseek-ai/deepseek-v2.5-reasoner"
        );

      // Special prompt for reasoning-capable models
      let enhancedPrompt = content;

      if (supportsReasoning) {
        if (needsManualReasoningExtraction) {
          // Format that makes it easier to parse reasoning and response separately
          enhancedPrompt = `Please respond to this request: "${content}"\n\nFirst, provide your reasoning using the following format:\n<reasoning>\nYour step-by-step reasoning process here...\n</reasoning>\n\nThen provide your final response using this format:\n<response>\nYour final response here...\n</response>`;
        } else {
          // For models that handle reasoning natively - keep it simple to avoid API errors
          enhancedPrompt = content;
        }
      }

      // Use the enhanced prompt from web search if available
      // Otherwise use the original content
      const finalPrompt = useWebSearch ? enhancedPrompt : content;

      console.log(
        "Final prompt to be used:",
        finalPrompt.substring(0, 100) + "..."
      );

      // Use test mode for development or real AI service for production
      // You can toggle this to true for testing without real API calls
      const useTestMode = false; // Set to false to use the real AI service

      // Create minimal options object to avoid unsupported parameters
      // Removed additional_parameters as they may cause API errors for reasoning models
      const chatOptions = {
        model: state.selectedModel, // Use the selected model from state
        stream: true,
      };

      console.log("Calling puter.ai.chat with options:", chatOptions);
      console.log("Final prompt length:", finalPrompt.length);
      console.log("Is reasoning model:", supportsReasoning);

      // Immediately call puter.ai.chat for faster response
      const maybeStream = puter.ai.chat(
        finalPrompt,
        chatOptions,
        useTestMode // Control whether to use test mode or real API
      );
      console.log("AI Response initial call completed");
      console.log("Response type:", typeof maybeStream);

      // Support promise or direct stream-like return without using `any`
      const stream =
        maybeStream &&
        typeof (maybeStream as unknown as Promise<unknown>).then === "function"
          ? await (maybeStream as Promise<unknown>)
          : (maybeStream as unknown);
      // Skip logging for performance gain
      console.log("Puter AI chat called with streaming enabled");
      // Optimized streaming handler with prioritized fast paths
      const maybeIterable = stream as unknown;
      let handled = false;

      try {
        if (
          maybeIterable &&
          typeof (maybeIterable as { [Symbol.asyncIterator]?: unknown })[
            Symbol.asyncIterator
          ] === "function"
        ) {
          handled = true;
          for await (const chunk of maybeIterable as AsyncIterable<unknown>) {
            if (!streamingRef.current.isStreaming) break;
            const chunkContent = extractChunkContent(chunk);
            if (chunkContent) {
              updateMessage(chunkContent);
            }
          }
        } else if (
          maybeIterable &&
          typeof (maybeIterable as { next?: unknown }).next === "function"
        ) {
          handled = true;
          const iterator = maybeIterable as {
            next: () => Promise<{ done: boolean; value: unknown }>;
          };
          let res = await iterator.next();
          while (!res.done && streamingRef.current.isStreaming) {
            const chunkContent = extractChunkContent(res.value);
            if (chunkContent) {
              updateMessage(chunkContent);
            }
            res = await iterator.next();
          }
        } else if (
          maybeIterable &&
          typeof (maybeIterable as { getReader?: unknown }).getReader ===
            "function"
        ) {
          // ReadableStream-like (browser response.body)
          handled = true;
          const reader = (
            maybeIterable as {
              getReader: () => {
                read: () => Promise<{ done: boolean; value?: unknown }>;
              };
            }
          ).getReader();
          const dec = new TextDecoder();
          // read loop
          while (streamingRef.current.isStreaming) {
            // read returns { done, value }
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              // value may be Uint8Array or string
              let text = "";
              if (typeof value === "string") text = value;
              else if (value instanceof Uint8Array) text = dec.decode(value);
              else if (value instanceof ArrayBuffer)
                text = dec.decode(new Uint8Array(value));
              else text = String(value);
              updateMessage({ content: text });
            }
          }
        } else if (
          maybeIterable &&
          typeof (maybeIterable as { on?: unknown }).on === "function"
        ) {
          // EventEmitter-like (node stream)
          handled = true;
          (
            maybeIterable as {
              on: (ev: string, cb: (chunk: unknown) => void) => void;
            }
          ).on("data", (chunk: unknown) => {
            const c = extractChunkContent(chunk);
            if (c) {
              updateMessage(c);
            }
          });
          // await end
          await new Promise<void>((resolve) =>
            (maybeIterable as { on: (ev: string, cb: () => void) => void }).on(
              "end",
              () => resolve()
            )
          );
        }
      } catch (e) {
        console.log(e);
        // Skip error logging for faster fallback
      }

      if (!handled) {
        // Non-iterable fallback: await response and extract content
        const response = stream as unknown;
        let responseContent = "";
        let reasoning: string | undefined;

        console.log("Raw AI response:", JSON.stringify(response, null, 2));

        if (response && typeof response === "object") {
          const r = response as Record<string, unknown>;
          console.log("Response keys:", Object.keys(r));

          // Special handling for reasoning models (Deepseek, Qwen, etc.)
          if (supportsReasoning) {
            console.log(
              "Processing reasoning model response for:",
              state.selectedModel
            );

            // Extended list of reasoning fields for different model types
            const reasoningFields = [
              "thinking",
              "reasoning",
              "thought_process",
              "thoughts",
              "internal_thoughts",
              "step_by_step",
              "analysis",
              "chain_of_thought",
              "rationale",
            ];

            // Try to find reasoning in various potential locations
            for (const field of reasoningFields) {
              if (
                r[field] &&
                typeof r[field] === "string" &&
                (r[field] as string).trim()
              ) {
                reasoning = r[field] as string;
                console.log(`Found reasoning in '${field}' field`);
                break;
              }
            }

            // Try common content patterns
            if (typeof r.response === "string") {
              responseContent = r.response as string;
            } else if (typeof r.answer === "string") {
              responseContent = r.answer as string;
            }
          }

          // Standard patterns
          if (!responseContent) {
            if ("content" in r && typeof r.content === "string") {
              responseContent = r.content as string;
              console.log("Found content directly in response");
            } else if (
              "message" in r &&
              r.message &&
              typeof r.message === "object"
            ) {
              const message = r.message as Record<string, unknown>;

              console.log("Response message keys:", Object.keys(message));

              // Get content
              if (typeof message.content === "string") {
                responseContent = message.content as string;
                console.log("Found content in message");
              }

              // Check for reasoning field in nested message
              if (!reasoning) {
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
                    typeof message[field] === "string" &&
                    (message[field] as string).trim()
                  ) {
                    reasoning = message[field] as string;
                    console.log(`Found reasoning in message.${field}`);
                    break;
                  }
                }
              }
            }
          } else if (Array.isArray(r.choices) && r.choices.length > 0) {
            // Handle OpenAI format
            const choice = r.choices[0] as Record<string, unknown>;
            if (choice.message && typeof choice.message === "object") {
              const message = choice.message as Record<string, unknown>;
              if (typeof message.content === "string") {
                responseContent = message.content as string;
              }

              if (typeof message.reasoning === "string") {
                reasoning = message.reasoning as string;
                console.log("Found reasoning in OpenAI response:", reasoning);
              }
            }
          } else {
            responseContent = "No response from AI";
          }
        } else if (typeof response === "string") {
          responseContent = response;
        } else {
          responseContent = "No response from AI";
        }

        // Update with both content and reasoning if available
        updateMessage({
          content: responseContent,
          ...(reasoning && { reasoning }),
        });

        // Log for debugging
        console.log("Received response:", {
          content: responseContent,
          reasoning,
        });
      }

      // Mark streaming finished and immediately complete the response
      streamingRef.current = { messageId: null, isStreaming: false };

      // Find the current message to get the most recent reasoning value
      const currentMessage = state.messages.find(
        (msg) => msg.id === aiMessageId
      );
      const currentReasoning = currentMessage?.reasoning;

      // For models that need help with reasoning, try one final extraction attempt
      if (
        !manuallyExtractedReasoning &&
        !currentReasoning &&
        needsManualReasoningExtraction
      ) {
        console.log(
          "Attempting automated reasoning extraction as a last resort"
        );

        // Look for patterns that might indicate reasoning sections
        const possiblePatterns = [
          // Try to find text between reasoning related markers
          /(?:reasoning|thinking|thought process|steps|first,)[\s\S]*?(?:final answer|response|conclusion|therefore)/i,
          // Try to find text that starts with "Let me think"
          /let me think[\s\S]*?(?:my answer|final answer|here's|therefore)/i,
          // Try to find text that contains step by step thinking
          /(?:step 1|first,|to answer this)[\s\S]*?(?:final answer|in conclusion|therefore)/i,
        ];

        for (const pattern of possiblePatterns) {
          const match = fullContent.match(pattern);
          if (match && match[0] && match[0].length > 30) {
            // Make sure it's substantial
            manuallyExtractedReasoning = match[0].trim();
            console.log(
              "Auto-extracted reasoning:",
              manuallyExtractedReasoning.substring(0, 50) + "..."
            );
            break;
          }
        }
      }

      // For final update, check if we've manually extracted any reasoning
      const finalReasoning = manuallyExtractedReasoning || currentReasoning;

      // Make sure we have content, use a fallback if empty
      let finalContent =
        needsManualReasoningExtraction && manualResponseContent
          ? manualResponseContent
          : fullContent;

      console.log("Final content before fallback check:", finalContent);

      // If content is still empty, try one more direct API call as a last resort
      if (!finalContent || finalContent.trim() === "") {
        console.log("Content is empty, trying direct API call as fallback");
        try {
          // Make a non-streaming API call as a last resort
          // Use the enhanced prompt from web search if available, otherwise use original content
          const fallbackPrompt = useWebSearch ? enhancedPrompt : content;
          const directResponse = await puter.ai.chat(
            fallbackPrompt,
            {
              model: state.selectedModel,
              stream: false,
            },
            false
          );

          console.log("Direct API fallback response:", directResponse);

          if (directResponse && typeof directResponse === "object") {
            // Try to extract content from the direct response
            const dr = directResponse as Record<string, unknown>;
            if (typeof dr.content === "string") {
              finalContent = dr.content as string;
            } else if (dr.message && typeof dr.message === "object") {
              const message = dr.message as Record<string, unknown>;
              if (typeof message.content === "string") {
                finalContent = message.content as string;
              }
            }
          } else if (typeof directResponse === "string") {
            finalContent = directResponse;
          }
        } catch (error) {
          console.error("Error in direct API fallback:", error);
        }
      }

      // If content is still empty after all attempts, provide a generic fallback
      if (!finalContent || finalContent.trim() === "") {
        finalContent =
          "I'm sorry, I couldn't generate a proper response. Please try again or rephrase your question.";
        console.log(
          "Using generic fallback response due to empty content after all attempts"
        );
      }

      console.log(
        "Final message update - Reasoning available:",
        !!finalReasoning
      );
      if (finalReasoning) {
        console.log(
          "Final reasoning content:",
          finalReasoning.substring(0, 50) + "..."
        );
      }

      if (manuallyExtractedReasoning) {
        console.log("Successfully extracted manual reasoning from response");
      }

      // Ensure final content is set and clear loading
      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: {
          id: aiMessageId,
          content: finalContent,
          reasoning: finalReasoning, // Use manually extracted reasoning if available
        },
      });

      // Verify the message was updated correctly
      setTimeout(() => {
        const updatedMessage = state.messages.find(
          (msg) => msg.id === aiMessageId
        );
        console.log(
          "Final message has reasoning:",
          !!updatedMessage?.reasoning
        );
      }, 100);

      // Store AI message in MongoDB with retries
      // Wait for the user message to be saved first to get the conversation ID
      await saveMessagePromise;

      // Use the conversation ID we got from saving the user message, or fall back to currentConversation state
      const conversationIdToUse = savedConversationId || currentConversation;

      if (conversationIdToUse) {
        console.log(
          `Saving AI message to conversation: ${conversationIdToUse}`
        );

        const saveAIMessage = async (retries = 3): Promise<boolean> => {
          try {
            const response = await fetch(
              `/api/conversations/${conversationIdToUse}/messages`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: aiMessageId,
                  role: "assistant",
                  content: finalContent,
                  timestamp: new Date(),
                  reasoning: finalReasoning,
                  hasReasoningCapability: supportsReasoning,
                  webSearchData: useWebSearch ? webSearchData : undefined,
                }),
              }
            );

            if (!response.ok) {
              console.error(
                `Failed to store AI message: ${response.status} ${response.statusText}`
              );
              if (retries > 0) {
                console.log(`Retrying (${retries} attempts left)...`);
                await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
                return saveAIMessage(retries - 1);
              }
              return false;
            }

            console.log("AI message successfully saved to MongoDB");
            return true;
          } catch (error) {
            console.error("Error storing AI response in MongoDB:", error);
            if (retries > 0) {
              console.log(`Retrying (${retries} attempts left)...`);
              await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
              return saveAIMessage(retries - 1);
            }
            return false;
          }
        };

        // Execute save operation in the background
        saveAIMessage().then((success) => {
          if (success) {
            // After successfully saving the AI message, make the conversation "official"
            // by updating state and triggering a UI refresh
            if (conversationIdToUse) {
              // Update the React state to make the conversation visible in the UI
              setCurrentConversation(conversationIdToUse);

              // The refreshConversations call will trigger sidebar updates
              // This only needs to happen once - when the conversation first becomes visible
              refreshConversations();
            }
          } else {
            console.error("Failed to save AI message after all retries");
          }
        });
      } else {
        console.error("No conversation ID available, can't save AI message");
      }

      dispatch({ type: "SET_LOADING", payload: false });
    } catch (e) {
      console.error("Error during AI chat streaming:", e);

      // Log detailed error information for reasoning models debugging
      console.error("Model:", state.selectedModel);
      console.error("Supports reasoning:", supportsReasoning);
      console.error(
        "Enhanced prompt used:",
        enhancedPrompt ? enhancedPrompt.substring(0, 100) : "N/A"
      );

      // Provide more specific error message based on the error type
      let errorMessage =
        "I apologize, but I encountered an error. Please try again.";

      if (e instanceof Error) {
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);

        // Check for common API errors
        if (e.message.includes("model") || e.message.includes("Model")) {
          errorMessage =
            "The selected model is currently unavailable. Please try a different model.";
        } else if (
          e.message.includes("parameter") ||
          e.message.includes("Parameter")
        ) {
          errorMessage =
            "There was a configuration issue with the model. Please try again.";
        } else if (
          e.message.includes("timeout") ||
          e.message.includes("Timeout")
        ) {
          errorMessage = "The request timed out. Please try again.";
        }
      }

      // Handle Puter API error objects
      if (
        typeof e === "object" &&
        e !== null &&
        "success" in e &&
        "error" in e
      ) {
        const puterError = e as {
          success: boolean;
          error: { code: string; message: string; status?: number };
        };
        console.error("Puter API Error:", puterError);

        if (
          puterError.error.code === "forbidden" ||
          puterError.error.status === 403
        ) {
          errorMessage = `Access denied to model "${state.selectedModel}". This model may require special permissions or may not be available in your region. Please try a different model.`;
        } else if (
          puterError.error.code === "not_found" ||
          puterError.error.status === 404
        ) {
          errorMessage = `Model "${state.selectedModel}" not found. Please select a different model.`;
        } else if (
          puterError.error.code === "rate_limit" ||
          puterError.error.status === 429
        ) {
          errorMessage =
            "Rate limit exceeded. Please wait a moment and try again.";
        } else {
          errorMessage = `API Error: ${puterError.error.message}`;
        }
      }

      // Batch updates for better performance
      streamingRef.current = { messageId: null, isStreaming: false };
      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: { id: aiMessageId, content: errorMessage },
      });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearChat = () => {
    // Clear any streaming
    streamingRef.current = { messageId: null, isStreaming: false };
    dispatch({ type: "CLEAR_MESSAGES" });
  };

  const setInputValue = (value: string) => {
    dispatch({ type: "SET_INPUT_VALUE", payload: value });
  };

  const setModel = (model: string) => {
    // Save to localStorage before dispatching the action (safely)
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedAIModel", model);
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    dispatch({ type: "SET_MODEL", payload: model });
  };

  // Add these new functions to the ChatProvider
  const loadConversation = async (conversationId: string, retries = 3) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch(`/api/conversations/${conversationId}`);

      if (!response.ok) {
        console.error(
          `Failed to load conversation: ${response.status} ${response.statusText}`
        );
        if (retries > 0) {
          console.log(
            `Retrying to load conversation (${retries} attempts left)...`
          );
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
          return loadConversation(conversationId, retries - 1);
        }
        dispatch({ type: "SET_LOADING", payload: false });
        return false;
      }

      const conversation = await response.json();
      console.log("Loaded conversation:", conversation);

      // Log if any messages have compare responses
      if (conversation.messages) {
        const messagesWithCompare = conversation.messages.filter(
          (msg: Message) =>
            msg.compareResponses && msg.compareResponses.length > 0
        );

        if (messagesWithCompare.length > 0) {
          console.log(
            `Found ${messagesWithCompare.length} messages with compare responses`
          );
          messagesWithCompare.forEach((msg: Message) => {
            console.log(
              `Message ID: ${msg.id} has ${
                msg.compareResponses?.length || 0
              } compare responses`
            );
          });
        }
      }

      // Clear current messages
      dispatch({ type: "CLEAR_MESSAGES" });

      // Add each message from the conversation
      // Ensure we preserve all fields including compareResponses and webSearchData
      conversation.messages.forEach((message: Message) => {
        // Make sure the message is fully formed with all properties
        const completeMessage: Message = {
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp
            ? new Date(message.timestamp)
            : new Date(),
          reasoning: message.reasoning,
          hasReasoningCapability: message.hasReasoningCapability,
          compareResponses: message.compareResponses || [],
          file: message.file,
          webSearchData: message.webSearchData,
        };

        dispatch({ type: "ADD_MESSAGE", payload: completeMessage });
      });

      // Set current conversation
      setCurrentConversation(conversationId);
      dispatch({ type: "SET_LOADING", payload: false });
      return true;
    } catch (error) {
      console.error("Error loading conversation:", error);

      if (retries > 0) {
        console.log(
          `Retrying to load conversation (${retries} attempts left)...`
        );
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
        return loadConversation(conversationId, retries - 1);
      }

      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const newChat = () => {
    dispatch({ type: "CLEAR_MESSAGES" });
    setCurrentConversation(null);
  };

  const refreshConversations = () => {
    // This function will be called after the first AI response is saved to the database
    // It dispatches an action that will trigger a UI refresh for components watching this state
    console.log("Triggering conversation refresh for UI components");

    // A shorter delay is sufficient since we're just updating React state
    // The actual database operations are already complete by this point
    setTimeout(() => {
      dispatch({
        type: "CONVERSATION_UPDATED",
        payload: new Date().toISOString(),
      });
    }, 300);
  };

  const updateMessage = (
    id: string,
    content: string,
    reasoning?: string,
    hasReasoningCapability?: boolean
  ) => {
    dispatch({
      type: "UPDATE_MESSAGE",
      payload: { id, content, reasoning, hasReasoningCapability },
    });
  };

  const value: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    clearChat,
    setInputValue,
    setModel,
    loadConversation,
    newChat,
    refreshConversations,
    updateMessage,
    currentConversation,
    puterState: { puter, isLoading: puterLoading, error: puterError }, // Optional: expose Puter state
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
