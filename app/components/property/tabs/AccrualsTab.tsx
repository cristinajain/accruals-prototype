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
      <div className="sp-accruals-header">
        <div><span className="sp-accruals-header__title">{pLabel} Accruals</span><span className="sp-accruals-header__meta">{approvedCount} approved · {pendingCount} pending · {Dl(approvedTotal)}</span></div>
        <div className="sp-flex-center sp-gap-6">
          {pendingCount > 0 && <button onClick={() => monthAccruals.forEach(a => { if (accrualStates[a.id] === "suggested") setStatus(a.id, "approved"); })} className="sp-btn sp-btn--primary">✓ Approve All ({pendingCount})</button>}
          <button onClick={() => setShowAddModal(true)} className="sp-btn--add-accrual">+ Add Accrual</button>
        </div>
      </div>

      <div className="sp-accrual-list">
        {monthAccruals.sort((a, b) => ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[a.id]] ?? 0) - ({ suggested: 0, approved: 1, dismissed: 2 }[accrualStates[b.id]] ?? 0) || b.confidence - a.confidence).map(acc => {
          const st = accrualStates[acc.id], isExp = expandedId === acc.id, amt = editAmounts[acc.id] ?? acc.amount;
          const src = SOURCE_TYPES[acc.sourceType] || SOURCE_TYPES.manual;
          const budgetVal = BUDGET[acc.glCode]?.[monthKey] || 0;
          const budgetVar = amt - budgetVal;
          return (<div key={acc.id} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-3xl)", border: `1px solid ${st === "approved" ? "var(--green-200)" : "var(--border)"}`, opacity: st === "dismissed" ? 0.5 : 1 }}>
            <div onClick={() => setExpandedId(isExp ? null : acc.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 90px 90px 130px" : "1fr 100px 80px 90px 180px", alignItems: "center", gap: 14 }}>
              <div style={{ minWidth: 0 }}>
                <div className="sp-flex-center sp-flex-wrap sp-gap-5 sp-mb-2">
                  <span className="sp-text-md-semibold">{acc.vendor}</span>
                  <Badge variant="category" icon={src.icon} code={src.code} />
                  {acc.movedFrom && <Badge>↗ {acc.movedFrom}</Badge>}
                </div>
                <div className="sp-text-sm-muted">{acc.glCode}</div>
              </div>
              <div>
                <div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-xl)", color: st === "dismissed" ? "var(--text-placeholder)" : "var(--text-primary)", textDecoration: st === "dismissed" ? "line-through" : "none" }}>{Dl(amt)}</div>
                {budgetVal > 0 && <div style={{ fontSize: "var(--font-size-xs)", color: budgetVar > 0 ? "var(--red-600)" : budgetVar < 0 ? "var(--green-700)" : "var(--text-placeholder)" }}>{budgetVar === 0 ? "On budget" : `${budgetVar > 0 ? "+" : ""}${Dl(budgetVar)}`}</div>}
              </div>
              <ConfBar value={acc.confidence} />
              {!chatOpen && <div className="sp-text-base-muted">{budgetVal > 0 ? Dl(budgetVal) : "—"}<div className="sp-text-xs-muted">budget</div></div>}
              <div className="sp-flex-end sp-gap-5" style={{ flexShrink: 0 }}>
                {st === "suggested" && <><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "approved"); }} className="sp-btn--approve">✓ Approve</button><button onClick={e => { e.stopPropagation(); setShowMoveModal(acc.id); }} className="sp-btn--move" title="Move">↗</button><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "dismissed"); }} className="sp-btn--dismiss">✕</button></>}
                {st !== "suggested" && <button onClick={e => { e.stopPropagation(); setStatus(acc.id, "suggested"); }} className="sp-btn--undo">↩</button>}
              </div>
            </div>
            {isExp && <div className="sp-accrual-detail">
              <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                <div>
                  <div className="sp-detail-section-label sp-detail-section-label--brand">{src.icon} Source: {src.label}</div>
                  <p className="sp-rationale">{acc.rationale}</p>
                  {acc.signals.map((s, i) => <div key={i} className="sp-signal-row"><Badge>{s.type}</Badge><span className="sp-signal-row__text">{s.detail}</span></div>)}
                  {acc.movedFrom && <div className="sp-callout sp-callout--moved sp-mt-6">↗ Moved from {acc.movedFrom}</div>}
                </div>
                <div>
                  <div className="sp-detail-section-label sp-detail-section-label--green">⚡ Actions</div>
                  <div className="sp-flex sp-flex-wrap sp-gap-5 sp-mb-12">{src.actions.map(a => <SourceAction key={a} action={a} accrualId={acc.id} actionStates={actionStates} setActionStates={setActionStates} />)}</div>
                  {st !== "dismissed" && <div className="sp-adjust-box">
                    <div className="sp-adjust-box__label">Adjust Amount</div>
                    <div className="sp-adjust-box__row"><span className="sp-adjust-box__currency">$</span><input type="number" value={amt} onChange={e => setEditAmounts(p => ({ ...p, [acc.id]: Number(e.target.value) }))} onClick={e => e.stopPropagation()} className="sp-adjust-box__input" /></div>
                    <label className="sp-adjust-box__checkbox-label"><input type="checkbox" checked={acc.autoReverse} onChange={() => setAccruals(p => p.map(a => a.id === acc.id ? { ...a, autoReverse: !a.autoReverse } : a))} /> Auto-reverse next period</label>
                  </div>}
                </div>
              </div>
            </div>}
          </div>);
        })}
      </div>
    </>
  );
}
