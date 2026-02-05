import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const variableEntrySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
  },
}, { _id: false });

const scheduleSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      trim: true,
      required: [true, "Group name is required"],
    },
    messageTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: [true, "Template is required"],
      index: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    variables: {
      type: [variableEntrySchema],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

scheduleSchema.plugin(toJSON);

export default (mongoose.models.Schedule ||
  mongoose.model("Schedule", scheduleSchema)) as mongoose.Model<any>;
