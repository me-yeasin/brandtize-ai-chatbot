import {
  useIsLoading,
  useMessages,
  useShowWelcome,
} from "@/contexts/chat/hooks";
import { cn } from "@/utils/taildwind_helper";
import FormattedMessage from "./_message-container-comp/formatted_message";
import MessageWithFile from "./_message-container-comp/message_with_file";
import RegenerateButton from "./_message-container-comp/regenerate_button";
import WelcomeMessage from "./_message-container-comp/welcome_message";

const MessageContainer = () => {
  const messages = useMessages();
  const showWelcome = useShowWelcome();
  const isLoading = useIsLoading();

  // Optimize the computation for better performance
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  const isLastMessageLoading = isLoading && lastMessage?.role === "assistant";

  return (
    <div
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
                        ? "bg-transparent rounded-bl-none"
                        : "bg-gray-800 rounded-bl-none"
                    )}
                  >
                    {shouldShowLoading ? (
                      <div className="flex items-center justify-center p-0 m-0">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </div>
                    ) : msg.file ? (
                      <MessageWithFile content={msg.content} file={msg.file} />
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}
                  </div>
                  {showRegenerateButton && (
                    <div className="flex justify-end">
                      <RegenerateButton previousMessage={prevUserMessage} />
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
