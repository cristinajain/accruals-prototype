// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { ConfBar } from "../../ui/ConfBar";
import { SourceAction } from "../../ui/SourceAction";
import { Dl } from "../../../lib/utils";
import { SOURCE_TYPES, BUDGET } from "../../../lib/data";

export function AccrualsTab({
  pLabel,
  monthKey,
  monthAccruals,
  approvedCount,
  pendingCount,
  approvedTotal,
  accrualStates,
  editAmounts,
  setEditAmounts,
  expandedId,
  setExpandedId,
  actionStates,
  setActionStates,
  setStatus,
  setShowAddModal,
  setShowMoveModal,
  setAccruals,
  chatOpen,
}) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div><span style={{ fontWeight: 600, fontSize: 14 }}>{pLabel} Accruals</span><span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>{approvedCount} approved · {pendingCount} pending · {Dl(approvedTotal)}</span></div>
        <button onClick={() => setShowAddModal(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px dashed #c7d2fe", background: "#eef2ff", color: "#4338ca", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ Add Accrual</button>
      </div>

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
      {pendingCount > 0 && <div style={{ marginTop: 16, textAlign: "center" }}><button onClick={() => monthAccruals.forEach(a => { if (accrualStates[a.id] === "suggested") setStatus(a.id, "approved"); })} className="sp-btn sp-btn--primary sp-btn--full" style={{ width: "auto", padding: "10px 28px" }}>✓ Approve All ({pendingCount})</button></div>}
    </>
  );
}
