import { useChat } from "@/contexts/chat/hooks";
import { useEffect, useState } from "react";
import ChatItem from "./chat_item";

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
}

const ChatHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { loadConversation, currentConversation } = useChat();

  // Function to fetch conversations
  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations for sidebar...");
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        console.log(`Loaded ${data.length} conversations`);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Load conversations on initial mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for the CONVERSATION_UPDATED action
  // This will be triggered after the first AI response is saved
  useEffect(() => {
    // We're watching for specific state changes that indicate a conversation update
    if (currentConversation) {
      console.log(
        "Current conversation changed, refreshing sidebar:",
        currentConversation
      );
      fetchConversations();
    }
  }, [currentConversation]);

  // Group conversations by date
  const groupedConversations = conversations.reduce(
    (groups: Record<string, Conversation[]>, conversation) => {
      const date = new Date(conversation.updatedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;

      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(conversation);
      return groups;
    },
    {}
  );

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {Object.entries(groupedConversations).map(([date, convos]) => (
        <div key={date}>
          <div className="text-xs text-gray-200 font-medium px-2 py-2">
            {date}
          </div>
          {convos.map((conversation) => (
            <ChatItem
              key={conversation._id}
              id={conversation._id}
              title={conversation.title}
              isActive={currentConversation === conversation._id}
              onClick={() => loadConversation(conversation._id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
