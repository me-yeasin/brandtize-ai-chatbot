import ChatBubbleIcon from "@/assets/icons/chat_bubble";
import ThreeDotIcon from "@/assets/icons/three_dot";
import { useEffect, useRef, useState } from "react";

interface ChatItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
  onRename?: (id: string, newTitle: string) => void;
}

const ChatItem = ({
  id,
  title,
  isActive,
  onClick,
  onRename,
}: ChatItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode]);

  // Update editTitle when title prop changes
  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close menu if clicked outside
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }

      // Close delete dialog if clicked outside
      if (
        showDeleteDialog &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setShowDeleteDialog(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteDialog]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditMode(true);
    setShowMenu(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // We'll handle this through refreshing the conversations in the parent
        // Since we don't have a direct way to signal deletion, we'll still use page reload
        // but in a production app, you'd want to add an onDelete callback similar to onRename
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);

    if (editTitle !== title) {
      try {
        const response = await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editTitle }),
        });

        if (response.ok) {
          // Notify parent component about the title change
          if (onRename) {
            onRename(id, editTitle);
          }
        }
      } catch (error) {
        console.error("Error updating conversation title:", error);
      }
    }
  };

  return (
    <>
      <div
        className={`${
          isActive ? "bg-gray-600" : "bg-gray-900"
        } rounded-lg px-3 py-2 mb-1 cursor-pointer transition-colors duration-200 hover:bg-gray-700 relative`}
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
              <span className="text-md truncate">{title}</span>
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

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={dialogRef}
            className="bg-gray-800 rounded-lg p-6 max-w-sm mx-auto shadow-lg border border-gray-700"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to parent
          >
            <h3 className="text-lg font-medium text-white mb-4">
              Delete Conversation
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatItem;
