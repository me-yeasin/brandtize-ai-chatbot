import mongoose, { Document, Schema } from "mongoose";
import { MessageDocument, MessageSchema } from "./message";

export interface ConversationDocument extends Document {
  title: string;
  messages: MessageDocument[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // For user authentication later
}

const ConversationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: "New Conversation",
    },
    messages: [MessageSchema],
    userId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Conversation ||
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema);
