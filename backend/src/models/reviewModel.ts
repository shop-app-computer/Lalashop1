import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  target: "product" | "shop";
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema: Schema = new Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    target: { type: String, enum: ["product", "shop"], default: "product" },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: false });

export default mongoose.model<IReview>("Review", reviewSchema);
