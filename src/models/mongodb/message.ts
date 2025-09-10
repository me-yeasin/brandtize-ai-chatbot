import mongoose, { Document, Schema } from "mongoose";

export interface MessageDocument extends Document {
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
  hasReasoningCapability?: boolean;
  compareResponses?: Array<{
    model: string;
    content: string;
    timestamp?: Date;
    reasoning?: string;
    hasReasoningCapability?: boolean;
  }>;
  webSearchData?: {
    queries: Array<{
      id: string;
      query: string;
      timestamp: string;
    }>;
    results: Array<{
      title: string;
      link: string;
      snippet: string;
      source: string;
      timestamp: string;
    }>;
  };
}

export const MessageSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  file: {
    name: String,
    size: Number,
    type: String,
  },
  reasoning: String,
  hasReasoningCapability: Boolean,
  compareResponses: [
    {
      model: String,
      content: String,
      timestamp: Date,
      reasoning: String,
      hasReasoningCapability: Boolean,
    },
  ],
  webSearchData: {
    queries: [
      {
        id: String,
        query: String,
        timestamp: String,
      },
    ],
    results: [
      {
        title: String,
        link: String,
        snippet: String,
        source: String,
        timestamp: String,
      },
    ],
  },
});

export default mongoose.models.Message ||
  mongoose.model<MessageDocument>("Message", MessageSchema);
