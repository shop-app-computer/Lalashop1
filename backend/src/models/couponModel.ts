import mongoose, { Document, Schema, Types } from "mongoose";

export type CouponType = "percent" | "fixed" | "freeship";
export type CouponStatus = "draft" | "active" | "paused" | "expired";
export type CouponScope = "shop" | "products" | "categories";

export interface ICoupon extends Document {
  shop: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  scope: CouponScope;
  productIds: Types.ObjectId[];
  categories: string[];
  startsAt?: Date;
  expiresAt?: Date;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percent", "fixed", "freeship"], default: "percent" },
    value: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    scope: { type: String, enum: ["shop", "products", "categories"], default: "shop" },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: String }],
    startsAt: { type: Date },
    expiresAt: { type: Date },
    status: { type: String, enum: ["draft", "active", "paused", "expired"], default: "draft" },
  },
  { timestamps: true }
);

couponSchema.index({ shop: 1, code: 1 }, { unique: true });

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;
