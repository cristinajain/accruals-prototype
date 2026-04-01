// @ts-nocheck
"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="sp11-app-shell">
      <Sidebar open={open} onToggle={() => setOpen(!open)} />
      <main className="sp11-main">{children}</main>
    </div>
  );
}
