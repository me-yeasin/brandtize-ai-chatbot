import ChatItem from "./chat_item";

const ChatHistory = () => {
  return (
    <div className="flex-1 overflow-y-auto px-2">
      <div className="text-xs text-gray-200 font-medium px-2 py-2">Today</div>
      <ChatItem />
      <ChatItem />
      <ChatItem />
    </div>
  );
};

export default ChatHistory;
