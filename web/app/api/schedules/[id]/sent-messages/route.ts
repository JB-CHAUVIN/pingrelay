import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Schedule from "@/models/Schedule";
import SentMessage from "@/models/SentMessage";
import Template from "@/models/Template";

/**
 * GET /api/schedules/[id]/sent-messages
 * Get all sent messages for a schedule with detailed information
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectMongo();

    // Verify the schedule belongs to the user
    const schedule = await Schedule.findById(id)
      .populate("messageTemplateId")
      .lean();

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    if (schedule.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the template to have message details
    const template = await Template.findById(
      schedule.messageTemplateId,
    ).lean();

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    // Get all sent messages for this schedule
    const sentMessages = await SentMessage.find({
      scheduleId: id,
    })
      .populate("phoneId")
      .sort({ messageIndex: 1 })
      .lean();

    // Build response with full details
    const messagesWithDetails = template.messages.map((templateMsg: any, index: number) => {
      const sentMessage = sentMessages.find(
        (sm: any) => sm.messageIndex === index,
      );

      // If message was sent, use the snapshot (actual content that was sent)
      // Otherwise, use the current template content
      const messageContent = sentMessage?.messageSnapshot || {
        sendOnDay: templateMsg.sendOnDay,
        sendOnHour: templateMsg.sendOnHour,
        messageTemplate: templateMsg.messageTemplate,
        image: templateMsg.image,
        video: templateMsg.video,
      };

      return {
        messageIndex: index,
        sendOnDay: messageContent.sendOnDay,
        sendOnHour: messageContent.sendOnHour,
        messageTemplate: messageContent.messageTemplate,
        image: messageContent.image,
        video: messageContent.video,
        phone: sentMessage?.phoneId?.phone || null,
        status: sentMessage?.status || "not_sent",
        // Tracking dates
        lastTryDate: sentMessage?.lastTryDate || null,
        successDate: sentMessage?.successDate || null,
        lastErrorDate: sentMessage?.lastErrorDate || null,
        sentAt: sentMessage?.sentAt || null, // Legacy
        wahaResponse: sentMessage?.wahaResponse || null,
        // Structured errors
        errorCode: sentMessage?.errorCode || null,
        errorData: sentMessage?.errorData || null,
        error: sentMessage?.error || null, // Legacy
        logs: sentMessage?.logs || [],
        groupId: sentMessage?.groupId || null,
        _id: sentMessage?._id || null,
        // Indicate if the template was modified after sending
        templateModified: sentMessage?.messageSnapshot
          ? JSON.stringify(sentMessage.messageSnapshot) !==
            JSON.stringify({
              sendOnDay: templateMsg.sendOnDay,
              sendOnHour: templateMsg.sendOnHour,
              messageTemplate: templateMsg.messageTemplate,
              image: templateMsg.image,
              video: templateMsg.video,
            })
          : false,
      };
    });

    // Calculate statistics
    const stats = {
      total: template.messages.length,
      sent: sentMessages.filter((sm: any) => sm.status === "sent").length,
      failed: sentMessages.filter((sm: any) => sm.status === "failed").length,
      pending: sentMessages.filter((sm: any) => sm.status === "pending").length,
      not_sent:
        template.messages.length -
        sentMessages.filter((sm: any) => sm.status === "sent").length,
    };

    return NextResponse.json({
      schedule: {
        _id: schedule._id,
        groupName: schedule.groupName,
        eventDate: schedule.eventDate,
        status: schedule.status,
        variables: schedule.variables,
      },
      messages: messagesWithDetails,
      stats,
    });
  } catch (error) {
    console.error("[API] Error fetching sent messages:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
