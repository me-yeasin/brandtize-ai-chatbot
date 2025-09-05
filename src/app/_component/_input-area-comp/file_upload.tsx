"use client";

import { useFileAttachment } from "@/contexts/file-attachment/file_attachment_context";
import { useRef, useState } from "react";

type FileUploadProps = {
  onClose: () => void;
};

const FileUpload = ({ onClose }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setAttachedFile } = useFileAttachment();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleAttach = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      // Instead of sending immediately, store the file in the FileAttachment context
      setAttachedFile({
        file,
        previewUrl: preview,
      });
      onClose();
    } catch (error) {
      setError("Error attaching file. Please try again.");
      console.error("Error attaching file:", error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-medium">Attach File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>

        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={triggerFileInput}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />

          {preview ? (
            <div className="mb-4">
              {/* We use img for simplicity in this demo - would use next/image in production */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-40 mx-auto" />
            </div>
          ) : (
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}

          <p className="mt-2 text-sm text-gray-300">
            {file ? file.name : "Click to select or drop a file here"}
          </p>
          {file && (
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(2)} KB • {file.type}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleAttach}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={!file}
          >
            Attach
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
