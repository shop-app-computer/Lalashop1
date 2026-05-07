import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  recipientName: string;
  phoneNumber: string;
  village: string;
  district: string;
  province: string;
  shippingBranch: string;
  isDefault: boolean;
}

const addressSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    shippingBranch: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>("Address", addressSchema);