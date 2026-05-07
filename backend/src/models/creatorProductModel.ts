import mongoose, { Schema, Document } from "mongoose";

export interface ICreatorProduct extends Document {
  creator: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  affiliateCode: string;
  clicks: number;
  conversions: number;
  totalEarned: number;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const creatorProductSchema = new Schema<ICreatorProduct>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    affiliateCode: { type: String, required: true, unique: true, index: true },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

creatorProductSchema.index({ creator: 1, product: 1 }, { unique: true });

export default mongoose.model<ICreatorProduct>("CreatorProduct", creatorProductSchema);
