import { ConversationService } from "@/services/conversation.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get the userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Only fetch conversations for the specific user if userId is provided
    const conversations = await ConversationService.getConversations(
      userId || undefined
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
    const { title, initialMessage, userId } = await req.json();

    const conversation = await ConversationService.createConversation(
      title || "New Conversation",
      userId,
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
