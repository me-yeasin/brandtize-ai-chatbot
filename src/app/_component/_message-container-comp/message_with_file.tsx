"use client";

import { useEffect, useRef } from "react";
import FormattedMessage from "./formatted_message";

// Define props to accept file information
interface MessageWithFileProps {
  content: string;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

const MessageWithFile = ({ content, file }: MessageWithFileProps) => {
  const fileInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileInfoRef.current && file) {
      // Format file size in KB
      const fileSizeKB = (file.size / 1024).toFixed(2);

      // Create file info element
      const fileType = file.type;
      const isImage = fileType.startsWith("image/");

      // Add file icon or appropriate visual based on file type
      let iconHtml = "";

      if (isImage) {
        iconHtml = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="text-blue-400">
            <path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>
            <path d="M8 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm0-1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"/>
          </svg>
        `;
      } else if (fileType.includes("pdf")) {
        iconHtml = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="text-red-400">
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
            <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
          </svg>
        `;
      } else if (fileType.includes("word") || fileType.includes("document")) {
        iconHtml = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="text-blue-600">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            <path d="M8.5 8.5a.5.5 0 0 0-1 0v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 0-1H8.5V8.5zm-4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H5v1h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-2z"/>
          </svg>
        `;
      } else {
        // Default file icon
        iconHtml = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="text-gray-400">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
          </svg>
        `;
      }

      // Insert the file info HTML
      fileInfoRef.current.innerHTML = `
        <div class="flex items-center p-3 bg-gray-800 rounded-lg mb-3">
          <div class="mr-3 flex-shrink-0">
            ${iconHtml}
          </div>
          <div>
            <p class="text-sm font-medium text-white">${file.name}</p>
            <p class="text-xs text-gray-400">${fileSizeKB} KB • ${file.type}</p>
          </div>
        </div>
      `;
    }
  }, [file]);

  return (
    <div>
      {file && <div ref={fileInfoRef} className="file-attachment"></div>}
      <div className="message-content">
        <FormattedMessage content={content} />
      </div>
    </div>
  );
};

export default MessageWithFile;
