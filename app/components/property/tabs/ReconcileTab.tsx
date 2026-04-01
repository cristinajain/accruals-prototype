// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";
import { ACTUALS_DATA } from "../../../lib/data";

export function ReconcileTab({ pLabel, reconciledCount, reconcileStates, setReconcileStates, expandedActual, setExpandedActual }) {
  return (
    <>
      <div className="sp11-banner sp11-banner--green sp11-mb-16 sp11-flex-between" style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div>
            <div className="sp11-flex-center sp11-gap-5 sp11-mb-2"><span className="sp11-recon-banner__title">Reconcile Actuals</span><Badge color="white">{pLabel}</Badge></div>
            <div className="sp11-recon-banner__sub">Match invoices to accruals, post JEs, resolve variances</div>
          </div>
        <div className="sp11-flex sp11-gap-12"><div className="sp11-text-right"><div className="sp11-recon-banner__kpi-label">Reconciled</div><div className="sp11-recon-banner__kpi-value">{reconciledCount}/{ACTUALS_DATA.length}</div></div></div>
      </div>

      {/* Single-period */}
      <div className="sp11-section-header sp11-mb-8">
        <span className="sp11-section-header__title">📄 Single-Period Invoices</span>
        {(() => { const pending = ACTUALS_DATA.filter(a => !a.spread && reconcileStates[a.id] !== "reconciled").length; return pending > 0 && <button onClick={() => { const n = { ...reconcileStates }; ACTUALS_DATA.filter(a => !a.spread).forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} className="sp11-btn sp11-btn--primary">✓ Post All ({pending})</button>; })()}
      </div>
      <div className="sp11-accrual-list sp11-mb-24">
          {ACTUALS_DATA.filter(a => !a.spread).map(act => {
            const v = act.actualAmount - act.accrualAmount, isExp = expandedActual === act.id, rS = reconcileStates[act.id];
            const sCfg = { matched: { l: "Exact Match" }, variance: { l: "Variance" }, unmatched: { l: "No Accrual" } }[act.status];
            const vColor = v > 0 ? "var(--red-800)" : "var(--green-600)";
            return (
              <div key={act.id} className={`sp11-accrual-row${isExp ? " sp11-accrual-row--expanded" : ""}${rS === "reconciled" ? " sp11-accrual-row--reconciled" : ""}`}>
                <div onClick={() => setExpandedActual(isExp ? null : act.id)} className="sp11-accrual-row__top" style={{ gridTemplateColumns: "1fr 100px 100px 100px 150px" }}>
                  <div><div className="sp11-flex-center sp11-gap-5 sp11-mb-2"><span className="sp11-text-md-semibold">{act.vendor}</span><Badge color={["Exact Match", "Variance", "No Accrual"].includes(sCfg.l) ? "white" : undefined}>{sCfg.l}</Badge>{rS === "reconciled" && <Badge>Posted</Badge>}</div><div className="sp11-text-sm-muted">{act.glCode} · {act.invoiceNum}</div></div>
                  <div><div className="sp11-text-xs-muted">Accrued</div><div className="sp11-recon-cell sp11-recon-cell--semibold">{act.accrualAmount ? Dl(act.accrualAmount) : "—"}</div></div>
                  <div><div className="sp11-text-xs-muted">Actual</div><div className="sp11-recon-cell sp11-recon-cell--bold">{Dl(act.actualAmount)}</div></div>
                  <div><div className="sp11-text-xs-muted">Variance</div><div className="sp11-recon-cell sp11-recon-cell--semibold" style={{ color: vColor }}>{v === 0 ? "✓ $0" : `${v > 0 ? "+" : ""}${Dl(v)}`}</div></div>
                  <div className="sp11-flex-end sp11-gap-5">
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} className="sp11-btn--approve">✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} className="sp11-btn--undo">↩</button>}
                  </div>
                </div>
                <div className={`sp11-accrual-detail${isExp ? "" : " sp11-accrual-detail--closed"}`}>
                  <div className="sp11-accrual-detail__clip">
                  <div className="sp11-accrual-detail__inner">
                    <div className="sp11-detail-grid">
                      <div>
                        <div className="sp11-detail-section-label sp11-detail-section-label--brand">Analysis</div>
                        {act.status === "matched" && <p className="sp11-rationale" style={{ margin: 0 }}>Exact match — zero variance.</p>}
                        {act.status === "variance" && <><p className="sp11-rationale" style={{ margin: "0 0 8px" }}>Actual was <strong style={{ color: v > 0 ? "var(--red-800)" : "var(--green-600)" }}>{Dl(Math.abs(v))} {v > 0 ? "over" : "under"}</strong>.</p>{act.notes && <div className="sp11-callout sp11-callout--warning">💡 {act.notes}</div>}</>}
                        {act.status === "unmatched" && <><div className="sp11-callout sp11-callout--error sp11-mb-6">⚠️ No accrual — full {Dl(act.actualAmount)} hits P&amp;L.</div>{act.notes && <p className="sp11-rationale" style={{ margin: 0 }}>{act.notes}</p>}<div className="sp11-callout sp11-callout--info sp11-mt-6">🧠 Added to AI watchlist for future periods.</div></>}
                      </div>
                      <div>
                        <div className="sp11-detail-section-label sp11-detail-section-label--brand">Journal Entry</div>
                        <div className="sp11-je-wrap">
                          {act.accrualAmount > 0 && <><div className="sp11-je-header">Reverse Accrual</div><table className="sp11-je-table-inner"><tbody><tr><td>DR 2100 — Accrued Exp</td><td>{Dl(act.accrualAmount)}</td></tr><tr><td className="sp11-je-td--cr">CR {act.glCode}</td><td>{Dl(act.accrualAmount)}</td></tr></tbody></table></>}
                          <div className="sp11-je-header">Book Actual</div>
                          <table className="sp11-je-table-inner"><tbody><tr><td>DR {act.glCode}</td><td>{Dl(act.actualAmount)}</td></tr><tr><td className="sp11-je-td--cr">CR 2000 — AP</td><td>{Dl(act.actualAmount)}</td></tr></tbody></table>
                          {v !== 0 && act.accrualAmount > 0 && <div className={`sp11-je-footer ${v > 0 ? "sp11-je-footer--amber" : "sp11-je-footer--green"}`}><strong>Net:</strong> {v > 0 ? "+" : ""}{Dl(v)} to P&amp;L</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Multi-period */}
      <div className="sp11-section-header sp11-mb-8">
        <span className="sp11-section-header__title">📅 Multi-Period Invoices</span>
        {(() => { const pending = ACTUALS_DATA.filter(a => a.spread && reconcileStates[a.id] !== "reconciled").length; return pending > 0 && <button onClick={() => { const n = { ...reconcileStates }; ACTUALS_DATA.filter(a => a.spread).forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} className="sp11-btn sp11-btn--primary">✓ Post All ({pending})</button>; })()}
      </div>
      <div className="sp11-accrual-list sp11-mb-20">
          {ACTUALS_DATA.filter(a => a.spread).map(act => {
            const sp = act.spread, curAmt = sp.schedule.find(p => p.status === "current")?.amount || 0;
            const isExp = expandedActual === act.id, rS = reconcileStates[act.id];
            const mLbl = { "straight-line": "Straight-Line", weighted: "Weighted" }[sp.method] || sp.method;
            return (
              <div key={act.id} className={`sp11-accrual-row${isExp ? " sp11-accrual-row--expanded" : ""}${rS === "reconciled" ? " sp11-accrual-row--reconciled" : ""}`}>
                <div onClick={() => setExpandedActual(isExp ? null : act.id)} className="sp11-accrual-row__top" style={{ gridTemplateColumns: "1fr 100px 100px 100px 150px" }}>
                  <div><div className="sp11-flex-center sp11-gap-5 sp11-mb-2"><span className="sp11-text-md-semibold">{act.vendor}</span><Badge color={["Straight-Line", "Weighted"].includes(mLbl) ? "white" : undefined}>{mLbl}</Badge>{rS === "reconciled" && <Badge>Posted</Badge>}</div><div className="sp11-text-sm-muted">{act.glCode} · {sp.startMonth} → {sp.endMonth}</div></div>
                  <div><div className="sp11-text-xs-muted">Total</div><div className="sp11-recon-cell sp11-recon-cell--bold">{Dl(act.actualAmount)}</div></div>
                  <div><div className="sp11-text-xs-muted">{pLabel}</div><div className="sp11-recon-cell sp11-recon-cell--brand">{Dl(curAmt)}</div></div>
                  <div><div className="sp11-text-xs-muted">Deferred</div><div className="sp11-recon-cell sp11-recon-cell--secondary">{Dl(act.actualAmount - curAmt)}</div></div>
                  <div className="sp11-flex-end sp11-gap-5">
                    {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} className="sp11-btn--approve">✓ Post JE</button>
                    : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} className="sp11-btn--undo">↩</button>}
                  </div>
                </div>
                <div className={`sp11-accrual-detail${isExp ? "" : " sp11-accrual-detail--closed"}`}>
                  <div className="sp11-accrual-detail__clip">
                  <div className="sp11-accrual-detail__inner">
                    <div className="sp11-detail-grid">
                      <div>
                        <div className="sp11-detail-section-label sp11-detail-section-label--brand">Allocation — {mLbl}</div>
                        <div className="sp11-je-wrap">
                          <table className="sp11-je-table-inner">
                            <thead><tr><th>Period</th><th style={{ textAlign: "right" }}>Amount</th>{sp.method !== "straight-line" && <th style={{ textAlign: "right" }}>Weight</th>}<th style={{ textAlign: "center" }}>Status</th></tr></thead>
                            <tbody>{sp.schedule.map((r, i) => <tr key={i} className={r.status === "current" ? "sp11-recon-schedule-tr--current" : ""}><td>{r.month}</td><td style={{ textAlign: "right", fontWeight: "var(--font-weight-semibold)" }}>{Dl(r.amount)}</td>{sp.method !== "straight-line" && <td style={{ textAlign: "right", fontSize: "var(--font-size-sm)", color: "var(--text-subtle)" }}>{r.weight || ""}</td>}<td style={{ textAlign: "center" }}>{r.status === "current" ? <Badge>Current</Badge> : <Badge>Future</Badge>}</td></tr>)}</tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <div className="sp11-detail-section-label sp11-detail-section-label--brand">Journal Entries</div>
                        <div className="sp11-je-wrap sp11-mb-8">
                          <div className="sp11-je-header">1. Book to Prepaid</div>
                          <table className="sp11-je-table-inner"><tbody><tr><td>DR {sp.glPrepaid}</td><td>{Dl(act.actualAmount)}</td></tr><tr><td className="sp11-je-td--cr">CR 2000 — AP</td><td>{Dl(act.actualAmount)}</td></tr></tbody></table>
                        </div>
                        <div className="sp11-je-wrap">
                          <div className="sp11-je-header sp11-je-header--green">2. {pLabel} Amortization</div>
                          <table className="sp11-je-table-inner"><tbody><tr><td>DR {act.glCode}</td><td>{Dl(curAmt)}</td></tr><tr><td className="sp11-je-td--cr">CR {sp.glPrepaid}</td><td>{Dl(curAmt)}</td></tr></tbody></table>
                          <div className="sp11-je-footer sp11-je-footer--green"><strong>P&amp;L:</strong> {Dl(curAmt)} · <strong>Prepaid:</strong> {Dl(act.actualAmount - curAmt)}</div>
                        </div>
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
