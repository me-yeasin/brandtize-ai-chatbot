import connectToDatabase from "@/lib/mongodb";
import { Message } from "@/models/message";
import Conversation from "@/models/mongodb/conversation";

export const ConversationService = {
  // Create a new conversation with initial message
  async createConversation(title: string, initialMessage?: Message) {
    await connectToDatabase();

    const conversation = new Conversation({
      title,
      messages: initialMessage ? [initialMessage] : [],
    });

    await conversation.save();
    return conversation;
  },

  // Get conversation by ID
  async getConversation(conversationId: string) {
    await connectToDatabase();
    return Conversation.findById(conversationId);
  },

  // Get all conversations (possibly paginated)
  async getConversations(limit: number = 20, skip: number = 0) {
    await connectToDatabase();
    return Conversation.find({})
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  // Add message to conversation
  async addMessage(conversationId: string, message: Message) {
    try {
      await connectToDatabase();

      // First check if conversation exists
      const existingConversation = await Conversation.findById(conversationId);
      if (!existingConversation) {
        console.error(`Conversation with ID ${conversationId} not found`);
        return null;
      }

      // Add the message to the conversation
      const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );

      return updatedConversation;
    } catch (error) {
      console.error(
        `Error adding message to conversation ${conversationId}:`,
        error
      );
      throw error; // Re-throw to be handled by the API route
    }
  },

  // Update conversation title
  async updateTitle(conversationId: string, title: string) {
    await connectToDatabase();
    return Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { title } },
      { new: true }
    );
  },

  // Delete conversation
  async deleteConversation(conversationId: string) {
    await connectToDatabase();
    return Conversation.findByIdAndDelete(conversationId);
  },
};
