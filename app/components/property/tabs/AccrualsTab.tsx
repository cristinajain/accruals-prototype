// @ts-nocheck

import { ClipboardList, TrendingUp, FileCheck, Wrench, Mail, Zap, Calculator, PenLine } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Bar } from "../../ui/Bar";
import { Tooltip } from "../../ui/Tooltip";
import { SourceAction } from "../../ui/SourceAction";
import { Dl } from "../../../lib/utils";
import { SOURCE_TYPES, BUDGET } from "../../../lib/data";

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  "open-po":       <ClipboardList size={13} strokeWidth={2} />,
  "gl-pattern":    <TrendingUp    size={13} strokeWidth={2} />,
  "contract":      <FileCheck     size={13} strokeWidth={2} />,
  "work-order":    <Wrench        size={13} strokeWidth={2} />,
  "pm-email":      <Mail          size={13} strokeWidth={2} />,
  "utility-model": <Zap           size={13} strokeWidth={2} />,
  "budget":        <Calculator    size={13} strokeWidth={2} />,
  "manual":        <PenLine       size={13} strokeWidth={2} />,
};

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
}) {
  return (
    <>
      <div className="sp11-accruals-header">
        <div>
            <div className="sp11-flex-center sp11-gap-5 sp11-mb-2"><span className="sp11-accruals-header__title">Accruals</span><Badge color="white">{pLabel}</Badge></div>
            <span className="sp11-accruals-header__meta" style={{ marginLeft: 0 }}>{approvedCount} approved · {pendingCount} pending · {Dl(approvedTotal)}</span>
          </div>
        <div className="sp11-flex-center sp11-gap-6">
          {pendingCount > 0 && <button onClick={() => monthAccruals.forEach(a => { if (accrualStates[a.id] === "suggested") setStatus(a.id, "approved"); })} className="sp11-btn sp11-btn--primary">Book All ({pendingCount})</button>}
          <button onClick={() => setShowAddModal(true)} className="sp11-btn sp11-btn--secondary">+ Add Accrual</button>
        </div>
      </div>

      <div className="sp11-accrual-list">
        {monthAccruals.sort((a, b) => ({ suggested: 0, approved: 0, dismissed: 1 }[accrualStates[a.id]] ?? 0) - ({ suggested: 0, approved: 0, dismissed: 1 }[accrualStates[b.id]] ?? 0) || b.confidence - a.confidence).map(acc => {
          const st = accrualStates[acc.id], isExp = expandedId === acc.id, amt = editAmounts[acc.id] ?? acc.amount;
          const src = SOURCE_TYPES[acc.sourceType] || SOURCE_TYPES.manual;
          const budgetVal = BUDGET[acc.glCode]?.[monthKey] || 0;
          const budgetVar = amt - budgetVal;
          const cols = "48px 1fr 100px 80px 100px auto";
          return (
            <div key={acc.id} className={`sp11-accrual-row${isExp ? " sp11-accrual-row--expanded" : ""}${st === "approved" ? " sp11-accrual-row--approved" : ""}${st === "dismissed" ? " sp11-accrual-row--dismissed" : ""}`}>
              <div onClick={() => setExpandedId(isExp ? null : acc.id)} className="sp11-accrual-row__top" style={{ gridTemplateColumns: cols }}>

                {/* Category badge — leftmost column */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Badge variant="category" icon={SOURCE_ICONS[acc.sourceType]} code={src.code} />
                </div>

                {/* Vendor + GL code */}
                <div style={{ minWidth: 0 }}>
                  <div className="sp11-flex-center sp11-gap-5 sp11-mb-2">
                    <span className="sp11-text-md-semibold">{acc.vendor}</span>
                    {acc.movedFrom && <Badge>↗ {acc.movedFrom}</Badge>}
                  </div>
                  <div className="sp11-text-sm-muted">{acc.glCode}</div>
                </div>

                {/* Amount */}
                <div>
                  <div className="sp11-accrual-amount">{Dl(amt)}</div>
                  {budgetVal > 0 && <div style={{ fontSize: "var(--font-size-xs)", color: budgetVar > 0 ? "var(--red-600)" : budgetVar < 0 ? "var(--green-700)" : "var(--text-placeholder)" }}>{budgetVar === 0 ? "On budget" : `${budgetVar > 0 ? "+" : ""}${Dl(budgetVar)}`}</div>}
                </div>

                {/* Budget */}
                <div className="sp11-text-base-muted">{budgetVal > 0 ? Dl(budgetVal) : "—"}<div className="sp11-text-xs-muted">budget</div></div>

                {/* Confidence bar */}
                <Bar value={acc.confidence} />

                {/* Actions */}
                <div className="sp11-flex-end sp11-gap-5" style={{ flexShrink: 0 }}>
                  {st === "suggested" && <>
                    <button onClick={e => { e.stopPropagation(); setStatus(acc.id, "approved"); }} className="sp11-btn--approve">Book</button>
                    <div className="sp11-accrual-secondary-slot">
                      <Tooltip label="Move to another period"><button onClick={e => { e.stopPropagation(); setShowMoveModal(acc.id); }} className="sp11-btn--move">↗</button></Tooltip>
                      <Tooltip label="Dismiss"><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "dismissed"); }} className="sp11-btn--dismiss">✕</button></Tooltip>
                    </div>
                  </>}
                  {st === "approved" && <>
                    <button disabled className="sp11-btn--approved">Booked</button>
                    <div className="sp11-accrual-secondary-slot">
                      <Tooltip label="Undo booking"><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "suggested"); }} className="sp11-btn--undo" style={{ flex: 1 }}>↩</button></Tooltip>
                    </div>
                  </>}
                  {st === "dismissed" && <Tooltip label="Undo dismissal"><button onClick={e => { e.stopPropagation(); setStatus(acc.id, "suggested"); }} className="sp11-btn--undo">↩</button></Tooltip>}
                </div>
              </div>

              <div className={`sp11-accrual-detail${isExp ? "" : " sp11-accrual-detail--closed"}`}>
                <div className="sp11-accrual-detail__clip">
                <div className="sp11-accrual-detail__inner">
                  <div className="sp11-detail-grid">
                    <div>
                      <div className="sp11-detail-section-label sp11-detail-section-label--brand">Source: {src.label}</div>
                      <p className="sp11-rationale">{acc.rationale}</p>
                      {acc.signals.map((s, i) => <div key={i} className="sp11-signal-row"><Badge>{s.type}</Badge><span className="sp11-signal-row__text">{s.detail}</span></div>)}
                      {acc.movedFrom && <div className="sp11-callout sp11-callout--moved sp11-mt-6">↗ Moved from {acc.movedFrom}</div>}
                    </div>
                    <div>
                      <div className="sp11-detail-section-label sp11-detail-section-label--brand">Actions</div>
                      <div className="sp11-flex sp11-flex-wrap sp11-gap-5 sp11-mb-12">{src.actions.map(a => <SourceAction key={a} action={a} accrualId={acc.id} actionStates={actionStates} setActionStates={setActionStates} />)}</div>
                      {st !== "dismissed" && <div className="sp11-adjust-box">
                        <div className="sp11-adjust-box__label">Adjust Amount</div>
                        <div className="sp11-adjust-box__row"><span className="sp11-adjust-box__currency">$</span><input type="number" value={amt} onChange={e => setEditAmounts(p => ({ ...p, [acc.id]: Number(e.target.value) }))} onClick={e => e.stopPropagation()} className="sp11-adjust-box__input" /></div>
                        <label className="sp11-adjust-box__checkbox-label"><input type="checkbox" checked={acc.autoReverse} onChange={() => setAccruals(p => p.map(a => a.id === acc.id ? { ...a, autoReverse: !a.autoReverse } : a))} /> Auto-reverse next period</label>
                      </div>}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
