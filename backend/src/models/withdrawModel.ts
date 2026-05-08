import mongoose, { Schema, Document } from "mongoose";

export type WithdrawStatus = "pending" | "approved" | "completed" | "rejected" | "failed";

export interface IWithdraw extends Document {
  user: mongoose.Types.ObjectId;
  bankAccount: mongoose.Types.ObjectId;
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawStatus;
  reference?: string;
  adminNote?: string;
  processedAt?: Date;
  // Audit trail — which admin took the last action on this request. Useful
  // when reviewing why a payout was approved/rejected and for finance reports.
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawSchema = new Schema<IWithdraw>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bankAccount: { type: Schema.Types.ObjectId, ref: "Bank", required: true },
    amount: { type: Number, required: true, min: 0 },
    fee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "rejected", "failed"],
      default: "pending",
      index: true,
    },
    reference: { type: String },
    adminNote: { type: String },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

withdrawSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IWithdraw>("Withdraw", withdrawSchema);
