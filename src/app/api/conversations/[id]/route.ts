import { auth } from "@/auth";
import { ConversationService } from "@/services/conversation.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateConversationSchema = z.object({
  title: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const conversation = await ConversationService.getConversation(id);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.userId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership first
    const conversation = await ConversationService.getConversation(id);
    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conversation.userId !== session.user.email) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ConversationService.deleteConversation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const validation = UpdateConversationSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { title } = validation.data;

    // Check ownership
    const conversation = await ConversationService.getConversation(id);
    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conversation.userId !== session.user.email) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedConversation = await ConversationService.updateTitle(id, title);

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
