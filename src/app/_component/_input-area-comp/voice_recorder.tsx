"use client";

import { useChatActions } from "@/contexts/chat/hooks";
import { useEffect, useRef, useState } from "react";

type VoiceRecorderProps = {
  onClose: () => void;
};

const VoiceRecorder = ({ onClose }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { sendMessage } = useChatActions();

  // Check for browser support
  const isBrowserSupported =
    typeof window !== "undefined" &&
    "mediaDevices" in navigator &&
    "getUserMedia" in navigator.mediaDevices &&
    "MediaRecorder" in window;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Create audio blob - would be used in a real implementation
        // to send to a speech-to-text service
        new Blob(audioChunksRef.current, { type: "audio/wav" });

        // In a real implementation, you would send the blob to a speech-to-text service
        // For now, we'll simulate transcription with a message
        const randomWords = [
          "Hello, how can I help you today?",
          "I need information about your services.",
          "Tell me about your product features.",
          "Can you assist me with a technical issue?",
          "I'd like to know more about pricing options.",
        ];

        // Simulate transcription delay
        setTimeout(() => {
          const fakeTranscript =
            randomWords[Math.floor(Math.random() * randomWords.length)];
          setTranscript(fakeTranscript);
        }, 1000);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      setError("Error accessing microphone. Please check permissions.");
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (transcript) {
      let useWebSearch = false;
      try {
        useWebSearch =
          typeof window !== "undefined" &&
          localStorage.getItem("webSearchEnabled") === "true";
      } catch {}
      sendMessage(transcript, useWebSearch);
      onClose();
    } else {
      setError("No voice transcript available. Try recording again.");
    }
  };

  if (!isBrowserSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg font-medium">Voice Input</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
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

          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-white mb-2">
              Voice recording is not supported in this browser
            </p>
            <p className="text-gray-400 text-sm">
              Please try using Chrome, Firefox, or Safari.
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-medium">Voice Input</h3>
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

        <div className="flex flex-col items-center justify-center py-4">
          {isRecording ? (
            <>
              <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-4 relative animate-pulse">
                <span className="absolute w-20 h-20 rounded-full bg-red-500"></span>
                <svg
                  className="w-12 h-12 text-white z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <p className="text-white mb-2">
                Recording... {formatTime(recordingTime)}
              </p>
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-2"
              >
                Stop Recording
              </button>
            </>
          ) : transcript ? (
            <>
              <div className="w-full p-4 bg-gray-700 rounded-lg mb-4">
                <p className="text-white">&ldquo;{transcript}&rdquo;</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setTranscript("");
                    setRecordingTime(0);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                >
                  Discard & Record Again
                </button>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 hover:bg-gray-600 cursor-pointer"
                onClick={startRecording}
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <p className="text-white mb-2">
                Click the microphone to start recording
              </p>
              <p className="text-gray-400 text-sm">
                Your voice will be converted to text
              </p>
            </>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        {!isRecording && !transcript && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
