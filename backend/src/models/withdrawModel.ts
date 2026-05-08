import mongoose, { Schema, Document } from "mongoose";

export type WithdrawStatus = "pending" | "approved" | "completed" | "rejected" | "failed";

export interface IWithdraw extends Document {
  user: mongoose.Types.ObjectId;
  // Legacy: ObjectId reference into the Bank collection from when withdrawals
  // used user-managed bank accounts. New withdrawals snapshot the destination
  // directly into bankNameSnapshot/accountNumberSnapshot/accountNameSnapshot
  // (filled from the seller's KYC at create time) so admin/seller views don't
  // depend on the Bank collection at all.
  bankAccount?: mongoose.Types.ObjectId;
  bankNameSnapshot?: string;
  accountNumberSnapshot?: string;
  accountNameSnapshot?: string;
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
    // Optional now — new withdrawals snapshot directly from KYC instead.
    bankAccount: { type: Schema.Types.ObjectId, ref: "Bank" },
    bankNameSnapshot: { type: String, default: "" },
    accountNumberSnapshot: { type: String, default: "" },
    accountNameSnapshot: { type: String, default: "" },
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
