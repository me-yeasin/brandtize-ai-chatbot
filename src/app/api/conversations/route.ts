import { auth } from "@/auth";
import { Message } from "@/models/message";
import { ConversationService } from "@/services/conversation.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateConversationSchema = z.object({
  title: z.string().optional(),
  initialMessage: z.object({
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    timestamp: z.string().or(z.date()).optional(),
    file: z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
    }).optional(),
  }).optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We ignore the client-provided userId for security, using the session user instead

    const conversations = await ConversationService.getConversations(
      session.user.email // Use email or ID as the user identifier. Using email for now as ID might be transient in session depending on config.
      // Wait, let's use user.id if available from our session callback
    );
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = CreateConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { title, initialMessage } = validation.data;

    const conversation = await ConversationService.createConversation(
      title || "New Conversation",
      session.user.email, // Use email as persistent ID
      initialMessage as unknown as Message // Type assertion needed due to flexible Message type
    );

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
