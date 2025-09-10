"use client";

import SendIcon from "@/assets/icons/send";
import ClientOnly from "@/component/client_only";
import {
  useChatActions,
  useInputValue,
  useIsLoading,
} from "@/contexts/chat/hooks";
import { useFileAttachment } from "@/contexts/file-attachment/file_attachment_context";
import { useEffect, useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";
import FileAttachment from "./file_attachment";

const TextEditorWithBtn = () => {
  const inputValue = useInputValue();
  const { setInputValue, sendMessage } = useChatActions();
  const isloading = useIsLoading();
  const { attachedFile, clearAttachedFile } = useFileAttachment();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with default values
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [showedWebSearchNotification, setShowedWebSearchNotification] =
    useState(false);

  // Load saved preferences from localStorage after component mounts (client-side only)
  useEffect(() => {
    // Load web search enabled state
    const savedWebSearch = localStorage.getItem("webSearchEnabled");
    if (savedWebSearch === "true") {
      setWebSearchEnabled(true);
    }

    // Load notification state
    const savedNotification = localStorage.getItem(
      "webSearchNotificationShown"
    );
    if (savedNotification === "true") {
      setShowedWebSearchNotification(true);
    }
  }, []);

  // Save web search preference when it changes
  useEffect(() => {
    localStorage.setItem("webSearchEnabled", webSearchEnabled.toString());
  }, [webSearchEnabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto"; // Reset height
    e.target.style.height = Math.min(e.target.scrollHeight, 350) + "px";
  };

  const handleSubmit = () => {
    if ((inputValue.trim() || attachedFile) && !isloading) {
      let messageContent = inputValue.trim();

      if (attachedFile) {
        const file = attachedFile.file;
        // Create file info for display in message content
        const fileInfo = `[File attached: ${file.name} (${(
          file.size / 1024
        ).toFixed(2)} KB, ${file.type})]`;

        // Add file info to the message if there's instruction text
        if (messageContent) {
          messageContent = `${messageContent}\n\n${fileInfo}`;
        } else {
          messageContent = fileInfo;
        }

        // Send the message with file metadata
        sendMessage(messageContent, webSearchEnabled, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } else {
        // Regular text message without file
        sendMessage(messageContent, webSearchEnabled);
      }

      // Clear the input and reset
      setInputValue("");

      // Clear the attached file after sending
      if (attachedFile) {
        clearAttachedFile();
      }

      // We no longer reset web search toggle after sending
      // This allows it to stay enabled until manually toggled off
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleWebSearch = () => {
    const newValue = !webSearchEnabled;
    setWebSearchEnabled(newValue);

    // Show a notification the first time web search is enabled - only on client side
    if (newValue && !showedWebSearchNotification) {
      setShowedWebSearchNotification(true);

      // Only show notification and store in localStorage after a small delay
      // to ensure we're fully on the client side
      setTimeout(() => {
        localStorage.setItem("webSearchNotificationShown", "true");

        // You could implement a toast notification here if you want
        console.log(
          "Web search enabled and will stay on until manually disabled"
        );
        alert(
          "Web search is now enabled and will stay on until you manually disable it"
        );
      }, 100);
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
      {/* File attachment preview if there is an attached file */}
      {attachedFile && (
        <div className="mb-2">
          <FileAttachment
            file={attachedFile.file}
            previewUrl={attachedFile.previewUrl}
            onRemove={clearAttachedFile}
          />
        </div>
      )}

      {/* Web search toggle button */}
      <div className="mb-2 flex justify-end">
        <ClientOnly>
          {/* Use separate buttons for enabled/disabled states to avoid hydration issues */}
          {webSearchEnabled ? (
            <button
              onClick={toggleWebSearch}
              className="flex items-center px-3 py-1 rounded-lg text-sm bg-blue-600 text-white font-medium ring-2 ring-blue-400 shadow-md transition-all duration-200"
              title="Web search enabled"
            >
              <BsSearch className="mr-1 text-blue-200" size={14} />
              Web
              <span className="ml-1 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
            </button>
          ) : (
            <button
              onClick={toggleWebSearch}
              className="flex items-center px-3 py-1 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
              title="Enable web search"
            >
              <BsSearch className="mr-1" size={14} />
              Web
            </button>
          )}
        </ClientOnly>
      </div>

      <textarea
        placeholder={
          attachedFile
            ? "Add instructions about the file..."
            : "Message AI Assistant..."
        }
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
