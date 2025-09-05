"use client";

interface FileAttachmentProps {
  file: File;
  previewUrl?: string | null;
  onRemove: () => void;
}

const FileAttachment = ({
  file,
  previewUrl,
  onRemove,
}: FileAttachmentProps) => {
  const isImage = file.type.startsWith("image/");
  const fileSize = (file.size / 1024).toFixed(2);

  return (
    <div className="flex items-center bg-gray-800 rounded p-2 mb-2 max-w-full overflow-hidden">
      <div className="flex-shrink-0 mr-2">
        {isImage && previewUrl ? (
          <div className="w-12 h-12 relative rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={file.name}
              className="w-12 h-12 object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-white truncate font-medium">{file.name}</p>
        <p className="text-xs text-gray-400">{fileSize} KB</p>
      </div>

      <button
        onClick={onRemove}
        className="ml-2 p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
    </div>
  );
};

export default FileAttachment;
