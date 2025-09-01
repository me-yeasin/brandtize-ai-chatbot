"use client";

import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import "./markdown.css";

interface FormattedMessageProps {
  content: string;
}

// Use a WeakMap to store delegated click handlers for each container node.
const copyHandlerMap = new WeakMap<HTMLDivElement, (e: MouseEvent) => void>();

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  // Parse markdown and enhance code blocks - optimized for performance
  useEffect(() => {
    if (!messageRef.current) return;

    // Configure marked for better performance
    // Configure marked with sync options
    const markedOptions = {
      breaks: true,
      gfm: true,
      async: false, // Synchronous parsing is faster for short content
    };

    const processMarkdown = () => {
      try {
        // Parse markdown to HTML - using sync API and casting result
        const rawHtml = marked.parse(content, markedOptions) as string;

        // Process the HTML to enhance code blocks
        const enhancedHtml = enhanceCodeBlocks(rawHtml);

        // Set the HTML content
        const container = messageRef.current;
        if (container) {
          // Use direct assignment for performance
          container.innerHTML = enhancedHtml;

          // Optimized event delegation with immediate action
          const onCopyClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            const button = target?.closest?.(
              ".copy-button"
            ) as HTMLElement | null;
            if (!button) return;

            const codeId = button.getAttribute("data-code-id");
            if (!codeId) return;

            // Fast element selection
            const codeElement = container.querySelector(
              `#${codeId}`
            ) as HTMLElement | null;
            if (!codeElement) return;

            const codeText = codeElement.textContent || "";

            // Immediate visual feedback before the async operation
            const textSpan = button.querySelector("span");
            if (textSpan) textSpan.textContent = "Copying...";

            navigator.clipboard
              .writeText(codeText)
              .then(() => {
                setCopyStates((prev) => ({ ...prev, [codeId]: true }));
                // Use shorter timeout
                setTimeout(() => {
                  setCopyStates((prev) => ({ ...prev, [codeId]: false }));
                }, 1000); // Reduced from 2000ms
              })
              .catch(() => {
                // Skip error logging for performance
                if (textSpan) textSpan.textContent = "Copy";
              });
          };

          container.addEventListener("click", onCopyClick);
          copyHandlerMap.set(container, onCopyClick);
        }
      } catch {
        // Fast fallback without error logging
        if (messageRef.current) {
          messageRef.current.textContent = content;
        }
      }
    };

    // Function to enhance code blocks with our custom styling and copy button
    const enhanceCodeBlocks = (html: string): string => {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Find all pre > code elements
      const codeBlocks = tempDiv.querySelectorAll("pre > code");

      codeBlocks.forEach((codeBlock, index) => {
        const preElement = codeBlock.parentElement;
        if (!preElement) return;

        // Get the language from class (highlight.js adds class like 'language-javascript')
        let language = "plain text";
        const languageMatch = Array.from(codeBlock.classList).find((cls) =>
          cls.startsWith("language-")
        );

        if (languageMatch) {
          language = languageMatch.replace("language-", "");

          try {
            // Apply syntax highlighting with a timeout to avoid blocking the UI
            setTimeout(() => {
              if (document.body.contains(codeBlock)) {
                hljs.highlightElement(codeBlock as HTMLElement);
              }
            }, 0);
          } catch {
            // Continue even if highlighting fails
          }
        }

        // Generate a unique ID for this code block
        const id = `code-${index}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        codeBlock.id = id;

        // Create the code header with language name and copy button
        const codeHeader = document.createElement("div");
        codeHeader.className = "code-header";
        codeHeader.innerHTML = `
          <span class="code-language">${language}</span>
          <button class="copy-button" data-code-id="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <span>Copy</span>
          </button>
        `;

        // Create a new container for the code block
        const codeContainer = document.createElement("div");
        codeContainer.className = "code-block";

        // Move the pre element into the container and add the header
        preElement.parentNode?.replaceChild(codeContainer, preElement);
        codeContainer.appendChild(codeHeader);
        codeContainer.appendChild(preElement);

        // Add classes to the pre element
        preElement.className = "code-pre";
      });

      return tempDiv.innerHTML;
    };

    // Process the markdown
    processMarkdown();

    // Cleanup event listeners: capture ref at time of effect
    const current = messageRef.current;
    return () => {
      if (!current) return;
      const handler = copyHandlerMap.get(current);
      if (handler) current.removeEventListener("click", handler);
      copyHandlerMap.delete(current);
    };
  }, [content]);

  // Update button text based on copy states
  useEffect(() => {
    if (!messageRef.current) return;

    Object.entries(copyStates).forEach(([id, copied]) => {
      const button = messageRef.current?.querySelector(
        `[data-code-id="${id}"]`
      );
      if (!button) return;

      const textSpan = button.querySelector("span");
      if (textSpan) {
        textSpan.textContent = copied ? "Copied!" : "Copy";
      }
    });
  }, [copyStates]);

  return (
    <div ref={messageRef} className="markdown-content text-white break-words" />
  );
};

export default FormattedMessage;
