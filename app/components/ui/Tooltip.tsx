// @ts-nocheck
"use client";

import { useState, useRef } from "react";

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    }, 120);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRect(null);
  };

  return (
    <span ref={ref} style={{ display: "inline-flex" }} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {rect && (
        <span
          style={{
            position: "fixed",
            left: rect.left + rect.width / 2,
            top: rect.top - 6,
            transform: "translate(-50%, -100%)",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-medium)",
            padding: "3px 8px",
            borderRadius: "var(--radius-md)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
