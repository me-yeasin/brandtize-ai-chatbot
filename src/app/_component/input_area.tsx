"use client";

import AttachIcon from "@/assets/icons/attach";
import VoiceIcon from "@/assets/icons/voice";
import { useState } from "react";
import FileUpload from "./_input-area-comp/file_upload";
import ModelSelector from "./_input-area-comp/model_selector";
import TextEditorWithBtn from "./_input-area-comp/texteditor_with_btn";
import ToolBtn from "./_input-area-comp/tool_btn";
import VoiceRecorder from "./_input-area-comp/voice_recorder";

const InputArea = () => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  return (
    <div className="bg-black px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <TextEditorWithBtn />

        <div className="flex items-center justify-between mt-2 text-xs text-white">
          <div className="flex items-center gap-4">
            <ToolBtn label="Attach" onClick={() => setShowFileUpload(true)}>
              <AttachIcon />
            </ToolBtn>
            <ToolBtn label="Voice" onClick={() => setShowVoiceRecorder(true)}>
              <VoiceIcon />
            </ToolBtn>
            <ModelSelector />
          </div>
          <div>AI may produce inaccurate information</div>
        </div>
      </div>

      {/* Modal for file upload */}
      {showFileUpload && (
        <FileUpload onClose={() => setShowFileUpload(false)} />
      )}

      {/* Modal for voice recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder onClose={() => setShowVoiceRecorder(false)} />
      )}
    </div>
  );
};

export default InputArea;
