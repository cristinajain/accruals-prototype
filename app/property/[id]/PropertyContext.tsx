// @ts-nocheck
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { MONTHS, BUDGET, INIT_ACCRUALS, ACTUALS_DATA } from "../../lib/data";

const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
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

  const reconciledCount = Object.values(reconcileStates).filter(s => s === "reconciled").length;

  const setStatus = useCallback((id, s) => {
    setAccrualStates(prev => ({ ...prev, [id]: s }));
    const acc = accruals.find(a => a.id === id);
    if (s === "approved" && acc) {
      const amt = editAmounts[id] ?? acc.amount;
      const now = new Date().toLocaleDateString();
      const entries = [
        { id: `je-acc-${id}`, status: "pending", date: now, type: "Accrual", vendor: acc.vendor, glCode: acc.glCode, debitAcct: acc.glCode, debitAmt: amt, creditAcct: "2100 — Accrued Expenses", creditAmt: amt, memo: `Accrue ${acc.month} — ${acc.vendor}`, period: acc.month },
      ];
      if (acc.autoReverse) {
        const nextMonth = MONTHS[MONTHS.indexOf(acc.month) + 1] || "Next Period";
        entries.push({ id: `je-rev-${id}`, status: "pending", date: `1st of ${nextMonth}`, type: "Auto-Reverse", vendor: acc.vendor, glCode: acc.glCode, debitAcct: "2100 — Accrued Expenses", debitAmt: amt, creditAcct: acc.glCode, creditAmt: amt, memo: `Auto-reverse ${acc.month} accrual — ${acc.vendor}`, period: nextMonth });
      }
      setJournalEntries(prev => [...prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`), ...entries]);
    }
    if (s === "suggested" || s === "dismissed") {
      setJournalEntries(prev => prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`));
    }
  }, [accruals, editAmounts]);

  const handleSetReconcileStates = (updaterOrValue) => {
    const next = typeof updaterOrValue === "function" ? updaterOrValue(reconcileStates) : updaterOrValue;
    Object.keys(next).forEach(actId => {
      if (next[actId] === reconcileStates[actId]) return;
      const act = ACTUALS_DATA.find(a => String(a.id) === String(actId));
      if (!act) return;
      if (next[actId] === "reconciled") {
        setJournalEntries(prev => prev.map(j =>
          j.glCode === act.glCode && j.status === "pending"
            ? { ...j, status: "cleared", clearedDate: new Date().toLocaleDateString() }
            : j
        ));
      } else {
        setJournalEntries(prev => prev.map(j =>
          j.glCode === act.glCode && j.status === "cleared"
            ? { ...j, status: "pending", clearedDate: undefined }
            : j
        ));
      }
    });
    setReconcileStates(next);
  };

  const moveAccrual = (id, toMonth) => {
    setAccruals(prev => prev.map(a => a.id === id ? { ...a, month: toMonth, movedFrom: a.movedFrom || a.month } : a));
    setJournalEntries(prev => prev.filter(j => j.id !== `je-acc-${id}` && j.id !== `je-rev-${id}`));
    setAccrualStates(prev => ({ ...prev, [id]: "suggested" }));
    setShowMoveModal(null);
  };

  const addManualAccrual = (pLabel) => {
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

  const addParsedItems = (pLabel) => {
    parsedItems.forEach((item, i) => {
      const newId = Date.now() + i;
      setAccruals(p => [...p, { id: newId, vendor: item.vendor, glCode: item.glCode || "TBD", amount: Number(item.amount) || 0, confidence: 0, sourceType: item.sourceType || "pm-email", priority: item.priority || "medium", month: pLabel, status: "suggested", rationale: item.notes || "AI-parsed.", signals: [{ type: "Upload", detail: "Extracted from pasted content" }], autoReverse: true, movedFrom: null }]);
      setAccrualStates(p => ({ ...p, [newId]: "suggested" }));
    });
    setParsedItems([]); setUploadText(""); setUploadMode(false); setShowAddModal(false);
  };

  return (
    <PropertyContext.Provider value={{
      accruals, setAccruals,
      accrualStates,
      expandedId, setExpandedId,
      editAmounts, setEditAmounts,
      chatOpen, setChatOpen,
      actionStates, setActionStates,
      journalEntries,
      showAddModal, setShowAddModal,
      showMoveModal, setShowMoveModal,
      newAccrual, setNewAccrual,
      reconcileStates,
      expandedActual, setExpandedActual,
      uploadMode, setUploadMode,
      uploadText, setUploadText,
      parseLoading,
      parsedItems, setParsedItems,
      reconciledCount,
      setStatus,
      handleSetReconcileStates,
      moveAccrual,
      addManualAccrual,
      parseUpload,
      addParsedItems,
    }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  return useContext(PropertyContext);
}
