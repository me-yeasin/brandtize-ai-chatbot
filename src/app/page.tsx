"use client";

import InputArea from "./_component/input_area";
import MessageContainer from "./_component/message_container";
import ChatSidebar from "./_component/sidebar";

import { ChatProvider } from "@/contexts/chat/chat_provider";

export default function Home() {
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatProvider>
          <MessageContainer />
          <InputArea />
        </ChatProvider>
      </div>
    </div>
  );
}
