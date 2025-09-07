"use client";

import InputArea from "./_component/input_area";
import MessageContainer from "./_component/message_container";
import ChatSidebar from "./_component/sidebar";

import { ChatProvider } from "@/contexts/chat/chat_provider";
import PuterProvider from "@/service-providers/puter-provider";

export default function Home() {
  return (
    <div className="flex h-screen">
      <PuterProvider>
        <ChatProvider>
          <ChatSidebar />
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            <MessageContainer />
            <InputArea />
          </div>
        </ChatProvider>
      </PuterProvider>
    </div>
  );
}
