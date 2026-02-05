import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Schedule from "@/models/Schedule";
import Template from "@/models/Template";
import Message from "@/models/Message";
import Phone from "@/models/Phones";
import SentMessage from "@/models/SentMessage";
import {
  sendTextMessage,
  sendImage,
  sendVideo,
  getChats,
  sleep,
  getRandomDelay,
} from "@/libs/waha";
import moment from "moment";
import { ERROR_CODES, type ErrorCode } from "@/libs/error-codes";

/**
 * Helper function to log and update SentMessage
 */
async function logSentMessage(
  sentMessageId: string,
  errorCode?: ErrorCode,
  errorData?: Record<string, any>,
  message?: string
) {
  const logEntry = {
    timestamp: new Date(),
    errorCode,
    errorData,
    message,
  };

  await SentMessage.findByIdAndUpdate(sentMessageId, {
    $push: { logs: logEntry },
  });
}

/**
 * Helper function to create or get SentMessage for tracking
 */
async function getOrCreateSentMessage(params: {
  scheduleId: any;
  messageId: any;
  messageIndex: number;
  phoneId: any;
  groupId?: string;
  messageSnapshot: any;
}) {
  // Try to find existing SentMessage
  let sentMessage = await SentMessage.findOne({
    scheduleId: params.scheduleId,
    messageIndex: params.messageIndex,
  });

  if (!sentMessage) {
    // Create new SentMessage
    sentMessage = await SentMessage.create({
      scheduleId: params.scheduleId,
      messageId: params.messageId,
      messageIndex: params.messageIndex,
      phoneId: params.phoneId,
      groupId: params.groupId,
      messageSnapshot: params.messageSnapshot,
      status: "pending",
      lastTryDate: new Date(),
      logs: [
        {
          timestamp: new Date(),
          message: "Tentative d'envoi initiée",
        },
      ],
    });
  } else {
    // Update existing SentMessage with new try
    await SentMessage.findByIdAndUpdate(sentMessage._id, {
      lastTryDate: new Date(),
    });
    await logSentMessage(
      sentMessage._id.toString(),
      undefined,
      undefined,
      "Nouvelle tentative d'envoi"
    );
  }

  return sentMessage;
}

/**
 * CRON endpoint to send scheduled WhatsApp messages
 * This should be called every minute via a CRON job
 *
 * Algorithm:
 * 1. Get all schedules with status "pending" or "running"
 * 2. For each schedule:
 *    - Get the template
 *    - For each message in the template:
 *      - Calculate execution date (eventDate + sendOnDay)
 *      - If execution date <= now AND message not sent yet:
 *        - Create or update SentMessage (track attempt)
 *        - Find WhatsApp group by groupName
 *        - Replace variables in message
 *        - Send message with anti-blocking
 *        - Update SentMessage with result
 *        - Update schedule status
 *    - If all messages sent: mark schedule as "completed"
 *    - If first message sent: mark schedule as "running"
 */
export async function POST(req: NextRequest) {
  try {
    // Verify CRON secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[CRON] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 },
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error("[CRON] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    console.log("[CRON] Starting message sending process");

    // Get all active schedules (pending or running)
    const schedules = await Schedule.find({
      status: { $in: ["pending", "running"] },
    })
      .populate("messageTemplateId")
      .lean();

    console.log(`[CRON] Found ${schedules.length} active schedules`);

    const results = {
      processed: 0,
      messagesChecked: 0,
      messagesSent: 0,
      errors: 0,
      schedulesCompleted: 0,
    };

    for (const schedule of schedules) {
      try {
        results.processed++;

        // Get the template
        const template = await Template.findById(
          schedule.messageTemplateId,
        ).lean();

        if (!template) {
          console.error(
            `[CRON] ${ERROR_CODES.TEMPLATE_NOT_FOUND}`,
            { scheduleId: schedule._id },
          );
          await Schedule.findByIdAndUpdate(schedule._id, {
            status: "failed",
          });
          results.errors++;
          continue;
        }

        console.log(
          `[CRON] Processing schedule ${schedule._id} - ${schedule.groupName}`,
        );

        const eventDate = moment(schedule.eventDate);
        const now = moment();

        // Get messages from Message collection if available, otherwise use template.messages
        const separateMessages = await Message.find({
          templateId: template._id,
        })
          .sort({ order: 1 })
          .lean();

        const messages =
          separateMessages.length > 0
            ? separateMessages
            : template.messages.map((msg: any, index: number) => ({
                ...msg,
                _id: null,
                order: index,
              }));

        console.log(
          `[CRON] Using ${separateMessages.length > 0 ? "separate" : "embedded"} messages (${messages.length} total)`,
        );

        // Check which messages should be sent
        let firstMessageSent = false;
        let allMessagesSent = true;

        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
          try {
            results.messagesChecked++;

            const templateMessage = messages[messageIndex];

            // Calculate when this message should be sent
            const sendOnDay = parseInt(templateMessage.sendOnDay);
            const [sendOnHour, sendOnMinute] =
              templateMessage.sendOnHour.split(":");
            const executionDate = eventDate
              .clone()
              .add(sendOnDay, "days")
              .set({
                hour: parseInt(sendOnHour),
                minute: parseInt(sendOnMinute),
                second: 0,
              });

            console.log(
              `[CRON] Message ${messageIndex + 1}/${template.messages.length} - Execution: ${executionDate.format("YYYY-MM-DD HH:mm")} - Now: ${now.format("YYYY-MM-DD HH:mm")}`,
            );

            // Check if message should be sent now
            if (now.isBefore(executionDate)) {
              console.log(`[CRON] Message ${messageIndex + 1} not due yet`);
              allMessagesSent = false;
              continue;
            }

            // Check if message was already sent
            const existingSentMessage = await SentMessage.findOne({
              scheduleId: schedule._id,
              messageIndex,
            });

            if (existingSentMessage && existingSentMessage.status === "sent") {
              console.log(`[CRON] Message ${messageIndex + 1} already sent`);
              continue;
            }

            // Get the phone to use
            const phone = await Phone.findById(templateMessage.phoneId).lean();

            // Create or get SentMessage for tracking (do this early)
            const sentMessage = await getOrCreateSentMessage({
              scheduleId: schedule._id,
              messageId: templateMessage._id || null,
              messageIndex,
              phoneId: templateMessage.phoneId,
              messageSnapshot: {
                sendOnDay: templateMessage.sendOnDay,
                sendOnHour: templateMessage.sendOnHour,
                messageTemplate: templateMessage.messageTemplate,
                image: templateMessage.image,
                video: templateMessage.video,
              },
            });

            if (!phone) {
              console.error(
                `[CRON] ${ERROR_CODES.PHONE_NOT_FOUND}`,
                { phoneId: templateMessage.phoneId },
              );
              await SentMessage.findByIdAndUpdate(sentMessage._id, {
                status: "failed",
                errorCode: ERROR_CODES.PHONE_NOT_FOUND,
                errorData: { phoneId: templateMessage.phoneId.toString() },
                error: "Phone not found",
                lastErrorDate: new Date(),
              });
              await logSentMessage(
                sentMessage._id.toString(),
                ERROR_CODES.PHONE_NOT_FOUND,
                { phoneId: templateMessage.phoneId.toString() }
              );
              results.errors++;
              allMessagesSent = false;
              continue;
            }

            if (phone.status !== "connected") {
              console.error(
                `[CRON] ${ERROR_CODES.PHONE_NOT_CONNECTED}`,
                { phone: phone.phone, status: phone.status },
              );
              await SentMessage.findByIdAndUpdate(sentMessage._id, {
                status: "failed",
                errorCode: ERROR_CODES.PHONE_NOT_CONNECTED,
                errorData: { phone: phone.phone, status: phone.status },
                error: `Phone not connected (status: ${phone.status})`,
                lastErrorDate: new Date(),
              });
              await logSentMessage(
                sentMessage._id.toString(),
                ERROR_CODES.PHONE_NOT_CONNECTED,
                { phone: phone.phone, status: phone.status }
              );
              results.errors++;
              allMessagesSent = false;
              continue;
            }

            // Find the WhatsApp group
            console.log(
              `[CRON] Looking for group "${schedule.groupName}" on phone ${phone.phone}`,
            );
            const chats = await getChats(phone.phone);
            const targetGroup = chats.find((chat: any) => {
              const subject = chat?.groupMetadata?.subject || "";
              return subject === schedule.groupName;
            });

            if (!targetGroup) {
              console.error(
                `[CRON] ${ERROR_CODES.GROUP_NOT_FOUND}`,
                { groupName: schedule.groupName, phone: phone.phone },
              );
              await SentMessage.findByIdAndUpdate(sentMessage._id, {
                status: "failed",
                errorCode: ERROR_CODES.GROUP_NOT_FOUND,
                errorData: { groupName: schedule.groupName, phone: phone.phone },
                error: `WhatsApp group not found: ${schedule.groupName}`,
                lastErrorDate: new Date(),
              });
              await logSentMessage(
                sentMessage._id.toString(),
                ERROR_CODES.GROUP_NOT_FOUND,
                { groupName: schedule.groupName, phone: phone.phone }
              );
              results.errors++;
              allMessagesSent = false;
              continue;
            }

            const groupId = targetGroup?.groupMetadata?.id?._serialized;
            if (!groupId) {
              console.error(
                `[CRON] ${ERROR_CODES.GROUP_ID_MISSING}`,
                { groupName: schedule.groupName },
              );
              await SentMessage.findByIdAndUpdate(sentMessage._id, {
                status: "failed",
                errorCode: ERROR_CODES.GROUP_ID_MISSING,
                errorData: { groupName: schedule.groupName },
                error: `Could not get group ID for: ${schedule.groupName}`,
                lastErrorDate: new Date(),
              });
              await logSentMessage(
                sentMessage._id.toString(),
                ERROR_CODES.GROUP_ID_MISSING,
                { groupName: schedule.groupName }
              );
              results.errors++;
              allMessagesSent = false;
              continue;
            }

            // Update sentMessage with groupId
            await SentMessage.findByIdAndUpdate(sentMessage._id, {
              groupId,
            });

            // Replace variables in message
            let messageText = templateMessage.messageTemplate;
            if (schedule.variables && schedule.variables.length > 0) {
              for (const variable of schedule.variables) {
                const regex = new RegExp(
                  `\\{\\{${variable.key}\\}\\}`,
                  "g",
                );
                messageText = messageText.replace(regex, variable.value);
              }
            }

            console.log(
              `[CRON] Sending message ${messageIndex + 1} to group ${schedule.groupName}`,
            );

            try {
              // Send text message
              const textResponse = await sendTextMessage(
                phone.phone,
                groupId,
                messageText,
              );

              // Send image if exists
              if (templateMessage.image) {
                console.log(`[CRON] Sending image attachment`);
                try {
                  await sendImage(phone.phone, groupId, templateMessage.image);
                } catch (imageError) {
                  console.error(`[CRON] ${ERROR_CODES.IMAGE_SEND_FAILED}`, imageError);
                  await logSentMessage(
                    sentMessage._id.toString(),
                    ERROR_CODES.IMAGE_SEND_FAILED,
                    { error: imageError instanceof Error ? imageError.message : "Unknown error" },
                    "Failed to send image attachment"
                  );
                }
              }

              // Send video if exists
              if (templateMessage.video) {
                console.log(`[CRON] Sending video attachment`);
                try {
                  await sendVideo(phone.phone, groupId, templateMessage.video);
                } catch (videoError) {
                  console.error(`[CRON] ${ERROR_CODES.VIDEO_SEND_FAILED}`, videoError);
                  await logSentMessage(
                    sentMessage._id.toString(),
                    ERROR_CODES.VIDEO_SEND_FAILED,
                    { error: videoError instanceof Error ? videoError.message : "Unknown error" },
                    "Failed to send video attachment"
                  );
                }
              }

              const successDate = new Date();

              // Update SentMessage record
              await SentMessage.findByIdAndUpdate(sentMessage._id, {
                status: "sent",
                successDate,
                sentAt: successDate, // Legacy field
                wahaResponse: textResponse,
              });

              await logSentMessage(
                sentMessage._id.toString(),
                undefined,
                undefined,
                "Message sent successfully"
              );

              console.log(
                `[CRON] Successfully sent message ${messageIndex + 1}`,
              );
              results.messagesSent++;
              firstMessageSent = true;

              // Add delay between message groups (anti-blocking)
              const groupDelay = getRandomDelay(5, 20);
              console.log(
                `[CRON] Waiting ${groupDelay / 1000} seconds before next message (anti-blocking)`,
              );
              await sleep(groupDelay);
            } catch (error) {
              console.error(
                `[CRON] ${ERROR_CODES.MESSAGE_SEND_FAILED}`,
                error,
              );

              // Update SentMessage with error
              await SentMessage.findByIdAndUpdate(sentMessage._id, {
                status: "failed",
                errorCode: ERROR_CODES.MESSAGE_SEND_FAILED,
                errorData: { error: error instanceof Error ? error.message : "Unknown error" },
                error: error instanceof Error ? error.message : "Unknown error",
                lastErrorDate: new Date(),
              });

              await logSentMessage(
                sentMessage._id.toString(),
                ERROR_CODES.MESSAGE_SEND_FAILED,
                { error: error instanceof Error ? error.message : "Unknown error" }
              );

              results.errors++;
              allMessagesSent = false;
            }
          } catch (error) {
            console.error(
              `[CRON] Error processing message ${messageIndex + 1}:`,
              error,
            );
            results.errors++;
            allMessagesSent = false;
          }
        }

        // Update schedule status
        if (allMessagesSent) {
          await Schedule.findByIdAndUpdate(schedule._id, {
            status: "completed",
          });
          console.log(`[CRON] Schedule ${schedule._id} completed`);
          results.schedulesCompleted++;
        } else if (firstMessageSent && schedule.status === "pending") {
          await Schedule.findByIdAndUpdate(schedule._id, {
            status: "running",
          });
          console.log(`[CRON] Schedule ${schedule._id} started`);
        }
      } catch (error) {
        console.error(
          `[CRON] Error processing schedule ${schedule._id}:`,
          error,
        );
        results.errors++;
      }
    }

    console.log("[CRON] Message sending process completed", results);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[CRON] Fatal error in message sending:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
