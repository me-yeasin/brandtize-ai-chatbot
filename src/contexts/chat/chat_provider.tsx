import {
  ChatContext,
  ChatContextType,
  chatReducer,
  initialState,
} from "@/contexts/chat/chat_context";
import { usePuter } from "@/hooks/puter/usePuter"; // Import your Puter hook
// AiResponse typing intentionally omitted — responses can be many shapes; handle as unknown/iterable
import { Message } from "@/models/message";
import { ReactNode, useEffect, useReducer, useRef } from "react";

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { puter, isLoading: puterLoading, error: puterError } = usePuter();

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || !puter) return;

    // Clear any existing streaming
    streamingRef.current = { messageId: null, isStreaming: false };

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Add user message
    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_INPUT_VALUE", payload: "" });

    // Create AI message (empty content) so the UI shows the normal loading indicator while streaming begins
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
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

      // Optimized extraction with minimal type checking for speed
      // Optimized content extraction with fewer try-catch blocks and early returns
      const extractChunkContent = (chunk: unknown): string => {
        // Fast path for common cases
        if (!chunk) return "";
        if (typeof chunk === "string") return chunk;

        // Handle binary data with single TextDecoder instance
        const dec = new TextDecoder();

        // Process binary data efficiently
        if (chunk instanceof Uint8Array) {
          return dec.decode(chunk);
        }
        if (chunk instanceof ArrayBuffer) {
          return dec.decode(new Uint8Array(chunk));
        }

        // Handle object format - simplified with direct property access
        if (typeof chunk === "object") {
          const obj = chunk as Record<string, unknown>;

          // Direct access for common patterns (OpenAI, custom formats)
          if (typeof obj.content === "string") return obj.content;

          // Handle nested message format
          if (obj.message && typeof obj.message === "object") {
            const msgContent = (obj.message as Record<string, unknown>).content;
            if (typeof msgContent === "string") return msgContent;
          }

          // Handle text property
          if (typeof obj.text === "string") return obj.text;

          // Handle OpenAI streaming format
          if (Array.isArray(obj.choices) && obj.choices[0]) {
            const delta = (obj.choices[0] as Record<string, unknown>).delta;
            if (delta && typeof delta === "object") {
              const deltaContent = (delta as Record<string, unknown>).content;
              if (typeof deltaContent === "string") return deltaContent;
            }
          }
        }

        return "";
      };

      // Optimized update function that directly updates the message without buffer delays
      const updateMessage = (content: string) => {
        if (!content) return;

        fullContent += content;
        dispatch({
          type: "UPDATE_STREAMING_MESSAGE",
          payload: { id: aiMessageId, content: fullContent },
        });
      };

      // No filler here — keep normal loading indicator until real chunks arrive

      // Skip unnecessary logging to speed up processing

      // Immediately call puter.ai.chat for faster response
      const maybeStream = puter.ai.chat(
        content,
        {
          model: "openrouter:z-ai/glm-4.5",
          stream: true,
        },
        true
      );

      // Support promise or direct stream-like return without using `any`
      const stream =
        maybeStream &&
        typeof (maybeStream as unknown as Promise<unknown>).then === "function"
          ? await (maybeStream as Promise<unknown>)
          : (maybeStream as unknown);
      // Skip logging for performance gain

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
              updateMessage(text);
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
      } catch {
        // Skip error logging for faster fallback
      }

      if (!handled) {
        // Non-iterable fallback: await response and extract content
        const response = stream as unknown;
        let responseContent = "";
        if (response && typeof response === "object") {
          const r = response as Record<string, unknown>;
          if ("content" in r && typeof r.content === "string") {
            responseContent = r.content as string;
          } else if (
            "message" in r &&
            r.message &&
            typeof (r.message as Record<string, unknown>).content === "string"
          ) {
            responseContent = (r.message as Record<string, unknown>)
              .content as string;
          } else {
            responseContent = "No response from AI";
          }
        } else if (typeof response === "string") {
          responseContent = response;
        } else {
          responseContent = "No response from AI";
        }

        updateMessage(responseContent);
      }

      // Mark streaming finished and immediately complete the response
      streamingRef.current = { messageId: null, isStreaming: false };

      // Ensure final content is set and clear loading
      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: { id: aiMessageId, content: fullContent },
      });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch {
      // Skip error logging for faster recovery

      // Immediately update UI with error message and reset state in one batch
      const errorMessage =
        "I apologize, but I encountered an error. Please try again.";

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

  const value: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    clearChat,
    setInputValue,
    puterState: { puter, isLoading: puterLoading, error: puterError }, // Optional: expose Puter state
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
