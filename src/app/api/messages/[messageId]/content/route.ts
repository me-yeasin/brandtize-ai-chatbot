import { MessageService } from "@/services/message.service";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    // Extract messageId from route params
    const { messageId } = await params;

    // Validate messageId
    if (!messageId) {
      return NextResponse.json(
        { error: "Missing message ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, model, reasoning, hasReasoningCapability } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    // Use the message service to update the message content
    await MessageService.updateMessageContent(
      messageId,
      content,
      model,
      reasoning,
      hasReasoningCapability
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating message content:", error);

    if ((error as Error).message === "Message not found") {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update message content" },
      { status: 500 }
    );
  }
}
