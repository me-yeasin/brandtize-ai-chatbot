import { ConversationService } from "@/services/conversation.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const conversations = await ConversationService.getConversations();
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
    const { title, initialMessage } = await req.json();

    const conversation = await ConversationService.createConversation(
      title || "New Conversation",
      initialMessage
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
