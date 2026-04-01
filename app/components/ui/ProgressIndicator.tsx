// @ts-nocheck
"use client";

export type IndicatorStatus = "not-started" | "in-progress" | "in-review" | "done";

const COLOR = {
  "not-started": "var(--indicator-empty)",
  "in-progress":  "var(--indicator-progress)",
  "in-review":    "var(--indicator-review)",
  "done":         "var(--indicator-done)",
};

interface ProgressIndicatorProps {
  status: IndicatorStatus;
  size?: number;
}

export function ProgressIndicator({ status, size = 20 }: ProgressIndicatorProps) {
  const s   = size;
  const c   = s / 2;        // center
  const r   = c - 1;        // radius (1px margin)
  const col = COLOR[status] ?? COLOR["not-started"];

  if (status === "not-started") {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0, display: "block" }}>
        <circle cx={c} cy={c} r={r} fill="white" stroke={col} strokeWidth="1.5" />
      </svg>
    );
  }

  if (status === "done") {
    // Solid filled circle + white checkmark
    const k = s / 20; // scale factor
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0, display: "block" }}>
        <circle cx={c} cy={c} r={r} fill={col} />
        <path
          d={`M${5*k},${10*k} L${8.5*k},${14*k} L${15*k},${7*k}`}
          stroke="white"
          strokeWidth={1.8 * k}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // in-progress: 25% pie (12 o'clock → 3 o'clock, clockwise)
  // in-review:   50% pie (12 o'clock → 6 o'clock, clockwise)
  const innerR = Math.max(r - 1.5, 0);     // inset pie to create ring gap
  const top    = { x: c,          y: c - innerR }; // 12 o'clock
  const right  = { x: c + innerR, y: c };          // 3 o'clock
  // 6 o'clock: shift slightly to avoid degenerate 180° arc
  const bottom = { x: c + 0.001, y: c + innerR };

  const end       = status === "in-progress" ? right : bottom;
  const largeArc  = 0; // both slices are ≤ 180°
  const sweep     = 1; // clockwise

  const piePath = `M${c},${c} L${top.x},${top.y} A${innerR},${innerR} 0 ${largeArc},${sweep} ${end.x},${end.y} Z`;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0, display: "block" }}>
      {/* white background */}
      <circle cx={c} cy={c} r={r} fill="white" />
      {/* filled slice */}
      <path d={piePath} fill={col} />
      {/* colored border on top */}
      <circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth="1.5" />
    </svg>
  );
}

export const INDICATOR_LABELS: Record<IndicatorStatus, string> = {
  "not-started": "Draft",
  "in-progress":  "In Progress",
  "in-review":    "In Review",
  "done":         "Done",
};
