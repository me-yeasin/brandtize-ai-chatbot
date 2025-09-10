import {
  useIsLoading,
  useMessages,
  useShowWelcome,
} from "@/contexts/chat/hooks";
import { cn } from "@/utils/taildwind_helper";
import { useEffect, useRef, useState } from "react";
import ClarifyButton from "./_message-container-comp/clarify_button";
import CompareButton from "./_message-container-comp/compare_button";
import CopyButton from "./_message-container-comp/copy_button";
import FormattedMessage from "./_message-container-comp/formatted_message";
import LoadingIndicatorWithMessage from "./_message-container-comp/loading_indicator_with_message";
import MessageWithFile from "./_message-container-comp/message_with_file";
import ModelDropdownButton from "./_message-container-comp/model_dropdown_button";
import RegenerateButton from "./_message-container-comp/regenerate_button";
import WelcomeMessage from "./_message-container-comp/welcome_message";

const MessageContainer = () => {
  const messages = useMessages();
  const showWelcome = useShowWelcome();
  const isLoading = useIsLoading();
  const containerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Optimize the computation for better performance
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  const isLastMessageLoading = isLoading && lastMessage?.role === "assistant";

  // Handle auto-scrolling
  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current && !userHasScrolled) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    };

    // Scroll to bottom when new messages arrive or AI is typing
    if (messages.length > 0 || isLoading) {
      scrollToBottom();
    }

    // Set up an interval to handle continuous scrolling during AI response generation
    let scrollInterval: NodeJS.Timeout | null = null;

    if (isLastMessageLoading && !userHasScrolled) {
      scrollInterval = setInterval(scrollToBottom, 500);
    }

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [messages, isLoading, isLastMessageLoading, userHasScrolled]);

  // Handle user scroll interaction
  useEffect(() => {
    const handleUserScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      // If user scrolled away from bottom, mark as user-scrolled
      if (!isAtBottom && isLastMessageLoading) {
        setUserHasScrolled(true);
      }

      // If user scrolled back to bottom, allow auto-scrolling again
      if (isAtBottom) {
        setUserHasScrolled(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleUserScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleUserScroll);
      }
    };
  }, [isLastMessageLoading]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto bg-black h-full w-full",
        showWelcome && "flex items-center justify-center"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Welcome Message */}
        {showWelcome && <WelcomeMessage />}

        {/* Messages - with optimized rendering */}
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => {
            // Fast path determination with minimal calculations
            const isLastMessage = index === messages.length - 1;

            // Simplified condition with fewer checks
            const shouldShowLoading =
              isLastMessageLoading &&
              isLastMessage &&
              msg.role === "assistant" &&
              !msg.content;

            // Find previous user message for regenerate button
            const prevUserMessage =
              msg.role === "assistant" && index > 0
                ? messages[index - 1]
                : null;
            const showRegenerateButton =
              msg.role === "assistant" &&
              !shouldShowLoading &&
              prevUserMessage?.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-col">
                  <div
                    className={cn(
                      "px-2 py-1 rounded-lg max-w-5xl w-auto inline-block",
                      msg.role === "user"
                        ? "bg-blue-600 rounded-br-none"
                        : shouldShowLoading
                        ? "bg-gray-900 border border-gray-800 rounded-bl-none"
                        : "bg-gray-800 rounded-bl-none"
                    )}
                  >
                    {shouldShowLoading ? (
                      <div className="p-1">
                        <LoadingIndicatorWithMessage
                          webSearchData={msg.webSearchData}
                        />
                      </div>
                    ) : msg.file ? (
                      <MessageWithFile
                        content={msg.content}
                        file={msg.file}
                        webSearchData={msg.webSearchData}
                      />
                    ) : (
                      <FormattedMessage
                        content={msg.content}
                        reasoning={msg.reasoning}
                        hasReasoningCapability={msg.hasReasoningCapability}
                        webSearchData={msg.webSearchData}
                      />
                    )}
                  </div>
                  {showRegenerateButton && (
                    <div className="flex justify-end">
                      <div className="flex items-center">
                        <RegenerateButton previousMessage={prevUserMessage} />
                        <CopyButton message={msg} />
                        <ModelDropdownButton
                          previousMessage={prevUserMessage}
                        />
                        <CompareButton
                          message={msg}
                          previousMessage={prevUserMessage}
                        />
                        <ClarifyButton
                          message={msg}
                          previousMessage={prevUserMessage}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
