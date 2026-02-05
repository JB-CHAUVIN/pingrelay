/**
 * Template Message Sync Utilities
 *
 * These utilities help sync embedded messages in templates to separate Message documents
 * This allows for proper relational integrity while maintaining backward compatibility
 */

import Message from "@/models/Message";
import mongoose from "mongoose";

interface MessageData {
  phoneId: string;
  sendTimeType?: "fixed_time" | "event_time" | "relative_time";
  sendOnDay: string;
  sendOnHour: string;
  messageTemplate: string;
  image?: string;
  video?: string;
}

/**
 * Sync template messages to Message collection
 * Deletes existing messages and creates new ones based on current template data
 *
 * @param templateId - The template ID
 * @param messages - Array of message data
 * @returns Array of created Message IDs
 */
export async function syncTemplateMessages(
  templateId: string | mongoose.Types.ObjectId,
  messages: MessageData[]
): Promise<string[]> {
  try {
    // Delete existing messages for this template
    await Message.deleteMany({ templateId });

    // Create new messages
    const messageIds: string[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const messageDoc = await Message.create({
        templateId,
        phoneId: msg.phoneId,
        sendTimeType: msg.sendTimeType || "fixed_time",
        sendOnDay: msg.sendOnDay,
        sendOnHour: msg.sendOnHour,
        messageTemplate: msg.messageTemplate,
        image: msg.image,
        video: msg.video,
        order: i,
      });
      messageIds.push(messageDoc._id.toString());
    }

    console.log(
      `[TEMPLATE-SYNC] Synced ${messageIds.length} messages for template ${templateId}`
    );

    return messageIds;
  } catch (error) {
    console.error(
      `[TEMPLATE-SYNC] Error syncing messages for template ${templateId}:`,
      error
    );
    throw error;
  }
}

/**
 * Delete all messages for a template
 *
 * @param templateId - The template ID
 */
export async function deleteTemplateMessages(
  templateId: string | mongoose.Types.ObjectId
): Promise<void> {
  try {
    const result = await Message.deleteMany({ templateId });
    console.log(
      `[TEMPLATE-SYNC] Deleted ${result.deletedCount} messages for template ${templateId}`
    );
  } catch (error) {
    console.error(
      `[TEMPLATE-SYNC] Error deleting messages for template ${templateId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get messages for a template (from Message collection)
 * Falls back to template.messages if no separate messages exist
 *
 * @param templateId - The template ID
 * @returns Array of messages
 */
export async function getTemplateMessages(
  templateId: string | mongoose.Types.ObjectId
): Promise<any[]> {
  try {
    const messages = await Message.find({ templateId })
      .sort({ order: 1 })
      .lean();

    return messages;
  } catch (error) {
    console.error(
      `[TEMPLATE-SYNC] Error getting messages for template ${templateId}:`,
      error
    );
    throw error;
  }
}
