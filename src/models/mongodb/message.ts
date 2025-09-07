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
});

export default mongoose.models.Message ||
  mongoose.model<MessageDocument>("Message", MessageSchema);
