import connectToDatabase from "@/lib/mongodb";
import { AlternativeResponse } from "@/models/message";
import Conversation from "@/models/mongodb/conversation";

export const MessageService = {
  // Update a message with compare responses
  async updateMessageCompareResponses(
    messageId: string,
    compareResponses: AlternativeResponse[]
  ) {
    try {
      await connectToDatabase();

      console.log(`Attempting to update message with ID: ${messageId}`);
      console.log(
        `Compare responses to save:`,
        JSON.stringify(compareResponses, null, 2)
      );

      // Since messages are stored within conversations, we need to find the conversation
      // that contains this message and update the specific message within it
      // Try to find by id field (string-based timestamp ID)
      const conversation = await Conversation.findOne({
        "messages.id": messageId,
      });

      if (!conversation) {
        console.log(`No conversation found with message ID: ${messageId}`);
        throw new Error("Message not found");
      }

      console.log(`Found conversation: ${conversation._id} containing message`);

      // Find the message index in the conversation
      const messageIndex = conversation.messages.findIndex(
        (msg: { id: string }) => msg.id === messageId
      );

      if (messageIndex === -1) {
        console.log(
          `Message with ID ${messageId} not found in conversation messages`
        );
        throw new Error("Message not found in conversation messages");
      }

      console.log(`Message found at index: ${messageIndex}`);

      // Use findOneAndUpdate with an array position-based update to directly set the compareResponses
      const result = await Conversation.findOneAndUpdate(
        {
          _id: conversation._id,
          "messages.id": messageId,
        },
        {
          $set: {
            [`messages.${messageIndex}.compareResponses`]: compareResponses,
          },
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      );

      if (!result) {
        console.log(`Failed to update message: ${messageId}`);
        throw new Error("Failed to update message");
      }

      // Verify that the update was successful
      const updatedMessage = result.messages[messageIndex];
      console.log("Updated message:", JSON.stringify(updatedMessage, null, 2));

      if (
        !updatedMessage.compareResponses ||
        updatedMessage.compareResponses.length === 0
      ) {
        console.log("Warning: compareResponses is empty after update!");
      } else {
        console.log(
          `Successfully updated message: ${messageId} with ${updatedMessage.compareResponses.length} compare responses`
        );
      }

      return true;
    } catch (error) {
      console.error(
        `Error updating message compare responses ${messageId}:`,
        error
      );
      throw error;
    }
  },

  // Update the main message content with selected alternative response
  async updateMessageContent(
    messageId: string,
    newContent: string,
    newModel?: string,
    reasoning?: string,
    hasReasoningCapability?: boolean
  ) {
    try {
      await connectToDatabase();

      console.log(`Attempting to update message content with ID: ${messageId}`);

      // Find the conversation containing this message
      const conversation = await Conversation.findOne({
        "messages.id": messageId,
      });

      if (!conversation) {
        console.log(`No conversation found with message ID: ${messageId}`);
        throw new Error("Message not found");
      }

      console.log(`Found conversation: ${conversation._id} containing message`);

      // Find the message index in the conversation
      const messageIndex = conversation.messages.findIndex(
        (msg: { id: string }) => msg.id === messageId
      );

      if (messageIndex === -1) {
        console.log(
          `Message with ID ${messageId} not found in conversation messages`
        );
        throw new Error("Message not found in conversation messages");
      }

      console.log(`Message found at index: ${messageIndex}`);

      // Prepare update object
      const updateFields: Record<string, string | boolean> = {
        [`messages.${messageIndex}.content`]: newContent,
      };

      if (reasoning !== undefined) {
        updateFields[`messages.${messageIndex}.reasoning`] = reasoning;
      }

      if (hasReasoningCapability !== undefined) {
        updateFields[`messages.${messageIndex}.hasReasoningCapability`] =
          hasReasoningCapability;
      }

      // Use findOneAndUpdate to directly set the message content
      const result = await Conversation.findOneAndUpdate(
        {
          _id: conversation._id,
          "messages.id": messageId,
        },
        {
          $set: updateFields,
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      );

      if (!result) {
        console.log(`Failed to update message: ${messageId}`);
        throw new Error("Failed to update message");
      }

      // Verify that the update was successful
      const updatedMessage = result.messages[messageIndex];
      console.log("Updated message:", JSON.stringify(updatedMessage, null, 2));

      console.log(`Successfully updated message content: ${messageId}`);

      return true;
    } catch (error) {
      console.error(`Error updating message content ${messageId}:`, error);
      throw error;
    }
  },
};
