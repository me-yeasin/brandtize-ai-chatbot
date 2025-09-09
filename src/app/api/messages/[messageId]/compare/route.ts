import { MessageService } from "@/services/message.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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
    const { compareResponses } = body;

    // Validate compareResponses
    if (!compareResponses || !Array.isArray(compareResponses)) {
      return NextResponse.json(
        { error: "compareResponses must be an array" },
        { status: 400 }
      );
    }

    // Validate each compare response
    for (const response of compareResponses) {
      if (!response.model || typeof response.content !== "string") {
        return NextResponse.json(
          {
            error: "Each compare response must have a model and content string",
          },
          { status: 400 }
        );
      }
    }

    // Use the message service to update the compare responses
    await MessageService.updateMessageCompareResponses(
      messageId,
      compareResponses
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating message compare responses:", error);

    if ((error as Error).message === "Message not found") {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
