// @ts-nocheck

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
  onBack,
  onTabChange,
  onPeriodChange,
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
    <div className="sp-app">
      <div className="sp-topbar" style={{ padding: "10px 24px", gap: 10 }}>
        <button onClick={() => { onBack(); setChatOpen(false); }} className="sp-btn--nav">←</button>
        <div>
          <div className="sp-topbar__prop-name">Park Avenue Tower</div>
          <div className="sp-topbar__prop-sub">245K sqft · NYC · Sarah Chen</div>
        </div>
        <div className="sp-period-selector sp-ml-12">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => { onPeriodChange(p.key); }}
              className={`sp-period-btn ${selectedPeriod === p.key ? "sp-period-btn--active" : ""}`}
            >
              {p.short}
              {p.status === "active" && <span className="sp-period-btn__dot" />}
            </button>
          ))}
        </div>
        <div className="sp-flex-center sp-gap-5 sp-ml-auto">
          <div className="sp-tabs">
            {[{ key: "accruals", label: "Estimate", icon: "🤖" }, { key: "variance", label: "Variance", icon: "📊" }, { key: "reconcile", label: "Reconcile", icon: "🔄" }, { key: "journal", label: "JEs", icon: "📝" }].map(t => (
              <button
                key={t.key}
                onClick={() => { onTabChange(t.key); }}
                className={`sp-tab ${activeTab === t.key ? "sp-tab--active" : ""}`}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <button onClick={() => setChatOpen(v => !v)} className="sp-btn--ai">🤖 AI</button>
          <DesignSystemNavButton />
        </div>
      </div>

      <div style={{ maxWidth: chatOpen ? 700 : 1060, margin: "0 auto", padding: "18px 24px", transition: "max-width 0.3s" }}>

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
              chatOpen={chatOpen}
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
            chatOpen={chatOpen}
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
