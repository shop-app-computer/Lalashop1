import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  name: string;
  qty: number;
  image: string;
  description?: string;
  price: number;
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  // Affiliate attribution
  creator?: mongoose.Types.ObjectId;
  commission?: number;
  commissionType?: "percent" | "fixed";
  commissionValue?: number;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
  channel?: "web" | "pos";
  posTerminal?: string;
}

const orderItemSchema = new Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    commission: { type: Number, default: 0 },
    commissionType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    commissionValue: { type: Number, default: 0 },
  },
  { _id: true }
);

const orderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    channel: {
      type: String,
      enum: ["web", "pos"],
      default: "web",
      index: true,
    },
    posTerminal: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ "orderItems.creator": 1, createdAt: -1 });

export default mongoose.model<IOrder>("Order", orderSchema);
