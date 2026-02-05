import mongoose, { Schema, model, models } from "mongoose";
import toJSON from "./plugins/toJSON";

export interface IMessage {
  _id: string;
  templateId: mongoose.Types.ObjectId;
  phoneId: mongoose.Types.ObjectId;
  sendOnDay: string;
  sendOnHour: string;
  messageTemplate: string;
  image?: string;
  video?: string;
  order: number; // Order in the template sequence
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
      index: true,
    },
    phoneId: {
      type: Schema.Types.ObjectId,
      ref: "Phone",
      required: true,
    },
    sendOnDay: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^(-?[1-2]?[0-9]|30|-30|0)$/.test(v);
        },
        message: "sendOnDay must be between -30 and 30, or 0 for D-Day",
      },
    },
    sendOnHour: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "sendOnHour must be in HH:mm format",
      },
    },
    messageTemplate: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 4096,
    },
    image: {
      type: String,
    },
    video: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
messageSchema.index({ templateId: 1, order: 1 });

messageSchema.plugin(toJSON);

export default models.Message || model<IMessage>("Message", messageSchema);
