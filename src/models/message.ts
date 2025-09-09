export interface AlternativeResponse {
  model: string;
  content: string;
  timestamp: Date;
  reasoning?: string;
  hasReasoningCapability?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
  };
  reasoning?: string;
  hasReasoningCapability?: boolean; // Flag to indicate if this message came from a model with reasoning
  compareResponses?: AlternativeResponse[]; // Array of alternative model responses for comparison
}
