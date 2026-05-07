import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "kyc_approved"
  | "kyc_rejected"
  | "system"
  | "security"
  | "payout"
  | "info"
  | "broadcast"
  | "promo"
  | "order_update"
  | "message";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "kyc_approved",
        "kyc_rejected",
        "system",
        "security",
        "payout",
        "info",
        "broadcast",
        "promo",
        "order_update",
        "message",
      ],
      default: "info",
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
