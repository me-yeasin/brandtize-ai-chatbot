import ChatHistory from "./_sidebar-component/chat_history";
import NewChatBtn from "./_sidebar-component/newchat_btn";
import UserProfile from "./_sidebar-component/user_profile";

const ChatSidebar = () => {
  return (
    <div className="w-[350px] border-r border-gray-800 flex flex-col h-full">
      <NewChatBtn />
      <ChatHistory />
      <UserProfile />
    </div>
  );
};

export default ChatSidebar;
