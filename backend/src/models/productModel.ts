import mongoose, { Schema, Document } from "mongoose";

export interface IProductPrice {
  range: string;
  price: number;
}

export interface IProductTier {
  minQty: number;
  price: number;
  discountPercent?: number;
}

export interface IVariantOption {
  name: string;
  values: string[];
}

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProductLeadTime {
  min: number;
  max: number;
  unit: "hours" | "days" | "weeks";
}

export interface IProductReturnPolicy {
  accepts: boolean;
  days: number;
  notes: string;
}

export interface IProduct extends Document {
  seller: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  compareAt?: number;
  cost?: number;
  prices?: IProductPrice[];
  image: string | string[];
  images?: string[];
  advertImages?: string[];
  freeShipping?: boolean;
  specifications?: IProductSpecification[];
  rating?: number;
  numReviews?: number;
  category: string;
  countInStock: number;
  moq?: number;
  tiers?: IProductTier[];
  sku?: string;
  barcode?: string;
  trackInventory?: boolean;
  allowOversell?: boolean;
  reorderAt?: number;
  status?: "Active" | "Draft" | "Archived";
  salesChannel?: "web" | "pos" | "both";
  showInStorefront?: boolean;
  tags?: string[];
  vendor?: string;
  variantOptions?: IVariantOption[];
  attributes?: Record<string, unknown>;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  originCountry?: string;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  channels?: Record<string, boolean>;
  allowCreators?: boolean;
  commissionType?: "percent" | "fixed";
  commissionValue?: number;
  minCreatorTier?: string;
  cookieDays?: number;
  location?: string;
  badge?: string;
  leadTime?: IProductLeadTime;
  returnPolicy?: IProductReturnPolicy;
  soldCount?: number;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productPriceSchema = new Schema(
  {
    range: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const tierSchema = new Schema(
  {
    minQty: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const specificationSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, default: "" },
  },
  { _id: false }
);

const variantOptionSchema = new Schema(
  {
    name: { type: String, required: true },
    values: { type: [String], default: [] },
  },
  { _id: false }
);

const leadTimeSchema = new Schema(
  {
    min: { type: Number, default: 3 },
    max: { type: Number, default: 7 },
    unit: { type: String, enum: ["hours", "days", "weeks"], default: "days" },
  },
  { _id: false }
);

const returnPolicySchema = new Schema(
  {
    accepts: { type: Boolean, default: true },
    days: { type: Number, default: 7 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const productSchema: Schema = new Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    compareAt: { type: Number },
    cost: { type: Number },
    prices: [productPriceSchema],
    image: { type: Schema.Types.Mixed, required: true },
    images: { type: [String], default: [] },
    advertImages: { type: [String], default: [] },
    freeShipping: { type: Boolean, default: false },
    specifications: { type: [specificationSchema], default: [] },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    countInStock: { type: Number, required: true, default: 0 },
    moq: { type: Number, default: 1 },
    tiers: { type: [tierSchema], default: [] },
    sku: { type: String, default: "" },
    barcode: { type: String, default: "" },
    trackInventory: { type: Boolean, default: true },
    allowOversell: { type: Boolean, default: false },
    reorderAt: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Draft", "Archived"],
      default: "Draft",
    },
    salesChannel: {
      type: String,
      enum: ["web", "pos", "both"],
      default: "web",
      index: true,
    },
    showInStorefront: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [] },
    vendor: { type: String, default: "" },
    variantOptions: { type: [variantOptionSchema], default: [] },
    attributes: { type: Schema.Types.Mixed, default: {} },
    weight: { type: Number },
    weightUnit: { type: String, default: "g" },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: "cm" },
    },
    originCountry: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    slug: { type: String, default: "" },
    channels: { type: Schema.Types.Mixed, default: {} },
    allowCreators: { type: Boolean, default: false },
    commissionType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    commissionValue: { type: Number, default: 0 },
    minCreatorTier: { type: String, default: "all" },
    cookieDays: { type: Number, default: 30 },
    location: { type: String, default: "Thailand" },
    badge: { type: String },
    leadTime: { type: leadTimeSchema, default: () => ({}) },
    returnPolicy: { type: returnPolicySchema, default: () => ({}) },
    soldCount: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Full-text index for search. Weights bias matches in name highest, then
// tags (taxonomy), then description (long-tail content). Vendor + category
// included so brand searches like "Nike" or category names also hit.
productSchema.index(
  {
    name: "text",
    description: "text",
    tags: "text",
    vendor: "text",
    category: "text",
  },
  {
    weights: { name: 10, tags: 5, vendor: 4, category: 3, description: 1 },
    name: "ProductTextIndex",
  },
);

// Plain B-tree on `name` so the autocomplete endpoint can do fast prefix
// regex matches (the text index doesn't help with "shi" → "shirt" prefix).
productSchema.index({ name: 1 });

export default mongoose.model<IProduct>("Product", productSchema);
