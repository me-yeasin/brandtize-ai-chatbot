"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type AttachedFile = {
  file: File;
  previewUrl: string | null;
};

interface FileAttachmentContextType {
  attachedFile: AttachedFile | null;
  setAttachedFile: (file: AttachedFile | null) => void;
  clearAttachedFile: () => void;
}

const FileAttachmentContext = createContext<
  FileAttachmentContextType | undefined
>(undefined);

export function FileAttachmentProvider({ children }: { children: ReactNode }) {
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const clearAttachedFile = () => {
    setAttachedFile(null);
  };

  return (
    <FileAttachmentContext.Provider
      value={{
        attachedFile,
        setAttachedFile,
        clearAttachedFile,
      }}
    >
      {children}
    </FileAttachmentContext.Provider>
  );
}

export function useFileAttachment() {
  const context = useContext(FileAttachmentContext);
  if (context === undefined) {
    throw new Error(
      "useFileAttachment must be used within a FileAttachmentProvider"
    );
  }
  return context;
}
