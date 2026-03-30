// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";
import { ACTUALS_DATA } from "../../../lib/data";

export function ReconcileTab({ pLabel, reconciledCount, reconcileStates, setReconcileStates, expandedActual, setExpandedActual, chatOpen }) {
  return (
    <>
      <div className="sp-banner sp-banner--green sp-mb-16 sp-flex-between">
        <div><div className="sp-recon-banner__title">Reconcile Actuals — {pLabel}</div><div className="sp-recon-banner__sub">Match invoices to accruals, post JEs, resolve variances</div></div>
        <div className="sp-flex sp-gap-12"><div className="sp-text-right"><div className="sp-recon-banner__kpi-label">Reconciled</div><div className="sp-recon-banner__kpi-value">{reconciledCount}/{ACTUALS_DATA.length}</div></div></div>
      </div>

      {/* Single-period */}
      <div className="sp-flex-between sp-mb-8">
        <div className="sp-section-label" style={{ marginBottom: 0 }}>📄 Single-Period Invoices</div>
        {(() => { const pending = ACTUALS_DATA.filter(a => !a.spread && reconcileStates[a.id] !== "reconciled").length; return pending > 0 && <button onClick={() => { const n = { ...reconcileStates }; ACTUALS_DATA.filter(a => !a.spread).forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} className="sp-btn sp-btn--success-gradient" style={{ padding: "5px 14px" }}>✓ Post All ({pending})</button>; })()}
      </div>
      <div className="sp-accrual-list sp-mb-24">
        {ACTUALS_DATA.filter(a => !a.spread).map(act => {
          const v = act.actualAmount - act.accrualAmount, isExp = expandedActual === act.id, rS = reconcileStates[act.id];
          const sCfg = { matched: { c: "green", l: "Exact Match" }, variance: { c: "amber", l: "Variance" }, unmatched: { c: "red", l: "No Accrual" } }[act.status];
          return (<div key={act.id} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-3xl)", border: `1px solid ${rS === "reconciled" ? "var(--green-200)" : "var(--border)"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
            <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 80px 80px 100px" : "1fr 100px 100px 100px 150px", alignItems: "center", gap: 12 }}>
              <div><div className="sp-flex-center sp-gap-5 sp-mb-2"><span className="sp-text-md-semibold">{act.vendor}</span><Badge color={sCfg.c}>{sCfg.l}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div className="sp-text-sm-muted">{act.glCode} · {act.invoiceNum}</div></div>
              <div><div className="sp-text-xs-muted">Accrued</div><div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)" }}>{act.accrualAmount ? Dl(act.accrualAmount) : "—"}</div></div>
              <div><div className="sp-text-xs-muted">Actual</div><div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)" }}>{Dl(act.actualAmount)}</div></div>
              <div><div className="sp-text-xs-muted">Variance</div><div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", color: v === 0 ? "var(--green-500)" : Math.abs(v) < (act.accrualAmount || 1) * .05 ? "var(--amber-500)" : "var(--red-500)" }}>{v === 0 ? "✓ $0" : `${v > 0 ? "+" : ""}${Dl(v)}`}</div></div>
              <div className="sp-flex-end sp-gap-5">
                {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} className="sp-btn--approve">✓ Post JE</button>
                : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} className="sp-btn--undo">↩</button>}
              </div>
            </div>
            {isExp && <div className="sp-accrual-detail">
              <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                <div>
                  <div className="sp-detail-section-label sp-detail-section-label--green">🔄 Analysis</div>
                  {act.status === "matched" && <p className="sp-rationale" style={{ margin: 0 }}>Exact match — zero variance.</p>}
                  {act.status === "variance" && <><p className="sp-rationale" style={{ margin: "0 0 8px" }}>Actual was <strong style={{ color: v > 0 ? "var(--red-600)" : "var(--green-700)" }}>{Dl(Math.abs(v))} {v > 0 ? "over" : "under"}</strong>.</p>{act.notes && <div className="sp-callout sp-callout--warning">💡 {act.notes}</div>}</>}
                  {act.status === "unmatched" && <><div className="sp-callout sp-callout--error sp-mb-6">⚠️ No accrual — full {Dl(act.actualAmount)} hits P&amp;L.</div>{act.notes && <p className="sp-rationale" style={{ margin: 0 }}>{act.notes}</p>}<div className="sp-callout sp-callout--info sp-mt-6">🧠 Added to AI watchlist for future periods.</div></>}
                </div>
                <div>
                  <div className="sp-detail-section-label sp-detail-section-label--green">📝 Journal Entry</div>
                  <div className="sp-je-wrap">
                    {act.accrualAmount > 0 && <><div className="sp-je-header">Reverse Accrual</div><table className="sp-je-table-inner"><tbody><tr><td>DR 2100 — Accrued Exp</td><td>{Dl(act.accrualAmount)}</td></tr><tr><td style={{ paddingLeft: 20 }}>CR {act.glCode}</td><td>{Dl(act.accrualAmount)}</td></tr></tbody></table></>}
                    <div className="sp-je-header">Book Actual</div>
                    <table className="sp-je-table-inner"><tbody><tr><td>DR {act.glCode}</td><td>{Dl(act.actualAmount)}</td></tr><tr><td style={{ paddingLeft: 20 }}>CR 2000 — AP</td><td>{Dl(act.actualAmount)}</td></tr></tbody></table>
                    {v !== 0 && act.accrualAmount > 0 && <div className={`sp-je-footer ${v > 0 ? "sp-je-footer--amber" : "sp-je-footer--green"}`}><strong>Net:</strong> {v > 0 ? "+" : ""}{Dl(v)} to P&amp;L</div>}
                  </div>
                </div>
              </div>
            </div>}
          </div>);
        })}
      </div>

      {/* Multi-period */}
      <div className="sp-flex-between sp-mb-8">
        <div className="sp-section-label" style={{ marginBottom: 0 }}>📅 Multi-Period Invoices</div>
        {(() => { const pending = ACTUALS_DATA.filter(a => a.spread && reconcileStates[a.id] !== "reconciled").length; return pending > 0 && <button onClick={() => { const n = { ...reconcileStates }; ACTUALS_DATA.filter(a => a.spread).forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} className="sp-btn sp-btn--success-gradient" style={{ padding: "5px 14px" }}>✓ Post All ({pending})</button>; })()}
      </div>
      <div className="sp-accrual-list sp-mb-20">
        {ACTUALS_DATA.filter(a => a.spread).map(act => {
          const sp = act.spread, curAmt = sp.schedule.find(p => p.status === "current")?.amount || 0;
          const isExp = expandedActual === act.id, rS = reconcileStates[act.id];
          const mLbl = { "straight-line": "Straight-Line", weighted: "Weighted" }[sp.method] || sp.method;
          return (<div key={act.id} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-3xl)", border: `1px solid ${rS === "reconciled" ? "var(--green-200)" : "var(--border)"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
            <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 80px 80px 100px" : "1fr 100px 100px 100px 150px", alignItems: "center", gap: 12 }}>
              <div><div className="sp-flex-center sp-gap-5 sp-mb-2"><span className="sp-text-md-semibold">{act.vendor}</span><Badge color="purple">Multi-Period</Badge><Badge color="cyan">{mLbl}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div className="sp-text-sm-muted">{act.glCode} · {sp.startMonth} → {sp.endMonth}</div></div>
              <div><div className="sp-text-xs-muted">Total</div><div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)" }}>{Dl(act.actualAmount)}</div></div>
              <div><div className="sp-text-xs-muted">{pLabel}</div><div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", color: "var(--brand-primary)" }}>{Dl(curAmt)}</div></div>
              <div><div className="sp-text-xs-muted">Deferred</div><div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", color: "var(--brand-secondary)" }}>{Dl(act.actualAmount - curAmt)}</div></div>
              <div className="sp-flex-end sp-gap-5">
                {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} className="sp-btn--approve">✓ Post JE</button>
                : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} className="sp-btn--undo">↩</button>}
              </div>
            </div>
            {isExp && <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "14px 18px", background: "var(--bg-inset)" }}>
              <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                <div>
                  <div className="sp-detail-section-label sp-detail-section-label--brand">📅 Allocation — {mLbl}</div>
                  <div className="sp-je-wrap">
                    <table className="sp-je-table-inner">
                      <thead><tr style={{ background: "var(--bg-subtle)" }}><th style={{ textAlign: "left", color: "var(--text-subtle)", fontSize: "var(--font-size-xs)" }}>Period</th><th style={{ textAlign: "right", color: "var(--text-subtle)", fontSize: "var(--font-size-xs)" }}>Amount</th>{sp.method !== "straight-line" && <th style={{ textAlign: "right", color: "var(--text-subtle)", fontSize: "var(--font-size-xs)" }}>Weight</th>}<th style={{ textAlign: "center", color: "var(--text-subtle)", fontSize: "var(--font-size-xs)" }}>Status</th></tr></thead>
                      <tbody>{sp.schedule.map((r, i) => <tr key={i} style={{ background: r.status === "current" ? "var(--green-50)" : "transparent" }}><td style={{ fontWeight: r.status === "current" ? "var(--font-weight-semibold)" : "var(--font-weight-normal)" }}>{r.month}</td><td style={{ textAlign: "right", fontWeight: "var(--font-weight-semibold)" }}>{Dl(r.amount)}</td>{sp.method !== "straight-line" && <td style={{ textAlign: "right", fontSize: "var(--font-size-sm)", color: "var(--text-subtle)" }}>{r.weight || ""}</td>}<td style={{ textAlign: "center" }}>{r.status === "current" ? <Badge color="green">Current</Badge> : <Badge color="gray">Future</Badge>}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div className="sp-detail-section-label sp-detail-section-label--green">📝 Journal Entries</div>
                  <div className="sp-je-wrap sp-mb-8">
                    <div className="sp-je-header">1. Book to Prepaid</div>
                    <table className="sp-je-table-inner"><tbody><tr><td>DR {sp.glPrepaid}</td><td>{Dl(act.actualAmount)}</td></tr><tr><td style={{ paddingLeft: 20 }}>CR 2000 — AP</td><td>{Dl(act.actualAmount)}</td></tr></tbody></table>
                  </div>
                  <div className="sp-je-wrap">
                    <div className="sp-je-header sp-je-header--green">2. {pLabel} Amortization</div>
                    <table className="sp-je-table-inner"><tbody><tr><td>DR {act.glCode}</td><td>{Dl(curAmt)}</td></tr><tr><td style={{ paddingLeft: 20 }}>CR {sp.glPrepaid}</td><td>{Dl(curAmt)}</td></tr></tbody></table>
                    <div className="sp-je-footer sp-je-footer--green"><strong>P&amp;L:</strong> {Dl(curAmt)} · <strong>Prepaid:</strong> {Dl(act.actualAmount - curAmt)}</div>
                  </div>
                </div>
              </div>
            </div>}
          </div>);
        })}
      </div>

    </>
  );
}
