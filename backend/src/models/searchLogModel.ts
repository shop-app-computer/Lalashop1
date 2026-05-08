import mongoose, { Schema, Document } from "mongoose";

// Lightweight tally of search terms — one row per unique normalised term.
// Updated via upsert from the /products/search endpoint as a fire-and-forget
// side effect. Used by the trending-searches endpoint and (later) by no-
// result-fallback to suggest popular alternatives.
export interface ISearchLog extends Document {
  term: string;
  hits: number;
  lastSearchedAt: Date;
  createdAt: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    term: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hits: { type: Number, default: 1 },
    lastSearchedAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISearchLog>("SearchLog", searchLogSchema);
