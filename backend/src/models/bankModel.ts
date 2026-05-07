import mongoose, { Schema, Document } from "mongoose";

export interface IBank extends Document {
  user: mongoose.Types.ObjectId;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
}

const bankSchema = new Schema<IBank>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IBank>("Bank", bankSchema);