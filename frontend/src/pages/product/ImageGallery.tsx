import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  /** Backwards-compat single image (cover). */
  image?: string;
  /** Full image set — preferred prop. */
  images?: string[];
  name: string;
  badge?: string;
  freeShipping?: boolean;
}

export function ImageGallery({ image, images, name }: ImageGalleryProps) {
  const gallery = useMemo<string[]>(() => {
    if (Array.isArray(images) && images.length) return images;
    if (Array.isArray(image)) return image as unknown as string[];
    if (typeof image === "string" && image) return [image];
    return [];
  }, [image, images]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Keep activeIdx in sync with the most-visible slide as the user scrolls
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = () => {
      const slideWidth = el.clientWidth;
      if (slideWidth <= 0) return;
      const idx = Math.round(el.scrollLeft / slideWidth);
      setActiveIdx(Math.max(0, Math.min(gallery.length - 1, idx)));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [gallery.length]);

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(gallery.length - 1, idx));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  if (gallery.length === 0) {
    return (
      <div style={{ padding: 32 }}>
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            aspectRatio: "1/1",
            background: "#0077b6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          No image
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ position: "relative" }}>
        {/* Horizontal scroller */}
        <div
          ref={scrollerRef}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            borderRadius: 24,
            border: "1.5px solid #f1f5f9",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            background: "#0077b6",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="hide-scrollbar"
        >
          {gallery.map((src, i) => (
            <div
              key={`${src}-${i}`}
              style={{
                flex: "0 0 100%",
                aspectRatio: "1/1",
                scrollSnapAlign: "center",
                background: "#0077b6",
              }}
            >
              <img
                src={src}
                alt={`${name} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>

        {/* Prev / Next arrows (desktop, only if >1 image) */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => scrollTo(activeIdx - 1)}
              aria-label="Previous image"
              style={arrowStyle("left")}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollTo(activeIdx + 1)}
              aria-label="Next image"
              style={arrowStyle("right")}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        {gallery.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to image ${i + 1}`}
                style={{
                  width: i === activeIdx ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  border: "none",
                  background: i === activeIdx ? "#fff" : "rgba(255,255,255,0.55)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: 12,
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };
}
