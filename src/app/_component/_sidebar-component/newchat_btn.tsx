import PlusIcon from "@/assets/icons/plus";

const NewChatBtn = () => {
  return (
    <div className="p-4">
      <button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-colors duration-200">
        <PlusIcon />
        <span className="font-medium">New chat</span>
      </button>
    </div>
  );
};

export default NewChatBtn;
