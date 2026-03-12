import { useState, useCallback, useRef, useEffect } from "react";

const SOURCE_TYPES = {
  "open-po": { label: "Open PO", icon: "📋", color: "blue", actions: ["Follow Up with Vendor", "Confirm Receipt with PM", "Close PO"] },
  "gl-pattern": { label: "GL Pattern", icon: "📊", color: "indigo", actions: ["Wait for Invoice", "Flag if Overdue"] },
  "contract": { label: "Contract", icon: "📄", color: "purple", actions: ["Book per Contract", "Verify Terms"] },
  "work-order": { label: "Work Order", icon: "🔧", color: "amber", actions: ["Confirm Completion", "Get Vendor Quote", "Create PO"] },
  "pm-email": { label: "PM Email", icon: "💬", color: "cyan", actions: ["Verify with PM", "Request Documentation", "Create PO"] },
  "utility-model": { label: "Utility Model", icon: "⚡", color: "emerald", actions: ["Wait for Bill", "Adjust for Occupancy"] },
  "budget": { label: "Budget", icon: "📑", color: "rose", actions: ["Verify with PM", "Adjust Estimate", "Defer to Next Month"] },
  "manual": { label: "Manual", icon: "✏️", color: "gray", actions: ["Verify", "Request Documentation"] },
};

const MONTHS = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"];
const PERIODS = [
  { key: "2026-01", label: "Jan 2026", short: "Jan '26", status: "active" },
  { key: "2026-02", label: "Feb 2026", short: "Feb '26", status: "open" },
  { key: "2026-03", label: "Mar 2026", short: "Mar '26", status: "open" },
  { key: "2026-04", label: "Apr 2026", short: "Apr '26", status: "open" },
];

const BUDGET = {
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

const INIT_ACCRUALS = [
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

const ACTUALS_DATA = [
  { id: "a1", accrualId: 3, vendor: "Allied Security Inc.", glCode: "6350 — Security Services", invoiceNum: "INV-AS-2026-0142", invoiceDate: "2026-01-18", receivedDate: "2026-01-22", actualAmount: 8750, accrualAmount: 8750, status: "matched", spread: null },
  { id: "a2", accrualId: 1, vendor: "Metro HVAC Services", glCode: "6210 — R&M HVAC", invoiceNum: "INV-MH-26-0108", invoiceDate: "2026-01-15", receivedDate: "2026-02-03", actualAmount: 14850, accrualAmount: 14200, status: "variance", spread: null },
  { id: "a3", accrualId: 5, vendor: "Schindler Elevator", glCode: "6230 — Elevator Maintenance", invoiceNum: "INV-SE-2026-01", invoiceDate: "2026-01-31", receivedDate: "2026-02-05", actualAmount: 4200, accrualAmount: 4200, status: "matched", spread: null },
  { id: "a4", accrualId: 6, vendor: "Skyline Roofing Co.", glCode: "6240 — R&M Roof", invoiceNum: "INV-SR-4521-01", invoiceDate: "2026-02-10", receivedDate: "2026-02-12", actualAmount: 24750, accrualAmount: 22000, status: "variance", notes: "Scope expanded — Floor 17 membrane patching.", spread: null },
  { id: "a5", accrualId: 2, vendor: "ConEd — Electric", glCode: "6110 — Utilities Electric", invoiceNum: "CONED-2026-01-PAT", invoiceDate: "2026-02-01", receivedDate: "2026-02-08", actualAmount: 32180, accrualAmount: 31500, status: "variance", spread: null },
  { id: "a6", accrualId: null, vendor: "NYC DOB", glCode: "6900 — Permits & Fees", invoiceNum: "DOB-VIOL-2026-0042", invoiceDate: "2026-01-28", receivedDate: "2026-02-14", actualAmount: 3500, accrualAmount: 0, status: "unmatched", notes: "DOB violation — scaffolding permit lapse.", spread: null },
  { id: "a7", accrualId: null, vendor: "Hartford Insurance", glCode: "6410 — Property Insurance", invoiceNum: "HIC-PAT-2026-AN", invoiceDate: "2026-01-15", receivedDate: "2026-01-20", actualAmount: 186000, accrualAmount: 15500, status: "multi-period", spread: { method: "straight-line", periods: 12, startMonth: "Jan 2026", endMonth: "Dec 2026", glPrepaid: "1500 — Prepaid Insurance", schedule: [{ month: "Jan 2026", amount: 15500, status: "current" }, { month: "Feb 2026", amount: 15500, status: "future" }, { month: "Mar–Dec", amount: 155000, status: "future", note: "10 × $15,500" }] } },
  { id: "a8", accrualId: null, vendor: "ABM Facility Services", glCode: "6250 — Landscaping", invoiceNum: "ABM-Q1-2026", invoiceDate: "2026-01-10", receivedDate: "2026-01-14", actualAmount: 13500, accrualAmount: 4500, status: "multi-period", spread: { method: "weighted", periods: 3, startMonth: "Jan 2026", endMonth: "Mar 2026", glPrepaid: "1510 — Prepaid Services", schedule: [{ month: "Jan 2026", amount: 6750, status: "current", weight: "50%" }, { month: "Feb 2026", amount: 4050, status: "future", weight: "30%" }, { month: "Mar 2026", amount: 2700, status: "future", weight: "20%" }] } },
];

// ——— Components ———
const Badge = ({ children, color }) => {
  const c = { green: { b: "#dcfce7", t: "#166534" }, blue: { b: "#dbeafe", t: "#1e40af" }, amber: { b: "#fef3c7", t: "#92400e" }, red: { b: "#fee2e2", t: "#991b1b" }, gray: { b: "#f1f5f9", t: "#475569" }, purple: { b: "#ede9fe", t: "#5b21b6" }, indigo: { b: "#e0e7ff", t: "#3730a3" }, emerald: { b: "#d1fae5", t: "#065f46" }, cyan: { b: "#cffafe", t: "#155e75" }, rose: { b: "#ffe4e6", t: "#9f1239" }, orange: { b: "#ffedd5", t: "#9a3412" } }[color] || { b: "#f1f5f9", t: "#475569" };
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: c.b, color: c.t, whiteSpace: "nowrap" }}>{children}</span>;
};
const Dl = n => n == null ? "—" : (n < 0 ? "-$" + Math.abs(n).toLocaleString() : "$" + n.toLocaleString());
const ConfBar = ({ value }) => {
  if (value === 0) return <span style={{ fontSize: 11, color: "#94a3b8" }}>Manual</span>;
  const cl = value >= 90 ? "#22c55e" : value >= 75 ? "#f59e0b" : value >= 60 ? "#f97316" : "#ef4444";
  return <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 40, height: 5, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: cl }} /></div><span style={{ fontSize: 11, fontWeight: 600, color: cl }}>{value}%</span></div>;
};
function SourceAction({ action, accrualId, actionStates, setActionStates }) {
  const key = `${accrualId}-${action}`, done = actionStates[key] === "done";
  return <button onClick={e => { e.stopPropagation(); setActionStates(p => ({ ...p, [key]: done ? "available" : "done" })); }} style={{ padding: "4px 9px", borderRadius: 6, border: `1px solid ${done ? "#bbf7d0" : "#e2e8f0"}`, background: done ? "#f0fdf4" : "#fff", color: done ? "#166534" : "#475569", fontSize: 11, cursor: "pointer", opacity: done ? 0.7 : 1, textDecoration: done ? "line-through" : "none" }}>{done ? "✓" : "•"} {action}</button>;
}

// ——— AI Chat ———
function AIChatPanel({ accruals, accrualStates, editAmounts, activeTab, selectedPeriod, journalEntries, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const btm = useRef(null), inp = useRef(null), prevKey = useRef("");
  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;

  useEffect(() => {
    const k = activeTab + selectedPeriod;
    if (prevKey.current !== k || !messages.length) { prevKey.current = k;
      setMessages([{ role: "assistant", content: `Copilot ready for **${pLabel}** — ${activeTab} tab. Ask me anything about accruals, variances, budget comparisons, journal entries, or reconciliation.` }]);
    }
  }, [activeTab, selectedPeriod, pLabel]);
  useEffect(() => { btm.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ctx = accruals.map(a => `- ${a.vendor} | ${a.glCode} | $${(editAmounts[a.id] ?? a.amount).toLocaleString()} | Month: ${a.month} | Status: ${accrualStates[a.id]} | Source: ${SOURCE_TYPES[a.sourceType]?.label} | Conf: ${a.confidence}% | AutoReverse: ${a.autoReverse}${a.movedFrom ? ` | Moved from ${a.movedFrom}` : ""} | ${a.rationale}`).join("\n");
  const jeCtx = journalEntries.length ? journalEntries.map(j => `- ${j.date}: ${j.type} | ${j.vendor} | DR ${j.debitAcct} $${j.debitAmt.toLocaleString()} / CR ${j.creditAcct} $${j.creditAmt.toLocaleString()} | ${j.memo}`).join("\n") : "None yet";
  const budgetCtx = Object.entries(BUDGET).map(([gl, b]) => `- ${gl} (${b.vendor}): Jan $${b.jan.toLocaleString()}, Feb $${b.feb.toLocaleString()}, Mar $${b.mar.toLocaleString()}`).join("\n");

  const send = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput(""); setMessages(p => [...p, { role: "user", content: q }]); setLoading(true);
    try {
      const hist = messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `AI accounting copilot for Park Avenue Tower (245K sqft, NYC). Period: ${pLabel}.\n\nACCRUALS:\n${ctx}\n\nBUDGET:\n${budgetCtx}\n\nJOURNAL ENTRIES:\n${jeCtx}\n\nBe concise, use $ and GL codes. Under 150 words unless asked for detail.`,
          messages: [...hist, { role: "user", content: q }] }) });
      const d = await r.json();
      setMessages(p => [...p, { role: "assistant", content: d.content?.map(b => b.text || "").join("") || "Error." }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "Connection error." }]); }
    finally { setLoading(false); }
  };
  const renderMd = t => t.split("\n").map((ln, i) => {
    const f = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    if (/^[•\-]\s/.test(ln)) return <div key={i} style={{ paddingLeft: 12, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: f.replace(/^[•\-]\s*/, "") }} /></div>;
    if (!ln.trim()) return <div key={i} style={{ height: 6 }} />;
    return <div key={i} style={{ marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: f }} />;
  });
  return (
    <div style={{ width: 370, background: "#fff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", right: 0, top: 0, zIndex: 100, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>AI</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>Copilot</div><div style={{ fontSize: 11, color: "#64748b" }}>{pLabel}</div></div></div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "88%", padding: "9px 13px", borderRadius: 11, background: m.role === "user" ? "#6366f1" : "#f8fafc", color: m.role === "user" ? "#fff" : "#1e293b", border: m.role === "user" ? "none" : "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.5, borderBottomRightRadius: m.role === "user" ? 4 : 11, borderBottomLeftRadius: m.role === "user" ? 12 : 4 }}>{renderMd(m.content)}</div></div>)}
        {loading && <div style={{ display: "flex" }}><div style={{ padding: "9px 13px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e2e8f0", borderBottomLeftRadius: 4 }}><div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: 3, background: "#94a3b8", animation: `pulse 1.2s ease-in-out ${j*.2}s infinite` }} />)}<style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style></div></div></div>}
        <div ref={btm} />
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}><div style={{ display: "flex", gap: 6 }}><input ref={inp} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); }}} placeholder="Ask anything..." style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} /><button onClick={send} disabled={loading || !input.trim()} style={{ padding: "9px 14px", borderRadius: 9, border: "none", background: loading || !input.trim() ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: loading || !input.trim() ? "#94a3b8" : "#fff", fontWeight: 600, cursor: loading || !input.trim() ? "default" : "pointer" }}>↑</button></div></div>
    </div>
  );
}

// ——— Main App ———
export default function App() {
  const [view, setView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("accruals");
  const [selectedPeriod, setSelectedPeriod] = useState("2026-01");
  const [accruals, setAccruals] = useState(INIT_ACCRUALS);
  const [accrualStates, setAccrualStates] = useState(() => { const m = {}; INIT_ACCRUALS.forEach(a => { m[a.id] = a.status; }); return m; });
  const [expandedId, setExpandedId] = useState(null);
  const [editAmounts, setEditAmounts] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [actionStates, setActionStates] = useState({});
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(null);
  const [newAccrual, setNewAccrual] = useState({ vendor: "", glCode: "", amount: "", sourceType: "pm-email", notes: "", priority: "medium" });
  const [reconcileStates, setReconcileStates] = useState(() => { const m = {}; ACTUALS_DATA.forEach(a => { m[a.id] = "pending"; }); return m; });
  const [expandedActual, setExpandedActual] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [parseLoading, setParseLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);

  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
  const monthKey = { "2026-01": "jan", "2026-02": "feb", "2026-03": "mar", "2026-04": "apr" }[selectedPeriod] || "jan";
  const monthAccruals = accruals.filter(a => a.month === pLabel);
  const approvedCount = monthAccruals.filter(a => accrualStates[a.id] === "approved").length;
  const pendingCount = monthAccruals.filter(a => accrualStates[a.id] === "suggested").length;
  const approvedTotal = monthAccruals.filter(a => accrualStates[a.id] === "approved").reduce((s, a) => s + (editAmounts[a.id] ?? a.amount), 0);
  const reconciledCount = Object.values(reconcileStates).filter(s => s === "reconciled").length;

  const setStatus = useCallback((id, s) => {
    setAccrualStates(prev => ({ ...prev, [id]: s }));
    const acc = accruals.find(a => a.id === id);
    if (s === "approved" && acc?.autoReverse) {
      const amt = editAmounts[id] ?? acc.amount;
      const now = new Date().toLocaleDateString();
      const nextMonth = MONTHS[MONTHS.indexOf(acc.month) + 1] || "Next Period";
      setJournalEntries(prev => [...prev,
        { id: `je-acc-${id}`, date: now, type: "Accrual", vendor: acc.vendor, glCode: acc.glCode, debitAcct: acc.glCode, debitAmt: amt, creditAcct: "2100 — Accrued Expenses", creditAmt: amt, memo: `Accrue ${acc.month} — ${acc.vendor}`, period: acc.month },
        { id: `je-rev-${id}`, date: `1st of ${nextMonth}`, type: "Auto-Reverse", vendor: acc.vendor, glCode: acc.glCode, debitAcct: "2100 — Accrued Expenses", debitAmt: amt, creditAcct: acc.glCode, creditAmt: amt, memo: `Auto-reverse ${acc.month} accrual — ${acc.vendor}`, period: nextMonth },
      ]);
    }
    if (s === "suggested" || s === "dismissed") setJournalEntries(prev => prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`));
  }, [accruals, editAmounts]);

  const moveAccrual = (id, toMonth) => {
    setAccruals(prev => prev.map(a => a.id === id ? { ...a, month: toMonth, movedFrom: a.movedFrom || a.month } : a));
    setJournalEntries(prev => prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`));
    setAccrualStates(prev => ({ ...prev, [id]: "suggested" }));
    setShowMoveModal(null);
  };

  const addManualAccrual = () => {
    if (!newAccrual.vendor || !newAccrual.amount) return;
    const id = Date.now();
    setAccruals(prev => [...prev, { id, vendor: newAccrual.vendor, glCode: newAccrual.glCode || "TBD", amount: Number(newAccrual.amount), confidence: 0, sourceType: newAccrual.sourceType, priority: newAccrual.priority, month: pLabel, status: "suggested", rationale: newAccrual.notes || "Manually added.", signals: [{ type: "Manual", detail: "Added by accountant" }], autoReverse: true, movedFrom: null }]);
    setAccrualStates(prev => ({ ...prev, [id]: "suggested" }));
    setNewAccrual({ vendor: "", glCode: "", amount: "", sourceType: "pm-email", notes: "", priority: "medium" });
    setShowAddModal(false);
  };

  const parseUpload = async () => {
    if (!uploadText.trim() || parseLoading) return; setParseLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `Extract accrual items. Return ONLY JSON array: [{vendor, glCode, amount (number), sourceType, notes, priority}]. No markdown.`, messages: [{ role: "user", content: uploadText }] }) });
      const d = await r.json(); setParsedItems(JSON.parse((d.content?.map(b => b.text || "").join("") || "[]").replace(/```json|```/g, "").trim()));
    } catch { setParsedItems([]); } finally { setParseLoading(false); }
  };
  const addParsedItems = () => {
    parsedItems.forEach((item, i) => { const id = Date.now() + i;
      setAccruals(p => [...p, { id, vendor: item.vendor, glCode: item.glCode || "TBD", amount: Number(item.amount) || 0, confidence: 0, sourceType: item.sourceType || "pm-email", priority: item.priority || "medium", month: pLabel, status: "suggested", rationale: item.notes || "AI-parsed.", signals: [{ type: "Upload", detail: "Extracted from pasted content" }], autoReverse: true, movedFrom: null }]);
      setAccrualStates(p => ({ ...p, [id]: "suggested" }));
    }); setParsedItems([]); setUploadText(""); setUploadMode(false); setShowAddModal(false);
  };

  // Variance computation
  const varianceData = Object.entries(BUDGET).map(([glCode, b]) => {
    const budgetVal = b[monthKey] || 0;
    const matchingAccruals = accruals.filter(a => a.glCode === glCode && a.month === pLabel);
    const accrualTotal = matchingAccruals.reduce((s, a) => s + (editAmounts[a.id] ?? a.amount), 0);
    const approvedAmt = matchingAccruals.filter(a => accrualStates[a.id] === "approved").reduce((s, a) => s + (editAmounts[a.id] ?? a.amount), 0);
    const matchingActuals = ACTUALS_DATA.filter(a => a.glCode === glCode);
    const actualTotal = matchingActuals.reduce((s, a) => {
      if (a.spread) return s + (a.spread.schedule.find(p => p.status === "current")?.amount || 0);
      return s + a.actualAmount;
    }, 0);
    const movedItems = matchingAccruals.filter(a => a.movedFrom);
    const budgetVar = accrualTotal - budgetVal;
    const actualVar = actualTotal > 0 ? actualTotal - budgetVal : null;
    return { glCode, vendor: b.vendor, budgetVal, accrualTotal, approvedAmt, actualTotal, budgetVar, actualVar, movedItems, matchingActuals };
  });
  const totBudget = varianceData.reduce((s, v) => s + v.budgetVal, 0);
  const totAccrual = varianceData.reduce((s, v) => s + v.accrualTotal, 0);
  const totActual = varianceData.reduce((s, v) => s + v.actualTotal, 0);
  const totBudgetVar = totAccrual - totBudget;

  const PORTFOLIO = [
    { id: 1, name: "Park Avenue Tower", type: "Office", units: "245K sqft", market: "NYC", accountant: "Sarah Chen", active: true, accrualCount: monthAccruals.length, approvedCount, pendingCount, totalAccrual: totAccrual, totalBudget: totBudget, variance: totBudgetVar, closeStatus: approvedCount > 0 ? "in-review" : "not-started", actualsPosted: reconciledCount, actualsTotal: ACTUALS_DATA.length, daysToClose: 4 },
    { id: 2, name: "Riverside Commons", type: "Multifamily", units: "312 units", market: "Austin", accountant: "Mike Torres", active: false, accrualCount: 11, approvedCount: 9, pendingCount: 2, totalAccrual: 94650, totalBudget: 88200, variance: 6450, closeStatus: "in-review", actualsPosted: 7, actualsTotal: 9, daysToClose: 3 },
    { id: 3, name: "Harbor Industrial Park", type: "Industrial", units: "180K sqft", market: "Chicago", accountant: "Sarah Chen", active: false, accrualCount: 15, approvedCount: 15, pendingCount: 0, totalAccrual: 312800, totalBudget: 305000, variance: 7800, closeStatus: "complete", actualsPosted: 12, actualsTotal: 12, daysToClose: 0 },
    { id: 4, name: "Oakwood Apartments", type: "Multifamily", units: "198 units", market: "Denver", accountant: "Lisa Park", active: false, accrualCount: 8, approvedCount: 8, pendingCount: 0, totalAccrual: 52100, totalBudget: 51000, variance: 1100, closeStatus: "complete", actualsPosted: 6, actualsTotal: 6, daysToClose: 0 },
    { id: 5, name: "Meridian Office Campus", type: "Office", units: "410K sqft", market: "Atlanta", accountant: "Mike Torres", active: false, accrualCount: 18, approvedCount: 4, pendingCount: 14, totalAccrual: 445200, totalBudget: 412000, variance: 33200, closeStatus: "not-started", actualsPosted: 0, actualsTotal: 14, daysToClose: 8 },
    { id: 6, name: "Lakeshore Retail Center", type: "Retail", units: "92K sqft", market: "Minneapolis", accountant: "Lisa Park", active: false, accrualCount: 7, approvedCount: 5, pendingCount: 2, totalAccrual: 68300, totalBudget: 65000, variance: 3300, closeStatus: "in-review", actualsPosted: 4, actualsTotal: 7, daysToClose: 5 },
  ];
  const portfolioTotalBudget = PORTFOLIO.reduce((s, p) => s + p.totalBudget, 0);
  const portfolioTotalAccrual = PORTFOLIO.reduce((s, p) => s + p.totalAccrual, 0);
  const portfolioVariance = portfolioTotalAccrual - portfolioTotalBudget;
  const portfolioComplete = PORTFOLIO.filter(p => p.closeStatus === "complete").length;
  const portfolioInReview = PORTFOLIO.filter(p => p.closeStatus === "in-review").length;
  const portfolioPending = PORTFOLIO.filter(p => p.closeStatus === "not-started").length;
  const portfolioTotalAccruals = PORTFOLIO.reduce((s, p) => s + p.accrualCount, 0);
  const portfolioApproved = PORTFOLIO.reduce((s, p) => s + p.approvedCount, 0);
  const portfolioPendingAccruals = PORTFOLIO.reduce((s, p) => s + p.pendingCount, 0);

  // ——— Dashboard ———
  if (view === "dashboard") return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</div>
          <div><div style={{ fontWeight: 700, fontSize: 16 }}>Stackpoint</div><div style={{ fontSize: 11, color: "#64748b" }}>AI Property Accounting</div></div>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 8, background: "#f1f5f9", fontSize: 13, fontWeight: 500, color: "#334155" }}>📅 {pLabel} Close</div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Portfolio Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Properties", value: PORTFOLIO.length, sub: `${portfolioComplete} closed · ${portfolioInReview} in review · ${portfolioPending} pending`, icon: "🏢", accent: "#6366f1" },
            { label: "Accruals", value: portfolioTotalAccruals, sub: `${portfolioApproved} approved · ${portfolioPendingAccruals} pending`, icon: "🤖", accent: "#8b5cf6" },
            { label: "Total Accrued", value: Dl(portfolioTotalAccrual), sub: `vs ${Dl(portfolioTotalBudget)} budget`, icon: "💰", accent: "#0ea5e9" },
            { label: "Net Variance", value: `${portfolioVariance >= 0 ? "+" : ""}${Dl(portfolioVariance)}`, sub: `${((portfolioVariance / portfolioTotalBudget) * 100).toFixed(1)}% over budget`, icon: "📊", accent: portfolioVariance > 0 ? "#ef4444" : "#22c55e" },
            { label: "Est. Time Saved", value: "~72 hrs", sub: "across portfolio this month", icon: "⏱️", accent: "#f59e0b" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 5 }}>{c.label}</div><span style={{ fontSize: 16 }}>{c.icon}</span></div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.accent, marginBottom: 2 }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Close Progress */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Portfolio Close Progress — {pLabel}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{portfolioComplete}/{PORTFOLIO.length} properties closed</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "#e2e8f0", overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${(portfolioComplete / PORTFOLIO.length) * 100}%`, background: "#22c55e", transition: "width 0.4s" }} />
            <div style={{ width: `${(portfolioInReview / PORTFOLIO.length) * 100}%`, background: "#f59e0b", transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#22c55e" }} /> Closed ({portfolioComplete})</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#f59e0b" }} /> In Review ({portfolioInReview})</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#e2e8f0" }} /> Not Started ({portfolioPending})</div>
          </div>
        </div>

        {/* Accountant Workload */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[...new Set(PORTFOLIO.map(p => p.accountant))].map(name => {
            const props = PORTFOLIO.filter(p => p.accountant === name);
            const pend = props.reduce((s, p) => s + p.pendingCount, 0);
            const done = props.filter(p => p.closeStatus === "complete").length;
            return (
              <div key={name} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#4338ca" }}>{name.split(" ").map(n => n[0]).join("")}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div><div style={{ fontSize: 11, color: "#64748b" }}>{props.length} properties · {pend} accruals pending</div></div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: done === props.length ? "#22c55e" : "#f59e0b" }}>{done}/{props.length} closed</div>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${(done / props.length) * 100}%`, height: "100%", borderRadius: 2, background: "#22c55e" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Property Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Properties</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Click to open property detail</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#f8fafc" }}>
              {["Property", "Type", "Accountant", "Status", "Accruals", "Budget", "Variance", "Actuals"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: h === "Variance" ? "right" : "left", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PORTFOLIO.map(p => {
                const statusCfg = { complete: { color: "green", label: "Closed" }, "in-review": { color: "amber", label: "In Review" }, "not-started": { color: "blue", label: "Not Started" } }[p.closeStatus];
                const varColor = p.variance > 0 ? "#dc2626" : p.variance < 0 ? "#059669" : "#64748b";
                return (
                  <tr key={p.id} onClick={() => { if (p.active) setView("property"); }} style={{ cursor: p.active ? "pointer" : "default", borderBottom: "1px solid #f1f5f9", opacity: p.active ? 1 : 0.85 }} onMouseEnter={e => { if (p.active) e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{p.name} {p.active && <span style={{ fontSize: 10, color: "#6366f1" }}>●</span>}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.units} · {p.market}</div>
                    </td>
                    <td style={{ padding: "11px 14px" }}><Badge color="gray">{p.type}</Badge></td>
                    <td style={{ padding: "11px 14px", color: "#475569" }}>{p.accountant}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                      {p.daysToClose > 0 && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{p.daysToClose}d to close</div>}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontWeight: 600 }}>{p.approvedCount}</span><span style={{ color: "#94a3b8" }}>/{p.accrualCount}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: 50, marginTop: 3 }}><div style={{ width: `${(p.approvedCount / p.accrualCount) * 100}%`, height: "100%", borderRadius: 2, background: "#22c55e" }} /></div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12 }}>{Dl(p.totalBudget)}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: varColor }}>{p.variance >= 0 ? "+" : ""}{Dl(p.variance)}</div>
                      <div style={{ fontSize: 10, color: varColor }}>{p.totalBudget > 0 ? `${((p.variance / p.totalBudget) * 100).toFixed(1)}%` : ""}</div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 12 }}><span style={{ fontWeight: 600 }}>{p.actualsPosted}</span><span style={{ color: "#94a3b8" }}>/{p.actualsTotal}</span> posted</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ——— Property View ———
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => { setView("dashboard"); setChatOpen(false); }} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13, color: "#475569" }}>←</button>
        <div><div style={{ fontWeight: 700, fontSize: 15 }}>Park Avenue Tower</div><div style={{ fontSize: 11, color: "#64748b" }}>245K sqft · NYC · Sarah Chen</div></div>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 2, marginLeft: 12 }}>
          {PERIODS.map(p => <button key={p.key} onClick={() => { setSelectedPeriod(p.key); setExpandedId(null); setExpandedActual(null); }} style={{ padding: "4px 11px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: selectedPeriod === p.key ? 600 : 400, cursor: "pointer", background: selectedPeriod === p.key ? "#fff" : "transparent", color: selectedPeriod === p.key ? "#0f172a" : "#94a3b8", boxShadow: selectedPeriod === p.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none", position: "relative" }}>{p.short}{p.status === "active" && <span style={{ position: "absolute", top: 1, right: 1, width: 5, height: 5, borderRadius: 99, background: "#22c55e" }} />}</button>)}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 9, padding: 2 }}>
            {[{ key: "accruals", label: "Estimate", icon: "🤖" }, { key: "variance", label: "Variance", icon: "📊" }, { key: "reconcile", label: "Reconcile", icon: "🔄" }, { key: "journal", label: "JEs", icon: "📝" }].map(t => <button key={t.key} onClick={() => { setActiveTab(t.key); setExpandedId(null); setExpandedActual(null); }} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: activeTab === t.key ? "#fff" : "transparent", color: activeTab === t.key ? "#0f172a" : "#64748b", fontWeight: activeTab === t.key ? 600 : 500, fontSize: 12, cursor: "pointer", boxShadow: activeTab === t.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none", display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 13 }}>{t.icon}</span>{t.label}</button>)}
          </div>
          <button onClick={() => setChatOpen(v => !v)} style={{ padding: "6px 12px", borderRadius: 9, border: "none", background: chatOpen ? "#6366f1" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>🤖 AI</button>
        </div>
      </div>

      <div style={{ maxWidth: chatOpen ? 700 : 1060, margin: "0 auto", padding: "18px 24px", transition: "max-width 0.3s" }}>

        {/* ——— ESTIMATE TAB ——— */}
        {activeTab === "accruals" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><span style={{ fontWeight: 600, fontSize: 14 }}>{pLabel} Accruals</span><span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>{approvedCount} approved · {pendingCount} pending · {Dl(approvedTotal)}</span></div>
            <button onClick={() => setShowAddModal(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px dashed #c7d2fe", background: "#eef2ff", color: "#4338ca", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ Add Accrual</button>
          </div>

          {showAddModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setShowAddModal(false); setUploadMode(false); setParsedItems([]); }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: 500, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Add Accrual — {pLabel}</div>
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 7, padding: 2 }}>
                  <button onClick={() => { setUploadMode(false); setParsedItems([]); }} style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: !uploadMode ? "#fff" : "transparent", fontWeight: !uploadMode ? 600 : 400, fontSize: 11, cursor: "pointer", color: !uploadMode ? "#0f172a" : "#64748b" }}>Manual</button>
                  <button onClick={() => setUploadMode(true)} style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: uploadMode ? "#fff" : "transparent", fontWeight: uploadMode ? 600 : 400, fontSize: 11, cursor: "pointer", color: uploadMode ? "#0f172a" : "#64748b" }}>Paste & Parse</button>
                </div>
              </div>
              {!uploadMode ? <div style={{ padding: "18px 22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Vendor *</label><input value={newAccrual.vendor} onChange={e => setNewAccrual(p => ({ ...p, vendor: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Amount *</label><input type="number" value={newAccrual.amount} onChange={e => setNewAccrual(p => ({ ...p, amount: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>GL Code</label><input value={newAccrual.glCode} onChange={e => setNewAccrual(p => ({ ...p, glCode: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Source</label><select value={newAccrual.sourceType} onChange={e => setNewAccrual(p => ({ ...p, sourceType: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" }}>{Object.entries(SOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Notes</label><textarea value={newAccrual.notes} onChange={e => setNewAccrual(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} /></div>
                <button onClick={addManualAccrual} disabled={!newAccrual.vendor || !newAccrual.amount} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: !newAccrual.vendor || !newAccrual.amount ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: !newAccrual.vendor || !newAccrual.amount ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: !newAccrual.vendor || !newAccrual.amount ? "default" : "pointer" }}>Add Accrual</button>
              </div> : <div style={{ padding: "18px 22px" }}>
                <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} placeholder="Paste PM email, invoice list, notes..." rows={6} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }} />
                <button onClick={parseUpload} disabled={!uploadText.trim() || parseLoading} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: !uploadText.trim() || parseLoading ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: !uploadText.trim() || parseLoading ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: !uploadText.trim() || parseLoading ? "default" : "pointer", marginBottom: 10 }}>{parseLoading ? "🤖 Parsing..." : "🤖 Extract Accruals"}</button>
                {parsedItems.length > 0 && <div>{parsedItems.map((item, i) => <div key={i} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", marginBottom: 6, display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 600, fontSize: 13 }}>{item.vendor}</span><span style={{ fontWeight: 700, color: "#6366f1" }}>{Dl(item.amount)}</span></div>)}<button onClick={addParsedItems} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 4 }}>✓ Add All ({parsedItems.length})</button></div>}
              </div>}
            </div>
          </div>}

          {showMoveModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowMoveModal(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 360, padding: "20px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Move Accrual</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{accruals.find(a => a.id === showMoveModal)?.vendor} — {Dl(editAmounts[showMoveModal] ?? accruals.find(a => a.id === showMoveModal)?.amount)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {MONTHS.filter(m => m !== accruals.find(a => a.id === showMoveModal)?.month).map(m => <button key={m} onClick={() => moveAccrual(showMoveModal, m)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{m}</button>)}
              </div>
            </div>
          </div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthAccruals.sort((a, b) => ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[a.id]] ?? 0) - ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[b.id]] ?? 0) || b.confidence - a.confidence).map(acc => {
              const st = accrualStates[acc.id], isExp = expandedId === acc.id, amt = editAmounts[acc.id] ?? acc.amount;
              const src = SOURCE_TYPES[acc.sourceType] || SOURCE_TYPES.manual;
              const budgetVal = BUDGET[acc.glCode]?.[monthKey] || 0;
              const budgetVar = amt - budgetVal;
              return (<div key={acc.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${st === "approved" ? "#bbf7d0" : "#e2e8f0"}`, opacity: st === "dismissed" ? 0.5 : 1 }}>
                <div onClick={() => setExpandedId(isExp ? null : acc.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 90px 90px 130px" : "1fr 100px 80px 90px 180px", alignItems: "center", gap: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{acc.vendor}</span>
                      <Badge color={src.color}>{src.icon} {src.label}</Badge>
                      {acc.movedFrom && <Badge color="orange">↗ {acc.movedFrom}</Badge>}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{acc.glCode}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: st === "dismissed" ? "#94a3b8" : "#0f172a", textDecoration: st === "dismissed" ? "line-through" : "none" }}>{Dl(amt)}</div>
                    {budgetVal > 0 && <div style={{ fontSize: 10, color: budgetVar > 0 ? "#dc2626" : budgetVar < 0 ? "#059669" : "#94a3b8" }}>{budgetVar === 0 ? "On budget" : `${budgetVar > 0 ? "+" : ""}${Dl(budgetVar)}`}</div>}
                  </div>
                  <ConfBar value={acc.confidence} />
                  {!chatOpen && <div style={{ fontSize: 12, color: "#64748b" }}>{budgetVal > 0 ? Dl(budgetVal) : "—"}<div style={{ fontSize: 10, color: "#94a3b8" }}>budget</div></div>}
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", flexShrink: 0 }}>
                    {st === "suggested" && <><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "approved"); }} style={{ padding: "5px 11px", borderRadius: 7, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>✓ Approve</button><button onClick={e => { e.stopPropagation(); setShowMoveModal(acc.id); }} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }} title="Move">↗</button><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "dismissed"); }} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>✕</button></>}
                    {st !== "suggested" && <button onClick={e => { e.stopPropagation(); setStatus(acc.id, "suggested"); }} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>↩</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px", background: "#fafbfc" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", marginBottom: 8 }}>{src.icon} Source: {src.label}</div>
                      <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: "0 0 10px 0" }}>{acc.rationale}</p>
                      {acc.signals.map((s, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, fontSize: 12 }}><Badge color="gray">{s.type}</Badge><span style={{ color: "#475569" }}>{s.detail}</span></div>)}
                      {acc.movedFrom && <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 7, background: "#ffedd5", border: "1px solid #fed7aa", fontSize: 11, color: "#9a3412" }}>↗ Moved from {acc.movedFrom}</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>⚡ Actions</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>{src.actions.map(a => <SourceAction key={a} action={a} accrualId={acc.id} actionStates={actionStates} setActionStates={setActionStates} />)}</div>
                      {st !== "dismissed" && <div style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Adjust Amount</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#94a3b8" }}>$</span><input type="number" value={amt} onChange={e => setEditAmounts(p => ({ ...p, [acc.id]: Number(e.target.value) }))} onClick={e => e.stopPropagation()} style={{ width: 120, padding: "7px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 15, fontWeight: 600, outline: "none" }} /></div>
                        <label style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}><input type="checkbox" checked={acc.autoReverse} onChange={() => setAccruals(p => p.map(a => a.id === acc.id ? { ...a, autoReverse: !a.autoReverse } : a))} /> Auto-reverse next period</label>
                      </div>}
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>
          {pendingCount > 0 && <div style={{ marginTop: 16, textAlign: "center" }}><button onClick={() => monthAccruals.forEach(a => { if (accrualStates[a.id] === "suggested") setStatus(a.id, "approved"); })} style={{ padding: "10px 28px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Approve All ({pendingCount})</button></div>}
        </>)}

        {/* ——— VARIANCE TAB ——— */}
        {activeTab === "variance" && (<>
          <div style={{ background: "linear-gradient(135deg, #faf5ff, #f5f3ff)", borderRadius: 12, border: "1px solid #ddd6fe", padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 16, color: "#5b21b6" }}>Variance Report — {pLabel}</div><div style={{ fontSize: 12, color: "#7c3aed", marginTop: 2 }}>Budget vs. Accrual Estimate vs. Actual — updates live</div></div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Budget</div><div style={{ fontSize: 17, fontWeight: 700, color: "#5b21b6" }}>{Dl(totBudget)}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Accrual</div><div style={{ fontSize: 17, fontWeight: 700, color: "#5b21b6" }}>{Dl(totAccrual)}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Actual</div><div style={{ fontSize: 17, fontWeight: 700, color: "#5b21b6" }}>{totActual > 0 ? Dl(totActual) : "—"}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Net Var</div><div style={{ fontSize: 17, fontWeight: 700, color: totBudgetVar > 0 ? "#dc2626" : totBudgetVar < 0 ? "#059669" : "#5b21b6" }}>{totBudgetVar >= 0 ? "+" : ""}{Dl(totBudgetVar)}</div></div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 11, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>GL / Vendor</th>
                <th style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Budget</th>
                <th style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: "#6366f1", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", background: "#eef2ff" }}>Accrual</th>
                <th style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: "#059669", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Actual</th>
                <th style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Bgt vs Accrual</th>
                <th style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Bgt vs Actual</th>
                <th style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Notes</th>
              </tr></thead>
              <tbody>
                {varianceData.map((r, i) => {
                  const bvColor = r.budgetVar > 0 ? "#dc2626" : r.budgetVar < 0 ? "#059669" : "#64748b";
                  const avColor = r.actualVar !== null ? (r.actualVar > 0 ? "#dc2626" : r.actualVar < 0 ? "#059669" : "#64748b") : "#94a3b8";
                  return <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "9px 14px" }}><div style={{ fontWeight: 600, fontSize: 12 }}>{r.glCode}</div><div style={{ fontSize: 10, color: "#94a3b8" }}>{r.vendor}</div></td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 500 }}>{r.budgetVal > 0 ? Dl(r.budgetVal) : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, background: "#fafaff" }}>{r.accrualTotal > 0 ? Dl(r.accrualTotal) : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 500, color: "#059669" }}>{r.actualTotal > 0 ? Dl(r.actualTotal) : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 600, color: bvColor }}>{r.budgetVar === 0 && r.accrualTotal === 0 ? "—" : r.budgetVar === 0 ? "✓" : `${r.budgetVar > 0 ? "+" : ""}${Dl(r.budgetVar)}`}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 500, color: avColor }}>{r.actualVar !== null ? `${r.actualVar > 0 ? "+" : ""}${Dl(r.actualVar)}` : "—"}</td>
                    <td style={{ padding: "9px 10px", fontSize: 11 }}>
                      {r.movedItems.map((m, j) => <Badge key={j} color="orange">↗ {m.movedFrom}</Badge>)}
                      {r.accrualTotal > 0 && r.budgetVal === 0 && <Badge color="red">Unbudgeted</Badge>}
                      {r.accrualTotal === 0 && r.budgetVal > 0 && <Badge color="gray">No accrual</Badge>}
                      {r.actualTotal > 0 && r.accrualTotal > 0 && Math.abs(r.actualTotal - r.accrualTotal) < r.accrualTotal * 0.02 && <Badge color="green">Matched</Badge>}
                    </td>
                  </tr>;
                })}
                <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 700 }}>Total</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700 }}>{Dl(totBudget)}</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, background: "#fafaff" }}>{Dl(totAccrual)}</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: "#059669" }}>{totActual > 0 ? Dl(totActual) : "—"}</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: totBudgetVar > 0 ? "#dc2626" : "#059669" }}>{totBudgetVar >= 0 ? "+" : ""}{Dl(totBudgetVar)}</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: totActual - totBudget > 0 ? "#dc2626" : "#059669" }}>{totActual > 0 ? `${totActual - totBudget >= 0 ? "+" : ""}${Dl(totActual - totBudget)}` : "—"}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>)}

        {/* ——— RECONCILE TAB ——— */}
        {activeTab === "reconcile" && (<>
          <div style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", borderRadius: 12, border: "1px solid #bbf7d0", padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 16, color: "#065f46" }}>Reconcile Actuals — {pLabel}</div><div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Match invoices to accruals, post JEs, resolve variances</div></div>
            <div style={{ display: "flex", gap: 12 }}><div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#059669" }}>Reconciled</div><div style={{ fontSize: 17, fontWeight: 700, color: "#065f46" }}>{reconciledCount}/{ACTUALS_DATA.length}</div></div></div>
          </div>

          {/* Single-period */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>📄 Single-Period Invoices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {ACTUALS_DATA.filter(a => !a.spread).map(act => {
              const v = act.actualAmount - act.accrualAmount, isExp = expandedActual === act.id, rS = reconcileStates[act.id];
              const sCfg = { matched: { c: "green", l: "Exact Match" }, variance: { c: "amber", l: "Variance" }, unmatched: { c: "red", l: "No Accrual" } }[act.status];
              return (<div key={act.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#e2e8f0"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
                <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 80px 80px 100px" : "1fr 100px 100px 100px 150px", alignItems: "center", gap: 12 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{act.vendor}</span><Badge color={sCfg.c}>{sCfg.l}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 11, color: "#64748b" }}>{act.glCode} · {act.invoiceNum}</div></div>
                  <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Accrued</div><div style={{ fontWeight: 600, fontSize: 13 }}>{act.accrualAmount ? Dl(act.accrualAmount) : "—"}</div></div>
                  <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Actual</div><div style={{ fontWeight: 700, fontSize: 13 }}>{Dl(act.actualAmount)}</div></div>
                  <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Variance</div><div style={{ fontWeight: 600, fontSize: 13, color: v === 0 ? "#22c55e" : Math.abs(v) < (act.accrualAmount || 1) * .05 ? "#f59e0b" : "#ef4444" }}>{v === 0 ? "✓ $0" : `${v > 0 ? "+" : ""}${Dl(v)}`}</div></div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>↩</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px", background: "#fafbfc" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>🔄 Analysis</div>
                      {act.status === "matched" && <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>Exact match — zero variance.</p>}
                      {act.status === "variance" && <><p style={{ fontSize: 13, color: "#334155", margin: "0 0 8px" }}>Actual was <strong style={{ color: v > 0 ? "#dc2626" : "#059669" }}>{Dl(Math.abs(v))} {v > 0 ? "over" : "under"}</strong>.</p>{act.notes && <div style={{ padding: "7px 10px", borderRadius: 7, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>💡 {act.notes}</div>}</>}
                      {act.status === "unmatched" && <><div style={{ padding: "7px 10px", borderRadius: 7, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 12, color: "#991b1b", marginBottom: 6 }}>⚠️ No accrual — full {Dl(act.actualAmount)} hits P&L.</div>{act.notes && <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{act.notes}</p>}<div style={{ marginTop: 6, padding: "7px 10px", borderRadius: 7, background: "#ede9fe", border: "1px solid #ddd6fe", fontSize: 11, color: "#5b21b6" }}>🧠 Added to AI watchlist for future periods.</div></>}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>📝 Journal Entry</div>
                      <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        {act.accrualAmount > 0 && <><div style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600, color: "#475569" }}>Reverse Accrual</div><table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR 2100 — Accrued Exp</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.accrualAmount)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR {act.glCode}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.accrualAmount)}</td></tr></tbody></table></>}
                        <div style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: act.accrualAmount > 0 ? "1px solid #e2e8f0" : "none", fontSize: 10, fontWeight: 600, color: "#475569" }}>Book Actual</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR {act.glCode}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR 2000 — AP</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr></tbody></table>
                        {v !== 0 && act.accrualAmount > 0 && <div style={{ padding: "7px 10px", background: v > 0 ? "#fef3c7" : "#dcfce7", borderTop: "1px solid #e2e8f0", fontSize: 11, color: v > 0 ? "#92400e" : "#166534" }}><strong>Net:</strong> {v > 0 ? "+" : ""}{Dl(v)} to P&L</div>}
                      </div>
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>

          {/* Multi-period */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>📅 Multi-Period Invoices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {ACTUALS_DATA.filter(a => a.spread).map(act => {
              const sp = act.spread, curAmt = sp.schedule.find(p => p.status === "current")?.amount || 0;
              const isExp = expandedActual === act.id, rS = reconcileStates[act.id];
              const mLbl = { "straight-line": "Straight-Line", weighted: "Weighted" }[sp.method] || sp.method;
              return (<div key={act.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#c7d2fe"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
                <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 80px 80px 100px" : "1fr 100px 100px 100px 150px", alignItems: "center", gap: 12 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{act.vendor}</span><Badge color="purple">Multi-Period</Badge><Badge color="cyan">{mLbl}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 11, color: "#64748b" }}>{act.glCode} · {sp.startMonth} → {sp.endMonth}</div></div>
                  <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Total</div><div style={{ fontWeight: 700, fontSize: 13 }}>{Dl(act.actualAmount)}</div></div>
                  <div><div style={{ fontSize: 10, color: "#94a3b8" }}>{pLabel}</div><div style={{ fontWeight: 700, fontSize: 13, color: "#6366f1" }}>{Dl(curAmt)}</div></div>
                  <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Deferred</div><div style={{ fontWeight: 600, fontSize: 13, color: "#8b5cf6" }}>{Dl(act.actualAmount - curAmt)}</div></div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>↩</button>}
                  </div>
                </div>
                {isExp && <div style={{ borderTop: "1px solid #e0e7ff", padding: "14px 18px", background: "#fafbfe" }}>
                  <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", marginBottom: 8 }}>📅 Allocation — {mLbl}</div>
                      <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                          <thead><tr style={{ background: "#f8fafc" }}><th style={{ padding: "7px 10px", textAlign: "left", color: "#64748b", fontSize: 10 }}>Period</th><th style={{ padding: "7px 10px", textAlign: "right", color: "#64748b", fontSize: 10 }}>Amount</th>{sp.method !== "straight-line" && <th style={{ padding: "7px 10px", textAlign: "right", color: "#64748b", fontSize: 10 }}>Weight</th>}<th style={{ padding: "7px 10px", textAlign: "center", color: "#64748b", fontSize: 10 }}>Status</th></tr></thead>
                          <tbody>{sp.schedule.map((r, i) => <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: r.status === "current" ? "#f0fdf4" : "transparent" }}><td style={{ padding: "7px 10px", fontWeight: r.status === "current" ? 600 : 400 }}>{r.month}</td><td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(r.amount)}</td>{sp.method !== "straight-line" && <td style={{ padding: "7px 10px", textAlign: "right", fontSize: 11, color: "#64748b" }}>{r.weight || ""}</td>}<td style={{ padding: "7px 10px", textAlign: "center" }}>{r.status === "current" ? <Badge color="green">Current</Badge> : <Badge color="gray">Future</Badge>}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>📝 Journal Entries</div>
                      <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600 }}>1. Book to Prepaid</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR {sp.glPrepaid}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR 2000 — AP</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr></tbody></table>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "7px 10px", background: "#f0fdf4", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600, color: "#065f46" }}>2. {pLabel} Amortization</div>
                        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR {act.glCode}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR {sp.glPrepaid}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td></tr></tbody></table>
                        <div style={{ padding: "7px 10px", background: "#f0fdf4", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#065f46" }}><strong>P&L:</strong> {Dl(curAmt)} · <strong>Prepaid:</strong> {Dl(act.actualAmount - curAmt)}</div>
                      </div>
                    </div>
                  </div>
                </div>}
              </div>);
            })}
          </div>

          {Object.values(reconcileStates).some(s => s === "pending") && <div style={{ textAlign: "center" }}><button onClick={() => { const n = {}; ACTUALS_DATA.forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} style={{ padding: "10px 28px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Post All ({ACTUALS_DATA.length - reconciledCount})</button></div>}
        </>)}

        {/* ——— JE TAB ——— */}
        {activeTab === "journal" && (<>
          <div style={{ marginBottom: 14 }}><span style={{ fontWeight: 600, fontSize: 14 }}>Journal Entries</span><span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>{journalEntries.length} entries · {journalEntries.filter(j => j.type === "Auto-Reverse").length} auto-reversals</span></div>
          {journalEntries.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 11, border: "1px solid #e2e8f0", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <div style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>No journal entries yet</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Approve accruals on the Estimate tab to auto-generate JEs and reversals.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {journalEntries.map(je => (
                <div key={je.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${je.type === "Auto-Reverse" ? "#fde68a" : "#bbf7d0"}`, padding: "12px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Badge color={je.type === "Auto-Reverse" ? "amber" : "green"}>{je.type === "Auto-Reverse" ? "🔄 Auto-Reverse" : "✓ Accrual"}</Badge>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{je.vendor}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{je.date} · {je.period}</span>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: 7, overflow: "hidden" }}>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR: {je.debitAcct}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(je.debitAmt)}</td></tr>
                      <tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR: {je.creditAcct}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(je.creditAmt)}</td></tr>
                    </tbody></table>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{je.memo}</div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>

      {chatOpen && <AIChatPanel accruals={accruals} accrualStates={accrualStates} editAmounts={editAmounts} activeTab={activeTab} selectedPeriod={selectedPeriod} journalEntries={journalEntries} onClose={() => setChatOpen(false)} />}
    </div>
  );
}