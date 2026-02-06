import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const templateMessageSchema = new mongoose.Schema({
  phoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Phone",
    required: [true, "Phone is required"],
  },
  sendTimeType: {
    type: String,
    enum: ["fixed_time", "event_time", "relative_time"],
    default: "fixed_time",
  },
  sendOnDay: {
    type: String,
    required: [true, "Send on day is required"],
    validate: {
      validator: function(v: string) {
        return /^(-?([1-2]?[0-9]|30)|0)$/.test(v);
      },
      message: "Invalid sendOnDay format (must be -30 to +30, or 0)"
    }
  },
  sendOnHour: {
    type: String,
    required: [true, "Send on hour is required"],
    validate: {
      validator: function(v: string) {
        return /^-?([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Invalid time format (must be HH:mm or -HH:mm)"
    }
  },
  messageTemplate: {
    type: String,
    required: [true, "Message template is required"],
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  video: {
    type: String,
    trim: true,
  },
}, { _id: false });

const templateSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: {
      type: [templateMessageSchema],
      validate: {
        validator: function(v: any[]) {
          return v && v.length > 0;
        },
        message: "At least one message is required"
      }
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

templateSchema.plugin(toJSON);

export default (mongoose.models.Template ||
  mongoose.model("Template", templateSchema)) as mongoose.Model<any>;
