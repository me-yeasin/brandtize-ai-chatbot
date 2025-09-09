import connectToDatabase from "@/lib/mongodb";
import { Message } from "@/models/message";
import Conversation from "@/models/mongodb/conversation";

export const ConversationService = {
  // Create a new conversation with initial message
  async createConversation(title: string, initialMessage?: Message) {
    await connectToDatabase();

    return Conversation.create({
      title,
      messages: initialMessage ? [initialMessage] : [],
    });
  },

  async getConversation(conversationId: string) {
    await connectToDatabase();
    console.log(`Getting conversation with ID: ${conversationId}`);

    const conversation = await Conversation.findById(conversationId);

    // Log to verify if compareResponses are included in the response
    if (conversation && conversation.messages) {
      console.log(
        `Found conversation with ${conversation.messages.length} messages`
      );
      const messagesWithCompare = conversation.messages.filter(
        (msg: Message) =>
          msg.compareResponses && msg.compareResponses.length > 0
      );

      if (messagesWithCompare.length > 0) {
        console.log(
          `Found ${messagesWithCompare.length} messages with compare responses`
        );
        messagesWithCompare.forEach((msg: Message) => {
          console.log(
            `Message ID: ${msg.id} has ${
              msg.compareResponses?.length || 0
            } compare responses`
          );
        });
      } else {
        console.log("No messages with compare responses found");
      }
    }

    return conversation;
  },

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

      // Validate that the conversation exists
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error(`Conversation not found: ${conversationId}`);
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
      throw error;
    }
  },

  async updateTitle(conversationId: string, title: string) {
    await connectToDatabase();
    return Conversation.findByIdAndUpdate(
      conversationId,
      { title },
      { new: true }
    );
  },

  async deleteConversation(conversationId: string) {
    await connectToDatabase();
    return Conversation.findByIdAndDelete(conversationId);
  },
};
