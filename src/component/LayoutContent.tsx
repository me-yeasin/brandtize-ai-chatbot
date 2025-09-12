"use client";

import WelcomeModal from "@/component/WelcomeModal";
import { FileAttachmentProvider } from "@/contexts/file-attachment/file_attachment_context";
import useWelcomeModal from "@/hooks/useWelcomeModal";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const { showModal, handleAccept } = useWelcomeModal();

  return (
    <>
      {/* Welcome Modal */}
      <WelcomeModal isOpen={showModal} onAccept={handleAccept} />

      <FileAttachmentProvider>{children}</FileAttachmentProvider>
    </>
  );
};

export default LayoutContent;
export type { LayoutContentProps };
