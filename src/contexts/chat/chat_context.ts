import { createContext } from "react";

import { Puter } from "@/hooks/puter/usePuter";

import { Message } from "@/models/message";

interface ChatState {
  messages: Message[];
  showWelcomeMessage: boolean;
  isLoading: boolean;
  inputValue: string;
  selectedModel: string;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_INPUT_VALUE"; payload: string }
  | { type: "HIDE_WELCOME" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SET_MODEL"; payload: string }
  | {
      type: "UPDATE_STREAMING_MESSAGE";
      payload: { id: string; content: string };
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
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content }
            : msg
        ),
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
    default:
      return state;
  }
}

// In your chat_context.ts file
export interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => void;
  clearChat: () => void;
  setInputValue: (value: string) => void;
  setModel: (model: string) => void;
  puterState?: {
    puter: Puter | null;
    isLoading: boolean;
    error: string | null;
  }; // Optional
}
export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);
