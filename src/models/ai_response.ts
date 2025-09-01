export interface AiResponse {
  index: number;
  message: ResponseMessage;
  logprobs: Record<string, unknown> | null;
  finish_reason: string;
  usage: Usage[];
  via_ai_chat_service: boolean;
}

interface Usage {
  type: string;
  model: string;
  amount: number;
  cost: number;
}

interface ResponseMessage {
  role: string;
  content: string;
  refusal: string | null;
  annotations: Record<string, unknown>[];
}
