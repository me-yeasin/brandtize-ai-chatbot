import ThreeDotIcon from "@/assets/icons/three_dot";

const UserProfile = () => {
  return (
    <div className="border-t border-gray-800 p-4">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">U</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white">User Name</div>
          <div className="text-xs text-gray-300">Free Plan</div>
        </div>
        <ThreeDotIcon />
      </div>
    </div>
  );
};

export default UserProfile;
