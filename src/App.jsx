import { useState, useCallback, useRef, useEffect } from "react";

// ——— Source Type Definitions ———
const SOURCE_TYPES = {
  "open-po": { label: "Open PO", icon: "📋", color: "blue", desc: "Purchase order exists but no invoice received", actions: ["Follow Up with Vendor", "Confirm Receipt with PM", "Close PO"] },
  "gl-pattern": { label: "GL Pattern", icon: "📊", color: "indigo", desc: "Historical invoicing pattern predicts this expense", actions: ["Wait for Invoice", "Flag if Overdue"] },
  "contract": { label: "Contract", icon: "📄", color: "purple", desc: "Known contractual obligation", actions: ["Book per Contract", "Flag if Expired", "Verify Terms"] },
  "work-order": { label: "Work Order", icon: "🔧", color: "amber", desc: "Active work order indicates expense incurred", actions: ["Confirm Completion", "Get Vendor Quote", "Create PO"] },
  "pm-email": { label: "PM Communication", icon: "💬", color: "cyan", desc: "Property manager reported expense via email or call", actions: ["Verify with PM", "Request Documentation", "Create PO"] },
  "utility-model": { label: "Utility Model", icon: "⚡", color: "emerald", desc: "Seasonal/usage model predicts utility expense", actions: ["Wait for Bill", "Adjust for Occupancy"] },
};

const PROPERTIES = [
  { id: 1, name: "Park Avenue Tower", type: "Office", units: "245K sqft", market: "NYC", accountant: "Sarah Chen", status: "review" },
  { id: 2, name: "Riverside Commons", type: "Multifamily", units: "312 units", market: "Austin", accountant: "Mike Torres", status: "review" },
  { id: 3, name: "Harbor Industrial Park", type: "Industrial", units: "180K sqft", market: "Chicago", accountant: "Sarah Chen", status: "pending" },
];

const ACCRUALS = [
  { id: 1, propertyId: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", amount: 14200, confidence: 96, category: "Recurring", status: "suggested", priority: "high",
    sourceType: "gl-pattern",
    rationale: "Monthly HVAC maintenance invoiced 23 of last 24 months. December invoice ($14,150) received on day 8. January invoice 6 days overdue.",
    signals: [{ type: "GL History", detail: "23/24 months invoiced, avg $14,150, σ = $340" }, { type: "AP Aging", detail: "No open PO or pending invoice from Metro HVAC" }, { type: "Seasonal", detail: "Winter months avg 3% higher — adjusted to $14,200" }],
    sourceEvidence: { type: "GL Pattern Match", matchRate: "96%", lastInvoice: "Dec 2025 — $14,150", avgDayReceived: "Day 8", currentDay: "Day 14 — 6 days overdue" },
    lastInvoice: "Dec 2025 — $14,150", trend: [13800, 14100, 14200, 13900, 14300, 14150] },
  { id: 2, propertyId: 1, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", amount: 31500, confidence: 91, category: "Utility", status: "suggested", priority: "high",
    sourceType: "utility-model",
    rationale: "Electric bill follows seasonal pattern. January historically 12% above annual avg due to heating. NYC HDD 8% above 3yr average this January.",
    signals: [{ type: "GL History", detail: "36/36 months invoiced, Jan avg $31,200" }, { type: "Seasonal Model", detail: "Winter uplift 1.12x on base $28,100" }, { type: "Weather", detail: "NYC Jan 2026 HDD 8% above 3yr avg" }],
    sourceEvidence: { type: "Utility Forecast", model: "Seasonal + Weather", confidence: "91%", factors: "HDD-adjusted, occupancy-weighted", priorJanAvg: "$31,200" },
    lastInvoice: "Dec 2025 — $28,400", trend: [26200, 27800, 31200, 28900, 25100, 28400] },
  { id: 3, propertyId: 1, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", amount: 8750, confidence: 97, category: "Recurring", status: "suggested", priority: "medium",
    sourceType: "contract",
    rationale: "Security contract renewed Oct 2025 at $8,750/mo. Fixed rate, no variability. Invoice typically arrives on the 15th.",
    signals: [{ type: "Contract", detail: "12-mo contract, $8,750/mo fixed, renewed Oct 2025" }, { type: "GL History", detail: "36/36 months invoiced at contracted rate" }],
    sourceEvidence: { type: "Active Contract", contractId: "SC-2025-1042", rate: "$8,750/mo", term: "Oct 2025 – Sep 2026", renewal: "Auto-renew", lastVerified: "Oct 2025" },
    lastInvoice: "Dec 2025 — $8,750", trend: [8200, 8200, 8200, 8750, 8750, 8750] },
  { id: 4, propertyId: 1, vendor: "ProClean Janitorial", glCode: "6220 — Cleaning Services", amount: 6800, confidence: 89, category: "Recurring", status: "suggested", priority: "medium",
    sourceType: "open-po",
    rationale: "PO #4480 open for January janitorial services ($6,500 base). PM flagged 2 extra cleanings for tenant move-in. No invoice received yet.",
    signals: [{ type: "Open PO", detail: "PO #4480: $6,500 base, opened Jan 2" }, { type: "PM Input", detail: "Extra cleaning for tenant move-in Floor 12" }, { type: "GL History", detail: "18/18 months invoiced, avg $6,680 ± $420" }],
    sourceEvidence: { type: "Open Purchase Order", poNumber: "PO-4480", poAmount: "$6,500", poDate: "Jan 2, 2026", poStatus: "Open — goods received, no invoice", requester: "Tom Bradley (Site Mgr)", vendor: "ProClean Janitorial", notes: "Extra cleanings added — estimate adjusted to $6,800" },
    lastInvoice: "Dec 2025 — $6,550", trend: [6400, 6800, 6500, 6900, 6700, 6550] },
  { id: 5, propertyId: 1, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", amount: 4200, confidence: 99, category: "Recurring", status: "suggested", priority: "low",
    sourceType: "contract",
    rationale: "Fixed-price elevator maintenance contract. Identical amount every month for 24 consecutive months. Zero expected variance.",
    signals: [{ type: "Contract", detail: "24-mo contract, $4,200/mo fixed, expires Aug 2026" }, { type: "GL History", detail: "24/24 months at exactly $4,200.00" }],
    sourceEvidence: { type: "Active Contract", contractId: "EM-2024-0087", rate: "$4,200/mo", term: "Sep 2024 – Aug 2026", renewal: "Manual", lastVerified: "Sep 2024" },
    lastInvoice: "Dec 2025 — $4,200", trend: [4200, 4200, 4200, 4200, 4200, 4200] },
  { id: 6, propertyId: 1, vendor: "Skyline Roofing (est.)", glCode: "6240 — R&M Roof", amount: 22000, confidence: 58, category: "One-time", status: "suggested", priority: "high",
    sourceType: "work-order",
    rationale: "Work order WO-4521 for emergency roof leak repair, Floor 18. Vendor selection in progress. Estimate based on 3 similar portfolio repairs ($18K–$26K).",
    signals: [{ type: "Work Order", detail: "WO-4521: Emergency roof leak, opened Jan 3, status: Vendor Selection" }, { type: "Portfolio Comp", detail: "3 similar repairs: $18K, $22K, $26K" }, { type: "PM Estimate", detail: "Building engineer: $20-25K pending vendor quote" }],
    sourceEvidence: { type: "Active Work Order", woNumber: "WO-4521", opened: "Jan 3, 2026", priority: "Emergency", description: "Roof membrane leak, Floor 18 NE corner", assignedTo: "Pending vendor selection", status: "Vendor Selection", completionEst: "Jan 20–25", pmContact: "Tom Bradley" },
    lastInvoice: "None — new expense", trend: [] },
  { id: 7, propertyId: 1, vendor: "Cushman & Wakefield", glCode: "6500 — Leasing Commissions", amount: 45000, confidence: 72, category: "One-time", status: "suggested", priority: "high",
    sourceType: "pm-email",
    rationale: "Leasing director emailed Jan 14 confirming Suite 1450 lease execution (Meridian Labs, 8,200 sqft). Commission per C&W agreement: 5% of Year 1 gross rent.",
    signals: [{ type: "Email", detail: "From: J. Morris (Leasing Dir), Jan 14: 'Suite 1450 lease fully executed'" }, { type: "Lease Event", detail: "Meridian Labs, 8,200 sqft, $109/sqft, 7-yr term" }, { type: "Commission Schedule", detail: "C&W agreement: 5% of Year 1 gross rent for new leases" }],
    sourceEvidence: { type: "Email Communication", from: "James Morris, Leasing Director", date: "Jan 14, 2026", subject: "Suite 1450 — Lease Executed", excerpt: "Wanted to let you know the Meridian Labs lease for Suite 1450 is fully executed as of today. Standard C&W commission applies.", attachments: "Lease_1450_Executed.pdf", verified: false },
    lastInvoice: "Oct 2025 — $38,500 (Suite 920 lease)", trend: [] },
  { id: 8, propertyId: 1, vendor: "ABC Plumbing", glCode: "6215 — R&M Plumbing", amount: 3200, confidence: 45, category: "One-time", status: "suggested", priority: "medium",
    sourceType: "pm-email",
    rationale: "Site manager Tom Bradley emailed Jan 18: 'Had ABC Plumbing out to fix the burst pipe in basement mechanical room. Should be around $3K give or take.' No PO, no invoice yet.",
    signals: [{ type: "Email", detail: "From: T. Bradley (Site Mgr), Jan 18: 'Had ABC Plumbing out for burst pipe'" }, { type: "No PO", detail: "No purchase order exists in the system" }, { type: "No Invoice", detail: "No invoice received from ABC Plumbing" }],
    sourceEvidence: { type: "Email Communication", from: "Tom Bradley, Site Manager", date: "Jan 18, 2026", subject: "RE: Basement pipe issue", excerpt: "Had ABC Plumbing out yesterday to fix the burst pipe in the basement mechanical room. Took about half a day. Should be around $3K give or take — I'll get the invoice when they send it.", attachments: "None", verified: false },
    lastInvoice: "None — new vendor", trend: [] },
];

const ACTUALS_DATA = [
  { id: "a1", accrualId: 3, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", invoiceNum: "INV-AS-2026-0142", invoiceDate: "2026-01-18", receivedDate: "2026-01-22", actualAmount: 8750, accrualAmount: 8750, status: "matched", spread: null },
  { id: "a2", accrualId: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", invoiceNum: "INV-MH-26-0108", invoiceDate: "2026-01-15", receivedDate: "2026-02-03", actualAmount: 14850, accrualAmount: 14200, status: "variance", spread: null },
  { id: "a3", accrualId: 5, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", invoiceNum: "INV-SE-2026-01", invoiceDate: "2026-01-31", receivedDate: "2026-02-05", actualAmount: 4200, accrualAmount: 4200, status: "matched", spread: null },
  { id: "a4", accrualId: 6, vendor: "Skyline Roofing Co.", glCode: "6240 — R&M Roof", invoiceNum: "INV-SR-4521-01", invoiceDate: "2026-02-10", receivedDate: "2026-02-12", actualAmount: 24750, accrualAmount: 22000, status: "variance", notes: "Scope expanded to include Floor 17 membrane patching.", spread: null },
  { id: "a5", accrualId: 2, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", invoiceNum: "CONED-2026-01-PAT", invoiceDate: "2026-02-01", receivedDate: "2026-02-08", actualAmount: 32180, accrualAmount: 31500, status: "variance", spread: null },
  { id: "a6", accrualId: null, vendor: "NYC DOB", glCode: "6900 — Permits & Fees", invoiceNum: "DOB-VIOL-2026-0042", invoiceDate: "2026-01-28", receivedDate: "2026-02-14", actualAmount: 3500, accrualAmount: 0, status: "unmatched", notes: "DOB violation — scaffolding permit lapse.", spread: null },
  { id: "a7", accrualId: null, vendor: "Hartford Insurance", glCode: "6410 — Property Insurance", invoiceNum: "HIC-PAT-2026-AN", invoiceDate: "2026-01-15", receivedDate: "2026-01-20", actualAmount: 186000, accrualAmount: 15500, status: "multi-period", spread: { method: "straight-line", totalAmount: 186000, periods: 12, startMonth: "Jan 2026", endMonth: "Dec 2026", perPeriod: 15500, glPrepaid: "1500 — Prepaid Insurance", schedule: [{ month: "Jan 2026", amount: 15500, status: "current" }, { month: "Feb 2026", amount: 15500, status: "future" }, { month: "Mar 2026", amount: 15500, status: "future" }, { month: "Apr–Dec", amount: 139500, status: "future", note: "9 × $15,500" }] } },
  { id: "a8", accrualId: null, vendor: "ABM Facility Services", glCode: "6250 — Landscaping", invoiceNum: "ABM-Q1-2026", invoiceDate: "2026-01-10", receivedDate: "2026-01-14", actualAmount: 13500, accrualAmount: 4500, status: "multi-period", spread: { method: "weighted", totalAmount: 13500, periods: 3, startMonth: "Jan 2026", endMonth: "Mar 2026", glPrepaid: "1510 — Prepaid Services", schedule: [{ month: "Jan 2026", amount: 6750, status: "current", weight: "50%" }, { month: "Feb 2026", amount: 4050, status: "future", weight: "30%" }, { month: "Mar 2026", amount: 2700, status: "future", weight: "20%" }] } },
];

const PERIODS = [
  { key: "2025-12", label: "Dec 2025", short: "Dec '25", status: "closed" },
  { key: "2026-01", label: "Jan 2026", short: "Jan '26", status: "active" },
  { key: "2026-02", label: "Feb 2026", short: "Feb '26", status: "open" },
  { key: "2026-03", label: "Mar 2026", short: "Mar '26", status: "open" },
];

// ——— Utility Components ———
const Badge = ({ children, color }) => {
  const c = { green: { b: "#dcfce7", t: "#166534" }, blue: { b: "#dbeafe", t: "#1e40af" }, amber: { b: "#fef3c7", t: "#92400e" }, red: { b: "#fee2e2", t: "#991b1b" }, gray: { b: "#f1f5f9", t: "#475569" }, purple: { b: "#ede9fe", t: "#5b21b6" }, indigo: { b: "#e0e7ff", t: "#3730a3" }, emerald: { b: "#d1fae5", t: "#065f46" }, cyan: { b: "#cffafe", t: "#155e75" }, rose: { b: "#ffe4e6", t: "#9f1239" }, orange: { b: "#ffedd5", t: "#9a3412" } }[color] || { b: "#f1f5f9", t: "#475569" };
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: c.b, color: c.t, letterSpacing: 0.2, whiteSpace: "nowrap" }}>{children}</span>;
};

const Dl = (n) => n == null ? "—" : "$" + n.toLocaleString();

const ConfBar = ({ value }) => {
  if (value === 0) return <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Manual</span>;
  const color = value >= 90 ? "#22c55e" : value >= 75 ? "#f59e0b" : value >= 60 ? "#f97316" : "#ef4444";
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 48, height: 6, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.4s" }} /></div><span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 32 }}>{value}%</span></div>;
};

const SparkLine = ({ data, w = 72, h = 22, color = "#6366f1" }) => {
  if (!data?.length || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * (h - 4) - 2}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
};

// ——— Source-Aware Action Button ———
function SourceAction({ action, sourceType, accrualId, actionStates, setActionStates }) {
  const key = `${accrualId}-${action}`;
  const state = actionStates[key] || "available";
  const isCompleted = state === "done";

  const icons = { "Follow Up with Vendor": "📧", "Confirm Receipt with PM": "👤", "Close PO": "🚫", "Wait for Invoice": "⏳", "Flag if Overdue": "🚩", "Book per Contract": "📝", "Flag if Expired": "⚠️", "Verify Terms": "🔍", "Confirm Completion": "✅", "Get Vendor Quote": "💰", "Create PO": "📋", "Verify with PM": "👤", "Request Documentation": "📎", "Wait for Bill": "⏳", "Adjust for Occupancy": "📊" };

  return (
    <button onClick={e => { e.stopPropagation(); setActionStates(prev => ({ ...prev, [key]: isCompleted ? "available" : "done" })); }}
      style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${isCompleted ? "#bbf7d0" : "#e2e8f0"}`, background: isCompleted ? "#f0fdf4" : "#fff", color: isCompleted ? "#166534" : "#475569", fontSize: 11, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s", textDecoration: isCompleted ? "line-through" : "none", opacity: isCompleted ? 0.7 : 1 }}>
      <span>{isCompleted ? "✓" : (icons[action] || "•")}</span>{action}
    </button>
  );
}

// ——— AI Chat Panel ———
function AIChatPanel({ property, accruals, accrualStates, actualsData, activeTab, selectedPeriod, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const prevKey = useRef("");

  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;

  useEffect(() => {
    const key = activeTab + selectedPeriod;
    if (prevKey.current !== key || !messages.length) {
      prevKey.current = key;
      const g = activeTab === "reconcile"
        ? `Ready to reconcile **${pLabel}** actuals for **${property.name}**. I can explain variances, show journal entries, assess model accuracy, or break down multi-period spreads.`
        : `I'm your copilot for **${property.name}** (${pLabel}). I have full context on all ${accruals.length} accrual suggestions including their sources — open POs, GL patterns, contracts, work orders, and PM communications. I can:\n\n• Explain source evidence — *"What PO is the janitorial accrual based on?"*\n• Recommend next actions — *"What should I do about the plumbing email?"*\n• Flag risks — *"Which accruals have the weakest evidence?"*\n• Draft follow-ups — *"Write a vendor follow-up for Metro HVAC"*`;
      setMessages([{ role: "assistant", content: g }]);
    }
  }, [activeTab, selectedPeriod, property.name, accruals.length]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ctx = accruals.map(a => {
    const src = SOURCE_TYPES[a.sourceType];
    return `- ${a.vendor} | GL: ${a.glCode} | Amount: $${a.amount.toLocaleString()} | Confidence: ${a.confidence}% | Status: ${accrualStates[a.id]} | SOURCE TYPE: ${src.label} (${src.desc}) | Available Actions: ${src.actions.join(", ")} | Rationale: ${a.rationale} | Source Evidence: ${JSON.stringify(a.sourceEvidence)} | Signals: ${a.signals.map(s => s.type + ": " + s.detail).join("; ")}`;
  }).join("\n");

  const actCtx = actualsData.map(a => {
    const v = a.actualAmount - a.accrualAmount;
    return `- ${a.vendor} | Actual: $${a.actualAmount.toLocaleString()} | Accrued: $${a.accrualAmount.toLocaleString()} | Variance: ${v >= 0 ? "+" : ""}$${v.toLocaleString()} | Status: ${a.status}${a.spread ? ` | Spread: ${a.spread.method} over ${a.spread.periods} periods` : ""}${a.notes ? ` | ${a.notes}` : ""}`;
  }).join("\n");

  const sys = `You are an AI accounting copilot in Stackpoint for ${property.name}, period ${pLabel}.

ACCRUALS WITH SOURCE TYPES:\n${ctx}

${activeTab === "reconcile" ? `ACTUALS:\n${actCtx}` : ""}

SOURCE TYPE CONTEXT:
- Open PO: PO exists in the PMS (Yardi/Entrata/RealPage) but no invoice has been received. Follow up with vendor or confirm goods/services received with site manager. If PO is no longer valid, close it.
- GL Pattern: Recurring historical invoicing pattern. High confidence for recurring vendors. Key risk: vendor churn or contract changes.
- Contract: Known contractual commitment. Highest confidence. Book per contract terms unless contract has expired or been amended.
- Work Order: Active work order suggests expense was incurred. Estimate from portfolio comps or PM. Key risk: scope changes, vendor selection pending.
- PM Communication: Email/phone from site manager or leasing director. Lowest-evidence source — requires verification. Often no PO exists yet.
- Utility Model: Seasonal + usage-based forecast. Good for directional estimates. Adjust for weather, occupancy, and rate changes.

GUIDELINES:
- Reference the specific source type and its evidence when answering
- For PM Communications, always flag that verification is needed and suggest creating a PO
- For Open POs, reference the PO number and status
- For Contracts, reference the contract ID and terms
- When asked about weak evidence, rank by: PM Email < Work Order < Open PO < GL Pattern < Utility Model < Contract
- Be concise, use dollar amounts and GL codes. Under 150 words unless deep analysis.`;

  const sendMessage = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput(""); setMessages(prev => [...prev, { role: "user", content: q }]); setLoading(true);
    try {
      const hist = messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: [...hist, { role: "user", content: q }] })
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.map(b => b.text || "").join("") || "Couldn't process that." }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Connection error." }]); }
    finally { setLoading(false); setTimeout(() => inputRef.current?.focus(), 50); }
  };

  const qas = activeTab === "reconcile"
    ? ["How accurate were estimates?", "Show HVAC reversal JE", "Break down insurance spread", "What about the DOB fine?"]
    : ["Which have weakest evidence?", "What PO is janitorial based on?", "Write vendor follow-up for HVAC", "What should I do about the plumbing email?"];

  const renderMd = t => t.split("\n").map((ln, i) => {
    const f = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:12px">$1</code>');
    if (/^[•\-]\s/.test(ln)) return <div key={i} style={{ paddingLeft: 12, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: f.replace(/^[•\-]\s*/, "") }} /></div>;
    if (!ln.trim()) return <div key={i} style={{ height: 6 }} />;
    return <div key={i} style={{ marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: f }} />;
  });

  return (
    <div style={{ width: 380, background: "#fff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", right: 0, top: 0, zIndex: 100, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>AI</div>
          <div><div style={{ fontWeight: 600, fontSize: 13 }}>Accounting Copilot</div><div style={{ fontSize: 11, color: "#64748b" }}>{property.name} · {pLabel}</div></div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "88%", padding: "10px 14px", borderRadius: 12, background: m.role === "user" ? "#6366f1" : "#f8fafc", color: m.role === "user" ? "#fff" : "#1e293b", border: m.role === "user" ? "none" : "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.55, borderBottomRightRadius: m.role === "user" ? 4 : 12, borderBottomLeftRadius: m.role === "user" ? 12 : 4 }}>{renderMd(m.content)}</div></div>)}
        {loading && <div style={{ display: "flex" }}><div style={{ padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderBottomLeftRadius: 4 }}><div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: "#94a3b8", animation: `pulse 1.2s ease-in-out ${i*.2}s infinite` }} />)}<style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style></div></div></div>}
        <div ref={bottomRef} />
      </div>
      {messages.length <= 1 && <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>{qas.map((q, i) => <button key={i} onClick={() => setInput(q)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, color: "#6366f1", cursor: "pointer", fontWeight: 500 }}>{q}</button>)}</div>}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); }}} placeholder="Ask about sources, actions, variances..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: loading || !input.trim() ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: loading || !input.trim() ? "#94a3b8" : "#fff", fontWeight: 600, cursor: loading || !input.trim() ? "default" : "pointer" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ——— Main App ———
export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState("accruals");
  const [selectedPeriod, setSelectedPeriod] = useState("2026-01");
  const [accrualStates, setAccrualStates] = useState(() => { const m = {}; ACCRUALS.forEach(a => { m[a.id] = a.status; }); return m; });
  const [expandedAccrual, setExpandedAccrual] = useState(null);
  const [editAmounts, setEditAmounts] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [reconcileStates, setReconcileStates] = useState(() => { const m = {}; ACTUALS_DATA.forEach(a => { m[a.id] = "pending"; }); return m; });
  const [expandedActual, setExpandedActual] = useState(null);
  const [actionStates, setActionStates] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccrual, setNewAccrual] = useState({ vendor: "", glCode: "", amount: "", sourceType: "pm-email", notes: "", priority: "medium" });
  const [customAccruals, setCustomAccruals] = useState([]);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [parseLoading, setParseLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);

  const addManualAccrual = () => {
    if (!newAccrual.vendor || !newAccrual.amount) return;
    const id = 100 + customAccruals.length;
    const entry = { id, propertyId: selectedProperty?.id || 1, vendor: newAccrual.vendor, glCode: newAccrual.glCode || "TBD", amount: Number(newAccrual.amount), confidence: 0, category: "Manual", status: "suggested", priority: newAccrual.priority, sourceType: newAccrual.sourceType, rationale: newAccrual.notes || "Manually added by accountant.", signals: [{ type: "Manual", detail: "Added by " + (selectedProperty?.accountant || "accountant") }], sourceEvidence: { type: "Manual Entry", addedBy: selectedProperty?.accountant || "Accountant", date: new Date().toLocaleDateString(), notes: newAccrual.notes }, lastInvoice: "N/A", trend: [] };
    setCustomAccruals(prev => [...prev, entry]);
    setAccrualStates(prev => ({ ...prev, [id]: "suggested" }));
    setNewAccrual({ vendor: "", glCode: "", amount: "", sourceType: "pm-email", notes: "", priority: "medium" });
    setShowAddModal(false);
  };

  const parseUpload = async () => {
    if (!uploadText.trim() || parseLoading) return;
    setParseLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You extract accrual line items from text. The text may be an email, invoice summary, spreadsheet paste, or free-form notes from a property manager.\n\nReturn ONLY a JSON array of objects with these fields:\n- vendor (string)\n- glCode (string, use standard RE GL codes like "6210 — R&M HVAC" if you can infer, otherwise "TBD")\n- amount (number, best estimate)\n- sourceType (one of: "open-po", "gl-pattern", "contract", "work-order", "pm-email", "utility-model")\n- notes (string, brief context)\n- priority (one of: "high", "medium", "low")\n\nIf amounts are unclear, estimate conservatively. Return valid JSON only, no markdown.`,
          messages: [{ role: "user", content: uploadText }] })
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const items = JSON.parse(cleaned);
      setParsedItems(Array.isArray(items) ? items : []);
    } catch { setParsedItems([]); }
    finally { setParseLoading(false); }
  };

  const addParsedItems = () => {
    parsedItems.forEach((item, i) => {
      const id = 200 + customAccruals.length + i;
      const entry = { id, propertyId: selectedProperty?.id || 1, vendor: item.vendor, glCode: item.glCode || "TBD", amount: Number(item.amount) || 0, confidence: 0, category: "Manual", status: "suggested", priority: item.priority || "medium", sourceType: item.sourceType || "pm-email", rationale: item.notes || "Parsed from uploaded text.", signals: [{ type: "Upload", detail: "Extracted by AI from pasted content" }], sourceEvidence: { type: "AI-Parsed Upload", addedBy: selectedProperty?.accountant || "Accountant", date: new Date().toLocaleDateString(), notes: item.notes }, lastInvoice: "N/A", trend: [] };
      setCustomAccruals(prev => [...prev, entry]);
      setAccrualStates(prev => ({ ...prev, [id]: "suggested" }));
    });
    setParsedItems([]); setUploadText(""); setUploadMode(false); setShowAddModal(false);
  };

  const setAccrualStatus = useCallback((id, s) => setAccrualStates(prev => ({ ...prev, [id]: s })), []);
  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
  const propertyAccruals = selectedProperty ? [...ACCRUALS.filter(a => a.propertyId === selectedProperty.id), ...customAccruals.filter(a => a.propertyId === selectedProperty.id)] : [];
  const approvedCount = propertyAccruals.filter(a => accrualStates[a.id] === "approved").length;
  const dismissedCount = propertyAccruals.filter(a => accrualStates[a.id] === "dismissed").length;
  const pendingCount = propertyAccruals.filter(a => accrualStates[a.id] === "suggested").length;
  const approvedTotal = propertyAccruals.filter(a => accrualStates[a.id] === "approved").reduce((s, a) => s + (editAmounts[a.id] ?? a.amount), 0);

  const singleActuals = ACTUALS_DATA.filter(a => !a.spread);
  const multiActuals = ACTUALS_DATA.filter(a => a.spread);
  const reconciledCount = Object.values(reconcileStates).filter(s => s === "reconciled").length;
  const currentFromSpreads = multiActuals.reduce((s, a) => s + (a.spread.schedule.find(p => p.status === "current")?.amount || 0), 0);

  // Source breakdown for dashboard
  const sourceCounts = {};
  propertyAccruals.forEach(a => { sourceCounts[a.sourceType] = (sourceCounts[a.sourceType] || 0) + 1; });

  // ——— Dashboard ———
  if (view === "dashboard") {
    return (
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</div><div><div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>Stackpoint</div><div style={{ fontSize: 11, color: "#64748b" }}>AI Property Accounting</div></div></div>
          <div style={{ padding: "6px 14px", borderRadius: 8, background: "#f1f5f9", fontSize: 13, fontWeight: 500, color: "#334155" }}>📅 {pLabel}</div>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[{ label: "AI Suggestions", value: ACCRUALS.length, sub: `${pendingCount} pending review`, icon: "🤖", accent: "#6366f1" }, { label: "Approved", value: approvedCount, sub: Dl(approvedTotal) + " total", icon: "✅", accent: "#22c55e" }, { label: "Source Types", value: Object.keys(sourceCounts).length, sub: "signal categories", icon: "🔍", accent: "#8b5cf6" }, { label: "Time Saved", value: "~18 hrs", sub: "vs. manual process", icon: "⏱️", accent: "#f59e0b" }].map((c, i) => <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e2e8f0" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{c.label}</div><span style={{ fontSize: 18 }}>{c.icon}</span></div><div style={{ fontSize: 22, fontWeight: 700, color: c.accent, marginBottom: 2 }}>{c.value}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{c.sub}</div></div>)}
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}><div style={{ fontWeight: 600, fontSize: 15 }}>Properties — {pLabel} Close</div></div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f8fafc" }}>{["Property", "Type", "Market", "Accountant", "Accruals"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
              <tbody>{PROPERTIES.map(p => <tr key={p.id} onClick={() => { setSelectedProperty(p); setView("property"); setActiveTab("accruals"); setChatOpen(false); setExpandedAccrual(null); }} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px" }}><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{p.units}</div></td>
                <td style={{ padding: "12px 16px" }}><Badge color="gray">{p.type}</Badge></td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>{p.market}</td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>{p.accountant}</td>
                <td style={{ padding: "12px 16px" }}>{ACCRUALS.filter(a => a.propertyId === p.id).length} suggestions</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ——— Property View ———
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => { setView("dashboard"); setChatOpen(false); }} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#475569" }}>← Back</button>
        <div style={{ marginRight: 8 }}><div style={{ fontWeight: 700, fontSize: 16 }}>{selectedProperty?.name}</div><div style={{ fontSize: 12, color: "#64748b" }}>{selectedProperty?.units} · {selectedProperty?.market} · {selectedProperty?.accountant}</div></div>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 2, gap: 1 }}>
          {PERIODS.map(p => <button key={p.key} onClick={() => setSelectedPeriod(p.key)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: selectedPeriod === p.key ? 600 : 400, cursor: "pointer", background: selectedPeriod === p.key ? "#fff" : "transparent", color: selectedPeriod === p.key ? "#0f172a" : "#94a3b8", boxShadow: selectedPeriod === p.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none", position: "relative" }}>{p.short}{p.status === "active" && <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: 99, background: "#22c55e" }} />}</button>)}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
            {[{ key: "accruals", label: "Estimate", icon: "🤖" }, { key: "reconcile", label: "Reconcile", icon: "🔄" }].map(t => <button key={t.key} onClick={() => { setActiveTab(t.key); setExpandedAccrual(null); setExpandedActual(null); }} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: activeTab === t.key ? "#fff" : "transparent", color: activeTab === t.key ? "#0f172a" : "#64748b", fontWeight: activeTab === t.key ? 600 : 500, fontSize: 13, cursor: "pointer", boxShadow: activeTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}</button>)}
          </div>
          <button onClick={() => setChatOpen(v => !v)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: chatOpen ? "#6366f1" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: chatOpen ? "inset 0 1px 4px rgba(0,0,0,0.2)" : "0 2px 8px rgba(99,102,241,0.3)" }}>🤖 {chatOpen ? "Close" : "AI Copilot"}</button>
        </div>
      </div>

      <div style={{ maxWidth: chatOpen ? 720 : 1100, margin: "0 auto", padding: "20px 24px", transition: "max-width 0.3s" }}>

        {/* ——— ACCRUALS TAB ——— */}
        {activeTab === "accruals" && (<>
          {/* Source breakdown bar */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Accrual Sources — {pLabel}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>{propertyAccruals.length} suggestions from {Object.keys(sourceCounts).length} source types</span>
              <button onClick={() => setShowAddModal(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px dashed #c7d2fe", background: "#eef2ff", color: "#4338ca", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>+ Add Accrual</button>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.entries(sourceCounts).map(([type, count]) => {
                const src = SOURCE_TYPES[type];
                return <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 14 }}>{src.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{src.label}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>×{count}</span>
                </div>;
              })}
            </div>
          </div>

          {/* Add Accrual Modal */}
          {showAddModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setShowAddModal(false); setUploadMode(false); setParsedItems([]); }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Add Accrual</div>
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 2 }}>
                  <button onClick={() => { setUploadMode(false); setParsedItems([]); }} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: !uploadMode ? "#fff" : "transparent", color: !uploadMode ? "#0f172a" : "#64748b", fontWeight: !uploadMode ? 600 : 400, fontSize: 12, cursor: "pointer", boxShadow: !uploadMode ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>Manual Entry</button>
                  <button onClick={() => setUploadMode(true)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: uploadMode ? "#fff" : "transparent", color: uploadMode ? "#0f172a" : "#64748b", fontWeight: uploadMode ? 600 : 400, fontSize: 12, cursor: "pointer", boxShadow: uploadMode ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>Paste & Parse</button>
                </div>
              </div>

              {!uploadMode ? (
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Vendor *</label><input value={newAccrual.vendor} onChange={e => setNewAccrual(p => ({ ...p, vendor: e.target.value }))} placeholder="e.g. Smith Electrical" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Amount *</label><div style={{ display: "flex", alignItems: "center" }}><span style={{ position: "absolute", marginLeft: 10, color: "#94a3b8", fontSize: 14 }}>$</span><input type="number" value={newAccrual.amount} onChange={e => setNewAccrual(p => ({ ...p, amount: e.target.value }))} placeholder="0" style={{ width: "100%", padding: "9px 12px 9px 24px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>GL Code</label><input value={newAccrual.glCode} onChange={e => setNewAccrual(p => ({ ...p, glCode: e.target.value }))} placeholder="e.g. 6210 — R&M HVAC" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Priority</label><select value={newAccrual.priority} onChange={e => setNewAccrual(p => ({ ...p, priority: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" }}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                  </div>
                  <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Source Type</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(SOURCE_TYPES).map(([key, src]) => (
                        <button key={key} onClick={() => setNewAccrual(p => ({ ...p, sourceType: key }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${newAccrual.sourceType === key ? "#6366f1" : "#e2e8f0"}`, background: newAccrual.sourceType === key ? "#eef2ff" : "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: newAccrual.sourceType === key ? "#4338ca" : "#475569", fontWeight: newAccrual.sourceType === key ? 600 : 400 }}>{src.icon} {src.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Notes / Rationale</label><textarea value={newAccrual.notes} onChange={e => setNewAccrual(p => ({ ...p, notes: e.target.value }))} placeholder="Why are you adding this accrual? Reference emails, work orders, conversations..." rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} /></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={addManualAccrual} disabled={!newAccrual.vendor || !newAccrual.amount} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: !newAccrual.vendor || !newAccrual.amount ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: !newAccrual.vendor || !newAccrual.amount ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: !newAccrual.vendor || !newAccrual.amount ? "default" : "pointer" }}>Add Accrual</button>
                    <button onClick={() => setShowAddModal(false)} style={{ padding: "11px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Paste email, invoice text, spreadsheet data, or PM notes</label>
                    <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} placeholder={"Example:\n\nHi Sarah,\n\nJust wanted to flag a few things for January close:\n- We had Apex Electric out to replace the lobby panel — should be around $4,500\n- The snow removal bill from NorthStar will be higher this month, probably $8,200 (vs. $6,000 budget)\n- Don't forget the annual fire alarm inspection — Allied Fire, $2,800\n\nThanks,\nTom"} rows={8} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box" }} />
                  </div>
                  <button onClick={parseUpload} disabled={!uploadText.trim() || parseLoading} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: !uploadText.trim() || parseLoading ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: !uploadText.trim() || parseLoading ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: !uploadText.trim() || parseLoading ? "default" : "pointer", marginBottom: 14 }}>
                    {parseLoading ? "🤖 Parsing with AI..." : "🤖 Extract Accruals with AI"}
                  </button>

                  {parsedItems.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>✓ Found {parsedItems.length} accrual{parsedItems.length > 1 ? "s" : ""}:</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                        {parsedItems.map((item, i) => {
                          const src = SOURCE_TYPES[item.sourceType] || SOURCE_TYPES["pm-email"];
                          return <div key={i} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{item.vendor}</span>
                                <Badge color={src.color}>{src.icon} {src.label}</Badge>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: 14, color: "#6366f1" }}>{Dl(item.amount)}</span>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{item.glCode} · {item.notes}</div>
                          </div>;
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={addParsedItems} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Add All {parsedItems.length} Accruals</button>
                        <button onClick={() => setParsedItems([])} style={{ padding: "11px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>Discard</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>}

          {/* Progress */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Review Progress</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>{approvedCount + dismissedCount}/{propertyAccruals.length} · <strong style={{ color: "#22c55e" }}>{Dl(approvedTotal)}</strong> approved</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#e2e8f0", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${(approvedCount / propertyAccruals.length) * 100}%`, background: "#22c55e", transition: "width 0.4s" }} />
              <div style={{ width: `${(dismissedCount / propertyAccruals.length) * 100}%`, background: "#94a3b8", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Accrual Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {propertyAccruals.sort((a, b) => ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[a.id]] ?? 0) - ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[b.id]] ?? 0) || b.confidence - a.confidence).map(acc => {
              const st = accrualStates[acc.id], isExp = expandedAccrual === acc.id, amt = editAmounts[acc.id] ?? acc.amount;
              const src = SOURCE_TYPES[acc.sourceType];

              return (<div key={acc.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${st === "approved" ? "#bbf7d0" : "#e2e8f0"}`, opacity: st === "dismissed" ? 0.5 : 1, transition: "all 0.2s" }}>
                {/* Row */}
                <div onClick={() => setExpandedAccrual(isExp ? null : acc.id)} style={{ padding: "14px 20px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 90px 100px 140px" : "1fr 110px 130px 200px", alignItems: "center", gap: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{acc.vendor}</span>
                      <Badge color={src.color}>{src.icon} {src.label}</Badge>
                      <Badge color={{ high: "red", medium: "amber", low: "gray" }[acc.priority]}>{acc.priority}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{acc.glCode}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: st === "dismissed" ? "#94a3b8" : "#0f172a", textDecoration: st === "dismissed" ? "line-through" : "none" }}>{Dl(amt)}</div>
                  <ConfBar value={acc.confidence} />
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexShrink: 0 }}>
                    {st === "suggested" && <><button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "approved"); }} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>✓ Approve</button><button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "dismissed"); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>✕</button></>}
                    {st !== "suggested" && <button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "suggested"); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>↩</button>}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExp && (
                  <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px", background: "#fafbfc" }}>
                    <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 20 }}>
                      {/* Left: Source Evidence & Rationale */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{src.icon} Source: {src.label}</div>
                        <div style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", marginBottom: 14 }}>
                          {Object.entries(acc.sourceEvidence).map(([k, v]) => (
                            k !== "type" && <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f8fafc", fontSize: 12 }}>
                              <span style={{ color: "#64748b", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span style={{ fontWeight: 500, color: "#0f172a", maxWidth: "60%", textAlign: "right" }}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>AI Rationale</div>
                        <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: "0 0 12px 0" }}>{acc.rationale}</p>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Evidence Signals</div>
                        {acc.signals.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12 }}><Badge color="gray">{s.type}</Badge><span style={{ color: "#475569" }}>{s.detail}</span></div>)}
                      </div>

                      {/* Right: Actions & Adjust */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>⚡ Workflow Actions</div>
                        <div style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Actions available for <strong>{src.label}</strong> source type:</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {src.actions.map(action => (
                              <SourceAction key={action} action={action} sourceType={acc.sourceType} accrualId={acc.id} actionStates={actionStates} setActionStates={setActionStates} />
                            ))}
                          </div>
                          {/* Conditional workflows based on source */}
                          {acc.sourceType === "open-po" && (
                            <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 6, background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 11, color: "#1e40af" }}>
                              💡 PO {acc.sourceEvidence.poNumber} is open with goods received. If vendor confirms no invoice is forthcoming, close the PO and dismiss this accrual.
                            </div>
                          )}
                          {acc.sourceType === "pm-email" && !acc.sourceEvidence.verified && (
                            <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 6, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
                              ⚠️ This accrual is based on unverified communication. No PO or invoice exists in the system. Verify with PM and create a PO before approving.
                            </div>
                          )}
                          {acc.sourceType === "work-order" && acc.sourceEvidence.status !== "Completed" && (
                            <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 6, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
                              ⚠️ Work order {acc.sourceEvidence.woNumber} is in "{acc.sourceEvidence.status}" status. Final amount may change once vendor is selected and scope is confirmed.
                            </div>
                          )}
                        </div>

                        {/* Amount Adjustment */}
                        {st !== "dismissed" && (
                          <div style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Adjust Amount</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 18, color: "#64748b" }}>$</span>
                              <input type="number" value={amt} onChange={e => setEditAmounts(prev => ({ ...prev, [acc.id]: Number(e.target.value) }))} onClick={e => e.stopPropagation()} style={{ width: 130, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, fontWeight: 600, outline: "none" }} />
                              {amt !== acc.amount && <span style={{ fontSize: 12, color: "#f59e0b" }}>{amt > acc.amount ? "↑" : "↓"} {Dl(Math.abs(amt - acc.amount))}</span>}
                            </div>
                          </div>
                        )}
                        {st === "suggested" && (
                          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            <button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "approved"); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Approve {Dl(amt)}</button>
                            <button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "dismissed"); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>✕ Dismiss</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>);
            })}
          </div>
          {pendingCount > 0 && <div style={{ marginTop: 20, textAlign: "center" }}><button onClick={() => propertyAccruals.forEach(a => { if (accrualStates[a.id] === "suggested") setAccrualStatus(a.id, "approved"); })} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>✓ Approve All ({pendingCount})</button></div>}
        </>)}

        {/* ——— RECONCILE TAB ——— */}
        {activeTab === "reconcile" && (<>
          <div style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", borderRadius: 12, border: "1px solid #bbf7d0", padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 16, color: "#065f46" }}>Reconciling: {pLabel}</div><div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Matching actuals against accrual estimates</div></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#059669" }}>{pLabel} P&L</div><div style={{ fontSize: 18, fontWeight: 700, color: "#065f46" }}>{Dl(singleActuals.reduce((s, a) => s + a.actualAmount, 0) + currentFromSpreads)}</div></div>
              <div style={{ width: 1, height: 32, background: "#bbf7d0" }} />
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#059669" }}>Deferred</div><div style={{ fontSize: 18, fontWeight: 700, color: "#065f46" }}>{Dl(multiActuals.reduce((s, a) => s + a.actualAmount, 0) - currentFromSpreads)}</div></div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[{ l: "Model Accuracy", v: "96.8%", s: "4/5 within 5%", i: "🎯", a: "#22c55e" }, { l: "Single-Period", v: Dl(singleActuals.reduce((s, a) => s + a.actualAmount, 0)), s: `${singleActuals.length} invoices`, i: "📄", a: "#0ea5e9" }, { l: "Multi-Period", v: Dl(multiActuals.reduce((s, a) => s + a.actualAmount, 0)), s: `${multiActuals.length} to spread`, i: "📅", a: "#8b5cf6" }, { l: "Reconciled", v: `${reconciledCount}/${ACTUALS_DATA.length}`, s: "JEs posted", i: "✅", a: "#22c55e" }].map((c, i) => <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{c.l}</div><span style={{ fontSize: 16 }}>{c.i}</span></div><div style={{ fontSize: 20, fontWeight: 700, color: c.a, marginBottom: 2 }}>{c.v}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{c.s}</div></div>)}
          </div>

          {/* Single-Period */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>📄 Single-Period Invoices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {singleActuals.map(act => {
              const v = act.actualAmount - act.accrualAmount, isExp = expandedActual === act.id, rS = reconcileStates[act.id];
              const sCfg = { matched: { c: "green", l: "Exact Match" }, variance: { c: "amber", l: "Variance" }, unmatched: { c: "red", l: "No Accrual" } }[act.status];
              return (<div key={act.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#e2e8f0"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
                <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "14px 20px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 90px 90px 120px" : "1fr 110px 110px 110px 160px", alignItems: "center", gap: 12 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 14 }}>{act.vendor}</span><Badge color={sCfg.c}>{sCfg.l}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 12, color: "#64748b" }}>{act.glCode} · {act.invoiceNum}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Accrued</div><div style={{ fontWeight: 600, fontSize: 14 }}>{act.accrualAmount ? Dl(act.accrualAmount) : "—"}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Actual</div><div style={{ fontWeight: 700, fontSize: 14 }}>{Dl(act.actualAmount)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Variance</div><div style={{ fontWeight: 600, fontSize: 14, color: v === 0 ? "#22c55e" : Math.abs(v) < (act.accrualAmount || 1) * .05 ? "#f59e0b" : "#ef4444" }}>{v === 0 ? "✓ $0" : `${v > 0 ? "+" : ""}${Dl(v)}`}</div></div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>↩ Undo</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px", background: "#fafbfc" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>🔄 Variance Analysis</div>
                      {act.status === "matched" && <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>Exact match — zero variance.</p>}
                      {act.status === "variance" && <><p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: "0 0 8px" }}>Actual was <strong style={{ color: v > 0 ? "#dc2626" : "#059669" }}>{Dl(Math.abs(v))} {v > 0 ? "over" : "under"}</strong>.</p>{act.notes && <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>💡 {act.notes}</div>}</>}
                      {act.status === "unmatched" && <><div style={{ padding: "8px 12px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 12, color: "#991b1b", marginBottom: 8 }}>⚠️ No accrual existed. Full {Dl(act.actualAmount)} is a P&L surprise.</div>{act.notes && <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{act.notes}</p>}<div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "#ede9fe", border: "1px solid #ddd6fe", fontSize: 11, color: "#5b21b6" }}>🧠 Model will add this expense type to the watchlist for future periods.</div></>}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📝 Journal Entry</div>
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        {act.accrualAmount > 0 && <><div style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#475569" }}>Reverse Accrual</div><table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>2100 — Accrued Expenses</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(act.accrualAmount)}</td><td style={{ padding: "6px 12px" }}></td></tr><tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>{act.glCode}</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(act.accrualAmount)}</td></tr></tbody></table></>}
                        <div style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: act.accrualAmount > 0 ? "1px solid #e2e8f0" : "none", fontSize: 11, fontWeight: 600, color: "#475569" }}>Book Actual</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>{act.glCode}</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td><td></td></tr><tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>2000 — AP</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr></tbody></table>
                        {v !== 0 && act.accrualAmount > 0 && <div style={{ padding: "8px 12px", background: v > 0 ? "#fef3c7" : "#dcfce7", borderTop: "1px solid #e2e8f0", fontSize: 12, color: v > 0 ? "#92400e" : "#166534" }}><strong>Net:</strong> {v > 0 ? "+" : ""}{Dl(v)} to P&L</div>}
                      </div>
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>

          {/* Multi-Period */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>📅 Multi-Period Invoices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {multiActuals.map(act => {
              const sp = act.spread, curAmt = sp.schedule.find(p => p.status === "current")?.amount || 0;
              const isExp = expandedActual === act.id, rS = reconcileStates[act.id];
              const mLabel = { "straight-line": "Straight-Line", milestone: "Milestone", weighted: "Weighted" }[sp.method];
              return (<div key={act.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#c7d2fe"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
                <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "14px 20px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 90px 90px 120px" : "1fr 110px 110px 110px 160px", alignItems: "center", gap: 12 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 14 }}>{act.vendor}</span><Badge color="purple">Multi-Period</Badge><Badge color="cyan">{mLabel}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 12, color: "#64748b" }}>{act.glCode} · {sp.startMonth} → {sp.endMonth}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Total</div><div style={{ fontWeight: 700, fontSize: 14 }}>{Dl(act.actualAmount)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>{pLabel}</div><div style={{ fontWeight: 700, fontSize: 14, color: "#6366f1" }}>{Dl(curAmt)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Deferred</div><div style={{ fontWeight: 600, fontSize: 14, color: "#8b5cf6" }}>{Dl(act.actualAmount - curAmt)}</div></div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>↩ Undo</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #e0e7ff", padding: "16px 20px", background: "#fafbfe" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📅 Allocation — {mLabel}</div>
                      {act.notes && <div style={{ padding: "8px 12px", borderRadius: 8, background: "#ede9fe", border: "1px solid #ddd6fe", fontSize: 12, color: "#5b21b6", marginBottom: 12 }}>💡 {act.notes}</div>}
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                          <thead><tr style={{ background: "#f8fafc" }}><th style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontSize: 11 }}>Period</th><th style={{ padding: "8px 12px", textAlign: "right", color: "#64748b", fontSize: 11 }}>Amount</th>{sp.method !== "straight-line" && <th style={{ padding: "8px 12px", textAlign: "right", color: "#64748b", fontSize: 11 }}>{sp.method === "milestone" ? "Trigger" : "Weight"}</th>}<th style={{ padding: "8px 12px", textAlign: "center", color: "#64748b", fontSize: 11 }}>Status</th></tr></thead>
                          <tbody>{sp.schedule.map((r, i) => <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: r.status === "current" ? "#f0fdf4" : "transparent" }}><td style={{ padding: "8px 12px", fontWeight: r.status === "current" ? 600 : 400 }}>{r.month}</td><td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(r.amount)}</td>{sp.method !== "straight-line" && <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, color: "#64748b" }}>{r.milestone || r.weight || ""}</td>}<td style={{ padding: "8px 12px", textAlign: "center" }}>{r.status === "current" ? <Badge color="green">Current</Badge> : <Badge color="gray">Future</Badge>}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📝 Journal Entries — {pLabel}</div>
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 10 }}>
                        <div style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#475569" }}>1. Book to Prepaid</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>{sp.glPrepaid}</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td><td></td></tr><tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>2000 — AP</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr></tbody></table>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#f0fdf4", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#065f46" }}>2. {pLabel} Amortization</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>{act.glCode}</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td><td></td></tr><tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>{sp.glPrepaid}</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td></tr></tbody></table>
                        <div style={{ padding: "8px 12px", background: "#f0fdf4", borderTop: "1px solid #e2e8f0", fontSize: 12, color: "#065f46" }}><strong>P&L:</strong> {Dl(curAmt)} · <strong>Prepaid:</strong> {Dl(act.actualAmount - curAmt)}</div>
                      </div>
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>

          {Object.values(reconcileStates).some(s => s === "pending") && <div style={{ textAlign: "center" }}><button onClick={() => { const n = {}; ACTUALS_DATA.forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(5,150,105,0.3)" }}>✓ Post All ({ACTUALS_DATA.length - reconciledCount} remaining)</button></div>}
        </>)}
      </div>

      {chatOpen && selectedProperty && <AIChatPanel property={selectedProperty} accruals={propertyAccruals} accrualStates={accrualStates} actualsData={ACTUALS_DATA} activeTab={activeTab} selectedPeriod={selectedPeriod} onClose={() => setChatOpen(false)} />}
    </div>
  );
}