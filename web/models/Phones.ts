import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const phoneSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Phone number is required"],
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "disconnected",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

phoneSchema.plugin(toJSON);

export default (mongoose.models.Phone ||
  mongoose.model("Phone", phoneSchema)) as mongoose.Model<any>;
