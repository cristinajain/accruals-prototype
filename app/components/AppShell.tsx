// @ts-nocheck
"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

const IconPanelOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18"/>
    <path d="m14 9 3 3-3 3"/>
  </svg>
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="sp-app-shell">
      <Sidebar open={open} onToggle={() => setOpen(!open)} />
      {!open && (
        <button className="sp-sidebar-reopen" onClick={() => setOpen(true)} title="Open sidebar">
          <IconPanelOpen />
        </button>
      )}
      <main className="sp-main">{children}</main>
    </div>
  );
}
