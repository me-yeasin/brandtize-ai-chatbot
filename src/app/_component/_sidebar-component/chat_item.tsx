import ChatBubbleIcon from "@/assets/icons/chat_bubble";

const ChatItem = () => {
  return (
    <div className="bg-gray-700 rounded-lg px-3 py-2 mb-1 cursor-pointer transition-colors duration-200">
      <div className="flex items-center gap-2">
        <ChatBubbleIcon />
        <span className="text-sm truncate">How to build a website</span>
      </div>
    </div>
  );
};

export default ChatItem;
