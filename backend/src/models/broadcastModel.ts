import mongoose, { Document, Schema, Types } from "mongoose";

export type BroadcastChannel = "in_app" | "email";
export type BroadcastAudience = "all_followers" | "all_customers" | "vip" | "inactive";
export type BroadcastStatus = "draft" | "scheduled" | "sent" | "failed";

export interface IBroadcast extends Document {
  shop: Types.ObjectId;
  title: string;
  body: string;
  channel: BroadcastChannel;
  audience: BroadcastAudience;
  audienceCount: number;
  scheduledAt?: Date;
  sentAt?: Date;
  status: BroadcastStatus;
  metrics: {
    delivered: number;
    opened: number;
    clicked: number;
  };
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const broadcastSchema = new Schema<IBroadcast>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    channel: { type: String, enum: ["in_app", "email"], default: "in_app" },
    audience: {
      type: String,
      enum: ["all_followers", "all_customers", "vip", "inactive"],
      default: "all_customers",
    },
    audienceCount: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "failed"],
      default: "draft",
    },
    metrics: {
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
    },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

const Broadcast = mongoose.model<IBroadcast>("Broadcast", broadcastSchema);
export default Broadcast;
