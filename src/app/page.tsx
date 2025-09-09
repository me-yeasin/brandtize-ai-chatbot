"use client";

import { useCallback, useEffect, useState } from "react";
import InputArea from "./_component/input_area";
import MessageContainer from "./_component/message_container";
import ChatSidebar from "./_component/sidebar";

import { ChatProvider } from "@/contexts/chat/chat_provider";
import PuterProvider from "@/service-providers/puter-provider";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Lock body scroll on mobile when sidebar overlay is open
  useEffect(() => {
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (isMobile && sidebarOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen">
      <PuterProvider>
        <ChatProvider>
          <ChatSidebar open={sidebarOpen} onClose={closeSidebar} />
          {/* Main Chat Area */}
          <div className="relative flex-1 flex flex-col h-full">
            {/* Floating button to open sidebar when closed */}
            {!sidebarOpen && (
              <button
                type="button"
                onClick={openSidebar}
                aria-label="Open sidebar"
                title="Open sidebar"
                className="absolute top-3 left-3 z-20 p-2 rounded-md bg-gray-900 hover:bg-gray-800 text-gray-200 shadow transition"
              >
                {/* Hamburger icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}

            <MessageContainer />
            <InputArea />
          </div>
        </ChatProvider>
      </PuterProvider>
    </div>
  );
}
