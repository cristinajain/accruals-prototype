import { useState, useCallback, useRef, useEffect } from "react";

const PROPERTIES = [
  { id: 1, name: "Park Avenue Tower", type: "Office", units: "245K sqft", market: "NYC", accountant: "Sarah Chen", status: "review", accruals: 12, approved: 4, total: "$187,420" },
  { id: 2, name: "Riverside Commons", type: "Multifamily", units: "312 units", market: "Austin", accountant: "Mike Torres", status: "review", accruals: 8, approved: 6, total: "$94,650" },
  { id: 3, name: "Harbor Industrial Park", type: "Industrial", units: "180K sqft", market: "Chicago", accountant: "Sarah Chen", status: "pending", accruals: 15, approved: 0, total: "$312,800" },
  { id: 4, name: "Oakwood Apartments", type: "Multifamily", units: "198 units", market: "Denver", accountant: "Lisa Park", status: "complete", accruals: 6, approved: 6, total: "$52,100" },
  { id: 5, name: "Meridian Office Campus", type: "Office", units: "410K sqft", market: "Atlanta", accountant: "Mike Torres", status: "pending", accruals: 18, approved: 0, total: "$445,200" },
];

const ACCRUALS = [
  { id: 1, propertyId: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", amount: 14200, confidence: 96, category: "Recurring", status: "suggested", priority: "high", rationale: "Monthly HVAC maintenance invoiced every month for 23 consecutive months. December invoice ($14,200) received on avg day 8. January invoice not yet received — 6 days past expected.", signals: [{ type: "GL History", detail: "23/24 months invoiced, avg $14,150, σ = $340" }, { type: "AP Aging", detail: "No open PO or pending invoice from Metro HVAC" }, { type: "Seasonal Adj.", detail: "Winter months avg 3% higher — adjusted from $14,150 → $14,200" }], lastInvoice: "Dec 2025 — $14,150", trend: [13800, 14100, 14200, 13900, 14300, 14150] },
  { id: 2, propertyId: 1, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", amount: 31500, confidence: 91, category: "Utility", status: "suggested", priority: "high", rationale: "Electric utility bill follows consistent seasonal pattern. January is historically 12% above annual average due to heating load.", signals: [{ type: "GL History", detail: "36/36 months invoiced, Jan avg $31,200" }, { type: "Seasonal Model", detail: "Winter uplift factor 1.12x applied to base $28,100" }], lastInvoice: "Dec 2025 — $28,400", trend: [26200, 27800, 31200, 28900, 25100, 28400] },
  { id: 3, propertyId: 1, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", amount: 8750, confidence: 94, category: "Recurring", status: "approved", priority: "medium", rationale: "Security contract renewed Oct 2025 at $8,750/mo. Invoiced consistently on the 15th.", signals: [{ type: "Contract", detail: "12-mo contract, $8,750/mo, renewed Oct 2025" }, { type: "GL History", detail: "36/36 months, new rate for 3 months" }], lastInvoice: "Dec 2025 — $8,750", trend: [8200, 8200, 8200, 8750, 8750, 8750] },
  { id: 4, propertyId: 1, vendor: "ProClean Janitorial", glCode: "6220 — Cleaning Services", amount: 6800, confidence: 89, category: "Recurring", status: "suggested", priority: "medium", rationale: "Janitorial service invoiced monthly. Amount varies slightly based on overtime hours.", signals: [{ type: "GL History", detail: "18/18 months invoiced, avg $6,680, σ = $420" }, { type: "Work Orders", detail: "2 extra floor cleanings requested in Jan" }], lastInvoice: "Dec 2025 — $6,550", trend: [6400, 6800, 6500, 6900, 6700, 6550] },
  { id: 5, propertyId: 1, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", amount: 4200, confidence: 97, category: "Recurring", status: "suggested", priority: "low", rationale: "Fixed-price elevator maintenance contract. Same amount every month for 2+ years.", signals: [{ type: "Contract", detail: "24-mo contract, $4,200/mo fixed, expires Aug 2026" }], lastInvoice: "Dec 2025 — $4,200", trend: [4200, 4200, 4200, 4200, 4200, 4200] },
  { id: 6, propertyId: 1, vendor: "Unknown — Roof Repair", glCode: "6240 — R&M Roof", amount: 22000, confidence: 62, category: "One-time", status: "suggested", priority: "high", rationale: "Work order WO-4521 opened Jan 3 for emergency roof leak repair, Floor 18. Vendor TBD.", signals: [{ type: "Work Order", detail: "WO-4521: Emergency roof leak, opened Jan 3, status: In Progress" }, { type: "Portfolio Comp", detail: "3 similar roof repairs: $18K, $22K, $26K" }], lastInvoice: "None — new expense", trend: [] },
  { id: 7, propertyId: 1, vendor: "NYC Water Board", glCode: "6120 — Utilities Water", amount: 4850, confidence: 85, category: "Utility", status: "dismissed", priority: "low", rationale: "Quarterly water bill. Last billed Q3 2025 ($4,720).", signals: [{ type: "GL History", detail: "Quarterly billing cycle, last 8 quarters avg $4,680" }], lastInvoice: "Sep 2025 — $4,720 (quarterly)", trend: [4500, 4600, 4650, 4720] },
  { id: 8, propertyId: 1, vendor: "Cushman & Wakefield", glCode: "6500 — Leasing Commissions", amount: 45000, confidence: 72, category: "One-time", status: "suggested", priority: "high", rationale: "New lease signed Jan 12 for Suite 1450. Leasing commission estimated at 5% of $900K.", signals: [{ type: "Lease Event", detail: "New lease executed Jan 12, Suite 1450, 8,200 sqft, $109/sqft" }, { type: "Commission Schedule", detail: "C&W agreement: 5% of Year 1 gross rent" }], lastInvoice: "Oct 2025 — $38,500 (Suite 920 lease)", trend: [] },
];

const ACTUALS_DATA = [
  { id: "a1", accrualId: 3, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", invoiceNum: "INV-AS-2026-0142", invoiceDate: "2026-01-18", receivedDate: "2026-01-22", actualAmount: 8750, accrualAmount: 8750, status: "matched", spread: null },
  { id: "a2", accrualId: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", invoiceNum: "INV-MH-26-0108", invoiceDate: "2026-01-15", receivedDate: "2026-02-03", actualAmount: 14850, accrualAmount: 14200, status: "variance", spread: null },
  { id: "a3", accrualId: 5, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", invoiceNum: "INV-SE-2026-01", invoiceDate: "2026-01-31", receivedDate: "2026-02-05", actualAmount: 4200, accrualAmount: 4200, status: "matched", spread: null },
  { id: "a4", accrualId: 6, vendor: "Skyline Roofing Co.", glCode: "6240 — R&M Roof", invoiceNum: "INV-SR-4521-01", invoiceDate: "2026-02-10", receivedDate: "2026-02-12", actualAmount: 24750, accrualAmount: 22000, status: "variance", notes: "Final scope included additional membrane patching on Floor 17 adjacent area.", spread: null },
  { id: "a5", accrualId: 2, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", invoiceNum: "CONED-2026-01-PAT", invoiceDate: "2026-02-01", receivedDate: "2026-02-08", actualAmount: 32180, accrualAmount: 31500, status: "variance", spread: null },
  { id: "a6", accrualId: null, vendor: "NYC DOB", glCode: "6900 — Permits & Fees", invoiceNum: "DOB-VIOL-2026-0042", invoiceDate: "2026-01-28", receivedDate: "2026-02-14", actualAmount: 3500, accrualAmount: 0, status: "unmatched", notes: "DOB violation penalty for scaffolding permit lapse. No accrual existed.", spread: null },
  // Multi-period invoices
  { id: "a7", accrualId: null, vendor: "Hartford Insurance", glCode: "6410 — Property Insurance", invoiceNum: "HIC-PAT-2026-AN", invoiceDate: "2026-01-15", receivedDate: "2026-01-20", actualAmount: 186000, accrualAmount: 15500, status: "multi-period", notes: "Annual property & liability insurance renewal. Policy period Jan 1 – Dec 31, 2026. Prior year was $15,200/mo ($182,400 annual).", spread: { method: "straight-line", totalAmount: 186000, periods: 12, startMonth: "Jan 2026", endMonth: "Dec 2026", perPeriod: 15500, glPrepaid: "1500 — Prepaid Insurance", schedule: [{ month: "Jan 2026", amount: 15500, status: "current" }, { month: "Feb 2026", amount: 15500, status: "future" }, { month: "Mar 2026", amount: 15500, status: "future" }, { month: "Apr 2026", amount: 15500, status: "future" }, { month: "May 2026", amount: 15500, status: "future" }, { month: "Jun 2026", amount: 15500, status: "future" }, { month: "Jul 2026", amount: 15500, status: "future" }, { month: "Aug 2026", amount: 15500, status: "future" }, { month: "Sep 2026", amount: 15500, status: "future" }, { month: "Oct 2026", amount: 15500, status: "future" }, { month: "Nov 2026", amount: 15500, status: "future" }, { month: "Dec 2026", amount: 15500, status: "future" }] } },
  { id: "a8", accrualId: null, vendor: "Cushman & Wakefield", glCode: "6500 — Leasing Commissions", invoiceNum: "CW-LC-1450-2026", invoiceDate: "2026-02-05", receivedDate: "2026-02-11", actualAmount: 47250, accrualAmount: 45000, status: "multi-period", notes: "Leasing commission for Suite 1450 (Meridian Labs). Per agreement, recognized over lease commencement period: 50% at execution, 25% at tenant occupancy (est. Mar), 25% at rent commencement (est. Apr).", spread: { method: "milestone", totalAmount: 47250, periods: 3, startMonth: "Jan 2026", endMonth: "Apr 2026", perPeriod: null, glPrepaid: "1520 — Deferred Leasing Costs", schedule: [{ month: "Jan 2026", amount: 23625, status: "current", milestone: "Lease execution" }, { month: "Mar 2026", amount: 11812, status: "future", milestone: "Tenant occupancy" }, { month: "Apr 2026", amount: 11813, status: "future", milestone: "Rent commencement" }] } },
  { id: "a9", accrualId: null, vendor: "ABM Facility Services", glCode: "6250 — Landscaping & Grounds", invoiceNum: "ABM-Q1-2026-PAT", invoiceDate: "2026-01-10", receivedDate: "2026-01-14", actualAmount: 13500, accrualAmount: 4500, status: "multi-period", notes: "Q1 2026 landscaping & snow removal contract. Covers Jan–Mar with seasonal weighting: Jan 50% (heavy snow), Feb 30%, Mar 20%.", spread: { method: "weighted", totalAmount: 13500, periods: 3, startMonth: "Jan 2026", endMonth: "Mar 2026", perPeriod: null, glPrepaid: "1510 — Prepaid Services", schedule: [{ month: "Jan 2026", amount: 6750, status: "current", weight: "50%" }, { month: "Feb 2026", amount: 4050, status: "future", weight: "30%" }, { month: "Mar 2026", amount: 2700, status: "future", weight: "20%" }] } },
];

const PERIODS = [
  { key: "2025-11", label: "Nov 2025", short: "Nov '25", status: "closed" },
  { key: "2025-12", label: "Dec 2025", short: "Dec '25", status: "closed" },
  { key: "2026-01", label: "Jan 2026", short: "Jan '26", status: "active" },
  { key: "2026-02", label: "Feb 2026", short: "Feb '26", status: "open" },
  { key: "2026-03", label: "Mar 2026", short: "Mar '26", status: "open" },
];

const SparkLine = ({ data, w = 80, h = 24, color = "#6366f1" }) => {
  if (!data || data.length < 2) return <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
};

const Badge = ({ children, color }) => {
  const c = { green: { bg: "#dcfce7", t: "#166534" }, blue: { bg: "#dbeafe", t: "#1e40af" }, amber: { bg: "#fef3c7", t: "#92400e" }, red: { bg: "#fee2e2", t: "#991b1b" }, gray: { bg: "#f1f5f9", t: "#475569" }, purple: { bg: "#ede9fe", t: "#5b21b6" }, indigo: { bg: "#e0e7ff", t: "#3730a3" }, emerald: { bg: "#d1fae5", t: "#065f46" }, orange: { bg: "#ffedd5", t: "#9a3412" }, cyan: { bg: "#cffafe", t: "#155e75" }, rose: { bg: "#ffe4e6", t: "#9f1239" } }[color] || { bg: "#f1f5f9", t: "#475569" };
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: c.bg, color: c.t, letterSpacing: 0.2, whiteSpace: "nowrap" }}>{children}</span>;
};

const ConfBar = ({ value }) => {
  const color = value >= 90 ? "#22c55e" : value >= 75 ? "#f59e0b" : "#ef4444";
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 48, height: 6, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.4s" }} /></div><span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 32 }}>{value}%</span></div>;
};

const Dl = (n) => n == null ? "—" : "$" + n.toLocaleString();

// ——— AI Chat Panel ———
function AIChatPanel({ property, accruals, accrualStates, actualsData, activeTab, selectedPeriod, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const prevKey = useRef("");

  useEffect(() => {
    const key = activeTab + selectedPeriod;
    if (prevKey.current !== key || messages.length === 0) {
      prevKey.current = key;
      const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
      const g = activeTab === "reconcile"
        ? `I'm ready to help you reconcile **${pLabel}** actuals for **${property.name}**. I can:\n\n• Explain variances — *"Why was HVAC $650 over?"*\n• Handle multi-period spreads — *"Break down the insurance allocation"*\n• Preview journal entries — *"Show me the reversal for ConEd"*\n• Assess model accuracy — *"How accurate were this month's estimates?"*`
        : `I'm your accounting copilot for **${property.name}** (${pLabel}). I can:\n\n• Analyze any accrual — *"Why is the roof repair $22K?"*\n• Compare to history — *"How does Jan compare to last year?"*\n• Create new accruals — *"Add an accrual for $3,200 landscaping"*`;
      setMessages([{ role: "assistant", content: g }]);
    }
  }, [activeTab, selectedPeriod, property.name]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
  const accrualCtx = accruals.map(a => `- ${a.vendor} | GL: ${a.glCode} | Accrued: $${a.amount.toLocaleString()} | Confidence: ${a.confidence}% | Status: ${accrualStates[a.id]} | Category: ${a.category} | Rationale: ${a.rationale}`).join("\n");
  const actualsCtx = actualsData.map(a => {
    const v = a.actualAmount - a.accrualAmount;
    let s = `- ${a.vendor} | GL: ${a.glCode} | Invoice: ${a.invoiceNum} | Actual: $${a.actualAmount.toLocaleString()} | Accrued: $${a.accrualAmount.toLocaleString()} | Variance: ${v >= 0 ? "+" : ""}$${v.toLocaleString()} | Status: ${a.status}`;
    if (a.notes) s += ` | Notes: ${a.notes}`;
    if (a.spread) s += ` | Spread: ${a.spread.method} over ${a.spread.periods} periods (${a.spread.startMonth}–${a.spread.endMonth}), current period amount: $${a.spread.schedule.find(s => s.status === "current")?.amount?.toLocaleString() || "TBD"}, prepaid GL: ${a.spread.glPrepaid}. Schedule: ${a.spread.schedule.map(p => `${p.month}: $${p.amount.toLocaleString()}${p.milestone ? " (" + p.milestone + ")" : ""}${p.weight ? " [" + p.weight + "]" : ""}`).join(", ")}`;
    return s;
  }).join("\n");

  const sysPrompt = `You are an AI accounting copilot in Stackpoint for ${property.name}, reconciling ${pLabel} month-end close.

PROPERTY: ${property.name} (${property.type}, ${property.units}, ${property.market}), Accountant: ${property.accountant}
RECONCILIATION PERIOD: ${pLabel}

PRIOR ACCRUALS:\n${accrualCtx}

ACTUALS RECEIVED:\n${actualsCtx}

MULTI-PERIOD SPREADING RULES:
- Straight-line: Equal monthly amounts, full invoice debits Prepaid, monthly amortization debits Expense / credits Prepaid
- Weighted: Seasonal or usage-based allocation with explicit percentages per period
- Milestone: Recognition tied to events (lease execution, occupancy, rent commencement)
- For the current period (${pLabel}), show what hits this month's P&L vs what goes to Prepaid
- Journal entries for multi-period: (1) Book full invoice: DR Prepaid / CR AP, (2) Current period amortization: DR Expense / CR Prepaid

GUIDELINES:
- Be concise with dollar amounts and GL codes
- When explaining multi-period spreads, show the full allocation schedule
- For journal entries, show complete debit/credit entries with GL codes
- Keep responses under 200 words unless deep analysis requested`;

  const sendMessage = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput(""); setMessages(prev => [...prev, { role: "user", content: q }]); setLoading(true);
    try {
      const hist = messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sysPrompt, messages: [...hist, { role: "user", content: q }] })
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.map(b => b.text || "").join("") || "Sorry, couldn't process that." }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Connection error — please try again." }]); }
    finally { setLoading(false); setTimeout(() => inputRef.current?.focus(), 50); }
  };

  const qas = activeTab === "reconcile"
    ? ["How accurate were estimates?", "Break down insurance spread", "Show HVAC reversal JE", "What about the DOB fine?"]
    : ["What's left to review?", "Why is the roof repair $22K?", "Which are riskiest?", "Compare Jan to Dec"];

  const renderMd = t => t.split("\n").map((ln, i) => {
    const f = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:12px">$1</code>');
    if (/^[•\-]\s/.test(ln)) return <div key={i} style={{ paddingLeft: 12, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: f.replace(/^[•\-]\s*/, "") }} /></div>;
    if (!ln.trim()) return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: f }} />;
  });

  return (
    <div style={{ width: 380, background: "#fff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", right: 0, top: 0, zIndex: 100, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: activeTab === "reconcile" ? "linear-gradient(135deg, #059669, #10b981)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>AI</div>
          <div><div style={{ fontWeight: 600, fontSize: 13 }}>{activeTab === "reconcile" ? "Reconciliation Copilot" : "Accounting Copilot"}</div><div style={{ fontSize: 11, color: "#64748b" }}>{property.name} · {pLabel}</div></div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "88%", padding: "10px 14px", borderRadius: 12, background: m.role === "user" ? "#6366f1" : "#f8fafc", color: m.role === "user" ? "#fff" : "#1e293b", border: m.role === "user" ? "none" : "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.55, borderBottomRightRadius: m.role === "user" ? 4 : 12, borderBottomLeftRadius: m.role === "user" ? 12 : 4 }}>{renderMd(m.content)}</div></div>)}
        {loading && <div style={{ display: "flex" }}><div style={{ padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderBottomLeftRadius: 4 }}><div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: "#94a3b8", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}<style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style></div></div></div>}
        <div ref={bottomRef} />
      </div>
      {messages.length <= 1 && <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>{qas.map((q, i) => <button key={i} onClick={() => setInput(q)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, color: "#6366f1", cursor: "pointer", fontWeight: 500 }}>{q}</button>)}</div>}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask about accruals or variances..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: loading || !input.trim() ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: loading || !input.trim() ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: loading || !input.trim() ? "default" : "pointer" }}>↑</button>
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

  const setAccrualStatus = useCallback((id, s) => setAccrualStates(prev => ({ ...prev, [id]: s })), []);
  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
  const propertyAccruals = selectedProperty ? ACCRUALS.filter(a => a.propertyId === selectedProperty.id) : [];
  const approvedCount = propertyAccruals.filter(a => accrualStates[a.id] === "approved").length;
  const dismissedCount = propertyAccruals.filter(a => accrualStates[a.id] === "dismissed").length;
  const pendingCount = propertyAccruals.filter(a => accrualStates[a.id] === "suggested").length;
  const approvedTotal = propertyAccruals.filter(a => accrualStates[a.id] === "approved").reduce((s, a) => s + (editAmounts[a.id] ?? a.amount), 0);

  // Current period P&L impact from multi-period spreads
  const currentPeriodFromSpreads = ACTUALS_DATA.filter(a => a.spread).reduce((s, a) => {
    const cur = a.spread.schedule.find(p => p.status === "current");
    return s + (cur?.amount || 0);
  }, 0);

  const singlePeriodActuals = ACTUALS_DATA.filter(a => !a.spread);
  const multiPeriodActuals = ACTUALS_DATA.filter(a => a.spread);
  const matchedActuals = singlePeriodActuals.filter(a => a.status === "matched");
  const varianceActuals = singlePeriodActuals.filter(a => a.status === "variance");
  const unmatchedActuals = singlePeriodActuals.filter(a => a.status === "unmatched");
  const totalActualSingle = singlePeriodActuals.reduce((s, a) => s + a.actualAmount, 0);
  const totalAccruedSingle = singlePeriodActuals.reduce((s, a) => s + a.accrualAmount, 0);
  const reconciledCount = Object.values(reconcileStates).filter(s => s === "reconciled").length;
  const avgAcc = singlePeriodActuals.filter(a => a.accrualAmount > 0).reduce((s, a) => s + (1 - Math.abs(a.actualAmount - a.accrualAmount) / a.accrualAmount), 0) / (singlePeriodActuals.filter(a => a.accrualAmount > 0).length || 1) * 100;

  // ——— Dashboard ———
  if (view === "dashboard") {
    return (
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</div>
            <div><div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>Stackpoint</div><div style={{ fontSize: 11, color: "#64748b" }}>AI Property Accounting</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: "#f1f5f9", fontSize: 13, fontWeight: 500, color: "#334155" }}>📅 {pLabel}</div>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#4338ca" }}>SC</div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[{ label: "AI Suggestions", value: ACCRUALS.length, sub: "pending review", icon: "🤖", accent: "#6366f1" }, { label: "Approved", value: approvedCount, sub: `${Dl(approvedTotal)} total`, icon: "✅", accent: "#22c55e" }, { label: "Total Suggested", value: Dl(ACCRUALS.reduce((s, a) => s + a.amount, 0)), sub: "across 5 properties", icon: "💰", accent: "#f59e0b" }, { label: "Time Saved", value: "~18 hrs", sub: "vs. manual process", icon: "⏱️", accent: "#8b5cf6" }].map((c, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{c.label}</div><span style={{ fontSize: 18 }}>{c.icon}</span></div>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.accent, marginBottom: 2 }}>{c.value}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}><div style={{ fontWeight: 600, fontSize: 15 }}>Properties — {pLabel} Close</div></div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f8fafc" }}>{["Property", "Type", "Market", "Accountant", "Status", "Accruals", "Est. Total"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
              <tbody>{PROPERTIES.map(p => {
                const sMap = { complete: "green", review: "amber", pending: "blue" }, sL = { complete: "Complete", review: "In Review", pending: "Not Started" };
                return <tr key={p.id} onClick={() => { setSelectedProperty(p); setView("property"); setActiveTab("accruals"); setChatOpen(false); }} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px" }}><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{p.units}</div></td>
                  <td style={{ padding: "12px 16px" }}><Badge color="gray">{p.type}</Badge></td><td style={{ padding: "12px 16px", color: "#475569" }}>{p.market}</td><td style={{ padding: "12px 16px", color: "#475569" }}>{p.accountant}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={sMap[p.status]}>{sL[p.status]}</Badge></td><td style={{ padding: "12px 16px" }}>{p.approved ?? 0}/{p.accruals}</td><td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.total}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ——— Property View ———
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => { setView("dashboard"); setChatOpen(false); }} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#475569" }}>← Back</button>
        <div style={{ marginRight: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedProperty?.name}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{selectedProperty?.units} · {selectedProperty?.market} · {selectedProperty?.accountant}</div>
        </div>

        {/* Period Selector */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 2, gap: 1 }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setSelectedPeriod(p.key)} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: selectedPeriod === p.key ? 600 : 400, cursor: "pointer",
              background: selectedPeriod === p.key ? "#fff" : "transparent", color: selectedPeriod === p.key ? "#0f172a" : p.status === "closed" ? "#94a3b8" : "#64748b",
              boxShadow: selectedPeriod === p.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none", position: "relative"
            }}>
              {p.short}
              {p.status === "active" && <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: 99, background: "#22c55e" }} />}
              {p.status === "closed" && <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: 99, background: "#94a3b8" }} />}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
            {[{ key: "accruals", label: "Estimate", icon: "🤖" }, { key: "reconcile", label: "Reconcile", icon: "🔄" }].map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setExpandedAccrual(null); setExpandedActual(null); }} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: activeTab === t.key ? "#fff" : "transparent", color: activeTab === t.key ? "#0f172a" : "#64748b", fontWeight: activeTab === t.key ? 600 : 500, fontSize: 13, cursor: "pointer", boxShadow: activeTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <button onClick={() => setChatOpen(v => !v)} style={{ marginLeft: 4, padding: "8px 14px", borderRadius: 10, border: "none", background: chatOpen ? "#6366f1" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: chatOpen ? "inset 0 1px 4px rgba(0,0,0,0.2)" : "0 2px 8px rgba(99,102,241,0.3)" }}>
            🤖 {chatOpen ? "Close" : "AI Copilot"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: chatOpen ? 720 : 1100, margin: "0 auto", padding: "20px 24px", transition: "max-width 0.3s" }}>

        {/* ——— ACCRUALS TAB ——— */}
        {activeTab === "accruals" && (<>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Review Progress — {pLabel}</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>{approvedCount + dismissedCount}/{propertyAccruals.length} reviewed · <strong style={{ color: "#22c55e" }}>{Dl(approvedTotal)}</strong> approved</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#e2e8f0", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${(approvedCount / propertyAccruals.length) * 100}%`, background: "#22c55e", transition: "width 0.4s" }} />
              <div style={{ width: `${(dismissedCount / propertyAccruals.length) * 100}%`, background: "#94a3b8", transition: "width 0.4s" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {propertyAccruals.sort((a, b) => ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[a.id]] ?? 0) - ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[b.id]] ?? 0) || b.confidence - a.confidence).map(acc => {
              const st = accrualStates[acc.id], isExp = expandedAccrual === acc.id, amt = editAmounts[acc.id] ?? acc.amount;
              return (<div key={acc.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${st === "approved" ? "#bbf7d0" : "#e2e8f0"}`, opacity: st === "dismissed" ? 0.55 : 1 }}>
                <div onClick={() => setExpandedAccrual(isExp ? null : acc.id)} style={{ padding: "14px 20px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 110px 90px 160px" : "1fr 140px 100px 80px 200px", alignItems: "center", gap: 12 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}><span style={{ fontWeight: 600, fontSize: 14 }}>{acc.vendor}</span><Badge color={{ Recurring: "indigo", Utility: "blue", "One-time": "purple" }[acc.category]}>{acc.category}</Badge><Badge color={{ high: "red", medium: "amber", low: "gray" }[acc.priority]}>{acc.priority}</Badge></div><div style={{ fontSize: 12, color: "#64748b" }}>{acc.glCode}</div></div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: st === "dismissed" ? "#94a3b8" : "#0f172a", textDecoration: st === "dismissed" ? "line-through" : "none" }}>{Dl(amt)}</div>
                  <ConfBar value={acc.confidence} />{!chatOpen && <SparkLine data={acc.trend} />}
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {st === "suggested" && <><button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "approved"); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>✓ Approve</button><button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "dismissed"); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>✕</button></>}
                    {st !== "suggested" && <button onClick={e => { e.stopPropagation(); setAccrualStatus(acc.id, "suggested"); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>↩</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px", background: "#fafbfc" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>🧠 AI Rationale</div>
                  <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: "0 0 12px 0" }}>{acc.rationale}</p>
                  {acc.signals.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12 }}><Badge color="gray">{s.type}</Badge><span style={{ color: "#475569" }}>{s.detail}</span></div>)}
                </div>}
              </div>);
            })}
          </div>
          {pendingCount > 0 && <div style={{ marginTop: 20, textAlign: "center" }}><button onClick={() => propertyAccruals.forEach(a => { if (accrualStates[a.id] === "suggested") setAccrualStatus(a.id, "approved"); })} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>✓ Approve All ({pendingCount})</button></div>}
        </>)}

        {/* ——— RECONCILE TAB ——— */}
        {activeTab === "reconcile" && (<>
          {/* Period Header */}
          <div style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", borderRadius: 12, border: "1px solid #bbf7d0", padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#065f46" }}>Reconciling: {pLabel}</div>
              <div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Matching actuals received against prior accrual estimates</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#059669" }}>Current Period P&L</div><div style={{ fontSize: 18, fontWeight: 700, color: "#065f46" }}>{Dl(totalActualSingle + currentPeriodFromSpreads)}</div></div>
              <div style={{ width: 1, height: 32, background: "#bbf7d0" }} />
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#059669" }}>Deferred to Future</div><div style={{ fontSize: 18, fontWeight: 700, color: "#065f46" }}>{Dl(multiPeriodActuals.reduce((s, a) => s + a.actualAmount, 0) - currentPeriodFromSpreads)}</div></div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Model Accuracy", value: avgAcc.toFixed(1) + "%", sub: `${matchedActuals.length} exact, ${varianceActuals.length} variance`, icon: "🎯", accent: avgAcc > 95 ? "#22c55e" : "#f59e0b" },
              { label: "Single-Period", value: Dl(totalActualSingle), sub: `variance: ${Dl(totalActualSingle - totalAccruedSingle)}`, icon: "📄", accent: "#0ea5e9" },
              { label: "Multi-Period", value: Dl(multiPeriodActuals.reduce((s, a) => s + a.actualAmount, 0)), sub: `${multiPeriodActuals.length} invoices to spread`, icon: "📅", accent: "#8b5cf6" },
              { label: "Reconciled", value: `${reconciledCount}/${ACTUALS_DATA.length}`, sub: "journal entries posted", icon: "✅", accent: "#22c55e" },
            ].map((c, i) => <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{c.label}</div><span style={{ fontSize: 16 }}>{c.icon}</span></div><div style={{ fontSize: 20, fontWeight: 700, color: c.accent, marginBottom: 2 }}>{c.value}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{c.sub}</div></div>)}
          </div>

          {/* Section: Single-Period */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>📄 Single-Period Invoices <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>— full amount hits {pLabel}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {singlePeriodActuals.map(actual => {
              const v = actual.actualAmount - actual.accrualAmount;
              const vP = actual.accrualAmount > 0 ? ((v / actual.accrualAmount) * 100).toFixed(1) : null;
              const isExp = expandedActual === actual.id, rS = reconcileStates[actual.id];
              const sCfg = { matched: { color: "green", label: "Exact Match" }, variance: { color: "amber", label: "Variance" }, unmatched: { color: "red", label: "No Accrual" } }[actual.status];
              const mAcc = actual.accrualId ? ACCRUALS.find(a => a.id === actual.accrualId) : null;
              return (<div key={actual.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#e2e8f0"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
                <div onClick={() => setExpandedActual(isExp ? null : actual.id)} style={{ padding: "14px 20px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 100px 100px 130px" : "1fr 110px 110px 110px 160px", alignItems: "center", gap: 12 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 14 }}>{actual.vendor}</span><Badge color={sCfg.color}>{sCfg.label}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 12, color: "#64748b" }}>{actual.glCode} · {actual.invoiceNum}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Accrued</div><div style={{ fontWeight: 600, fontSize: 14 }}>{actual.accrualAmount === 0 ? "—" : Dl(actual.accrualAmount)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Actual</div><div style={{ fontWeight: 700, fontSize: 14 }}>{Dl(actual.actualAmount)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Variance</div><div style={{ fontWeight: 600, fontSize: 14, color: v === 0 ? "#22c55e" : Math.abs(v) < (actual.accrualAmount || 1) * 0.05 ? "#f59e0b" : "#ef4444" }}>{v === 0 ? "✓ $0" : `${v > 0 ? "+" : ""}${Dl(v)}`}{vP && v !== 0 && <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 4 }}>({v > 0 ? "+" : ""}{vP}%)</span>}</div></div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(prev => ({ ...prev, [actual.id]: "reconciled" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(prev => ({ ...prev, [actual.id]: "pending" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>↩ Undo</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px", background: "#fafbfc" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>🔄 Variance Analysis</div>
                      {actual.status === "matched" && <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>Exact match — no variance. AI confidence was {mAcc?.confidence}%.</p>}
                      {actual.status === "variance" && <><p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: "0 0 8px 0" }}>Actual came in <strong style={{ color: v > 0 ? "#dc2626" : "#059669" }}>{Dl(Math.abs(v))} {v > 0 ? "over" : "under"}</strong> ({vP}% variance).</p>{actual.notes && <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>💡 {actual.notes}</div>}</>}
                      {actual.status === "unmatched" && <><div style={{ padding: "8px 12px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 12, color: "#991b1b", marginBottom: 8 }}>⚠️ No accrual existed. Full {Dl(actual.actualAmount)} is a P&L surprise.</div>{actual.notes && <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{actual.notes}</p>}</>}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📝 Journal Entry</div>
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        {actual.accrualAmount > 0 && <><div style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#475569" }}>Reverse Accrual</div><table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>2100 — Accrued Expenses</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(actual.accrualAmount)}</td><td style={{ padding: "6px 12px" }}></td></tr><tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>{actual.glCode}</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(actual.accrualAmount)}</td></tr></tbody></table></>}
                        <div style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: actual.accrualAmount > 0 ? "1px solid #e2e8f0" : "none", fontSize: 11, fontWeight: 600, color: "#475569" }}>Book Actual</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>{actual.glCode}</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(actual.actualAmount)}</td><td></td></tr><tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>2000 — Accounts Payable</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(actual.actualAmount)}</td></tr></tbody></table>
                        {v !== 0 && actual.accrualAmount > 0 && <div style={{ padding: "8px 12px", background: v > 0 ? "#fef3c7" : "#dcfce7", borderTop: "1px solid #e2e8f0", fontSize: 12, color: v > 0 ? "#92400e" : "#166534" }}><strong>Net impact:</strong> {v > 0 ? "+" : ""}{Dl(v)} to {pLabel} P&L</div>}
                      </div>
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>

          {/* Section: Multi-Period Invoices */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>📅 Multi-Period Invoices <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>— spread across future periods</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {multiPeriodActuals.map(actual => {
              const sp = actual.spread;
              const curAmt = sp.schedule.find(p => p.status === "current")?.amount || 0;
              const futAmt = actual.actualAmount - curAmt;
              const isExp = expandedActual === actual.id, rS = reconcileStates[actual.id];
              const methodLabel = { "straight-line": "Straight-Line", milestone: "Milestone", weighted: "Weighted" }[sp.method];

              return (<div key={actual.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#c7d2fe"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
                <div onClick={() => setExpandedActual(isExp ? null : actual.id)} style={{ padding: "14px 20px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 100px 100px 130px" : "1fr 110px 110px 110px 160px", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{actual.vendor}</span>
                      <Badge color="purple">Multi-Period</Badge>
                      <Badge color="cyan">{methodLabel}</Badge>
                      {rS === "reconciled" && <Badge color="emerald">Posted</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{actual.glCode} · {sp.startMonth} → {sp.endMonth} ({sp.periods} periods)</div>
                  </div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Total Invoice</div><div style={{ fontWeight: 700, fontSize: 14 }}>{Dl(actual.actualAmount)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>{pLabel}</div><div style={{ fontWeight: 700, fontSize: 14, color: "#6366f1" }}>{Dl(curAmt)}</div></div>
                  <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Deferred</div><div style={{ fontWeight: 600, fontSize: 14, color: "#8b5cf6" }}>{Dl(futAmt)}</div></div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(prev => ({ ...prev, [actual.id]: "reconciled" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(prev => ({ ...prev, [actual.id]: "pending" })); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>↩ Undo</button>}
                  </div>
                </div>

                {isExp && <div style={{ borderTop: "1px solid #e0e7ff", padding: "16px 20px", background: "#fafbfe" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 20 }}>
                    {/* Allocation Schedule */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📅 Allocation Schedule — {methodLabel}</div>
                      {actual.notes && <div style={{ padding: "8px 12px", borderRadius: 8, background: "#ede9fe", border: "1px solid #ddd6fe", fontSize: 12, color: "#5b21b6", marginBottom: 12 }}>💡 {actual.notes}</div>}
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                          <thead><tr style={{ background: "#f8fafc" }}>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11 }}>Period</th>
                            <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 11 }}>Amount</th>
                            {sp.method !== "straight-line" && <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 11 }}>{sp.method === "milestone" ? "Trigger" : "Weight"}</th>}
                            <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, color: "#64748b", fontSize: 11 }}>Status</th>
                          </tr></thead>
                          <tbody>{sp.schedule.map((row, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: row.status === "current" ? "#f0fdf4" : "transparent" }}>
                              <td style={{ padding: "8px 12px", fontWeight: row.status === "current" ? 600 : 400 }}>{row.month}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{Dl(row.amount)}</td>
                              {sp.method !== "straight-line" && <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, color: "#64748b" }}>{row.milestone || row.weight || ""}</td>}
                              <td style={{ padding: "8px 12px", textAlign: "center" }}>{row.status === "current" ? <Badge color="green">This Period</Badge> : <Badge color="gray">Future</Badge>}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                        <div style={{ padding: "8px 12px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b" }}>Total</span><span style={{ fontWeight: 700 }}>{Dl(actual.actualAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Journal Entries */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📝 Journal Entries — {pLabel}</div>
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#475569" }}>1. Book Full Invoice to Prepaid</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody>
                          <tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>{sp.glPrepaid}</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(actual.actualAmount)}</td><td style={{ padding: "6px 12px" }}></td></tr>
                          <tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>2000 — Accounts Payable</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(actual.actualAmount)}</td></tr>
                        </tbody></table>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#f0fdf4", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#065f46" }}>2. {pLabel} Amortization</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody>
                          <tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px 12px" }}>{actual.glCode}</td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td><td style={{ padding: "6px 12px" }}></td></tr>
                          <tr><td style={{ padding: "6px 12px", paddingLeft: 24 }}>{sp.glPrepaid}</td><td></td><td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td></tr>
                        </tbody></table>
                        <div style={{ padding: "8px 12px", background: "#f0fdf4", borderTop: "1px solid #e2e8f0", fontSize: 12, color: "#065f46" }}><strong>{pLabel} P&L:</strong> {Dl(curAmt)} · <strong>Prepaid remaining:</strong> {Dl(futAmt)}</div>
                      </div>
                      {rS !== "reconciled" && <button onClick={() => setReconcileStates(prev => ({ ...prev, [actual.id]: "reconciled" }))} style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Post Both Journal Entries</button>}
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>

          {/* Awaiting Invoices */}
          {(() => {
            const noInv = propertyAccruals.filter(a => !ACTUALS_DATA.find(act => act.accrualId === a.id) && accrualStates[a.id] === "approved");
            if (!noInv.length) return null;
            return <div style={{ marginBottom: 24 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>⏳ Still Awaiting Invoices ({noInv.length})</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{noInv.map(a => <div key={a.id} style={{ background: "#fff", borderRadius: 10, border: "1px dashed #d1d5db", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 600, fontSize: 13 }}>{a.vendor}</div><div style={{ fontSize: 12, color: "#64748b" }}>{a.glCode}</div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 600, fontSize: 14 }}>{Dl(editAmounts[a.id] ?? a.amount)}</div><div style={{ fontSize: 11, color: "#f59e0b" }}>Accrual carries forward</div></div></div>)}</div></div>;
          })()}

          {Object.values(reconcileStates).some(s => s === "pending") && <div style={{ textAlign: "center" }}><button onClick={() => { const n = {}; ACTUALS_DATA.forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(5,150,105,0.3)" }}>✓ Post All ({ACTUALS_DATA.length - reconciledCount} remaining)</button></div>}
        </>)}
      </div>

      {chatOpen && selectedProperty && <AIChatPanel property={selectedProperty} accruals={propertyAccruals} accrualStates={accrualStates} actualsData={ACTUALS_DATA} activeTab={activeTab} selectedPeriod={selectedPeriod} onClose={() => setChatOpen(false)} />}
    </div>
  );
}