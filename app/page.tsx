"use client";
// @ts-nocheck

import { PERIODS } from "./lib/data";
import { DashboardView } from "./components/dashboard/DashboardView";

const pLabel = PERIODS.find(p => p.status === "active")?.label ?? "Jan '26";

const PORTFOLIO = [
  { id: 1, name: "Park Avenue Tower",      type: "Office",      units: "245K sqft", market: "NYC",          accountant: "Sarah Chen",  active: true,  accrualCount: 8,  approvedCount: 4,  pendingCount: 2,  totalAccrual: 47450,  totalBudget: 88200,  variance: 47450,  closeStatus: "in-review",   actualsPosted: 0,  actualsTotal: 8,  daysToClose: 4 },
  { id: 2, name: "Riverside Commons",       type: "Multifamily", units: "312 units", market: "Austin",        accountant: "Mike Torres", active: false, accrualCount: 11, approvedCount: 9,  pendingCount: 2,  totalAccrual: 94650,  totalBudget: 88200,  variance: 6450,   closeStatus: "in-review",   actualsPosted: 7,  actualsTotal: 9,  daysToClose: 3 },
  { id: 3, name: "Harbor Industrial Park",  type: "Industrial",  units: "180K sqft", market: "Chicago",       accountant: "Sarah Chen",  active: false, accrualCount: 15, approvedCount: 15, pendingCount: 0,  totalAccrual: 312800, totalBudget: 305000, variance: 7800,   closeStatus: "complete",    actualsPosted: 12, actualsTotal: 12, daysToClose: 0 },
  { id: 4, name: "Oakwood Apartments",      type: "Multifamily", units: "198 units", market: "Denver",        accountant: "Lisa Park",   active: false, accrualCount: 8,  approvedCount: 8,  pendingCount: 0,  totalAccrual: 52100,  totalBudget: 51000,  variance: 1100,   closeStatus: "complete",    actualsPosted: 6,  actualsTotal: 6,  daysToClose: 0 },
  { id: 5, name: "Meridian Office Campus",  type: "Office",      units: "410K sqft", market: "Atlanta",       accountant: "Mike Torres", active: false, accrualCount: 18, approvedCount: 4,  pendingCount: 14, totalAccrual: 445200, totalBudget: 412000, variance: 33200,  closeStatus: "not-started", actualsPosted: 0,  actualsTotal: 14, daysToClose: 8 },
  { id: 6, name: "Lakeshore Retail Center", type: "Retail",      units: "92K sqft",  market: "Minneapolis",   accountant: "Lisa Park",   active: false, accrualCount: 7,  approvedCount: 5,  pendingCount: 2,  totalAccrual: 68300,  totalBudget: 65000,  variance: 3300,   closeStatus: "in-review",   actualsPosted: 4,  actualsTotal: 7,  daysToClose: 5 },
];

export default function Page() {
  return <DashboardView PORTFOLIO={PORTFOLIO} pLabel={pLabel} />;
}
