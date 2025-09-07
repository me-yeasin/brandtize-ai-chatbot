import PlusIcon from "@/assets/icons/plus";
import { useChat } from "@/contexts/chat/hooks";

const NewChatBtn = () => {
  const { newChat } = useChat();

  return (
    <div className="p-4">
      <button
        onClick={newChat}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-colors duration-200"
      >
        <PlusIcon />
        <span className="font-medium">New chat</span>
      </button>
    </div>
  );
};

export default NewChatBtn;
