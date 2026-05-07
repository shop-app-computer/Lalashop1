import mongoose, { Schema, Document } from "mongoose";

export type KycStatus = "pending" | "approved" | "rejected";

export interface IKycShopInfo {
  shopName: string;
  shopAccount: string;
  shopCategory: string;
  shopEmail: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  entityName?: string;
}

export interface IKycDocument {
  url: string;
  label?: string;
  mimeType?: string;
  uploadedAt?: Date;
}

export interface IKycIdentity {
  idType: string;
  idNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate?: string;
  expiryDate?: string;
  tinNumber?: string;
  businessLicenseUrl?: string;
  idDocumentUrl?: string;
  documents?: IKycDocument[];
  address: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface IKycSubmission extends Document {
  user: mongoose.Types.ObjectId;
  status: KycStatus;
  businessType: string;
  shopInfo: IKycShopInfo;
  identity: IKycIdentity;
  warehouse: {
    fullAddress: string;
  };
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
}

const addressSchema = new Schema(
  {
    street: { type: String, default: "" },
    apartment: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
);

const shopInfoSchema = new Schema(
  {
    shopName: { type: String, required: true },
    shopAccount: { type: String, default: "" },
    shopCategory: { type: String, default: "" },
    shopEmail: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    entityName: { type: String, default: "" },
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    url: { type: String, required: true },
    label: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const identitySchema = new Schema(
  {
    idType: { type: String, default: "passport" },
    idNumber: { type: String, default: "" },
    firstName: { type: String, default: "" },
    middleName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    tinNumber: { type: String, default: "" },
    businessLicenseUrl: { type: String, default: "" },
    idDocumentUrl: { type: String, default: "" },
    documents: { type: [documentSchema], default: [] },
    address: { type: addressSchema, default: () => ({}) },
  },
  { _id: false }
);

const kycSubmissionSchema = new Schema<IKycSubmission>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    businessType: { type: String, required: true },
    shopInfo: { type: shopInfoSchema, required: true },
    identity: { type: identitySchema, default: () => ({}) },
    warehouse: {
      fullAddress: { type: String, default: "" },
    },
    submittedAt: { type: Date, default: () => new Date() },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IKycSubmission>("KycSubmission", kycSubmissionSchema);
