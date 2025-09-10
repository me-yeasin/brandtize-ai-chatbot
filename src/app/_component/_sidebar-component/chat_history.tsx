import { useChat } from "@/contexts/chat/hooks";
import { useEffect, useState } from "react";
import CircleSpinner from "../../../component/animated/circle_spinner";
import ChatItem from "./chat_item";

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
}

type ChatHistoryProps = {
  onItemSelected?: () => void;
};

const ChatHistory = ({ onItemSelected }: ChatHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { loadConversation, currentConversation } = useChat();

  // Handler for conversation rename
  const handleConversationRename = (id: string, newTitle: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv._id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  // Function to fetch conversations
  const fetchConversations = async (isInitial = false) => {
    try {
      console.log("Fetching conversations for sidebar...");
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        console.log(`Loaded ${data.length} conversations`);
        // Only set initialLoading to false when it's the initial fetch
        if (isInitial) {
          setInitialLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (isInitial) {
        setInitialLoading(false);
      }
    }
  };

  // Load conversations on initial mount
  useEffect(() => {
    fetchConversations(true); // Mark this as the initial fetch
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
    <div className="flex-1 h-[calc(100vh-220px)] overflow-y-auto px-2">
      {initialLoading ? (
        <div className="flex justify-center items-center h-32">
          <CircleSpinner />
        </div>
      ) : (
        Object.entries(groupedConversations).map(([date, convos]) => (
          <div key={date}>
            <div className="text-sm text-gray-200 font-medium px-2 py-2">
              {date}
            </div>
            {convos.map((conversation) => (
              <ChatItem
                key={conversation._id}
                id={conversation._id}
                title={conversation.title}
                isActive={currentConversation === conversation._id}
                onClick={async () => {
                  await loadConversation(conversation._id);
                  onItemSelected?.();
                }}
                onRename={handleConversationRename}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatHistory;
