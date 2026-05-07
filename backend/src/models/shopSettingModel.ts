import mongoose, { Document, Schema, Types } from "mongoose";

// One ShopSetting document per seller (1:1 with the User who owns the shop).
// We split logical sections into nested objects so the frontend can fetch the
// whole document once and update sections independently.

export interface IShopGeneral {
  storeName: string;
  storeSlug: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  category: string;
  language: string;
  currency: string;
}

export interface IShippingZone {
  id: string;
  name: string;
  countries: string[];
  rate: number;
  freeShippingThreshold: number;
  estimatedDays: { min: number; max: number };
}

export interface IShopShipping {
  enabled: boolean;
  freeShippingDefault: boolean;
  defaultRate: number;
  defaultLeadDays: { min: number; max: number };
  zones: IShippingZone[];
  defaultPackageWeight: number;
  weightUnit: "g" | "kg";
}

export interface IShopPayment {
  acceptCash: boolean;
  acceptBankTransfer: boolean;
  acceptCreditCard: boolean;
  acceptPromptPay: boolean;
  promptPayId: string;
  vatRegistered: boolean;
  vatNumber: string;
  vatPercent: number;
  payoutSchedule: "weekly" | "biweekly" | "monthly";
}

export interface IShopIntegration {
  key: "tiktok" | "facebook" | "instagram" | "line" | "shopify";
  enabled: boolean;
  connectedAt?: Date;
  account?: string;
  metadata?: Record<string, unknown>;
}

export interface IShopSetting extends Document {
  shop: Types.ObjectId;
  general: IShopGeneral;
  shipping: IShopShipping;
  payment: IShopPayment;
  integrations: IShopIntegration[];
  createdAt: Date;
  updatedAt: Date;
}

const generalSchema = new Schema<IShopGeneral>(
  {
    storeName: { type: String, default: "" },
    storeSlug: { type: String, default: "" },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    category: { type: String, default: "" },
    language: { type: String, default: "en" },
    currency: { type: String, default: "THB" },
  },
  { _id: false }
);

const zoneSchema = new Schema<IShippingZone>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    countries: [{ type: String }],
    rate: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    estimatedDays: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 7 },
    },
  },
  { _id: false }
);

const shippingSchema = new Schema<IShopShipping>(
  {
    enabled: { type: Boolean, default: true },
    freeShippingDefault: { type: Boolean, default: false },
    defaultRate: { type: Number, default: 50 },
    defaultLeadDays: {
      min: { type: Number, default: 3 },
      max: { type: Number, default: 7 },
    },
    zones: [zoneSchema],
    defaultPackageWeight: { type: Number, default: 500 },
    weightUnit: { type: String, enum: ["g", "kg"], default: "g" },
  },
  { _id: false }
);

const paymentSchema = new Schema<IShopPayment>(
  {
    acceptCash: { type: Boolean, default: true },
    acceptBankTransfer: { type: Boolean, default: true },
    acceptCreditCard: { type: Boolean, default: false },
    acceptPromptPay: { type: Boolean, default: true },
    promptPayId: { type: String, default: "" },
    vatRegistered: { type: Boolean, default: false },
    vatNumber: { type: String, default: "" },
    vatPercent: { type: Number, default: 7 },
    payoutSchedule: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      default: "weekly",
    },
  },
  { _id: false }
);

const integrationSchema = new Schema<IShopIntegration>(
  {
    key: {
      type: String,
      enum: ["tiktok", "facebook", "instagram", "line", "shopify"],
      required: true,
    },
    enabled: { type: Boolean, default: false },
    connectedAt: { type: Date },
    account: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const shopSettingSchema = new Schema<IShopSetting>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    general: { type: generalSchema, default: () => ({}) },
    shipping: { type: shippingSchema, default: () => ({}) },
    payment: { type: paymentSchema, default: () => ({}) },
    integrations: { type: [integrationSchema], default: [] },
  },
  { timestamps: true }
);

const ShopSetting = mongoose.model<IShopSetting>("ShopSetting", shopSettingSchema);
export default ShopSetting;
