import mongoose, { Schema, model, models } from "mongoose";
import toJSON from "./plugins/toJSON";

export interface ISentMessageLog {
  timestamp: Date;
  errorCode?: string;
  errorData?: Record<string, any>;
  message?: string;
}

export interface ISentMessage {
  _id: string;
  scheduleId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId; // Reference to the Message
  messageIndex: number; // Keep for backward compatibility and ordering
  phoneId: mongoose.Types.ObjectId;
  groupId?: string;
  // Snapshot of the message at the time of sending (immutable record)
  messageSnapshot: {
    sendOnDay: string;
    sendOnHour: string;
    messageTemplate: string;
    image?: string;
    video?: string;
  };
  status: "pending" | "sent" | "failed";
  // Tracking dates
  lastTryDate?: Date; // Last attempt to send
  successDate?: Date; // When successfully sent
  lastErrorDate?: Date; // Last error occurrence
  // Legacy field (kept for backward compatibility)
  sentAt?: Date;
  wahaResponse?: any;
  // Structured error tracking
  errorCode?: string; // Structured error code (e.g., PHONE_NOT_CONNECTED)
  errorData?: Record<string, any>; // Error context data
  error?: string; // Legacy error message (kept for backward compatibility)
  // Logs history
  logs: ISentMessageLog[];
  createdAt: Date;
  updatedAt: Date;
}

const sentMessageSchema = new Schema<ISentMessage>(
  {
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
      index: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false, // Optional for backward compatibility with embedded messages
      index: true,
    },
    messageIndex: {
      type: Number,
      required: true,
    },
    phoneId: {
      type: Schema.Types.ObjectId,
      ref: "Phone",
      required: true,
    },
    groupId: {
      type: String,
      required: false,
      index: true,
    },
    // Snapshot of the message content at the time of sending
    // This prevents issues if the message is modified later
    messageSnapshot: {
      type: {
        sendOnDay: { type: String, required: true },
        sendOnHour: { type: String, required: true },
        messageTemplate: { type: String, required: true },
        image: { type: String },
        video: { type: String },
      },
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      required: true,
    },
    // Tracking dates
    lastTryDate: {
      type: Date,
    },
    successDate: {
      type: Date,
    },
    lastErrorDate: {
      type: Date,
    },
    // Legacy field (kept for backward compatibility)
    sentAt: {
      type: Date,
    },
    wahaResponse: {
      type: Schema.Types.Mixed,
    },
    // Structured error tracking
    errorCode: {
      type: String,
    },
    errorData: {
      type: Schema.Types.Mixed,
    },
    // Legacy error message (kept for backward compatibility)
    error: {
      type: String,
    },
    // Logs history
    logs: {
      type: [
        {
          timestamp: { type: Date, required: true },
          errorCode: { type: String },
          errorData: { type: Schema.Types.Mixed },
          message: { type: String },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for efficient queries
sentMessageSchema.index({ scheduleId: 1, messageIndex: 1 });
sentMessageSchema.index({ scheduleId: 1, messageId: 1 });
sentMessageSchema.index({ status: 1, createdAt: 1 });

sentMessageSchema.plugin(toJSON);

export default models.SentMessage ||
  model<ISentMessage>("SentMessage", sentMessageSchema);
