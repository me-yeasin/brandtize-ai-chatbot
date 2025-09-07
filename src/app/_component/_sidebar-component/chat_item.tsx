import ChatBubbleIcon from "@/assets/icons/chat_bubble";
import ThreeDotIcon from "@/assets/icons/three_dot";
import { useEffect, useRef, useState } from "react";

interface ChatItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const ChatItem = ({ id, title, isActive, onClick }: ChatItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditMode(true);
    setShowMenu(false);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        const response = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Refresh the page or update the conversations list
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
    setShowMenu(false);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);

    if (editTitle !== title) {
      try {
        await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editTitle }),
        });
      } catch (error) {
        console.error("Error updating conversation title:", error);
      }
    }
  };

  return (
    <div
      className={`${
        isActive ? "bg-gray-600" : "bg-gray-700"
      } rounded-lg px-3 py-2 mb-1 cursor-pointer transition-colors duration-200 hover:bg-gray-600 relative`}
      onClick={onClick}
    >
      {editMode ? (
        <form onSubmit={handleTitleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-gray-800 text-white rounded px-2 py-1 text-sm"
            onBlur={handleTitleSubmit}
          />
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <ChatBubbleIcon />
            <span className="text-sm truncate">{title}</span>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-gray-600"
            >
              <ThreeDotIcon />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden w-32"
              >
                <button
                  onClick={handleEditClick}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Rename
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatItem;
