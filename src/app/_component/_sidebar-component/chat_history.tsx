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

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations");
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

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
