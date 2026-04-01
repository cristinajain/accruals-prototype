// @ts-nocheck
"use client";

interface RingProgressProps {
  value: number;          // 0–100
  size?: number;          // diameter in px (default 18)
  color?: string;         // arc color (default brand-primary)
  trackColor?: string;    // track color (default border-subtle)
  strokeWidth?: number;
}

export function RingProgress({
  value,
  size = 18,
  color = "var(--brand-primary)",
  trackColor = "var(--border-subtle)",
  strokeWidth = 2.5,
}: RingProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const c = size / 2;
  const r = c - strokeWidth;
  const circumference = 2 * Math.PI * r;
  const filled = normalizedValue / 100 * circumference;

  if (normalizedValue >= 100) {
    const doneRadius = c - 1;
    const k = size / 20;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ flexShrink: 0, display: "block" }}
      >
        <circle cx={c} cy={c} r={doneRadius} fill={color} />
        <path
          d={`M${5 * k},${10 * k} L${8.5 * k},${14 * k} L${15 * k},${7 * k}`}
          stroke="white"
          strokeWidth={1.8 * k}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, display: "block" }}
    >
      {/* track */}
      <circle
        cx={c} cy={c} r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* filled arc */}
      {normalizedValue > 0 && (
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      )}
    </svg>
  );
}
