import {
  useIsLoading,
  useMessages,
  useShowWelcome,
} from "@/contexts/chat/hooks";
import { cn } from "@/utils/taildwind_helper";
import FormattedMessage from "./_message-container-comp/formatted_message";
import WelcomeMessage from "./_message-container-comp/welcome_message";

const MessageContainer = () => {
  const messages = useMessages();
  const showWelcome = useShowWelcome();
  const isLoading = useIsLoading();

  // Check if the last message is from the assistant and loading
  const isLastMessageLoading =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant";

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

        {/* Messages */}
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => {
            // Check if this is the last message and it should show loading
            const isLastMessage = index === messages.length - 1;
            // Show spinner only if assistant message has no content yet and is currently loading
            const shouldShowLoading =
              isLastMessageLoading &&
              isLastMessage &&
              msg.role === "assistant" &&
              !msg.content;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
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
                  ) : (
                    <FormattedMessage content={msg.content} />
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
