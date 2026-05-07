import mongoose from "mongoose";

export interface IPost extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  mentions: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  visibility: "public" | "friends" | "friends_except" | "specific_friends";
  visibleTo?: mongoose.Types.ObjectId[];
  hiddenFrom?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    caption: { type: String },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    visibility: { 
      type: String, 
      enum: ["public", "friends", "friends_except", "specific_friends"], 
      default: "public" 
    },
    visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hiddenFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", postSchema);
