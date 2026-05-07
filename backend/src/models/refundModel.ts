import mongoose, { Document, Schema, Types } from "mongoose";

export type RefundStatus = "requested" | "approved" | "rejected" | "completed";
export type RefundReason =
  | "not_received"
  | "damaged"
  | "wrong_item"
  | "not_as_described"
  | "changed_mind"
  | "other";

export interface IRefund extends Document {
  shop: Types.ObjectId;
  order: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  reason: RefundReason;
  description: string;
  status: RefundStatus;
  evidenceImages: string[];
  resolutionNote: string;
  decidedAt?: Date;
  decidedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    reason: {
      type: String,
      enum: [
        "not_received",
        "damaged",
        "wrong_item",
        "not_as_described",
        "changed_mind",
        "other",
      ],
      default: "other",
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "completed"],
      default: "requested",
      index: true,
    },
    evidenceImages: [{ type: String }],
    resolutionNote: { type: String, default: "" },
    decidedAt: { type: Date },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Refund = mongoose.model<IRefund>("Refund", refundSchema);
export default Refund;
