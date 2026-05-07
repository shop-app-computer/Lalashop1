import React, { useEffect, useRef, useState } from "react";

// Code-128 reference patterns (subset B). Each char produces 6 bars/spaces.
// We use Code 128B (ASCII) for simplicity — sufficient for numeric SKU codes.
const CODE128_PATTERNS = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "11000111010",
];

const START_B = 104;
const STOP = 106;

const encodeCode128B = (data: string): string => {
  const codes: number[] = [START_B];
  for (const ch of data) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 127) continue;
    codes.push(code - 32);
  }
  // Checksum
  let sum = codes[0];
  for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
  const checksum = sum % 103;
  codes.push(checksum);
  codes.push(STOP);
  return codes.map((c) => CODE128_PATTERNS[c]).join("") + "11";
};

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  width = 2,
  height = 80,
  showText = true,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [bars, setBars] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setBars("");
      return;
    }
    setBars(encodeCode128B(value));
  }, [value]);

  if (!bars) {
    return (
      <div className={`text-[11px] text-gray-400 italic ${className}`}>
        (no barcode)
      </div>
    );
  }

  const totalWidth = bars.length * width;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      width={totalWidth}
      height={height + (showText ? 18 : 0)}
      viewBox={`0 0 ${totalWidth} ${height + (showText ? 18 : 0)}`}
      className={className}
    >
      <rect width={totalWidth} height={height + (showText ? 18 : 0)} fill="#ffffff" />
      {bars.split("").map((bit, i) => (
        <rect
          key={i}
          x={i * width}
          y={0}
          width={width}
          height={height}
          fill={bit === "1" ? "#000000" : "#ffffff"}
        />
      ))}
      {showText && (
        <text
          x={totalWidth / 2}
          y={height + 13}
          fontSize={12}
          fontFamily="monospace"
          textAnchor="middle"
          fill="#000000"
        >
          {value}
        </text>
      )}
    </svg>
  );
};

export default Barcode;

// ─── helpers ──────────────────────────────────────────────────────────

export const downloadBarcodeSvg = (value: string, fileName?: string): void => {
  const bars = encodeCode128B(value);
  const width = 2;
  const height = 80;
  const totalWidth = bars.length * width;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height + 18}" viewBox="0 0 ${totalWidth} ${height + 18}">
  <rect width="${totalWidth}" height="${height + 18}" fill="#ffffff"/>
  ${bars
    .split("")
    .map((bit, i) =>
      bit === "1"
        ? `<rect x="${i * width}" y="0" width="${width}" height="${height}" fill="#000000"/>`
        : ""
    )
    .join("")}
  <text x="${totalWidth / 2}" y="${height + 13}" font-size="12" font-family="monospace" text-anchor="middle" fill="#000000">${value}</text>
</svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || `barcode-${value}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const printBarcode = (value: string, label?: string): void => {
  const bars = encodeCode128B(value);
  const width = 2;
  const height = 80;
  const totalWidth = bars.length * width;
  const svgMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height + 18}" viewBox="0 0 ${totalWidth} ${height + 18}">
  <rect width="${totalWidth}" height="${height + 18}" fill="#ffffff"/>
  ${bars
    .split("")
    .map((bit, i) =>
      bit === "1"
        ? `<rect x="${i * width}" y="0" width="${width}" height="${height}" fill="#000000"/>`
        : ""
    )
    .join("")}
  <text x="${totalWidth / 2}" y="${height + 13}" font-size="12" font-family="monospace" text-anchor="middle" fill="#000000">${value}</text>
</svg>`;

  const w = window.open("", "_blank", "width=400,height=200");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>Barcode ${value}</title>
<style>
  @page { size: 60mm 30mm; margin: 0; }
  body { margin: 0; padding: 4mm; display: flex; flex-direction: column; align-items: center; gap: 4px; font-family: -apple-system, sans-serif; }
  .label { font-size: 11px; font-weight: 600; text-align: center; max-width: 50mm; word-break: break-word; }
  svg { display: block; }
</style></head>
<body>
${label ? `<div class="label">${label}</div>` : ""}
${svgMarkup}
<script>setTimeout(function(){window.print();window.close();},250);</script>
</body></html>`);
  w.document.close();
};
