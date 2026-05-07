import mongoose, { Document, Schema, Types } from "mongoose";

export type PromotionType = "flash_sale" | "bundle" | "bogo" | "discount";
export type PromotionStatus = "draft" | "scheduled" | "active" | "ended";

export interface IPromotion extends Document {
  shop: Types.ObjectId;
  name: string;
  type: PromotionType;
  description?: string;
  bannerImage?: string;
  productIds: Types.ObjectId[];
  discountPercent: number;
  bundleQty: number;
  bogoBuy: number;
  bogoGet: number;
  startsAt: Date;
  endsAt: Date;
  status: PromotionStatus;
  views: number;
  orders: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["flash_sale", "bundle", "bogo", "discount"],
      default: "discount",
    },
    description: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    discountPercent: { type: Number, default: 0 },
    bundleQty: { type: Number, default: 0 },
    bogoBuy: { type: Number, default: 0 },
    bogoGet: { type: Number, default: 0 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "ended"],
      default: "draft",
    },
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

promotionSchema.index({ shop: 1, status: 1, endsAt: 1 });

const Promotion = mongoose.model<IPromotion>("Promotion", promotionSchema);
export default Promotion;
