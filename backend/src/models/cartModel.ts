import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId; // Optional for now, could use session or guest ID
  sessionId?: string; // For guest carts
  items: ICartItem[];
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  qty: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: { unique: true, sparse: true } },
    sessionId: { type: String },
    items: [cartItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", cartSchema);
