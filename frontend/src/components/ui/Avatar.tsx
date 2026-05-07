import React from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  username?: string;
  userId?: string;
  size?: number;
  className?: string;
  alt?: string;
}

const PALETTE = [
  ["#fef3c7", "#92400e"], // amber
  ["#fee2e2", "#991b1b"], // red
  ["#dbeafe", "#1e3a8a"], // blue
  ["#dcfce7", "#166534"], // green
  ["#f3e8ff", "#6b21a8"], // purple
  ["#ffe4e6", "#9f1239"], // rose
  ["#cffafe", "#155e75"], // cyan
  ["#fef9c3", "#854d0e"], // yellow
  ["#e0e7ff", "#3730a3"], // indigo
];

const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const initials = (name?: string, username?: string): string => {
  const source = (name || username || "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Avatar({
  src,
  name,
  username,
  userId,
  size = 40,
  className = "",
  alt,
}: AvatarProps) {
  const seed = userId || username || name || "anon";
  const [bg, fg] = PALETTE[hashString(seed) % PALETTE.length];
  const text = initials(name, username);
  const fontSize = Math.max(10, Math.round(size * 0.42));

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || username || name || "avatar"}
        className={`object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: fg,
        fontSize,
        lineHeight: 1,
      }}
      aria-label={alt || username || name || "avatar"}
    >
      {text}
    </div>
  );
}
