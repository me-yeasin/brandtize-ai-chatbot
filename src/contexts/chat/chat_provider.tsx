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

      // Buffer for incoming chunks; we'll flush it gradually to create a typing effect
      let fullContent = "";
      let pendingBuffer = "";
      let isFlushing = false;

      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

      const extractChunkContent = (chunk: unknown): string => {
        if (!chunk) return "";
        // handle binary chunks (Uint8Array / ArrayBuffer)
        if (typeof Uint8Array !== "undefined" && chunk instanceof Uint8Array) {
          try {
            const dec = new TextDecoder();
            return dec.decode(chunk as Uint8Array);
          } catch {
            return "";
          }
        }
        if (
          typeof ArrayBuffer !== "undefined" &&
          chunk instanceof ArrayBuffer
        ) {
          try {
            const dec = new TextDecoder();
            return dec.decode(new Uint8Array(chunk as ArrayBuffer));
          } catch {
            return "";
          }
        }
        if (typeof chunk === "string") return chunk;
        if (typeof chunk === "object") {
          try {
            const obj = chunk as Record<string, unknown>;
            if ("content" in obj && typeof obj.content === "string")
              return obj.content as string;
            if (
              "message" in obj &&
              obj.message &&
              typeof (obj.message as Record<string, unknown>).content ===
                "string"
            )
              return (obj.message as Record<string, unknown>).content as string;
            if ("text" in obj && typeof obj.text === "string")
              return obj.text as string;
            if (
              "choices" in obj &&
              Array.isArray(obj.choices) &&
              obj.choices[0] &&
              (obj.choices[0] as Record<string, unknown>).delta &&
              typeof (
                (obj.choices[0] as Record<string, unknown>).delta as Record<
                  string,
                  unknown
                >
              ).content === "string"
            )
              return (
                (obj.choices[0] as Record<string, unknown>).delta as Record<
                  string,
                  unknown
                >
              ).content as string;
          } catch {
            return "";
          }
        }
        return "";
      };

      // Flush loop: consume pendingBuffer in small slices to create a smooth typing animation
      const startFlushLoop = async () => {
        if (isFlushing) return;
        isFlushing = true;
        try {
          while (streamingRef.current.isStreaming || pendingBuffer.length > 0) {
            if (pendingBuffer.length === 0) {
              await sleep(8);
              continue;
            }

            const take = pendingBuffer.slice(0, 6); // show more chars per step for faster reveal
            pendingBuffer = pendingBuffer.slice(take.length);

            fullContent += take;
            dispatch({
              type: "UPDATE_STREAMING_MESSAGE",
              payload: { id: aiMessageId, content: fullContent },
            });

            // tuned very low for fast typing feel
            await sleep(6);
          }
        } finally {
          isFlushing = false;
        }
      };

      // Start flush loop immediately so UI shows typing (or typing indicator) right away and spinner is minimized
      void startFlushLoop();

      // No filler here — keep normal loading indicator until real chunks arrive

      console.log("Sending message to AI:", content);

      // Call puter.ai.chat. It may return a stream-like object synchronously or a Promise that resolves to one.
      const maybeStream = puter.ai.chat(
        content,
        {
          model: "openrouter:z-ai/glm-4.5",
          stream: true,
        },
        false
      );

      // Support promise or direct stream-like return without using `any`
      const stream =
        maybeStream &&
        typeof (maybeStream as unknown as Promise<unknown>).then === "function"
          ? await (maybeStream as Promise<unknown>)
          : (maybeStream as unknown);
      console.log(stream);

      // Try multiple streaming shapes: async iterator, iterator.next(), ReadableStream (getReader), EventEmitter-like
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
              pendingBuffer += chunkContent;
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
              pendingBuffer += chunkContent;
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
              pendingBuffer += text;
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
              pendingBuffer += c;
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
      } catch (streamErr) {
        // swallow and fall back
        console.warn("stream handling error", streamErr);
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

        pendingBuffer += responseContent;
        void startFlushLoop();
      }

      // Mark streaming finished but wait for buffer to drain for typing effect
      streamingRef.current = { messageId: null, isStreaming: false };

      // Wait until the flush loop drains pendingBuffer
      while (isFlushing || pendingBuffer.length > 0) {
        // small wait
        await sleep(12);
      }

      // Ensure final content is set and clear loading
      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: { id: aiMessageId, content: fullContent },
      });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (e) {
      console.error("Error getting AI response:", e);

      // Handle error with a fallback message
      const errorMessage =
        "I apologize, but I encountered an error. Please try again.";

      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: { id: aiMessageId, content: errorMessage },
      });

      streamingRef.current = { messageId: null, isStreaming: false };
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
