import BrandIcon from "@/assets/icons/brand_icon";
import { useMemo, useState } from "react";
import ChatHistory from "./_sidebar-component/chat_history";
import NewChatBtn from "./_sidebar-component/newchat_btn";
import UserProfile from "./_sidebar-component/user_profile";
type ChatSidebarProps = {
  open?: boolean; // when provided, the component becomes controlled
  onClose?: () => void;
};
const ChatSidebar = ({ open, onClose }: ChatSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const effectiveOpen = useMemo(
    () => (open !== undefined ? open : isOpen),
    [open, isOpen]
  );
  const handleClose = () => {
    if (onClose) return onClose();
    setIsOpen(false);
  };
  // Close sidebar only on mobile viewports (under md) after an action
  const closeOnMobile = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      handleClose();
    }
  };
  return (
    <div
      className={[
        // Mobile: full-screen overlay when open, hidden when closed
        effectiveOpen
          ? "fixed inset-0 z-[9999999999] w-full h-full bg-black"
          : "hidden",
        // Desktop: layout + width control
        effectiveOpen ? "md:w-[350px]" : "md:w-0",
        "md:static md:block md:h-full md:bg-transparent flex flex-col h-full overflow-hidden transition-[width] duration-200",
        effectiveOpen ? "md:border-r md:border-gray-800" : "md:border-r-0",
      ].join(" ")}
    >
      {/* Header with Logo and Close Button */}
      <div className="sticky top-0 z-10 bg-black/70 backdrop-blur px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 [&>svg]:w-6 [&>svg]:h-6">
          <BrandIcon />
          <span className="text-sm font-semibold">Brandtize</span>
        </div>
        <button
          type="button"
          aria-label="Close sidebar"
          title="Close sidebar"
          onClick={handleClose}
          className="p-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition"
        >
          {/* X icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Scrollable content area - NewChatBtn and ChatHistory */}
      <div className="flex-1 overflow-y-auto">
        <NewChatBtn onAfterNewChat={closeOnMobile} />
        <ChatHistory onItemSelected={closeOnMobile} />
      </div>

      {/* UserProfile - always at the bottom */}
      <UserProfile />
    </div>
  );
};
export default ChatSidebar;
