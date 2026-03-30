// @ts-nocheck
"use client";

import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sp-app-shell">
      <Sidebar />
      <main className="sp-main">{children}</main>
    </div>
  );
}
