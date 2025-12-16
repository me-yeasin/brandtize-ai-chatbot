import { auth } from "@/auth";
import { Message } from "@/models/message";
import { ConversationService } from "@/services/conversation.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string().or(z.date()).optional(),
  reasoning: z.string().optional(),
  hasReasoningCapability: z.boolean().optional(),
  webSearchData: z.any().optional(),
  file: z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
    }).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await req.json();

    const validation = MessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid message data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const message = validation.data;

    // Verify ownership
    const conversation = await ConversationService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.userId !== session.user.email) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedConversation = await ConversationService.addMessage(
      conversationId,
      message as unknown as Message
    );

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
