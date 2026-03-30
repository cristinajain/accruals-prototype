// @ts-nocheck
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
];

// ─── Component definitions ─────────────────────────────────────────────────────
// key = "cssClass:cssProperty", consistent with class names in globals.css

const COMPONENTS = [
  {
    name: "Badge",
    className: "sp-badge",
    description: "Status and label pill",
    props: [
      { key: "sp-badge:font-size",          label: "Font Size",      cssClass: "sp-badge",       cssProp: "font-size",      tokenType: "fontsize",    default: "var(--font-size-sm)" },
      { key: "sp-badge:font-weight",        label: "Font Weight",    cssClass: "sp-badge",       cssProp: "font-weight",    tokenType: "fontweight",  default: "var(--font-weight-semibold)" },
      { key: "sp-badge:border-radius",      label: "Radius",         cssClass: "sp-badge",       cssProp: "border-radius",  tokenType: "radius",      default: "var(--radius-full)" },
      { key: "sp-badge--green:background",  label: "Green · BG",     cssClass: "sp-badge--green",  cssProp: "background",   tokenType: "color",       default: "var(--green-50)" },
      { key: "sp-badge--green:color",       label: "Green · Text",   cssClass: "sp-badge--green",  cssProp: "color",        tokenType: "color",       default: "var(--green-900)" },
      { key: "sp-badge--amber:background",  label: "Amber · BG",     cssClass: "sp-badge--amber",  cssProp: "background",   tokenType: "color",       default: "var(--amber-100)" },
      { key: "sp-badge--amber:color",       label: "Amber · Text",   cssClass: "sp-badge--amber",  cssProp: "color",        tokenType: "color",       default: "var(--text-secondary)" },
      { key: "sp-badge--red:background",    label: "Red · BG",       cssClass: "sp-badge--red",    cssProp: "background",   tokenType: "color",       default: "var(--red-100)" },
      { key: "sp-badge--red:color",         label: "Red · Text",     cssClass: "sp-badge--red",    cssProp: "color",        tokenType: "color",       default: "var(--red-600)" },
      { key: "sp-badge--gray:background",   label: "Gray · BG",      cssClass: "sp-badge--gray",   cssProp: "background",   tokenType: "color",       default: "var(--bg-muted)" },
      { key: "sp-badge--gray:color",        label: "Gray · Text",    cssClass: "sp-badge--gray",   cssProp: "color",        tokenType: "color",       default: "var(--text-muted)" },
      { key: "sp-badge--purple:background", label: "Purple · BG",    cssClass: "sp-badge--purple", cssProp: "background",   tokenType: "color",       default: "var(--violet-200)" },
      { key: "sp-badge--purple:color",      label: "Purple · Text",  cssClass: "sp-badge--purple", cssProp: "color",        tokenType: "color",       default: "var(--violet-700)" },
      { key: "sp-badge--blue:background",   label: "Blue · BG",      cssClass: "sp-badge--blue",   cssProp: "background",   tokenType: "color",       default: "var(--blue-100)" },
      { key: "sp-badge--blue:color",        label: "Blue · Text",    cssClass: "sp-badge--blue",   cssProp: "color",        tokenType: "color",       default: "var(--blue-700)" },
    ],
  },
  {
    name: "Button",
    className: "sp-btn",
    description: "Action button variants",
    props: [
      { key: "sp-btn:border-radius",              label: "Radius",             cssClass: "sp-btn",               cssProp: "border-radius",  tokenType: "radius",     default: "var(--radius-lg)" },
      { key: "sp-btn:font-size",                  label: "Font Size",          cssClass: "sp-btn",               cssProp: "font-size",      tokenType: "fontsize",   default: "var(--font-size-base)" },
      { key: "sp-btn--primary:background",        label: "Primary · BG",       cssClass: "sp-btn--primary",      cssProp: "background",     tokenType: "color",      default: "var(--green-50)" },
      { key: "sp-btn--primary:color",             label: "Primary · Text",     cssClass: "sp-btn--primary",      cssProp: "color",          tokenType: "color",      default: "var(--brand-primary)" },
      { key: "sp-btn--success-gradient:background", label: "Success · BG",    cssClass: "sp-btn--success-gradient", cssProp: "background", tokenType: "color",      default: "var(--green-50)" },
      { key: "sp-btn--success-gradient:color",    label: "Success · Text",     cssClass: "sp-btn--success-gradient", cssProp: "color",      tokenType: "color",      default: "var(--brand-primary)" },
      { key: "sp-btn--ghost:background",          label: "Ghost · BG",         cssClass: "sp-btn--ghost",        cssProp: "background",     tokenType: "color",      default: "var(--bg-muted)" },
      { key: "sp-btn--ghost:color",               label: "Ghost · Text",       cssClass: "sp-btn--ghost",        cssProp: "color",          tokenType: "color",      default: "var(--text-secondary)" },
      { key: "sp-btn--dashed:background",         label: "Dashed · BG",        cssClass: "sp-btn--dashed",       cssProp: "background",     tokenType: "color",      default: "var(--green-50)" },
      { key: "sp-btn--dashed:color",              label: "Dashed · Text",      cssClass: "sp-btn--dashed",       cssProp: "color",          tokenType: "color",      default: "var(--brand-primary)" },
    ],
  },
  {
    name: "Tab Bar",
    className: "sp-tabs",
    description: "Navigation tab bar",
    props: [
      { key: "sp-tabs:background",       label: "Bar · BG",         cssClass: "sp-tabs",       cssProp: "background",    tokenType: "color",    default: "var(--bg-muted)" },
      { key: "sp-tabs:border-radius",    label: "Bar · Radius",     cssClass: "sp-tabs",       cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-2xl)" },
      { key: "sp-tab:font-size",         label: "Tab · Font Size",  cssClass: "sp-tab",        cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-md)" },
      { key: "sp-tab:color",             label: "Tab · Text",       cssClass: "sp-tab",        cssProp: "color",         tokenType: "color",    default: "var(--text-subtle)" },
      { key: "sp-tab:border-radius",     label: "Tab · Radius",     cssClass: "sp-tab",        cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp-tab--active:background",label: "Active · BG",      cssClass: "sp-tab--active",cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp-tab--active:color",     label: "Active · Text",    cssClass: "sp-tab--active",cssProp: "color",         tokenType: "color",    default: "var(--text-primary)" },
    ],
  },
  {
    name: "Card",
    className: "sp-card",
    description: "Content card container",
    props: [
      { key: "sp-card:background",    label: "Background", cssClass: "sp-card", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp-card:border-radius", label: "Radius",     cssClass: "sp-card", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-3xl)" },
    ],
  },
  {
    name: "Stat Card",
    className: "sp-stat-card",
    description: "KPI summary tile",
    props: [
      { key: "sp-stat-card:background",    label: "Background",    cssClass: "sp-stat-card", cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp-stat-card:border-radius", label: "Radius",        cssClass: "sp-stat-card", cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-3xl)" },
      { key: "sp-stat-card__value:font-size",  label: "Value · Size",   cssClass: "sp-stat-card__value", cssProp: "font-size",  tokenType: "fontsize",  default: "var(--font-size-4xl)" },
      { key: "sp-stat-card__label:font-size",  label: "Label · Size",   cssClass: "sp-stat-card__label", cssProp: "font-size",  tokenType: "fontsize",  default: "var(--font-size-sm)" },
      { key: "sp-stat-card__label:color",      label: "Label · Color",  cssClass: "sp-stat-card__label", cssProp: "color",      tokenType: "color",     default: "var(--text-subtle)" },
    ],
  },
  {
    name: "Banner",
    className: "sp-banner",
    description: "Highlight / info banner",
    props: [
      { key: "sp-banner:background",    label: "Background", cssClass: "sp-banner", cssProp: "background",    tokenType: "color",  default: "var(--bg-muted)" },
      { key: "sp-banner:border-radius", label: "Radius",     cssClass: "sp-banner", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-3xl)" },
    ],
  },
  {
    name: "Input",
    className: "sp-input",
    description: "Text input / select / textarea",
    props: [
      { key: "sp-input:background",    label: "Background", cssClass: "sp-input", cssProp: "background",    tokenType: "color",    default: "var(--bg-card)" },
      { key: "sp-input:border-radius", label: "Radius",     cssClass: "sp-input", cssProp: "border-radius", tokenType: "radius",   default: "var(--radius-lg)" },
      { key: "sp-input:font-size",     label: "Font Size",  cssClass: "sp-input", cssProp: "font-size",     tokenType: "fontsize", default: "var(--font-size-md)" },
    ],
  },
  {
    name: "Modal",
    className: "sp-modal",
    description: "Dialog / overlay modal",
    props: [
      { key: "sp-modal:background",    label: "Background", cssClass: "sp-modal", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp-modal:border-radius", label: "Radius",     cssClass: "sp-modal", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-6xl)" },
    ],
  },
  {
    name: "Row Card",
    className: "sp-row-card",
    description: "Accrual / reconcile list row",
    props: [
      { key: "sp-row-card:background",    label: "Background", cssClass: "sp-row-card", cssProp: "background",    tokenType: "color",  default: "var(--bg-card)" },
      { key: "sp-row-card:border-radius", label: "Radius",     cssClass: "sp-row-card", cssProp: "border-radius", tokenType: "radius", default: "var(--radius-3xl)" },
    ],
  },
  {
    name: "Top Bar",
    className: "sp-topbar",
    description: "Page navigation top bar",
    props: [
      { key: "sp-topbar:background", label: "Background", cssClass: "sp-topbar", cssProp: "background", tokenType: "color", default: "var(--bg-card)" },
    ],
  },
];

// ─── Token option lists for pickers ───────────────────────────────────────────

const TOKEN_OPTIONS: Record<string, { group: string; tokens: string[] }[]> = {
  color: [
    { group: "Brand",       tokens: ["var(--brand-primary)", "var(--brand-secondary)"] },
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

// ─── Component prop row with token picker ──────────────────────────────────────

function CompPropRow({ prop, value, dirty, onChange, onReset }) {
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

  const opts = TOKEN_OPTIONS[prop.tokenType] || [];
  const isColor = prop.tokenType === "color";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 11, color: dirty ? "#3d5a47" : "#64748b", fontWeight: dirty ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {prop.label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
        {isColor && (
          <div style={{ width: 18, height: 18, borderRadius: 3, background: value, border: "1px solid #e2e8f0", flexShrink: 0 }} />
        )}
        <select value={value} onChange={e => onChange(prop.key, e.target.value)} style={selectStyle}>
          {opts.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.tokens.map(token => (
                <option key={token} value={token}>{token.replace("var(--", "").replace(")", "")}</option>
              ))}
            </optgroup>
          ))}
          {/* Always include current value if not in list */}
          {!opts.flatMap(g => g.tokens).includes(value) && (
            <option value={value}>{value}</option>
          )}
        </select>
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

export function DesignSystemPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"foundations" | "components">("foundations");

  // Foundations state
  const [values, setValues]     = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  // Components state
  const [compValues, setCompValues]     = useState<Record<string, string>>(buildCompDefaults);
  const [compDefaults]                  = useState<Record<string, string>>(buildCompDefaults);
  const [compCollapsed, setCompCollapsed] = useState<Record<string, boolean>>({});
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
      el.id = "sp-ds-comp-overrides";
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
    trigger: {
      position: "fixed" as const,
      top: 8,
      right: 12,
      zIndex: 400,
      width: 30,
      height: 30,
      borderRadius: 7,
      border: "1px solid #e2e8f0",
      background: open ? "#e4ebe6" : "#ffffff",
      color: open ? "#3d5a47" : "#475569",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 15,
      fontWeight: 700,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
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
      {/* Trigger */}
      <button onClick={() => setOpen(v => !v)} style={S.trigger} title="Design System">⋮</button>

      {/* Backdrop */}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "transparent" }} />}

      {/* Panel */}
      <div style={S.panel}>
        {/* Header */}
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d5a47" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>Design System</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                {(tab === "foundations" ? dirtyCount : compDirtyCount) > 0
                  ? `${tab === "foundations" ? dirtyCount : compDirtyCount} unsaved change${(tab === "foundations" ? dirtyCount : compDirtyCount) > 1 ? "s" : ""}`
                  : tab === "foundations" ? "All tokens · globals.css" : "All components · globals.css"}
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", padding: "2px 6px", borderRadius: 4 }}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={S.tabBar}>
          <button style={S.tabBtn(tab === "foundations")} onClick={() => setTab("foundations")}>
            Foundations {dirtyCount > 0 && <span style={{ marginLeft: 4, fontSize: 9, background: "#edfde4", color: "#3d5a47", borderRadius: 8, padding: "1px 4px", fontWeight: 700 }}>{dirtyCount}</span>}
          </button>
          <button style={S.tabBtn(tab === "components")} onClick={() => setTab("components")}>
            Components {compDirtyCount > 0 && <span style={{ marginLeft: 4, fontSize: 9, background: "#edfde4", color: "#3d5a47", borderRadius: 8, padding: "1px 4px", fontWeight: 700 }}>{compDirtyCount}</span>}
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
