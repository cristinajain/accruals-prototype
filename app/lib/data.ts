// @ts-nocheck

// code = short code shown in category badge tile
export const SOURCE_TYPES = {
  "open-po":       { label: "Open PO",       icon: "📋", code: "PO",  actions: ["Follow Up with Vendor", "Confirm Receipt with PM", "Close PO"] },
  "gl-pattern":    { label: "GL Pattern",    icon: "📊", code: "GL",  actions: ["Wait for Invoice", "Flag if Overdue"] },
  "contract":      { label: "Contract",      icon: "📄", code: "CT",  actions: ["Book per Contract", "Verify Terms"] },
  "work-order":    { label: "Work Order",    icon: "🔧", code: "WO",  actions: ["Confirm Completion", "Get Vendor Quote", "Create PO"] },
  "pm-email":      { label: "PM Email",      icon: "💬", code: "PM",  actions: ["Verify with PM", "Request Documentation", "Create PO"] },
  "utility-model": { label: "Utility Model", icon: "⚡", code: "UT",  actions: ["Wait for Bill", "Adjust for Occupancy"] },
  "budget":        { label: "Budget",        icon: "📑", code: "BG",  actions: ["Verify with PM", "Adjust Estimate", "Defer to Next Month"] },
  "manual":        { label: "Manual",        icon: "✏️", code: "MN",  actions: ["Verify", "Request Documentation"] },
};

export const MONTHS = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"];

export const PERIODS = [
  { key: "2026-01", label: "Jan 2026", short: "Jan '26", status: "active" },
  { key: "2026-02", label: "Feb 2026", short: "Feb '26", status: "open" },
  { key: "2026-03", label: "Mar 2026", short: "Mar '26", status: "open" },
  { key: "2026-04", label: "Apr 2026", short: "Apr '26", status: "open" },
];

export const BUDGET = {
  "6210 — R&M HVAC": { vendor: "Metro HVAC Services", jan: 14000, feb: 14000, mar: 14000, apr: 14000 },
  "6110 — Utilities Electric": { vendor: "ConEd", jan: 30000, feb: 28000, mar: 25000, apr: 22000 },
  "6350 — Security Services": { vendor: "Allied Security", jan: 8750, feb: 8750, mar: 8750, apr: 8750 },
  "6220 — Cleaning Services": { vendor: "ProClean", jan: 6500, feb: 6500, mar: 6500, apr: 6500 },
  "6230 — Elevator Maintenance": { vendor: "Schindler", jan: 4200, feb: 4200, mar: 4200, apr: 4200 },
  "6240 — R&M Roof": { vendor: "TBD", jan: 0, feb: 5000, mar: 0, apr: 0 },
  "6500 — Leasing Commissions": { vendor: "Cushman & Wakefield", jan: 0, feb: 0, mar: 45000, apr: 0 },
  "6410 — Property Insurance": { vendor: "Hartford", jan: 15500, feb: 15500, mar: 15500, apr: 15500 },
  "6250 — Landscaping": { vendor: "ABM Facility", jan: 6750, feb: 4050, mar: 2700, apr: 4500 },
  "6215 — R&M Plumbing": { vendor: "TBD", jan: 2000, feb: 2000, mar: 2000, apr: 2000 },
  "6900 — Permits & Fees": { vendor: "Various", jan: 500, feb: 500, mar: 500, apr: 500 },
};

export const INIT_ACCRUALS = [
  { id: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", amount: 14200, confidence: 96, sourceType: "gl-pattern", priority: "high", month: "Jan 2026", status: "suggested", rationale: "Monthly HVAC invoiced 23/24 months. Jan invoice 6 days overdue.", signals: [{ type: "GL History", detail: "23/24 months, avg $14,150" }], autoReverse: true, movedFrom: null },
  { id: 2, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", amount: 31500, confidence: 91, sourceType: "utility-model", priority: "high", month: "Jan 2026", status: "suggested", rationale: "Seasonal model: Jan historically 12% above avg. Weather-adjusted.", signals: [{ type: "Seasonal Model", detail: "Winter uplift 1.12x" }], autoReverse: true, movedFrom: null },
  { id: 3, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", amount: 8750, confidence: 97, sourceType: "contract", priority: "medium", month: "Jan 2026", status: "approved", rationale: "Contract: $8,750/mo fixed.", signals: [{ type: "Contract", detail: "$8,750/mo, renewed Oct 2025" }], autoReverse: true, movedFrom: null },
  { id: 4, vendor: "ProClean Janitorial", glCode: "6220 — Cleaning Services", amount: 6800, confidence: 89, sourceType: "open-po", priority: "medium", month: "Jan 2026", status: "suggested", rationale: "PO #4480 open. PM flagged extra cleanings.", signals: [{ type: "Open PO", detail: "PO-4480: $6,500 base + extras" }], autoReverse: true, movedFrom: null },
  { id: 5, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", amount: 4200, confidence: 99, sourceType: "contract", priority: "low", month: "Jan 2026", status: "suggested", rationale: "Fixed contract, identical 24 months.", signals: [{ type: "Contract", detail: "$4,200/mo fixed" }], autoReverse: true, movedFrom: null },
  { id: 6, vendor: "Skyline Roofing (est.)", glCode: "6240 — R&M Roof", amount: 22000, confidence: 58, sourceType: "work-order", priority: "high", month: "Jan 2026", status: "suggested", rationale: "WO-4521 emergency roof leak. Budget was $5K in Feb — actual scope much larger.", signals: [{ type: "Work Order", detail: "WO-4521: Emergency" }, { type: "Budget", detail: "$5K in Feb, shifted to Jan, $17K over" }], autoReverse: true, movedFrom: null },
  { id: 7, vendor: "Cushman & Wakefield", glCode: "6500 — Leasing Commissions", amount: 45000, confidence: 72, sourceType: "pm-email", priority: "high", month: "Jan 2026", status: "suggested", rationale: "Leasing director emailed Jan 14: Suite 1450 lease executed. Budgeted $45K in Mar — pulled forward.", signals: [{ type: "Email", detail: "Suite 1450 lease fully executed" }], autoReverse: true, movedFrom: null },
  { id: 8, vendor: "ABC Plumbing", glCode: "6215 — R&M Plumbing", amount: 3200, confidence: 45, sourceType: "pm-email", priority: "medium", month: "Jan 2026", status: "suggested", rationale: "Site manager email: burst pipe ~$3K.", signals: [{ type: "Email", detail: "T. Bradley: burst pipe ~$3K" }], autoReverse: true, movedFrom: null },
  { id: 9, vendor: "TBD — Roof Repair", glCode: "6240 — R&M Roof", amount: 5000, confidence: 70, sourceType: "budget", priority: "medium", month: "Feb 2026", status: "suggested", rationale: "Budget: $5K roof repair in Feb. No WO yet.", signals: [{ type: "Budget", detail: "$5,000 budgeted" }], autoReverse: true, movedFrom: null },
];

export const ACTUALS_DATA = [
  { id: "a1", accrualId: 3, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", invoiceNum: "INV-AS-2026-0142", invoiceDate: "2026-01-18", receivedDate: "2026-01-22", actualAmount: 8750, accrualAmount: 8750, status: "matched", spread: null },
  { id: "a2", accrualId: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", invoiceNum: "INV-MH-26-0108", invoiceDate: "2026-01-15", receivedDate: "2026-02-03", actualAmount: 14850, accrualAmount: 14200, status: "variance", spread: null },
  { id: "a3", accrualId: 5, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", invoiceNum: "INV-SE-2026-01", invoiceDate: "2026-01-31", receivedDate: "2026-02-05", actualAmount: 4200, accrualAmount: 4200, status: "matched", spread: null },
  { id: "a4", accrualId: 6, vendor: "Skyline Roofing Co.", glCode: "6240 — R&M Roof", invoiceNum: "INV-SR-4521-01", invoiceDate: "2026-02-10", receivedDate: "2026-02-12", actualAmount: 24750, accrualAmount: 22000, status: "variance", notes: "Scope expanded — Floor 17 membrane patching.", spread: null },
  { id: "a5", accrualId: 2, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", invoiceNum: "CONED-2026-01-PAT", invoiceDate: "2026-02-01", receivedDate: "2026-02-08", actualAmount: 32180, accrualAmount: 31500, status: "variance", spread: null },
  { id: "a6", accrualId: null, vendor: "NYC DOB", glCode: "6900 — Permits & Fees", invoiceNum: "DOB-VIOL-2026-0042", invoiceDate: "2026-01-28", receivedDate: "2026-02-14", actualAmount: 3500, accrualAmount: 0, status: "unmatched", notes: "DOB violation — scaffolding permit lapse.", spread: null },
  { id: "a7", accrualId: null, vendor: "Hartford Insurance", glCode: "6410 — Property Insurance", invoiceNum: "HIC-PAT-2026-AN", invoiceDate: "2026-01-15", receivedDate: "2026-01-20", actualAmount: 186000, accrualAmount: 15500, status: "multi-period", spread: { method: "straight-line", periods: 12, startMonth: "Jan 2026", endMonth: "Dec 2026", glPrepaid: "1500 — Prepaid Insurance", schedule: [{ month: "Jan 2026", amount: 15500, status: "current" }, { month: "Feb 2026", amount: 15500, status: "future" }, { month: "Mar–Dec", amount: 155000, status: "future", note: "10 × $15,500" }] } },
  { id: "a8", accrualId: null, vendor: "ABM Facility Services", glCode: "6250 — Landscaping", invoiceNum: "ABM-Q1-2026", invoiceDate: "2026-01-10", receivedDate: "2026-01-14", actualAmount: 13500, accrualAmount: 4500, status: "multi-period", spread: { method: "weighted", periods: 3, startMonth: "Jan 2026", endMonth: "Mar 2026", glPrepaid: "1510 — Prepaid Services", schedule: [{ month: "Jan 2026", amount: 6750, status: "current", weight: "50%" }, { month: "Feb 2026", amount: 4050, status: "future", weight: "30%" }, { month: "Mar 2026", amount: 2700, status: "future", weight: "20%" }] } },
];
