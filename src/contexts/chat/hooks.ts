import { useContext } from "react";
import { ChatContext } from "./chat_context";

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

// Selector hooks for better performance
export function useMessages() {
  const { state } = useChat();
  return state.messages;
}

export function useShowWelcome() {
  const { state } = useChat();
  return state.showWelcomeMessage;
}

export function useIsLoading() {
  const { state } = useChat();
  return state.isLoading;
}

export function useInputValue() {
  const { state } = useChat();
  return state.inputValue;
}

export function useSelectedModel() {
  const { state } = useChat();
  return state.selectedModel;
}

export function useChatActions() {
  const { sendMessage, clearChat, setInputValue, setModel } = useChat();
  return { sendMessage, clearChat, setInputValue, setModel };
}
