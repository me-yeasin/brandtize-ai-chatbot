import { createContext } from "react";

import { Puter } from "@/hooks/puter/usePuter";

import { Message } from "@/models/message";

interface ChatState {
  messages: Message[];
  showWelcomeMessage: boolean;
  isLoading: boolean;
  inputValue: string;
  selectedModel: string;
  _lastRefresh?: string; // Timestamp of last conversation refresh
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_INPUT_VALUE"; payload: string }
  | { type: "HIDE_WELCOME" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SET_MODEL"; payload: string }
  | { type: "CONVERSATION_UPDATED"; payload: string } // New action to trigger conversation refresh
  | {
      type: "UPDATE_STREAMING_MESSAGE";
      payload: { id: string; content: string; reasoning?: string };
    }
  | {
      type: "UPDATE_MESSAGE";
      payload: {
        id: string;
        content: string;
        reasoning?: string;
        hasReasoningCapability?: boolean;
      };
    };

export const initialState: ChatState = {
  messages: [],
  showWelcomeMessage: true,
  isLoading: false,
  inputValue: "",
  selectedModel: "gpt-5-nano", // Default model
};

// Reducer
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "UPDATE_STREAMING_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) => {
          if (msg.id === action.payload.id) {
            const updatedMsg = {
              ...msg,
              content: action.payload.content,
            };

            // Only update reasoning if provided in payload, otherwise keep existing
            if (action.payload.reasoning !== undefined) {
              updatedMsg.reasoning = action.payload.reasoning;
            }

            return updatedMsg;
          }
          return msg;
        }),
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        showWelcomeMessage: false,
      };
    case "SET_INPUT_VALUE":
      return {
        ...state,
        inputValue: action.payload,
      };
    case "HIDE_WELCOME":
      return {
        ...state,
        showWelcomeMessage: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
        showWelcomeMessage: true,
        inputValue: "",
      };
    case "SET_MODEL":
      return {
        ...state,
        selectedModel: action.payload,
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) => {
          if (msg.id === action.payload.id) {
            return {
              ...msg,
              content: action.payload.content,
              reasoning: action.payload.reasoning,
              hasReasoningCapability: action.payload.hasReasoningCapability,
            };
          }
          return msg;
        }),
      };
    case "CONVERSATION_UPDATED":
      // This case is specifically to trigger rerenders for components
      // that need to refresh when conversations change
      console.log("Conversation updated at:", action.payload);
      return {
        ...state,
        // We add a dummy field that won't affect functionality but ensures
        // a new state object is created to trigger rerenders
        _lastRefresh: action.payload,
      };
    default:
      return state;
  }
}

// In your chat_context.ts file
export interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (
    content: string,
    useWebSearch?: boolean,
    fileInfo?: { name: string; size: number; type: string }
  ) => void;
  clearChat: () => void;
  setInputValue: (value: string) => void;
  setModel: (model: string) => void;
  loadConversation: (conversationId: string) => void;
  newChat: () => void;
  refreshConversations: () => void; // New function to refresh the conversation list
  updateMessage: (
    id: string,
    content: string,
    reasoning?: string,
    hasReasoningCapability?: boolean
  ) => void; // New function to update a specific message
  currentConversation: string | null;
  puterState?: {
    puter: Puter | null;
    isLoading: boolean;
    error: string | null;
  }; // Optional
}
export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);
