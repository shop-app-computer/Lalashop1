import React from "react";
import { Star } from "lucide-react";
import { LiveBadgeProps, SpecRowProps, StarsProps, TrustPillProps } from "./types";

export function Stars({ count = 5, filled = 4, size = 14 }: StarsProps) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: count }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < filled ? "#f59e0b" : "none"}
          color={i < filled ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

export function LiveBadge({ children, color = "#22c55e" }: LiveBadgeProps) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: 999, padding: "4px 12px",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", background: color,
        display: "inline-block", animation: "pulse 2s infinite",
      }} />
      {children}
    </span>
  );
}

export function SpecRow({ label, value, highlight }: SpecRowProps) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, fontWeight: 800, color: highlight ? "#1e293b" : "#1e293b",
        padding: highlight ? "2px 10px" : "0",
        borderRadius: highlight ? 999 : 0,
      }}>
        {value}
      </span>
    </div>
  );
}

export function TrustPill({ icon: Icon, label, value, color }: TrustPillProps) {
  return (
    <div
      style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        gap: 6, padding: "16px 8px", borderRadius: 18,
        
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", letterSpacing: "0.08em", textAlign: "center" }}>
        {label}
      </div>
      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textAlign: "center" }}>
        {value}
      </div>
    </div>
  );
}