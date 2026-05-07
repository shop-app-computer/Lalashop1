import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliateClick extends Document {
  creator: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  affiliateCode: string;
  visitor?: mongoose.Types.ObjectId;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  converted: boolean;
  order?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const affiliateClickSchema = new Schema<IAffiliateClick>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    affiliateCode: { type: String, required: true, index: true },
    visitor: { type: Schema.Types.ObjectId, ref: "User" },
    ip: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
    converted: { type: Boolean, default: false },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

affiliateClickSchema.index({ product: 1, visitor: 1, createdAt: -1 });

export default mongoose.model<IAffiliateClick>("AffiliateClick", affiliateClickSchema);
