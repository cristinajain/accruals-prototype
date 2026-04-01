// @ts-nocheck
"use client";

import { MessageCircle } from "lucide-react";
import { TabGroup } from "../ui/TabGroup";
import { PERIODS } from "../../lib/data";
import { DesignSystemNavButton } from "../DesignSystemPanel";
import { AIChatPanel } from "../AIChatPanel";
import { AccrualsTab } from "./tabs/AccrualsTab";
import { VarianceTab } from "./tabs/VarianceTab";
import { ReconcileTab } from "./tabs/ReconcileTab";
import { JournalTab } from "./tabs/JournalTab";
import { AddAccrualModal } from "./AddAccrualModal";
import { MoveAccrualModal } from "./MoveAccrualModal";

export function PropertyView({
  onPeriodChange,
  onTabChange,
  setChatOpen,
  chatOpen,
  selectedPeriod,
  activeTab,
  setExpandedId,
  setExpandedActual,
  pLabel,
  monthKey,
  monthAccruals,
  approvedCount,
  pendingCount,
  approvedTotal,
  accruals,
  setAccruals,
  accrualStates,
  editAmounts,
  setEditAmounts,
  expandedId,
  actionStates,
  setActionStates,
  setStatus,
  showAddModal,
  setShowAddModal,
  showMoveModal,
  setShowMoveModal,
  uploadMode,
  setUploadMode,
  parsedItems,
  setParsedItems,
  uploadText,
  setUploadText,
  parseLoading,
  parseUpload,
  addParsedItems,
  newAccrual,
  setNewAccrual,
  addManualAccrual,
  moveAccrual,
  varianceData,
  totBudget,
  totAccrual,
  totActual,
  reconciledCount,
  reconcileStates,
  setReconcileStates,
  expandedActual,
  journalEntries,
}) {
  return (
    <div className="sp11-app">
      <div className="sp11-topbar" style={{ position: "relative" }}>
        <div>
          <div className="sp11-topbar__prop-name">Park Avenue Tower</div>
          <div className="sp11-topbar__prop-sub">245K sqft · NYC · Sarah Chen</div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
          <TabGroup
            tabs={PERIODS.map(p => ({ key: p.key, label: p.short, dot: p.status === "active" }))}
            activeKey={selectedPeriod}
            onChange={onPeriodChange}
          />
        </div>
        <div className="sp11-flex-center sp11-gap-5 sp11-ml-auto">
          <button onClick={() => setChatOpen(v => !v)} className="sp11-btn sp11-btn--secondary sp11-flex-center sp11-gap-4"><MessageCircle size={14} strokeWidth={2} />Ask AI</button>
          <DesignSystemNavButton />
        </div>
      </div>

      <div className={`sp11-prop-content${activeTab === "variance" ? " sp11-prop-content--full" : ""}`}>

        {activeTab === "accruals" && (
          <>
            <AccrualsTab
              pLabel={pLabel}
              monthKey={monthKey}
              monthAccruals={monthAccruals}
              approvedCount={approvedCount}
              pendingCount={pendingCount}
              approvedTotal={approvedTotal}
              accrualStates={accrualStates}
              editAmounts={editAmounts}
              setEditAmounts={setEditAmounts}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              actionStates={actionStates}
              setActionStates={setActionStates}
              setStatus={setStatus}
              setShowAddModal={setShowAddModal}
              setShowMoveModal={setShowMoveModal}
              setAccruals={setAccruals}
            />
            {showAddModal && (
              <AddAccrualModal
                pLabel={pLabel}
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
                onClose={() => { setShowAddModal(false); setUploadMode(false); setParsedItems([]); }}
              />
            )}
            {showMoveModal && (
              <MoveAccrualModal
                showMoveModal={showMoveModal}
                accruals={accruals}
                editAmounts={editAmounts}
                moveAccrual={moveAccrual}
                onClose={() => setShowMoveModal(null)}
              />
            )}
          </>
        )}

        {activeTab === "variance" && (
          <VarianceTab
            varianceData={varianceData}
            totBudget={totBudget}
            totAccrual={totAccrual}
            totActual={totActual}
            pLabel={pLabel}
            accruals={accruals}
          />
        )}

        {activeTab === "reconcile" && (
          <ReconcileTab
            pLabel={pLabel}
            reconciledCount={reconciledCount}
            reconcileStates={reconcileStates}
            setReconcileStates={setReconcileStates}
            expandedActual={expandedActual}
            setExpandedActual={setExpandedActual}
          />
        )}

        {activeTab === "journal" && (
          <JournalTab journalEntries={journalEntries} />
        )}

      </div>

      {chatOpen && (
        <AIChatPanel
          accruals={accruals}
          accrualStates={accrualStates}
          editAmounts={editAmounts}
          activeTab={activeTab}
          selectedPeriod={selectedPeriod}
          journalEntries={journalEntries}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
