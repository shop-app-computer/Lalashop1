import mongoose, { Schema, Document } from "mongoose";

export type EarningStatus = "pending" | "settled" | "canceled";

export interface ICreatorEarning extends Document {
  creator: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  amount: number;
  status: EarningStatus;
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const creatorEarningSchema = new Schema<ICreatorEarning>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderItemId: { type: Schema.Types.ObjectId, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "settled", "canceled"],
      default: "pending",
      index: true,
    },
    settledAt: { type: Date },
  },
  { timestamps: true }
);

creatorEarningSchema.index({ creator: 1, status: 1, createdAt: -1 });
creatorEarningSchema.index({ order: 1, orderItemId: 1 }, { unique: true });

export default mongoose.model<ICreatorEarning>("CreatorEarning", creatorEarningSchema);
