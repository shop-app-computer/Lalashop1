import mongoose, { Document, Schema, Types } from "mongoose";

export type MessageKind = "text" | "image" | "system" | "product";

// Product context attached to a message so sellers immediately see which item
// a buyer is asking about (rendered as a small product card in the thread).
export interface IProductContext {
  productId: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  slug?: string;
}

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  body: string;
  kind: MessageKind;
  imageUrl?: string;
  productContext?: IProductContext;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, default: "" },
    kind: { type: String, enum: ["text", "image", "system", "product"], default: "text" },
    imageUrl: { type: String, default: "" },
    productContext: {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      name: { type: String },
      image: { type: String },
      price: { type: Number },
      slug: { type: String },
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
