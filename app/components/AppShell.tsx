// @ts-nocheck
"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

const IconPanelClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18M16 15l-3-3 3-3"/>
  </svg>
);

const IconPanelOpen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18M13 9l3 3-3 3"/>
  </svg>
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="sp-app-shell">
      <Sidebar open={open} />
      {/* Fixed toggle pill — sits at the sidebar's right edge */}
      <button
        className={`sp-sidebar-toggle${open ? "" : " sp-sidebar-toggle--collapsed"}`}
        onClick={() => setOpen(!open)}
        title={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        {open ? <IconPanelClose /> : <IconPanelOpen />}
      </button>
      <main className="sp-main">{children}</main>
    </div>
  );
}
