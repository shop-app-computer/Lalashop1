import React, { useEffect, useMemo, useState } from "react";
import { Package, Globe, Award, Clock, Send, Star } from "lucide-react";
import { SpecRow, Stars } from "./ProductUIPrimitives";
import { ProductTabsProps } from "./types";
import { apiClient } from "@/services/apiClient";

const TAB_LIST = [
  { id: "specs", label: "Specifications" },
  { id: "desc", label: "Description" },
  { id: "reviews", label: "Reviews" },
];

interface ReviewDoc {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { _id?: string; name?: string; username?: string; profileImage?: string };
}

export function ProductTabs({ tab, setTab, product }: ProductTabsProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 28,
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        overflow: "hidden",
        marginBottom: 32,
        animation: "fadeSlideUp 0.6s 0.15s ease both",
      }}
    >
      {/* Tab Nav */}
      <div style={{ display: "flex", borderBottom: "1.5px solid #f1f5f9", padding: "0 32px" }}>
        {TAB_LIST.map((t) => (
          <button
            key={t.id}
            className="tab-btn"
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 19px",
              fontWeight: 500,
              fontSize: 13,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tab === t.id ? "#0077b6" : "#9ca3af",
              borderBottom: tab === t.id ? "3px solid #0077b6" : "3px solid transparent",
              transition: "all 0.2s",
              letterSpacing: "0.04em",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 32 }}>
        {tab === "specs" && <SpecsTab product={product} />}
        {tab === "desc" && <DescTab product={product} />}
        {tab === "reviews" && <ReviewsTab product={product} />}
      </div>
    </div>
  );
}

/* ── Specs ── */
function SpecsTab({ product }: Pick<ProductTabsProps, "product">) {
  const sellerSpecs = Array.isArray((product as any).specifications)
    ? ((product as any).specifications as Array<{ label: string; value: string }>)
    : [];

  const lt: any = (product as any).leadTime;
  const leadTimeText = lt && (lt.min || lt.max)
    ? (() => {
        const unitLabel =
          lt.unit === "hours" ? "Hours" : lt.unit === "weeks" ? "Weeks" : "Days";
        const min = Number(lt.min) || 0;
        const max = Number(lt.max) || min;
        return min === max ? `${min} ${unitLabel}` : `${min}–${max} ${unitLabel}`;
      })()
    : "7–14 Days";

  const fallbackSpecs = [
    { label: "Origin", value: (product as any).location || "Thailand" },
    { label: "Vendor", value: (product as any).vendor || "—" },
    { label: "Lead Time", value: leadTimeText },
  ];

  const specsToShow = sellerSpecs.length > 0 ? sellerSpecs : fallbackSpecs;

  const supplierSpecs = [
    { label: "Response Rate", value: "98%" },
    { label: "Years Active", value: "12 Years" },
    { label: "Total Orders", value: "25,000+" },
    { label: "Countries", value: "42 Countries" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
      <div>
        <SectionLabel>Key Specifications</SectionLabel>
        {specsToShow.map((s, i) => (
          <SpecRow key={`${s.label}-${i}`} label={s.label} value={s.value} />
        ))}
        {sellerSpecs.length === 0 && (
          <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
            The seller hasn&apos;t added detailed specifications yet.
          </p>
        )}
      </div>
      <div>
        <SectionLabel>Supplier Profile</SectionLabel>
        {supplierSpecs.map((s, i) => (
          <SpecRow key={i} label={s.label} value={s.value} />
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
          {["Verified Seller", "Trade Assurance"].map((b) => (
            <span
              key={b}
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#0077b6",
                background: "#00a6991a",
                border: "1px solid #0077b6",
                borderRadius: 999,
                padding: "4px 12px",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Description ── */
function DescTab({ product }: Pick<ProductTabsProps, "product">) {
  const features = [
    { icon: Package, text: "Bulk packaging available" },
    { icon: Globe, text: "Ships worldwide" },
    { icon: Award, text: "Award-winning quality" },
    { icon: Clock, text: "Fast lead time" },
  ];

  return (
    <div style={{ maxWidth: 700 }}>
      <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, fontWeight: 500, marginBottom: 20 }}>
        {product.description ||
          "The high-performance industrial solution designed for global supply chains. Sourced directly from verified manufacturers with decades of experience."}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {features.map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderRadius: 14,
              background: "#f8fafc",
              border: "1.5px solid #f1f5f9",
              fontWeight: 700,
              fontSize: 13,
              color: "#374151",
            }}
          >
            <Icon size={16} color="#0077b6" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reviews ── */
function ReviewsTab({ product }: Pick<ProductTabsProps, "product">) {
  const productId = (product as any)?._id || (product as any)?.id;

  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [target, setTarget] = useState<"product" | "shop">("product");

  const me = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/products/${productId}/reviews`);
        if (!cancelled) setReviews(res?.data || []);
      } catch (e) {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const avg = useMemo(() => {
    if (reviews.length === 0) return Number((product as any)?.rating) || 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews, product]);

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(4, Math.max(0, Math.round(Number(r.rating) || 0) - 1));
      counts[idx] += 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: `${Math.round((counts[star - 1] / total) * 100)}%`,
    }));
  }, [reviews]);

  const sellerId =
    typeof (product as any)?.seller === "string"
      ? (product as any).seller
      : (product as any)?.seller?._id;
  const isOwnProduct = me?._id && sellerId && me._id === sellerId;

  const handleSubmit = async () => {
    setErr(null);
    if (!me?._id) return setErr("Please log in to leave a review.");
    if (rating < 1) return setErr("Pick a star rating first.");
    setSubmitting(true);
    try {
      const res = await apiClient(`/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment, target }),
      });
      if (res?.data) {
        setReviews((prev) => [res.data, ...prev]);
        setRating(0);
        setComment("");
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
            {avg.toFixed(1)}
          </div>
          <Stars filled={Math.round(avg)} size={16} />
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {distribution.map(({ star, pct }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", width: 10 }}>{star}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    background: "#0077b6",
                    width: pct,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose */}
      {!isOwnProduct && (
        <div
          style={{
            border: "1.5px solid #f1f5f9",
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            background: "#fafbff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#0077b6", letterSpacing: "0.1em" }}>
              SHARE YOUR EXPERIENCE
            </p>
            <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "#fff", borderRadius: 999, border: "1px solid #e2e8f0" }}>
              {(["product", "shop"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    border: "none",
                    background: target === t ? "#0077b6" : "transparent",
                    color: target === t ? "#fff" : "#64748b",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  Rate {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    size={28}
                    fill={active ? "#f59e0b" : "none"}
                    color={active ? "#f59e0b" : "#cbd5e1"}
                  />
                </button>
              );
            })}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell other buyers what you liked, fit, quality, packaging…"
            rows={3}
            style={{
              width: "100%",
              borderRadius: 14,
              border: "1.5px solid #e2e8f0",
              padding: 12,
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              background: "#fff",
            }}
          />

          {err && (
            <p style={{ color: "#dc2626", fontSize: 12, fontWeight: 600, marginTop: 8 }}>{err}</p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                background: "#0077b6",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              <Send size={14} /> {submitting ? "Posting…" : "review"}
            </button>
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          No reviews yet — be the first to review this product.
        </p>
      ) : (
        reviews.map((r) => (
          <div
            key={r._id}
            style={{ padding: "18px 0", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 14 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 15,
                color: "#d97706",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {r.user?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.user.profileImage}
                  alt={r.user.name || "User"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                (r.user?.name || "U")[0]
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                  {r.user?.name || "Anonymous"}
                </span>
                <Stars filled={r.rating} size={12} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 500, margin: 0 }}>
                {r.comment || "(no comment)"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Helpers ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: "#0077b6",
        letterSpacing: "0.15em",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}
