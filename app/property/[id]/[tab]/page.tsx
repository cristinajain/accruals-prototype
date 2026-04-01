// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PERIODS, BUDGET, ACTUALS_DATA } from "../../../lib/data";
import { PropertyView } from "../../../components/property/PropertyView";
import { useProperty } from "../PropertyContext";

const VALID_TABS = ["accruals", "variance", "reconcile", "journal"];

export default function PropertyPage() {
  const router = useRouter();
  const { id, tab } = useParams();
  const searchParams = useSearchParams();
  const ctx = useProperty();

  const activeTab = VALID_TABS.includes(tab) ? tab : "accruals";
  const selectedPeriod = searchParams.get("period") || "2026-01";

  // Reset expanded rows when tab or period changes
  useEffect(() => {
    ctx.setExpandedId(null);
    ctx.setExpandedActual(null);
  }, [activeTab, selectedPeriod]);

  const navigate = (nextTab, nextPeriod) => {
    const t = nextTab ?? activeTab;
    const p = nextPeriod ?? selectedPeriod;
    router.push(`/property/${id}/${t}?period=${p}`);
  };

  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
  const monthKey = { "2026-01": "jan", "2026-02": "feb", "2026-03": "mar", "2026-04": "apr" }[selectedPeriod] || "jan";
  const monthAccruals = ctx.accruals.filter(a => a.month === pLabel);
  const approvedCount = monthAccruals.filter(a => ctx.accrualStates[a.id] === "approved").length;
  const pendingCount = monthAccruals.filter(a => ctx.accrualStates[a.id] === "suggested").length;
  const approvedTotal = monthAccruals.filter(a => ctx.accrualStates[a.id] === "approved").reduce((s, a) => s + (ctx.editAmounts[a.id] ?? a.amount), 0);

  const varianceData = Object.entries(BUDGET).map(([glCode, b]) => {
    const budgetVal = b[monthKey] || 0;
    const matchingAccruals = ctx.accruals.filter(a => a.glCode === glCode && a.month === pLabel);
    const accrualTotal = matchingAccruals.reduce((s, a) => s + (ctx.editAmounts[a.id] ?? a.amount), 0);
    const approvedAmt = matchingAccruals.filter(a => ctx.accrualStates[a.id] === "approved").reduce((s, a) => s + (ctx.editAmounts[a.id] ?? a.amount), 0);
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
      onPeriodChange={(p) => navigate(null, p)}
      onTabChange={(t) => navigate(t, null)}
      activeTab={activeTab}
      selectedPeriod={selectedPeriod}
      setChatOpen={ctx.setChatOpen}
      chatOpen={ctx.chatOpen}
      setExpandedId={ctx.setExpandedId}
      setExpandedActual={ctx.setExpandedActual}
      pLabel={pLabel}
      monthKey={monthKey}
      monthAccruals={monthAccruals}
      approvedCount={approvedCount}
      pendingCount={pendingCount}
      approvedTotal={approvedTotal}
      accruals={ctx.accruals}
      setAccruals={ctx.setAccruals}
      accrualStates={ctx.accrualStates}
      editAmounts={ctx.editAmounts}
      setEditAmounts={ctx.setEditAmounts}
      expandedId={ctx.expandedId}
      actionStates={ctx.actionStates}
      setActionStates={ctx.setActionStates}
      setStatus={ctx.setStatus}
      showAddModal={ctx.showAddModal}
      setShowAddModal={ctx.setShowAddModal}
      showMoveModal={ctx.showMoveModal}
      setShowMoveModal={ctx.setShowMoveModal}
      uploadMode={ctx.uploadMode}
      setUploadMode={ctx.setUploadMode}
      parsedItems={ctx.parsedItems}
      setParsedItems={ctx.setParsedItems}
      uploadText={ctx.uploadText}
      setUploadText={ctx.setUploadText}
      parseLoading={ctx.parseLoading}
      parseUpload={ctx.parseUpload}
      addParsedItems={() => ctx.addParsedItems(pLabel)}
      newAccrual={ctx.newAccrual}
      setNewAccrual={ctx.setNewAccrual}
      addManualAccrual={() => ctx.addManualAccrual(pLabel)}
      moveAccrual={ctx.moveAccrual}
      varianceData={varianceData}
      totBudget={totBudget}
      totAccrual={totAccrual}
      totActual={totActual}
      reconciledCount={ctx.reconciledCount}
      reconcileStates={ctx.reconcileStates}
      setReconcileStates={ctx.handleSetReconcileStates}
      expandedActual={ctx.expandedActual}
      journalEntries={ctx.journalEntries}
    />
  );
}
