"use client";
// @ts-nocheck

import { PERIODS } from "./lib/data";
import { PORTFOLIO } from "./lib/portfolio";
import { DashboardView } from "./components/dashboard/DashboardView";

const pLabel = PERIODS.find(p => p.status === "active")?.label ?? "Jan '26";

export default function Page() {
  return <DashboardView PORTFOLIO={PORTFOLIO} pLabel={pLabel} />;
}
