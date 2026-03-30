// @ts-nocheck
"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PERIODS, MONTHS, BUDGET, INIT_ACCRUALS, ACTUALS_DATA } from "../../../lib/data";
import { PropertyView } from "../../../components/property/PropertyView";

const VALID_TABS = ["accruals", "variance", "reconcile", "journal"];

export default function PropertyPage() {
  const router = useRouter();
  const { id, tab } = useParams();
  const searchParams = useSearchParams();

  const activeTab = VALID_TABS.includes(tab) ? tab : "accruals";
  const selectedPeriod = searchParams.get("period") || "2026-01";

  const [accruals, setAccruals] = useState(INIT_ACCRUALS);
  const [accrualStates, setAccrualStates] = useState(() => {
    const m = {};
    INIT_ACCRUALS.forEach(a => { m[a.id] = a.status; });
    return m;
  });
  const [expandedId, setExpandedId] = useState(null);
  const [editAmounts, setEditAmounts] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [actionStates, setActionStates] = useState({});
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(null);
  const [newAccrual, setNewAccrual] = useState({ vendor: "", glCode: "", amount: "", sourceType: "pm-email", notes: "", priority: "medium" });
  const [reconcileStates, setReconcileStates] = useState(() => {
    const m = {};
    ACTUALS_DATA.forEach(a => { m[a.id] = "pending"; });
    return m;
  });
  const [expandedActual, setExpandedActual] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [parseLoading, setParseLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);

  // Reset expanded rows when tab or period changes
  useEffect(() => {
    setExpandedId(null);
    setExpandedActual(null);
  }, [activeTab, selectedPeriod]);

  const navigate = (nextTab, nextPeriod) => {
    const t = nextTab ?? activeTab;
    const p = nextPeriod ?? selectedPeriod;
    router.push(`/property/${id}/${t}?period=${p}`);
  };

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
    if (s === "suggested" || s === "dismissed") {
      setJournalEntries(prev => prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`));
    }
  }, [accruals, editAmounts]);

  const moveAccrual = (id, toMonth) => {
    setAccruals(prev => prev.map(a => a.id === id ? { ...a, month: toMonth, movedFrom: a.movedFrom || a.month } : a));
    setJournalEntries(prev => prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`));
    setAccrualStates(prev => ({ ...prev, [id]: "suggested" }));
    setShowMoveModal(null);
  };

  const addManualAccrual = () => {
    if (!newAccrual.vendor || !newAccrual.amount) return;
    const newId = Date.now();
    setAccruals(prev => [...prev, { id: newId, vendor: newAccrual.vendor, glCode: newAccrual.glCode || "TBD", amount: Number(newAccrual.amount), confidence: 0, sourceType: newAccrual.sourceType, priority: newAccrual.priority, month: pLabel, status: "suggested", rationale: newAccrual.notes || "Manually added.", signals: [{ type: "Manual", detail: "Added by accountant" }], autoReverse: true, movedFrom: null }]);
    setAccrualStates(prev => ({ ...prev, [newId]: "suggested" }));
    setNewAccrual({ vendor: "", glCode: "", amount: "", sourceType: "pm-email", notes: "", priority: "medium" });
    setShowAddModal(false);
  };

  const parseUpload = async () => {
    if (!uploadText.trim() || parseLoading) return;
    setParseLoading(true);
    try {
      const r = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `Extract accrual items. Return ONLY JSON array: [{vendor, glCode, amount (number), sourceType, notes, priority}]. No markdown.`, messages: [{ role: "user", content: uploadText }] }) });
      const d = await r.json();
      setParsedItems(JSON.parse((d.content?.map(b => b.text || "").join("") || "[]").replace(/```json|```/g, "").trim()));
    } catch { setParsedItems([]); } finally { setParseLoading(false); }
  };

  const addParsedItems = () => {
    parsedItems.forEach((item, i) => {
      const newId = Date.now() + i;
      setAccruals(p => [...p, { id: newId, vendor: item.vendor, glCode: item.glCode || "TBD", amount: Number(item.amount) || 0, confidence: 0, sourceType: item.sourceType || "pm-email", priority: item.priority || "medium", month: pLabel, status: "suggested", rationale: item.notes || "AI-parsed.", signals: [{ type: "Upload", detail: "Extracted from pasted content" }], autoReverse: true, movedFrom: null }]);
      setAccrualStates(p => ({ ...p, [newId]: "suggested" }));
    });
    setParsedItems([]); setUploadText(""); setUploadMode(false); setShowAddModal(false);
  };

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
    return { glCode, vendor: b.vendor, budgetVal, accrualTotal, approvedAmt, actualTotal, movedItems, matchingActuals };
  });
  const totBudget = varianceData.reduce((s, v) => s + v.budgetVal, 0);
  const totAccrual = varianceData.reduce((s, v) => s + v.accrualTotal, 0);
  const totActual = varianceData.reduce((s, v) => s + v.actualTotal, 0);

  return (
    <PropertyView
      onBack={() => router.push("/")}
      onTabChange={(t) => navigate(t, null)}
      onPeriodChange={(p) => navigate(null, p)}
      activeTab={activeTab}
      selectedPeriod={selectedPeriod}
      setChatOpen={setChatOpen}
      chatOpen={chatOpen}
      setExpandedId={setExpandedId}
      setExpandedActual={setExpandedActual}
      pLabel={pLabel}
      monthKey={monthKey}
      monthAccruals={monthAccruals}
      approvedCount={approvedCount}
      pendingCount={pendingCount}
      approvedTotal={approvedTotal}
      accruals={accruals}
      setAccruals={setAccruals}
      accrualStates={accrualStates}
      editAmounts={editAmounts}
      setEditAmounts={setEditAmounts}
      expandedId={expandedId}
      actionStates={actionStates}
      setActionStates={setActionStates}
      setStatus={setStatus}
      showAddModal={showAddModal}
      setShowAddModal={setShowAddModal}
      showMoveModal={showMoveModal}
      setShowMoveModal={setShowMoveModal}
      uploadMode={uploadMode}
      setUploadMode={setUploadMode}
      parsedItems={parsedItems}
      setParsedItems={setParsedItems}
      uploadText={uploadText}
      setUploadText={setUploadText}
      parseLoading={parseLoading}
      parseUpload={parseUpload}
      addParsedItems={addParsedItems}
      newAccrual={newAccrual}
      setNewAccrual={setNewAccrual}
      addManualAccrual={addManualAccrual}
      moveAccrual={moveAccrual}
      varianceData={varianceData}
      totBudget={totBudget}
      totAccrual={totAccrual}
      totActual={totActual}
      reconciledCount={reconciledCount}
      reconcileStates={reconcileStates}
      setReconcileStates={setReconcileStates}
      expandedActual={expandedActual}
      journalEntries={journalEntries}
    />
  );
}
