// @ts-nocheck
"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { RingProgress } from "./ui/RingProgress";
import { ProgressIndicator } from "./ui/ProgressIndicator";
import { ConfBar } from "./ui/ConfBar";
import { TabGroup } from "./ui/TabGroup";
import { Target, Activity, ClipboardList, TrendingUp, FileCheck, Wrench, Mail, Zap, Calculator, PenLine, File, FileText, BarChart2, CheckCheck, BookOpen } from "lucide-react";

const DesignSystemContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// ─── Foundation token groups ───────────────────────────────────────────────────

const GROUPS = [
  {
    label: "Brand",
    tokens: [
      { name: "brand-primary",   label: "Primary",   type: "color", default: "#3d5a47" },
      { name: "brand-secondary", label: "Secondary", type: "color", default: "#e4ebe6" },
      { name: "brand-gradient",  label: "Gradient",  type: "text",  default: "linear-gradient(135deg, #3d5a47, #5a7a62)" },
    ],
  },
  {
    label: "Backgrounds",
    tokens: [
      { name: "bg-app",    label: "App",    type: "color", default: "#f8fafc" },
      { name: "bg-card",   label: "Card",   type: "color", default: "#ffffff" },
      { name: "bg-subtle", label: "Subtle", type: "color", default: "#f8fafc" },
      { name: "bg-muted",  label: "Muted",  type: "color", default: "#f1f5f9" },
      { name: "bg-inset",  label: "Inset",  type: "color", default: "#ffffff" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { name: "text-primary",     label: "Primary",     type: "color", default: "#0f172a" },
      { name: "text-secondary",   label: "Secondary",   type: "color", default: "#334155" },
      { name: "text-muted",       label: "Muted",       type: "color", default: "#475569" },
      { name: "text-subtle",      label: "Subtle",      type: "color", default: "#64748b" },
      { name: "text-placeholder", label: "Placeholder", type: "color", default: "#94a3b8" },
      { name: "text-disabled",    label: "Disabled",    type: "color", default: "#f1f5f9" },
    ],
  },
  {
    label: "Borders",
    tokens: [
      { name: "border",        label: "Default", type: "color", default: "#e2e8f0" },
      { name: "border-subtle", label: "Subtle",  type: "color", default: "#f1f5f9" },
    ],
  },
  {
    label: "Green",
    tokens: [
      { name: "green-50",  label: "50",  type: "color", default: "#edfde4" },
      { name: "green-100", label: "100", type: "color", default: "#ddffcc" },
      { name: "green-200", label: "200", type: "color", default: "#b3ffa7" },
      { name: "green-500", label: "500", type: "color", default: "#5aff3f" },
      { name: "green-600", label: "600", type: "color", default: "#00af00" },
      { name: "green-700", label: "700", type: "color", default: "#00af00" },
      { name: "green-800", label: "800", type: "color", default: "#006f00" },
      { name: "green-900", label: "900", type: "color", default: "#006f00" },
    ],
  },
  {
    label: "Amber",
    tokens: [
      { name: "amber-100", label: "100", type: "color", default: "#fffbbc" },
      { name: "amber-200", label: "200", type: "color", default: "#fff968" },
      { name: "amber-500", label: "500", type: "color", default: "#ffec00" },
      { name: "amber-800", label: "800", type: "color", default: "#ffcc00" },
    ],
  },
  {
    label: "Red",
    tokens: [
      { name: "red-100", label: "100", type: "color", default: "#fee2e2" },
      { name: "red-200", label: "200", type: "color", default: "#ffc4c5" },
      { name: "red-500", label: "500", type: "color", default: "#ff868b" },
      { name: "red-600", label: "600", type: "color", default: "#ff4b45" },
      { name: "red-800", label: "800", type: "color", default: "#ee0009" },
      { name: "red-900", label: "900", type: "color", default: "#860000" },
    ],
  },
  {
    label: "Blue",
    tokens: [
      { name: "blue-100", label: "100", type: "color", default: "#d0f3ff" },
      { name: "blue-200", label: "200", type: "color", default: "#74dbfc" },
      { name: "blue-500", label: "500", type: "color", default: "#00aeff" },
      { name: "blue-700", label: "700", type: "color", default: "#005cff" },
      { name: "blue-800", label: "800", type: "color", default: "#002770" },
    ],
  },
  {
    label: "Violet",
    tokens: [
      { name: "violet-50",  label: "50",  type: "color", default: "#faf5ff" },
      { name: "violet-100", label: "100", type: "color", default: "#ede9fe" },
      { name: "violet-200", label: "200", type: "color", default: "#e7cfff" },
      { name: "violet-300", label: "300", type: "color", default: "#cfa0ff" },
      { name: "violet-500", label: "500", type: "color", default: "#a242ff" },
      { name: "violet-700", label: "700", type: "color", default: "#7b00ea" },
      { name: "violet-800", label: "800", type: "color", default: "#43008a" },
    ],
  },
  {
    label: "Orange",
    tokens: [
      { name: "orange-100", label: "100", type: "color", default: "#ffe5bb" },
      { name: "orange-200", label: "200", type: "color", default: "#ffc489" },
      { name: "orange-500", label: "500", type: "color", default: "#ff8e00" },
      { name: "orange-700", label: "700", type: "color", default: "#ff6d00" },
      { name: "orange-800", label: "800", type: "color", default: "#ff6d00" },
      { name: "orange-900", label: "900", type: "color", default: "#7a3100" },
    ],
  },
  {
    label: "Indigo",
    tokens: [
      { name: "indigo-50",  label: "50",  type: "color", default: "#eef2ff" },
      { name: "indigo-100", label: "100", type: "color", default: "#e0e7ff" },
      { name: "indigo-200", label: "200", type: "color", default: "#c7d2fe" },
      { name: "indigo-500", label: "500", type: "color", default: "#6366f1" },
      { name: "indigo-700", label: "700", type: "color", default: "#4338ca" },
      { name: "indigo-800", label: "800", type: "color", default: "#3730a3" },
    ],
  },
  {
    label: "Font Size",
    tokens: [
      { name: "font-size-xs",   label: "xs",   type: "px", default: "10", min: 6,  max: 24 },
      { name: "font-size-sm",   label: "sm",   type: "px", default: "11", min: 6,  max: 24 },
      { name: "font-size-base", label: "base", type: "px", default: "12", min: 8,  max: 24 },
      { name: "font-size-md",   label: "md",   type: "px", default: "13", min: 8,  max: 28 },
      { name: "font-size-lg",   label: "lg",   type: "px", default: "14", min: 10, max: 28 },
      { name: "font-size-xl",   label: "xl",   type: "px", default: "15", min: 10, max: 32 },
      { name: "font-size-2xl",  label: "2xl",  type: "px", default: "16", min: 12, max: 32 },
      { name: "font-size-3xl",  label: "3xl",  type: "px", default: "17", min: 12, max: 36 },
      { name: "font-size-4xl",  label: "4xl",  type: "px", default: "20", min: 14, max: 40 },
      { name: "font-size-hero", label: "hero", type: "px", default: "32", min: 20, max: 64 },
    ],
  },
  {
    label: "Font Weight",
    tokens: [
      { name: "font-weight-normal",   label: "Normal",   type: "fontweight", default: "400" },
      { name: "font-weight-medium",   label: "Medium",   type: "fontweight", default: "500" },
      { name: "font-weight-semibold", label: "Semibold", type: "fontweight", default: "600" },
      { name: "font-weight-bold",     label: "Bold",     type: "fontweight", default: "700" },
    ],
  },
  {
    label: "Spacing",
    tokens: [
      { name: "space-1",  label: "1",  type: "px", default: "2",  min: 0, max: 16  },
      { name: "space-2",  label: "2",  type: "px", default: "4",  min: 0, max: 24  },
      { name: "space-3",  label: "3",  type: "px", default: "6",  min: 0, max: 24  },
      { name: "space-4",  label: "4",  type: "px", default: "8",  min: 0, max: 32  },
      { name: "space-5",  label: "5",  type: "px", default: "10", min: 0, max: 32  },
      { name: "space-6",  label: "6",  type: "px", default: "12", min: 0, max: 40  },
      { name: "space-7",  label: "7",  type: "px", default: "14", min: 0, max: 40  },
      { name: "space-8",  label: "8",  type: "px", default: "16", min: 0, max: 48  },
      { name: "space-9",  label: "9",  type: "px", default: "18", min: 0, max: 48  },
      { name: "space-10", label: "10", type: "px", default: "20", min: 0, max: 56  },
      { name: "space-11", label: "11", type: "px", default: "22", min: 0, max: 56  },
      { name: "space-12", label: "12", type: "px", default: "24", min: 0, max: 64  },
      { name: "space-16", label: "16", type: "px", default: "28", min: 0, max: 64  },
      { name: "space-20", label: "20", type: "px", default: "40", min: 0, max: 80  },
    ],
  },
  {
    label: "Border Radius",
    tokens: [
      { name: "radius-xs",     label: "xs",     type: "px", default: "2",    min: 0, max: 16   },
      { name: "radius-sm",     label: "sm",     type: "px", default: "4",    min: 0, max: 24   },
      { name: "radius-md",     label: "md",     type: "px", default: "6",    min: 0, max: 32   },
      { name: "radius-lg",     label: "lg",     type: "px", default: "7",    min: 0, max: 32   },
      { name: "radius-xl",     label: "xl",     type: "px", default: "8",    min: 0, max: 32   },
      { name: "radius-2xl",    label: "2xl",    type: "px", default: "9",    min: 0, max: 40   },
      { name: "radius-3xl",    label: "3xl",    type: "px", default: "11",   min: 0, max: 40   },
      { name: "radius-4xl",    label: "4xl",    type: "px", default: "12",   min: 0, max: 48   },
      { name: "radius-5xl",    label: "5xl",    type: "px", default: "14",   min: 0, max: 48   },
      { name: "radius-6xl",    label: "6xl",    type: "px", default: "16",   min: 0, max: 48   },
      { name: "radius-full",   label: "Full",   type: "px", default: "9999", min: 0, max: 9999 },
      { name: "radius-circle", label: "Circle", type: "px", default: "99",   min: 0, max: 999  },
    ],
  },
  {
    label: "Shadows",
    tokens: [
      { name: "shadow-sm", label: "sm", type: "text", default: "0 1px 2px rgba(0, 0, 0, 0.06)"   },
      { name: "shadow-md", label: "md", type: "text", default: "0 4px 24px rgba(0, 0, 0, 0.08)"  },
      { name: "shadow-lg", label: "lg", type: "text", default: "0 20px 60px rgba(0, 0, 0, 0.15)" },
    ],
  },
  {
    label: "Status Indicators",
    tokens: [
      { name: "indicator-empty",    label: "Empty",    type: "color", default: "#9ca3af" },
      { name: "indicator-progress", label: "Progress", type: "color", default: "#ffec00" },
      { name: "indicator-review",   label: "Review",   type: "color", default: "#22c55e" },
      { name: "indicator-done",     label: "Done",     type: "color", default: "#3d5a47" },
    ],
  },
];

// ─── Tab Group interactive preview ─────────────────────────────────────────────
// Thin stateful wrapper — delegates to the real TabGroup component

function TabGroupDemo({ tabs, dotIndex }: { tabs: { key: string; label: string; icon?: ReactNode }[]; dotIndex?: number }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? "");
  return (
    <TabGroup
      tabs={tabs.map((t, i) => ({ ...t, dot: i === dotIndex }))}
      activeKey={activeKey}
      onChange={setActiveKey}
    />
  );
}

// ─── Component definitions ─────────────────────────────────────────────────────
// key = "cssClass:cssProperty", consistent with class names in globals.css
// preview = JSX rendered live inside the panel; reflects the injected <style> overrides

const COMPONENTS = [
  {
    name: "Badge",
    className: "sp11-badge",
    description: "3 types: General · Status · Category",
    preview: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>General</span>
          <div style={{ display: "flex", gap: 5 }}>
            <span className="sp11-badge">Label</span>
            <span className="sp11-badge sp11-badge--white">White</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, width: "100%", minWidth: 0 }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</span>
          <div style={{ display: "flex", gap: 5, width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 2 }}>
            <span className="sp11-badge sp11-badge--status-primary">Closed</span>
            <span className="sp11-badge sp11-badge--status-green">In Review</span>
            <span className="sp11-badge sp11-badge--status-yellow">In Progress</span>
            <span className="sp11-badge">Not Started</span>
            <span className="sp11-badge sp11-badge--status-red">Unbudgeted</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</span>
          <div style={{ display: "flex", gap: 5 }}>
            <span className="sp11-badge sp11-badge--category"><span className="sp11-badge__cat-icon"><Wrench size={13} strokeWidth={2} /></span><span>WO</span></span>
            <span className="sp11-badge sp11-badge--category"><span className="sp11-badge__cat-icon"><ClipboardList size={13} strokeWidth={2} /></span><span>PO</span></span>
            <span className="sp11-badge sp11-badge--category"><span className="sp11-badge__cat-icon"><FileCheck size={13} strokeWidth={2} /></span><span>CT</span></span>
            <span className="sp11-badge sp11-badge--category"><span className="sp11-badge__cat-icon"><TrendingUp size={13} strokeWidth={2} /></span><span>GL</span></span>
          </div>
        </div>
      </div>
    ),
    props: [
      { key: "sp11-badge:background",               label: "General · BG",         cssClass: "sp11-badge",                cssProp: "background",    tokenType: "color",    default: "var(--bg-muted)" },
      { key: "sp11-badge:color",                    label: "General · Text",        cssClass: "sp11-badge",                cssProp: "color",         tokenType: "color",    default: "var(--text-muted)" },
      { key: "sp11-badge:font-size",                label: "General · Font Size",   cssClass: "sp11-badge",                cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-xs)" },
      { key: "sp11-badge:border-radius",            label: "General · Radius",      cssClass: "sp11-badge",                cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-full)" },
      { key: "sp11-badge--white:background",        label: "White · BG",            cssClass: "sp11-badge--white",         cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp11-badge--white:color",             label: "White · Text",          cssClass: "sp11-badge--white",         cssProp: "color",         tokenType: "color",    default: "var(--text-secondary)" },
      { key: "sp11-badge--white:border",            label: "White · Border",        cssClass: "sp11-badge--white",         cssProp: "border",        tokenType: "color",    default: "1px solid var(--brand-secondary)" },
      { key: "sp11-badge--status-green:background", label: "Status Green · BG",     cssClass: "sp11-badge--status-green",  cssProp: "background",    tokenType: "color",    default: "var(--green-50)" },
      { key: "sp11-badge--status-green:color",      label: "Status Green · Text",   cssClass: "sp11-badge--status-green",  cssProp: "color",         tokenType: "color",    default: "var(--green-800)" },
      { key: "sp11-badge--status-yellow:background",label: "Status Yellow · BG",    cssClass: "sp11-badge--status-yellow", cssProp: "background",    tokenType: "color",    default: "var(--amber-100)" },
      { key: "sp11-badge--status-red:background",   label: "Status Red · BG",       cssClass: "sp11-badge--status-red",    cssProp: "background",    tokenType: "color",    default: "var(--red-100)" },
      { key: "sp11-badge--status-red:color",        label: "Status Red · Text",     cssClass: "sp11-badge--status-red",    cssProp: "color",         tokenType: "color",    default: "var(--red-600)" },
      { key: "sp11-badge--category:background",     label: "Category · BG",         cssClass: "sp11-badge--category",      cssProp: "background",    tokenType: "color",    default: "var(--brand-secondary)" },
      { key: "sp11-badge--category:border-radius",  label: "Category · Radius",     cssClass: "sp11-badge--category",      cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-sm)" },
      { key: "sp11-badge--category:color",          label: "Category · Text",       cssClass: "sp11-badge--category",      cssProp: "color",         tokenType: "color",    default: "var(--brand-primary)" },
    ],
  },
  {
    name: "Button",
    className: "sp11-btn",
    description: "Primary (bulk actions) · Secondary (add/create) · Ghost (row actions)",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Primary — bulk actions</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="sp11-btn sp11-btn--primary">Book All</button>
            <button className="sp11-btn sp11-btn--primary">✓ Post All</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Secondary — add / create</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="sp11-btn sp11-btn--secondary">+ Add Accrual</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ghost — row actions</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="sp11-btn--approve">Book</button>
            <button className="sp11-btn--undo">↩ Undo</button>
            <button className="sp11-btn sp11-btn--ghost">Action</button>
            <button className="sp11-btn--move">↗</button>
            <button className="sp11-btn--dismiss">✕</button>
          </div>
        </div>
      </div>
    ),
    props: [
      { key: "sp11-btn:border-radius",             label: "Radius",              cssClass: "sp11-btn",              cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp11-btn:font-size",               label: "Font Size",           cssClass: "sp11-btn",              cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-base)" },
      { key: "sp11-btn--primary:background",     label: "Primary · BG",       cssClass: "sp11-btn--primary",     cssProp: "background",    tokenType: "color",    default: "var(--green-50)" },
      { key: "sp11-btn--primary:border-color",   label: "Primary · Border",   cssClass: "sp11-btn--primary",     cssProp: "border-color",  tokenType: "color",    default: "var(--green-200)" },
      { key: "sp11-btn--primary:color",          label: "Primary · Text",     cssClass: "sp11-btn--primary",     cssProp: "color",         tokenType: "color",    default: "var(--brand-primary)" },
      { key: "sp11-btn--secondary:background",   label: "Secondary · BG",     cssClass: "sp11-btn--secondary",   cssProp: "background",    tokenType: "color",    default: "var(--bg-muted)" },
      { key: "sp11-btn--secondary:border-color", label: "Secondary · Border", cssClass: "sp11-btn--secondary",   cssProp: "border-color",  tokenType: "color",    default: "var(--brand-primary)" },
      { key: "sp11-btn--secondary:color",        label: "Secondary · Text",   cssClass: "sp11-btn--secondary",   cssProp: "color",         tokenType: "color",    default: "var(--brand-primary)" },
      { key: "sp11-btn--ghost:background",       label: "Ghost · BG",         cssClass: "sp11-btn--ghost",       cssProp: "background",    tokenType: "color",    default: "var(--bg-muted)" },
      { key: "sp11-btn--ghost:border-color",     label: "Ghost · Border",     cssClass: "sp11-btn--ghost",       cssProp: "border-color",  tokenType: "color",    default: "var(--border)" },
      { key: "sp11-btn--ghost:color",            label: "Ghost · Text",       cssClass: "sp11-btn--ghost",       cssProp: "color",         tokenType: "color",    default: "var(--text-secondary)" },
      { key: "sp11-btn--approve:background",     label: "Book · BG",       cssClass: "sp11-btn--approve",     cssProp: "background",    tokenType: "color",    default: "var(--bg-muted)" },
      { key: "sp11-btn--approve:border-color",   label: "Book · Border",   cssClass: "sp11-btn--approve",     cssProp: "border-color",  tokenType: "color",    default: "var(--border)" },
      { key: "sp11-btn--approve:color",          label: "Book · Text",     cssClass: "sp11-btn--approve",     cssProp: "color",         tokenType: "color",    default: "var(--text-secondary)" },
    ],
  },
  {
    name: "Card",
    className: "sp11-card",
    description: "Content card container",
    preview: (
      <div className="sp11-card" style={{ width: "100%" }}>
        <div className="sp11-card__header">
          <div className="sp11-card__title">Card Title</div>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Action</span>
        </div>
        <div style={{ padding: "10px 20px", fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Card content area</div>
      </div>
    ),
    props: [
      { key: "sp11-card:background",    label: "Background", cssClass: "sp11-card", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp11-card:border-radius", label: "Radius",     cssClass: "sp11-card", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-3xl)" },
    ],
  },
  {
    name: "Stat Card",
    className: "sp11-stat-card",
    description: "KPI summary tile",
    preview: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        <div className="sp11-stat-card">
          <div className="sp11-stat-card__label">Properties</div>
          <div className="sp11-stat-card__value" style={{ color: "var(--brand-primary)" }}>12</div>
          <div className="sp11-stat-card__sub">4 closed</div>
        </div>
        <div className="sp11-stat-card">
          <div className="sp11-stat-card__label">Accruals</div>
          <div className="sp11-stat-card__value" style={{ color: "var(--brand-primary)" }}>$48K</div>
          <div className="sp11-stat-card__sub">32 approved</div>
        </div>
      </div>
    ),
    props: [
      { key: "sp11-stat-card:background",       label: "Background",   cssClass: "sp11-stat-card",       cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp11-stat-card:border-radius",    label: "Radius",       cssClass: "sp11-stat-card",       cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-3xl)" },
      { key: "sp11-stat-card__value:font-size", label: "Value · Size", cssClass: "sp11-stat-card__value", cssProp: "font-size",    tokenType: "fontsize", default: "var(--font-size-4xl)" },
      { key: "sp11-stat-card__label:font-size", label: "Label · Size", cssClass: "sp11-stat-card__label", cssProp: "font-size",    tokenType: "fontsize", default: "var(--font-size-sm)" },
      { key: "sp11-stat-card__label:color",     label: "Label · Color",cssClass: "sp11-stat-card__label", cssProp: "color",        tokenType: "color",    default: "var(--text-subtle)" },
    ],
  },
  {
    name: "Banner",
    className: "sp11-banner",
    description: "Highlight / info banner",
    preview: (
      <div className="sp11-banner" style={{ marginBottom: 0, width: "100%" }}>
        <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}>Reconcile Actuals — Jan 2026</div>
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: 2 }}>Match invoices to accruals and post JEs</div>
      </div>
    ),
    props: [
      { key: "sp11-banner:background",    label: "Background", cssClass: "sp11-banner", cssProp: "background",    tokenType: "color",  default: "var(--bg-muted)" },
      { key: "sp11-banner:border-radius", label: "Radius",     cssClass: "sp11-banner", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-3xl)" },
    ],
  },
  {
    name: "Input",
    className: "sp11-input",
    description: "Text input / select / textarea",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <input className="sp11-input" placeholder="Text input field" readOnly style={{ pointerEvents: "none" }} />
        <select className="sp11-select" style={{ pointerEvents: "none" }}>
          <option>Select an option</option>
        </select>
      </div>
    ),
    props: [
      { key: "sp11-input:background",    label: "Background", cssClass: "sp11-input", cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp11-input:border-radius", label: "Radius",     cssClass: "sp11-input", cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp11-input:font-size",     label: "Font Size",  cssClass: "sp11-input", cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-md)" },
    ],
  },
  {
    name: "Modal",
    className: "sp11-modal",
    description: "Dialog / overlay modal",
    preview: (
      <div className="sp11-modal" style={{ width: "100%", boxShadow: "var(--shadow-md)" }}>
        <div className="sp11-modal__header" style={{ padding: "12px 16px" }}>
          <div className="sp11-modal__title">Add Accrual</div>
          <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-muted)", cursor: "pointer" }}>✕</span>
        </div>
        <div style={{ padding: "12px 16px", fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Modal body content</div>
      </div>
    ),
    props: [
      { key: "sp11-modal:background",    label: "Background", cssClass: "sp11-modal", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp11-modal:border-radius", label: "Radius",     cssClass: "sp11-modal", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-6xl)" },
    ],
  },
  {
    name: "Row Card",
    className: "sp11-row-card",
    description: "Accrual / reconcile list row",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <div className="sp11-row-card" style={{ border: "1px solid var(--green-200)" }}>
          <div className="sp11-row-card__body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
            <div>
              <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)" }}>Metro HVAC Services</div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>6210 — R&M HVAC</div>
            </div>
            <div style={{ fontWeight: "var(--font-weight-bold)", color: "var(--brand-primary)" }}>$14,200</div>
          </div>
        </div>
        <div className="sp11-row-card">
          <div className="sp11-row-card__body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
            <div>
              <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)" }}>ConEd — Electric</div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>6110 — Utilities</div>
            </div>
            <div style={{ fontWeight: "var(--font-weight-bold)", color: "var(--text-primary)" }}>$31,500</div>
          </div>
        </div>
      </div>
    ),
    props: [
      { key: "sp11-row-card:background",    label: "Background", cssClass: "sp11-row-card", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp11-row-card:border-radius", label: "Radius",     cssClass: "sp11-row-card", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-3xl)" },
    ],
  },
  {
    name: "Top Bar",
    className: "sp11-topbar",
    description: "Page navigation top bar",
    preview: (
      <div className="sp11-topbar" style={{ borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12 }}>S</div>
          <div>
            <div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-base)" }}>Stackpoint</div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-subtle)" }}>AI Property Accounting</div>
          </div>
        </div>
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 999, padding: "3px 10px" }}>Jan 2026 Close</div>
      </div>
    ),
    props: [
      { key: "sp11-topbar:background", label: "Background", cssClass: "sp11-topbar", cssProp: "background", tokenType: "color", default: "var(--bg-card)" },
    ],
  },
  {
    name: "Bar — General",
    className: "sp11-bar",
    description: "Single-color inline bar (generic use)",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[{ v: 70, label: "7/10" }, { v: 45, label: "9/20" }, { v: 20, label: "1/5" }].map(({ v, label }) => (
          <div key={v} className="sp11-bar">
            <div className="sp11-bar__track">
              <div className="sp11-bar__fill" style={{ width: `${v}%` }} />
            </div>
            <span className="sp11-bar__label">{label}</span>
          </div>
        ))}
      </div>
    ),
    props: [
      { key: "sp11-bar__fill:background", label: "Fill Color",  cssClass: "sp11-bar__fill", cssProp: "background", tokenType: "color", default: "var(--brand-primary)" },
      { key: "sp11-bar__label:color",     label: "Label Color", cssClass: "sp11-bar__label", cssProp: "color",     tokenType: "color", default: "var(--brand-primary)" },
    ],
  },
  {
    name: "Bar — Confidence",
    className: "sp11-bar",
    description: "Color-coded confidence bar (High · Medium · Low)",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[{ label: "High", value: 85, tier: "high" }, { label: "Medium", value: 55, tier: "medium" }, { label: "Low", value: 25, tier: "low" }]
          .map(({ label, value, tier }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, width: 44, textAlign: "right" }}>{label}</span>
            <div className="sp11-bar">
              <div className="sp11-bar__track">
                <div className={`sp11-bar__fill sp11-bar__fill--${tier}`} style={{ width: `${value}%` }} />
              </div>
              <span className={`sp11-bar__label sp11-bar__label--${tier}`}>{value}%</span>
            </div>
          </div>
        ))}
      </div>
    ),
    props: [
      { key: "sp11-bar__track:background",       label: "Track · BG",        cssClass: "sp11-bar__track",       cssProp: "background",    tokenType: "color",    default: "var(--border)" },
      { key: "sp11-bar__track:height",            label: "Track · Height",    cssClass: "sp11-bar__track",       cssProp: "height",        tokenType: "spacing",  default: "var(--space-3)" },
      { key: "sp11-bar__track:border-radius",     label: "Track · Radius",    cssClass: "sp11-bar__track",       cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-xs)" },
      { key: "sp11-bar__fill--high:background",    label: "Fill · High",        cssClass: "sp11-bar__fill--high",   cssProp: "background", tokenType: "color",    default: "var(--green-600)" },
      { key: "sp11-bar__label--high:color",        label: "Label · High",       cssClass: "sp11-bar__label--high",  cssProp: "color",      tokenType: "color",    default: "var(--green-600)" },
      { key: "sp11-bar__fill--medium:background",  label: "Fill · Medium",      cssClass: "sp11-bar__fill--medium", cssProp: "background", tokenType: "color",    default: "var(--amber-800)" },
      { key: "sp11-bar__label--medium:color",      label: "Label · Medium",     cssClass: "sp11-bar__label--medium",cssProp: "color",      tokenType: "color",    default: "var(--amber-800)" },
      { key: "sp11-bar__fill--low:background",     label: "Fill · Low",         cssClass: "sp11-bar__fill--low",    cssProp: "background", tokenType: "color",    default: "var(--red-500)" },
      { key: "sp11-bar__label--low:color",         label: "Label · Low",        cssClass: "sp11-bar__label--low",   cssProp: "color",      tokenType: "color",    default: "var(--red-500)" },
      { key: "sp11-bar__label:font-size",          label: "Label · Size",       cssClass: "sp11-bar__label",        cssProp: "font-size",  tokenType: "fontsize", default: "var(--font-size-sm)" },
    ],
  },
  {
    name: "Progress Indicator",
    className: "sp11-progress-indicator",
    description: "4-state SVG status icon: Not Started · In Progress · In Review · Done",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {(["not-started", "in-progress", "in-review", "done"] as const).map(s => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <ProgressIndicator status={s} size={24} />
              <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {s === "not-started" ? "Draft" : s === "in-progress" ? "In Progress" : s === "in-review" ? "In Review" : "Done"}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {([16, 20, 24, 28] as const).map(sz => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <ProgressIndicator status="in-review" size={sz} />
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{sz}px</span>
            </div>
          ))}
        </div>
      </div>
    ),
    props: [
      { key: "indicator-empty:color",    label: "Empty color",    cssClass: "indicator-empty",    cssProp: "color", tokenType: "color", default: "var(--indicator-empty)" },
      { key: "indicator-progress:color", label: "Progress color", cssClass: "indicator-progress", cssProp: "color", tokenType: "color", default: "var(--indicator-progress)" },
      { key: "indicator-review:color",   label: "Review color",   cssClass: "indicator-review",   cssProp: "color", tokenType: "color", default: "var(--indicator-review)" },
      { key: "indicator-done:color",     label: "Done color",     cssClass: "indicator-done",     cssProp: "color", tokenType: "color", default: "var(--indicator-done)" },
    ],
  },
  {
    name: "Ring Progress",
    className: "sp11-ring-progress",
    description: "SVG donut arc showing 0–100%. Shows checkmark at 100%.",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          {[0, 25, 50, 75, 100].map(v => (
            <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <RingProgress value={v} size={28} />
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{v}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {[16, 20, 24, 28, 32].map(sz => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <RingProgress value={60} size={sz} />
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{sz}px</span>
            </div>
          ))}
        </div>
      </div>
    ),
    props: [
      { key: "sp11-ring-progress:color",       label: "Arc color",   cssClass: "sp11-ring-progress", cssProp: "color",            tokenType: "color", default: "var(--brand-primary)" },
      { key: "sp11-ring-progress:track-color", label: "Track color", cssClass: "sp11-ring-progress", cssProp: "background-color", tokenType: "color", default: "var(--border-subtle)" },
    ],
  },
  {
    name: "Tab Group",
    className: "sp11-tab-group",
    description: "Animated segmented pill navigation — used for dashboard and property-level tabs",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TabGroupDemo tabs={[
          { label: "Overview",  icon: <Target   size={13} strokeWidth={1.5} /> },
          { label: "Monitor",   icon: <Activity size={13} strokeWidth={1.5} /> },
        ]} />
        <TabGroupDemo tabs={[
          { label: "Accruals",  icon: <FileText   size={13} strokeWidth={1.5} /> },
          { label: "Variance",  icon: <BarChart2  size={13} strokeWidth={1.5} /> },
          { label: "Reconcile", icon: <CheckCheck size={13} strokeWidth={1.5} /> },
          { label: "Journal",   icon: <BookOpen   size={13} strokeWidth={1.5} /> },
        ]} />
      </div>
    ),
    props: [
      { key: "sp11-tab-group:background",    label: "Container · BG",     cssClass: "sp11-tab-group",   cssProp: "background",    tokenType: "color",  default: "var(--bg-subtle)" },
      { key: "sp11-tab-group:border-color",  label: "Container · Border",  cssClass: "sp11-tab-group",   cssProp: "border-color",  tokenType: "color",  default: "var(--border-subtle)" },
      { key: "sp11-tab--active:background",  label: "Active tab · BG",    cssClass: "sp11-tab--active", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp11-tab--active:color",       label: "Active tab · Text",  cssClass: "sp11-tab--active", cssProp: "color",         tokenType: "color",  default: "var(--text-primary)" },
      { key: "sp11-tab:color",               label: "Inactive tab · Text", cssClass: "sp11-tab",         cssProp: "color",         tokenType: "color",  default: "var(--text-subtle)" },
      { key: "sp11-tab:border-radius",       label: "Tab · Radius",       cssClass: "sp11-tab",         cssProp: "border-radius", tokenType: "radius", default: "var(--radius-full)" },
    ],
  },
  {
    name: "Account Card",
    className: "sp11-account-card",
    description: "Accountant summary card grouping properties with accrual/variance/reports status",
    preview: (
      <div className="sp11-account-card" style={{ width: "100%" }}>
        <div className="sp11-account-card__name">Sarah Chen</div>
        <div className="sp11-account-card__grid">
          {[
            { name: "Park Avenue Tower", accrualPct: 26, accrualLabel: "26% of 22" },
            { name: "Harbor Industrial", accrualPct: 100, accrualLabel: "100% of 15" },
          ].map((p, i) => (
            <div key={i} className="sp11-account-card__prop">
              <div className="sp11-account-card__prop-header">
                <span className="sp11-account-card__prop-name">{p.name}</span>
                <ProgressIndicator status={i === 0 ? "in-progress" : "done"} size={18} />
              </div>
              <div className="sp11-account-card__rows">
                <div className="sp11-account-card__row">
                  <span className="sp11-account-card__row-label">Accruals</span>
                  <span className="sp11-account-card__row-value">
                    <RingProgress value={p.accrualPct} size={15} />
                    <span className="sp11-account-card__row-text">{p.accrualLabel}</span>
                  </span>
                </div>
                <div className="sp11-account-card__row">
                  <span className="sp11-account-card__row-label">Variance</span>
                  <span className="sp11-account-card__row-value">
                    <ProgressIndicator status={i === 0 ? "in-review" : "done"} size={15} />
                    <span className="sp11-account-card__row-text">{i === 0 ? "In Review" : "Done"}</span>
                  </span>
                </div>
                <div className="sp11-account-card__row">
                  <span className="sp11-account-card__row-label">Reports</span>
                  <span className="sp11-account-card__row-value">
                    <ProgressIndicator status={i === 0 ? "not-started" : "done"} size={15} />
                    <span className="sp11-account-card__row-text">{i === 0 ? "Draft" : "Done"}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    props: [
      { key: "sp11-account-card:background",         label: "Card · BG",        cssClass: "sp11-account-card",          cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp11-account-card:border-radius",      label: "Card · Radius",    cssClass: "sp11-account-card",          cssProp: "border-radius", tokenType: "radius", default: "var(--radius-xl)" },
      { key: "sp11-account-card__name:font-size",    label: "Name · Size",      cssClass: "sp11-account-card__name",    cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-xl)" },
      { key: "sp11-account-card__row-label:color",   label: "Label · Color",    cssClass: "sp11-account-card__row-label", cssProp: "color",       tokenType: "color",  default: "var(--text-subtle)" },
    ],
  },
  {
    name: "Conf Bar",
    className: "sp11-conf-bar",
    description: "Confidence score bar with tier-based color coding (≥90 high · ≥75 medium · ≥60 warning · <60 low)",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        {[{ value: 94, label: "High (94%)" }, { value: 78, label: "Medium (78%)" }, { value: 62, label: "Warning (62%)" }, { value: 41, label: "Low (41%)" }, { value: 0, label: "Manual" }].map(({ value, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1 }}><ConfBar value={value} /></div>
          </div>
        ))}
      </div>
    ),
    props: [
      { key: "sp11-conf-bar__track:background", label: "Track · BG",    cssClass: "sp11-conf-bar__track", cssProp: "background",   tokenType: "color",   default: "var(--bg-muted)" },
      { key: "sp11-conf-bar__track:height",     label: "Track · Height", cssClass: "sp11-conf-bar__track", cssProp: "height",       tokenType: "spacing", default: "4px" },
      { key: "sp11-conf-bar__label:font-size",  label: "Label · Size",   cssClass: "sp11-conf-bar__label", cssProp: "font-size",    tokenType: "fontsize", default: "var(--font-size-xs)" },
    ],
  },
  {
    name: "Source Action",
    className: "sp11-task-item",
    description: "Checkable task/action button — available and done states",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        {[
          { action: "Request invoice",    done: false },
          { action: "Verify GL code",     done: true  },
          { action: "Flag for review",    done: false },
        ].map(({ action, done }) => (
          <div key={action} className={`sp11-task-item ${done ? "sp11-task-item--done" : ""}`}>
            <span className={`sp11-task-item__checkbox ${done ? "sp11-task-item__checkbox--done" : ""}`} aria-hidden="true">{done ? "✓" : ""}</span>
            <span className="sp11-task-item__text">{action}</span>
          </div>
        ))}
      </div>
    ),
    props: [
      { key: "sp11-task-item:background",           label: "BG",             cssClass: "sp11-task-item",                cssProp: "background",    tokenType: "color",    default: "var(--bg-muted)" },
      { key: "sp11-task-item:border-radius",         label: "Radius",         cssClass: "sp11-task-item",                cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp11-task-item__text:font-size",       label: "Text · Size",    cssClass: "sp11-task-item__text",          cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-sm)" },
      { key: "sp11-task-item__checkbox--done:background", label: "Done · BG", cssClass: "sp11-task-item__checkbox--done", cssProp: "background",  tokenType: "color",    default: "var(--brand-primary)" },
    ],
  },
  {
    name: "Accrual Row",
    className: "sp11-accrual-row",
    description: "Expandable list row for accruals and reconcile items — 4 states",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%" }}>
        {[
          { vendor: "Metro HVAC Services", gl: "6210 — R&M", state: "suggested", label: "Suggested" },
          { vendor: "ConEd — Electric",    gl: "6110 — Utilities", state: "approved",  label: "Booked" },
          { vendor: "City Water Dept",     gl: "6120 — Utilities", state: "dismissed", label: "Dismissed" },
        ].map(({ vendor, gl, state, label }) => (
          <div key={vendor} className={`sp11-accrual-row${state === "dismissed" ? " sp11-accrual-row--dismissed" : ""}`}>
            <div className="sp11-accrual-row__top" style={{ gridTemplateColumns: "1fr 80px 80px" }}>
              <div>
                <div className="sp11-flex-center sp11-gap-5 sp11-mb-2">
                  <span className="sp11-text-md-semibold">{vendor}</span>
                </div>
                <div className="sp11-text-sm-muted">{gl}</div>
              </div>
              <div className="sp11-accrual-amount">$14,200</div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "var(--text-subtle)", background: "var(--bg-muted)", borderRadius: 999, padding: "2px 6px" }}>{label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    props: [
      { key: "sp11-accrual-row:background",            label: "Row · BG",         cssClass: "sp11-accrual-row",          cssProp: "background",         tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp11-accrual-row--dismissed:opacity",    label: "Dismissed opacity",cssClass: "sp11-accrual-row--dismissed", cssProp: "opacity",          tokenType: "spacing",  default: "0.5" },
      { key: "sp11-accrual-amount:font-size",          label: "Amount · Size",    cssClass: "sp11-accrual-amount",       cssProp: "font-size",           tokenType: "fontsize", default: "var(--font-size-xl)" },
      { key: "sp11-accrual-row__top:height",           label: "Row · Height",     cssClass: "sp11-accrual-row__top",     cssProp: "height",              tokenType: "spacing",  default: "68px" },
    ],
  },
  {
    name: "Callout",
    className: "sp11-callout",
    description: "Inline status callout — Warning · Error · Info · Moved · Success",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        {[
          { mod: "warning", label: "⚠️ Warning",  text: "Actual was $1,200 over accrual." },
          { mod: "error",   label: "🚨 Error",    text: "No accrual — full amount hits P&L." },
          { mod: "info",    label: "🧠 Info",     text: "Added to AI watchlist for next period." },
          { mod: "moved",   label: "↗ Moved",    text: "Moved from December 2025." },
          { mod: "success", label: "✓ Success",  text: "Exact match — zero variance." },
        ].map(({ mod, label, text }) => (
          <div key={mod} className={`sp11-callout sp11-callout--${mod}`}>
            <strong>{label}</strong> {text}
          </div>
        ))}
      </div>
    ),
    props: [
      { key: "sp11-callout:font-size",             label: "Font Size",       cssClass: "sp11-callout",            cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-base)" },
      { key: "sp11-callout:border-radius",         label: "Radius",          cssClass: "sp11-callout",            cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp11-callout--warning:background",   label: "Warning · BG",    cssClass: "sp11-callout--warning",   cssProp: "background",    tokenType: "color",    default: "var(--amber-100)" },
      { key: "sp11-callout--warning:color",        label: "Warning · Text",  cssClass: "sp11-callout--warning",   cssProp: "color",         tokenType: "color",    default: "var(--amber-800)" },
      { key: "sp11-callout--error:background",     label: "Error · BG",      cssClass: "sp11-callout--error",     cssProp: "background",    tokenType: "color",    default: "var(--red-100)" },
      { key: "sp11-callout--error:color",          label: "Error · Text",    cssClass: "sp11-callout--error",     cssProp: "color",         tokenType: "color",    default: "var(--red-800)" },
      { key: "sp11-callout--info:background",      label: "Info · BG",       cssClass: "sp11-callout--info",      cssProp: "background",    tokenType: "color",    default: "var(--violet-100)" },
      { key: "sp11-callout--info:color",           label: "Info · Text",     cssClass: "sp11-callout--info",      cssProp: "color",         tokenType: "color",    default: "var(--violet-800)" },
      { key: "sp11-callout--moved:background",     label: "Moved · BG",      cssClass: "sp11-callout--moved",     cssProp: "background",    tokenType: "color",    default: "var(--orange-100)" },
      { key: "sp11-callout--success:background",   label: "Success · BG",    cssClass: "sp11-callout--success",   cssProp: "background",    tokenType: "color",    default: "var(--green-50)" },
      { key: "sp11-callout--success:color",        label: "Success · Text",  cssClass: "sp11-callout--success",   cssProp: "color",         tokenType: "color",    default: "var(--green-900)" },
    ],
  },
  {
    name: "Period Selector",
    className: "sp11-tab-group",
    description: "Period tab strip — uses tab-group with sp11-tab__dot marking the current open period",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <TabGroupDemo
          tabs={[
            { label: "Jan '26" },
            { label: "Feb '26" },
            { label: "Mar '26" },
            { label: "Apr '26" },
          ]}
          dotIndex={0}
        />
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-subtle)" }}>
          Green dot = current open period · click to switch
        </div>
      </div>
    ),
    props: [
      { key: "sp11-tab-group:background",   label: "Strip · BG",      cssClass: "sp11-tab-group",   cssProp: "background",    tokenType: "color",  default: "var(--brand-secondary)" },
      { key: "sp11-tab:color",              label: "Tab · Inactive",   cssClass: "sp11-tab",         cssProp: "color",         tokenType: "color",  default: "var(--text-subtle)" },
      { key: "sp11-tab--active:background", label: "Tab · Active BG",  cssClass: "sp11-tab--active", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp11-tab--active:color",      label: "Tab · Active Text",cssClass: "sp11-tab--active", cssProp: "color",         tokenType: "color",  default: "var(--text-primary)" },
      { key: "sp11-tab__dot:background",    label: "Dot · Color",      cssClass: "sp11-tab__dot",    cssProp: "background",    tokenType: "color",  default: "var(--green-500)" },
    ],
  },
  {
    name: "Empty State",
    className: "sp11-empty-state",
    description: "Placeholder shown when a list or section has no content",
    preview: (
      <div className="sp11-empty-state" style={{ width: "100%" }}>
        <div className="sp11-empty-state__icon" aria-hidden>
          <File size={40} strokeWidth={1.5} style={{ color: "var(--border)" }} />
        </div>
        <div className="sp11-empty-state__title">No journal entries yet</div>
        <div className="sp11-empty-state__body">Book accruals to auto-generate JEs and reversals.</div>
      </div>
    ),
    props: [
      { key: "sp11-empty-state:background",          label: "Background",        cssClass: "sp11-empty-state",            cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp11-empty-state:border-radius",       label: "Radius",            cssClass: "sp11-empty-state",            cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-3xl)" },
      { key: "sp11-empty-state__icon:font-size",     label: "Icon · Size",       cssClass: "sp11-empty-state__icon",      cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-hero)" },
      { key: "sp11-empty-state__title:color",        label: "Title · Color",     cssClass: "sp11-empty-state__title",     cssProp: "color",         tokenType: "color",    default: "var(--text-secondary)" },
      { key: "sp11-empty-state__body:font-size",     label: "Body · Size",       cssClass: "sp11-empty-state__body",      cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-md)" },
      { key: "sp11-empty-state__body:color",         label: "Body · Color",      cssClass: "sp11-empty-state__body",      cssProp: "color",         tokenType: "color",    default: "var(--text-subtle)" },
    ],
  },
  {
    name: "Adjust Box",
    className: "sp11-adjust-box",
    description: "Amount adjustment form — label · dollar input · auto-reverse checkbox",
    preview: (
      <div style={{ width: "100%", maxWidth: 260 }}>
        <div className="sp11-adjust-box">
          <div className="sp11-adjust-box__label">Adjust Amount</div>
          <div className="sp11-adjust-box__row">
            <span className="sp11-adjust-box__currency">$</span>
            <input
              type="number"
              defaultValue={14200}
              className="sp11-adjust-box__input"
              style={{ pointerEvents: "none" }}
              readOnly
            />
          </div>
          <label className="sp11-adjust-box__checkbox-label" style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" readOnly style={{ pointerEvents: "none" }} />
            Auto-reverse next period
          </label>
        </div>
      </div>
    ),
    props: [
      { key: "sp11-adjust-box:background",           label: "Background",        cssClass: "sp11-adjust-box",             cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp11-adjust-box:border-radius",        label: "Radius",            cssClass: "sp11-adjust-box",             cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-2xl)" },
      { key: "sp11-adjust-box__label:color",         label: "Label · Color",     cssClass: "sp11-adjust-box__label",      cssProp: "color",         tokenType: "color",    default: "var(--text-subtle)" },
      { key: "sp11-adjust-box__currency:color",      label: "Currency · Color",  cssClass: "sp11-adjust-box__currency",   cssProp: "color",         tokenType: "color",    default: "var(--text-placeholder)" },
      { key: "sp11-adjust-box__input:border-radius", label: "Input · Radius",    cssClass: "sp11-adjust-box__input",      cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp11-adjust-box__checkbox-label:color",label: "Checkbox · Color",  cssClass: "sp11-adjust-box__checkbox-label", cssProp: "color",    tokenType: "color",    default: "var(--text-subtle)" },
    ],
  },
];

// ─── Token option lists for pickers ───────────────────────────────────────────

const TOKEN_OPTIONS: Record<string, { group: string; tokens: string[] }[]> = {
  color: [
    { group: "Brand",       tokens: ["var(--brand-primary)", "var(--brand-secondary)"] },
    { group: "Indicators",  tokens: ["var(--indicator-empty)", "var(--indicator-progress)", "var(--indicator-review)", "var(--indicator-done)"] },
    { group: "Backgrounds", tokens: ["var(--bg-app)", "var(--bg-card)", "var(--bg-subtle)", "var(--bg-muted)", "var(--bg-inset)"] },
    { group: "Text",        tokens: ["var(--text-primary)", "var(--text-secondary)", "var(--text-muted)", "var(--text-subtle)", "var(--text-placeholder)", "var(--text-disabled)"] },
    { group: "Borders",     tokens: ["var(--border)", "var(--border-subtle)"] },
    { group: "Green",       tokens: ["var(--green-50)", "var(--green-100)", "var(--green-200)", "var(--green-500)", "var(--green-600)", "var(--green-700)", "var(--green-800)", "var(--green-900)"] },
    { group: "Amber",       tokens: ["var(--amber-100)", "var(--amber-200)", "var(--amber-500)", "var(--amber-800)"] },
    { group: "Red",         tokens: ["var(--red-100)", "var(--red-200)", "var(--red-500)", "var(--red-600)", "var(--red-800)", "var(--red-900)"] },
    { group: "Blue",        tokens: ["var(--blue-100)", "var(--blue-200)", "var(--blue-500)", "var(--blue-700)", "var(--blue-800)"] },
    { group: "Violet",      tokens: ["var(--violet-50)", "var(--violet-100)", "var(--violet-200)", "var(--violet-300)", "var(--violet-500)", "var(--violet-700)", "var(--violet-800)"] },
    { group: "Orange",      tokens: ["var(--orange-100)", "var(--orange-200)", "var(--orange-500)", "var(--orange-700)", "var(--orange-800)", "var(--orange-900)"] },
    { group: "Indigo",      tokens: ["var(--indigo-50)", "var(--indigo-100)", "var(--indigo-200)", "var(--indigo-500)", "var(--indigo-700)", "var(--indigo-800)"] },
    { group: "Special",     tokens: ["transparent", "white", "black"] },
  ],
  fontsize: [
    { group: "Font Size", tokens: ["var(--font-size-xs)", "var(--font-size-sm)", "var(--font-size-base)", "var(--font-size-md)", "var(--font-size-lg)", "var(--font-size-xl)", "var(--font-size-2xl)", "var(--font-size-3xl)", "var(--font-size-4xl)", "var(--font-size-hero)"] },
  ],
  fontweight: [
    { group: "Font Weight", tokens: ["var(--font-weight-normal)", "var(--font-weight-medium)", "var(--font-weight-semibold)", "var(--font-weight-bold)"] },
  ],
  radius: [
    { group: "Border Radius", tokens: ["0px", "var(--radius-xs)", "var(--radius-sm)", "var(--radius-md)", "var(--radius-lg)", "var(--radius-xl)", "var(--radius-2xl)", "var(--radius-3xl)", "var(--radius-4xl)", "var(--radius-5xl)", "var(--radius-6xl)", "var(--radius-full)"] },
  ],
  spacing: [
    { group: "Spacing", tokens: ["0px", "var(--space-1)", "var(--space-2)", "var(--space-3)", "var(--space-4)", "var(--space-5)", "var(--space-6)", "var(--space-7)", "var(--space-8)", "var(--space-9)", "var(--space-10)", "var(--space-12)", "var(--space-16)", "var(--space-20)"] },
  ],
  shadow: [
    { group: "Shadow", tokens: ["none", "var(--shadow-sm)", "var(--shadow-md)", "var(--shadow-lg)"] },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHex(v: string) { return /^#[0-9a-fA-F]{6}$/.test(v.trim()); }

function toCssValue(token, raw: string): string {
  if (token.type === "px") return `${raw}px`;
  return raw;
}

function fromCssValue(token, cssVal: string): string {
  const v = cssVal.trim();
  if (token.type === "px") return v.replace(/px$/, "");
  return v;
}

// Build all comp props defaults map
function buildCompDefaults(): Record<string, string> {
  const defs: Record<string, string> = {};
  COMPONENTS.forEach(c => c.props.forEach(p => { defs[p.key] = p.default; }));
  return defs;
}

// ─── Foundation TokenRow ───────────────────────────────────────────────────────

function TokenRow({ token, value, dirty, onChange, onReset }) {
  const S = {
    row: { display: "grid", gridTemplateColumns: "96px 1fr auto", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f1f5f9" },
    label: { fontSize: 11, color: dirty ? "#3d5a47" : "#64748b", fontWeight: dirty ? 600 : 400, fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    resetBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: "2px 4px", borderRadius: 4, lineHeight: 1, opacity: dirty ? 1 : 0, pointerEvents: dirty ? "auto" : "none" },
    textInput: { width: "100%", border: "1px solid #e2e8f0", borderRadius: 5, padding: "3px 7px", fontSize: 11, fontFamily: "ui-monospace, monospace", background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" as const },
  };

  if (token.type === "color") {
    const hex = isHex(value) ? value : token.default;
    return (
      <div style={S.row}>
        <span style={S.label}>{token.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, background: value, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <input type="color" value={hex} onChange={e => onChange(token.name, e.target.value)} style={{ position: "absolute", inset: -4, opacity: 0, cursor: "pointer", width: "150%", height: "150%" }} />
            </div>
          </div>
          <input type="text" value={value} onChange={e => onChange(token.name, e.target.value)} style={{ ...S.textInput, flex: 1 }} />
        </div>
        <button onClick={() => onReset(token.name)} style={S.resetBtn} title="Reset">↩</button>
      </div>
    );
  }

  if (token.type === "px") {
    const num = parseInt(value) || 0;
    const min = token.min ?? 0;
    const max = token.max ?? 64;
    const clampedMax = Math.min(max, 200);
    return (
      <div style={S.row}>
        <span style={S.label}>{token.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="range" min={min} max={clampedMax} value={Math.min(num, clampedMax)} onChange={e => onChange(token.name, e.target.value)} style={{ flex: 1, accentColor: "#3d5a47", height: 3 }} />
          <input type="number" value={value} min={min} max={max} onChange={e => onChange(token.name, e.target.value)} style={{ ...S.textInput, width: 46, textAlign: "right" }} />
          <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>px</span>
        </div>
        <button onClick={() => onReset(token.name)} style={S.resetBtn} title="Reset">↩</button>
      </div>
    );
  }

  if (token.type === "fontweight") {
    return (
      <div style={S.row}>
        <span style={S.label}>{token.label}</span>
        <select value={value} onChange={e => onChange(token.name, e.target.value)} style={{ ...S.textInput, cursor: "pointer" }}>
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(w => (
            <option key={w} value={String(w)}>{w}</option>
          ))}
        </select>
        <button onClick={() => onReset(token.name)} style={S.resetBtn} title="Reset">↩</button>
      </div>
    );
  }

  return (
    <div style={{ ...S.row, gridTemplateColumns: "96px 1fr auto" }}>
      <span style={S.label}>{token.label}</span>
      <input type="text" value={value} onChange={e => onChange(token.name, e.target.value)} style={S.textInput} />
      <button onClick={() => onReset(token.name)} style={S.resetBtn} title="Reset">↩</button>
    </div>
  );
}

// ─── Resolve a CSS token value to a displayable color string ──────────────────

function resolveColor(token: string): string {
  if (typeof window === "undefined") return "#ccc";
  if (token === "transparent") return "transparent";
  if (token === "white") return "#ffffff";
  if (token === "black") return "#000000";
  if (token.startsWith("var(--")) {
    const name = token.slice(6, -1);
    return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim() || "#ccc";
  }
  return token;
}

// ─── Custom color select with swatch dots per option ──────────────────────────

function ColorSelect({ value, opts, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const label = value.startsWith("var(--") ? value.slice(6, -1) : value;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 6,
          border: "1px solid #e2e8f0", borderRadius: 5, padding: "3px 6px",
          fontSize: 10, fontFamily: "ui-monospace, monospace",
          background: "#fff", color: "#0f172a", cursor: "pointer",
          textAlign: "left", outline: "none", boxSizing: "border-box",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: resolveColor(value), border: "1px solid #e2e8f0", flexShrink: 0, display: "inline-block" }} />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: 8, color: "#94a3b8", flexShrink: 0 }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 2,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 9999,
          maxHeight: 260, overflowY: "auto", minWidth: 200,
        }}>
          {opts.map(group => (
            <div key={group.group}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 10px 3px" }}>{group.group}</div>
              {group.tokens.map(token => {
                const lbl = token.startsWith("var(--") ? token.slice(6, -1) : token;
                const isSelected = token === value;
                return (
                  <div
                    key={token}
                    onMouseDown={() => { onChange(token); setOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "4px 10px", cursor: "pointer", fontSize: 10,
                      fontFamily: "ui-monospace, monospace",
                      background: isSelected ? "#f0fdf4" : "transparent",
                      color: isSelected ? "#3d5a47" : "#0f172a",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSelected ? "#f0fdf4" : "transparent"; }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: resolveColor(token), border: "1px solid #e2e8f0", flexShrink: 0, display: "inline-block" }} />
                    {lbl}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Component prop row with token picker ──────────────────────────────────────

function CompPropRow({ prop, value, dirty, onChange, onReset }) {
  const opts = TOKEN_OPTIONS[prop.tokenType] || [];
  const isColor = prop.tokenType === "color";

  const selectStyle = {
    flex: 1,
    border: "1px solid #e2e8f0",
    borderRadius: 5,
    padding: "3px 6px",
    fontSize: 10,
    fontFamily: "ui-monospace, monospace",
    background: "#fff",
    color: "#0f172a",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box" as const,
    minWidth: 0,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 11, color: dirty ? "#3d5a47" : "#64748b", fontWeight: dirty ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {prop.label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
        {isColor ? (
          <ColorSelect value={value} opts={opts} onChange={v => onChange(prop.key, v)} />
        ) : (
          <select value={value} onChange={e => onChange(prop.key, e.target.value)} style={selectStyle}>
            {opts.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.tokens.map(token => (
                  <option key={token} value={token}>{token.replace("var(--", "").replace(")", "")}</option>
                ))}
              </optgroup>
            ))}
            {!opts.flatMap(g => g.tokens).includes(value) && (
              <option value={value}>{value}</option>
            )}
          </select>
        )}
      </div>
      <button
        onClick={() => onReset(prop.key)}
        title="Reset"
        style={{ background: "none", border: "none", cursor: dirty ? "pointer" : "default", fontSize: 12, color: "#94a3b8", padding: "2px 4px", borderRadius: 4, lineHeight: 1, opacity: dirty ? 1 : 0, pointerEvents: dirty ? "auto" : "none" }}
      >
        ↩
      </button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

function DesignSystemPanelInner() {
  const ctx = useContext(DesignSystemContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;
  const [tab, setTab] = useState<"foundations" | "components">("components");

  // Foundations state
  const [values, setValues]     = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.map(g => [g.label, true]))
  );
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  // Components state
  const [compValues, setCompValues]     = useState<Record<string, string>>(buildCompDefaults);
  const [compDefaults, setCompDefaults] = useState<Record<string, string>>(buildCompDefaults);
  const [compCollapsed, setCompCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMPONENTS.map(c => [c.name, true]))
  );
  const [compSaving, setCompSaving]     = useState(false);
  const [compSaved, setCompSaved]       = useState(false);

  // Style tag ref for live component overrides
  const compStyleRef = useRef<HTMLStyleElement | null>(null);

  // Mount: read foundation defaults from computed CSS
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const defs: Record<string, string> = {};
    GROUPS.forEach(g =>
      g.tokens.forEach(t => {
        const raw = style.getPropertyValue(`--${t.name}`).trim();
        defs[t.name] = raw ? fromCssValue(t, raw) : t.default;
      })
    );
    setDefaults(defs);
    setValues(defs);
  }, []);

  // Inject component overrides as a <style> tag for live preview
  useEffect(() => {
    if (!compStyleRef.current) {
      const el = document.createElement("style");
      el.id = "sp11-ds-comp-overrides";
      document.head.appendChild(el);
      compStyleRef.current = el;
    }
    const changedByClass: Record<string, Record<string, string>> = {};
    for (const [key, value] of Object.entries(compValues)) {
      if (value === compDefaults[key]) continue;
      const [cls, prop] = key.split(":");
      if (!changedByClass[cls]) changedByClass[cls] = {};
      changedByClass[cls][prop] = value;
    }
    compStyleRef.current.textContent = Object.entries(changedByClass)
      .map(([cls, props]) =>
        `.${cls} { ${Object.entries(props).map(([p, v]) => `${p}: ${v} !important;`).join(" ")} }`
      ).join("\n");
  }, [compValues, compDefaults]);

  // Foundations handlers
  const handleChange = useCallback((name: string, rawVal: string) => {
    setValues(prev => ({ ...prev, [name]: rawVal }));
    const token = GROUPS.flatMap(g => g.tokens).find(t => t.name === name);
    if (token) document.documentElement.style.setProperty(`--${name}`, toCssValue(token, rawVal));
  }, []);

  const handleReset = useCallback((name: string) => {
    const def = defaults[name];
    if (def === undefined) return;
    setValues(prev => ({ ...prev, [name]: def }));
    document.documentElement.style.removeProperty(`--${name}`);
  }, [defaults]);

  const handleResetAll = useCallback(() => {
    setValues({ ...defaults });
    GROUPS.forEach(g => g.tokens.forEach(t => document.documentElement.style.removeProperty(`--${t.name}`)));
  }, [defaults]);

  const handleApply = useCallback(async () => {
    setSaving(true);
    try {
      const variables: Record<string, string> = {};
      GROUPS.forEach(g =>
        g.tokens.forEach(t => {
          if (values[t.name] !== undefined) variables[t.name] = toCssValue(t, values[t.name]);
        })
      );
      await fetch("/api/design-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables }),
      });
      setDefaults({ ...values });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Design system apply failed:", e);
    } finally {
      setSaving(false);
    }
  }, [values]);

  // Components handlers
  const handleCompChange = useCallback((key: string, value: string) => {
    setCompValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCompReset = useCallback((key: string) => {
    setCompValues(prev => ({ ...prev, [key]: compDefaults[key] }));
  }, [compDefaults]);

  const handleCompResetAll = useCallback(() => {
    setCompValues({ ...compDefaults });
  }, [compDefaults]);

  const handleCompApply = useCallback(async () => {
    setCompSaving(true);
    try {
      const classProps: Record<string, string> = {};
      COMPONENTS.forEach(c =>
        c.props.forEach(p => {
          if (compValues[p.key] !== compDefaults[p.key]) {
            classProps[p.key] = compValues[p.key];
          }
        })
      );
      await fetch("/api/design-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classProps }),
      });
      setCompDefaults({ ...compValues });
      setCompSaved(true);
      setTimeout(() => setCompSaved(false), 2500);
    } catch (e) {
      console.error("Component apply failed:", e);
    } finally {
      setCompSaving(false);
    }
  }, [compValues, compDefaults]);

  // Dirty checks
  const isDirty = useCallback((name: string) => values[name] !== defaults[name], [values, defaults]);
  const isCompDirty = useCallback((key: string) => compValues[key] !== compDefaults[key], [compValues, compDefaults]);

  const dirtyCount = GROUPS.reduce((n, g) => n + g.tokens.filter(t => isDirty(t.name)).length, 0);
  const compDirtyCount = COMPONENTS.reduce((n, c) => n + c.props.filter(p => isCompDirty(p.key)).length, 0);

  const toggleGroup = (label: string) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  const toggleComp = (name: string) => setCompCollapsed(prev => ({ ...prev, [name]: !prev[name] }));

  const S = {
    panel: {
      position: "fixed" as const,
      top: 0,
      right: open ? 0 : -420,
      width: 400,
      height: "100vh",
      background: "#ffffff",
      borderLeft: "1px solid #e2e8f0",
      zIndex: 350,
      display: "flex",
      flexDirection: "column" as const,
      transition: "right 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: open ? "0 0 40px rgba(0,0,0,0.10)" : "none",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    tabBar: {
      display: "flex",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 16px",
      gap: 0,
      flexShrink: 0,
      background: "#fafbfc",
    },
    tabBtn: (active: boolean) => ({
      padding: "9px 14px",
      fontSize: 12,
      fontWeight: active ? 600 : 400,
      color: active ? "#3d5a47" : "#64748b",
      border: "none",
      borderBottom: `2px solid ${active ? "#3d5a47" : "transparent"}`,
      background: "transparent",
      cursor: "pointer",
      fontFamily: "inherit",
      marginBottom: -1,
      transition: "color 0.15s",
    }),
    scroll: { flex: 1, overflowY: "auto" as const, padding: "8px 16px 16px" },
    groupHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0 4px", cursor: "pointer", userSelect: "none" as const, borderBottom: "1px solid #e2e8f0", marginBottom: 4 },
    groupLabel: { fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#64748b" },
    compHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "9px 0 5px", cursor: "pointer", userSelect: "none" as const, borderBottom: "1px solid #e2e8f0", marginBottom: 4 },
    footer: { padding: "12px 16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, flexShrink: 0, background: "#fafbfc" },
    resetAllBtn: (disabled: boolean) => ({
      padding: "7px 14px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#f1f5f9",
      color: "#475569", fontSize: 12, fontWeight: 600, cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
    }),
    applyBtn: (disabled: boolean, applied: boolean) => ({
      flex: 1, padding: "7px 14px", borderRadius: 7, border: "1px solid #b3ffa7",
      background: applied ? "#ddffcc" : "#edfde4", color: "#3d5a47", fontSize: 12, fontWeight: 600,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: "inherit", transition: "background 0.2s",
    }),
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "transparent" }} />}

      {/* Panel */}
      <div style={S.panel}>
        {/* Header */}
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>Design System</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", padding: "2px 6px", borderRadius: 4 }}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={S.tabBar}>
          <button style={S.tabBtn(tab === "components")} onClick={() => setTab("components")}>
            Components {compDirtyCount > 0 && <span style={{ marginLeft: 4, fontSize: 9, background: "#edfde4", color: "#3d5a47", borderRadius: 8, padding: "1px 4px", fontWeight: 700 }}>{compDirtyCount}</span>}
          </button>
          <button style={S.tabBtn(tab === "foundations")} onClick={() => setTab("foundations")}>
            Foundations {dirtyCount > 0 && <span style={{ marginLeft: 4, fontSize: 9, background: "#edfde4", color: "#3d5a47", borderRadius: 8, padding: "1px 4px", fontWeight: 700 }}>{dirtyCount}</span>}
          </button>
        </div>

        {/* Foundations tab */}
        {tab === "foundations" && (
          <>
            <div style={S.scroll}>
              {GROUPS.map(group => {
                const isCollapsed = collapsed[group.label];
                const groupDirty = group.tokens.filter(t => isDirty(t.name)).length;
                return (
                  <div key={group.label} style={{ marginBottom: 2 }}>
                    <div style={S.groupHeader} onClick={() => toggleGroup(group.label)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={S.groupLabel}>{group.label}</span>
                        {groupDirty > 0 && <span style={{ fontSize: 9, background: "#edfde4", color: "#3d5a47", borderRadius: 10, padding: "1px 5px", fontWeight: 700 }}>{groupDirty}</span>}
                      </div>
                      <span style={{ fontSize: 10, color: "#94a3b8", transform: isCollapsed ? "rotate(-90deg)" : "none", display: "inline-block" }}>▾</span>
                    </div>
                    {!isCollapsed && (
                      <div style={{ paddingBottom: 4 }}>
                        {group.tokens.map(token => (
                          <TokenRow key={token.name} token={token} value={values[token.name] ?? token.default} dirty={isDirty(token.name)} onChange={handleChange} onReset={handleReset} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={S.footer}>
              <button onClick={handleResetAll} disabled={dirtyCount === 0} style={S.resetAllBtn(dirtyCount === 0)}>Reset All</button>
              <button onClick={handleApply} disabled={dirtyCount === 0 || saving} style={S.applyBtn(dirtyCount === 0 || saving, saved)}>
                {saving ? "Saving…" : saved ? "✓ Applied to CSS" : `Apply to CSS${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
              </button>
            </div>
          </>
        )}

        {/* Components tab */}
        {tab === "components" && (
          <>
            <div style={S.scroll}>
              {COMPONENTS.map(comp => {
                const isCollapsed = compCollapsed[comp.name];
                const compDirty = comp.props.filter(p => isCompDirty(p.key)).length;
                return (
                  <div key={comp.name} style={{ marginBottom: 2 }}>
                    <div style={S.compHeader} onClick={() => toggleComp(comp.name)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ ...S.groupLabel }}>{comp.name}</span>
                          {compDirty > 0 && <span style={{ fontSize: 9, background: "#edfde4", color: "#3d5a47", borderRadius: 10, padding: "1px 5px", fontWeight: 700 }}>{compDirty}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>.{comp.className}</div>
                      </div>
                      <span style={{ fontSize: 10, color: "#94a3b8", transform: isCollapsed ? "rotate(-90deg)" : "none", display: "inline-block", marginTop: 2 }}>▾</span>
                    </div>
                    {!isCollapsed && (
                      <div style={{ paddingBottom: 8 }}>
                        {/* Live preview — reflects injected <style> overrides instantly */}
                        {comp.preview && (
                          <div style={{
                            background: "#f8fafc",
                            border: "none",
                            borderRadius: "0 0 8px 8px",
                            padding: "12px 14px",
                            marginTop: -4,
                            marginBottom: 10,
                          }}>
                            {comp.preview}
                          </div>
                        )}
                        {comp.props.map(prop => (
                          <CompPropRow
                            key={prop.key}
                            prop={prop}
                            value={compValues[prop.key] ?? prop.default}
                            dirty={isCompDirty(prop.key)}
                            onChange={handleCompChange}
                            onReset={handleCompReset}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={S.footer}>
              <button onClick={handleCompResetAll} disabled={compDirtyCount === 0} style={S.resetAllBtn(compDirtyCount === 0)}>Reset All</button>
              <button onClick={handleCompApply} disabled={compDirtyCount === 0 || compSaving} style={S.applyBtn(compDirtyCount === 0 || compSaving, compSaved)}>
                {compSaving ? "Saving…" : compSaved ? "✓ Applied to Code" : `Apply to Code${compDirtyCount > 0 ? ` (${compDirtyCount})` : ""}`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function DesignSystemNavButton() {
  const ctx = useContext(DesignSystemContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;
  // Hidden from users — accessible via Shift+D shortcut during development
  return (
    <button
      type="button"
      onClick={() => setOpen(v => !v)}
      className={`sp11-ds-nav-btn${open ? " sp11-ds-nav-btn--open" : ""}`}
      title="Design System (Shift+D)"
      style={{ display: "none" }}
      aria-expanded={open}
      aria-label="Design system"
    >
      ⋮
    </button>
  );
}

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") setOpen(v => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <DesignSystemContext.Provider value={value}>
      {children}
      <DesignSystemPanelInner />
    </DesignSystemContext.Provider>
  );
}
