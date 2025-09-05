"use client";

import { useEffect, useRef } from "react";

import SendIcon from "@/assets/icons/send";
import {
  useChatActions,
  useInputValue,
  useIsLoading,
} from "@/contexts/chat/hooks";
import { useFileAttachment } from "@/contexts/file-attachment/file_attachment_context";
import FileAttachment from "./file_attachment";

const TextEditorWithBtn = () => {
  const inputValue = useInputValue();
  const { setInputValue, sendMessage } = useChatActions();
  const isloading = useIsLoading();
  const { attachedFile, clearAttachedFile } = useFileAttachment();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto"; // Reset height
    // e.target.style.height = `${e.target.scrollHeight}px`; // Set to new height
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
        sendMessage(messageContent, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } else {
        // Regular text message without file
        sendMessage(messageContent);
      }

      // Clear the attached file after sending
      if (attachedFile) {
        clearAttachedFile();
      }
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
