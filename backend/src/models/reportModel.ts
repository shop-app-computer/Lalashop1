import mongoose, { Schema, Document } from "mongoose";

export type ReportTargetType = "user" | "shop" | "product" | "post" | "comment";
export type ReportReason = "spam" | "abuse" | "fraud" | "counterfeit" | "harassment" | "other";
export type ReportStatus = "open" | "reviewing" | "actioned" | "dismissed";
export type ReportAction = "none" | "warn" | "remove" | "suspend" | "ban";

export interface IReport extends Document {
  targetType: ReportTargetType;
  targetId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: ReportReason;
  description?: string;
  evidence?: string[];
  status: ReportStatus;
  assignedTo?: mongoose.Types.ObjectId;
  actionTaken: ReportAction;
  adminNote?: string;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    targetType: {
      type: String,
      required: true,
      enum: ["user", "shop", "product", "post", "comment"],
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ["spam", "abuse", "fraud", "counterfeit", "harassment", "other"],
      index: true,
    },
    description: { type: String, default: "" },
    evidence: { type: [String], default: [] },
    status: {
      type: String,
      required: true,
      enum: ["open", "reviewing", "actioned", "dismissed"],
      default: "open",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    actionTaken: {
      type: String,
      enum: ["none", "warn", "remove", "suspend", "ban"],
      default: "none",
    },
    adminNote: { type: String, default: "" },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

reportSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IReport>("Report", reportSchema);
