import AttachIcon from "@/assets/icons/attach";
import VoiceIcon from "@/assets/icons/voice";
import ModelSelector from "./_input-area-comp/model_selector";
import TextEditorWithBtn from "./_input-area-comp/texteditor_with_btn";
import ToolBtn from "./_input-area-comp/tool_btn";

const InputArea = () => {
  return (
    <div className="bg-black px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <TextEditorWithBtn />

        <div className="flex items-center justify-between mt-2 text-xs text-white">
          <div className="flex items-center gap-4">
            <ToolBtn label="Attach">
              <AttachIcon />
            </ToolBtn>
            <ToolBtn label="Voice">
              <VoiceIcon />
            </ToolBtn>
            <ModelSelector />
          </div>
          <div>AI may produce inaccurate information</div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
