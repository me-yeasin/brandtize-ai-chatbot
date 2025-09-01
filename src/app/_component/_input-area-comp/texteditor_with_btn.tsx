"use client";

import { useEffect, useRef } from "react";

import SendIcon from "@/assets/icons/send";
import {
  useChatActions,
  useInputValue,
  useIsLoading,
} from "@/contexts/chat/hooks";

const TextEditorWithBtn = () => {
  const inputValue = useInputValue();
  const { setInputValue, sendMessage } = useChatActions();
  const isloading = useIsLoading();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto"; // Reset height
    // e.target.style.height = `${e.target.scrollHeight}px`; // Set to new height
    e.target.style.height = Math.min(e.target.scrollHeight, 350) + "px";
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !isloading) {
      sendMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        Math.min(textAreaRef.current.scrollHeight, 350) + "px";
    }
  }, [inputValue]);

  return (
    <div className="relative">
      <textarea
        placeholder="Message AI Assistant..."
        className="w-full border border-gray-600 rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent hide-scrollbar"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        ref={textAreaRef}
        value={inputValue}
        rows={1}
        disabled={isloading}
      />
      <button
        onClick={handleSubmit}
        className="absolute bottom-3 right-3 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default TextEditorWithBtn;
