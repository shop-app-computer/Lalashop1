import mongoose, { Document, Schema, Types } from "mongoose";

// Per-shop customer label/segment metadata. We store this in a separate
// collection (rather than denormalizing onto User) so each shop can label its
// own customers independently — a buyer who shops at multiple stores gets a
// different VIP/note from each seller.

export interface ICustomerLabel extends Document {
  shop: Types.ObjectId;
  customer: Types.ObjectId;
  tags: string[];
  segment: "vip" | "regular" | "new" | "inactive" | "blocked" | "";
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerLabelSchema = new Schema<ICustomerLabel>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tags: [{ type: String }],
    segment: {
      type: String,
      enum: ["vip", "regular", "new", "inactive", "blocked", ""],
      default: "",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

customerLabelSchema.index({ shop: 1, customer: 1 }, { unique: true });

const CustomerLabel = mongoose.model<ICustomerLabel>("CustomerLabel", customerLabelSchema);
export default CustomerLabel;
