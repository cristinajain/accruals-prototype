// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";
import { ACTUALS_DATA } from "../../../lib/data";

export function ReconcileTab({ pLabel, reconciledCount, reconcileStates, setReconcileStates, expandedActual, setExpandedActual, chatOpen }) {
  return (
    <>
      <div className="sp-banner sp-banner--green" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontWeight: 700, fontSize: 16, color: "#065f46" }}>Reconcile Actuals — {pLabel}</div><div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Match invoices to accruals, post JEs, resolve variances</div></div>
        <div style={{ display: "flex", gap: 12 }}><div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#059669" }}>Reconciled</div><div style={{ fontSize: 17, fontWeight: 700, color: "#065f46" }}>{reconciledCount}/{ACTUALS_DATA.length}</div></div></div>
      </div>

      {/* Single-period */}
      <div className="sp-section-label">📄 Single-Period Invoices</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {ACTUALS_DATA.filter(a => !a.spread).map(act => {
          const v = act.actualAmount - act.accrualAmount, isExp = expandedActual === act.id, rS = reconcileStates[act.id];
          const sCfg = { matched: { c: "green", l: "Exact Match" }, variance: { c: "amber", l: "Variance" }, unmatched: { c: "red", l: "No Accrual" } }[act.status];
          return (<div key={act.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#e2e8f0"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
            <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 80px 80px 100px" : "1fr 100px 100px 100px 150px", alignItems: "center", gap: 12 }}>
              <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{act.vendor}</span><Badge color={sCfg.c}>{sCfg.l}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 11, color: "#64748b" }}>{act.glCode} · {act.invoiceNum}</div></div>
              <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Accrued</div><div style={{ fontWeight: 600, fontSize: 13 }}>{act.accrualAmount ? Dl(act.accrualAmount) : "—"}</div></div>
              <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Actual</div><div style={{ fontWeight: 700, fontSize: 13 }}>{Dl(act.actualAmount)}</div></div>
              <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Variance</div><div style={{ fontWeight: 600, fontSize: 13, color: v === 0 ? "#22c55e" : Math.abs(v) < (act.accrualAmount || 1) * .05 ? "#f59e0b" : "#ef4444" }}>{v === 0 ? "✓ $0" : `${v > 0 ? "+" : ""}${Dl(v)}`}</div></div>
              <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>✓ Post JE</button>
                : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>↩</button>}
              </div>
            </div>
            {isExp && <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px", background: "#fafbfc" }}>
              <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>🔄 Analysis</div>
                  {act.status === "matched" && <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>Exact match — zero variance.</p>}
                  {act.status === "variance" && <><p style={{ fontSize: 13, color: "#334155", margin: "0 0 8px" }}>Actual was <strong style={{ color: v > 0 ? "#dc2626" : "#059669" }}>{Dl(Math.abs(v))} {v > 0 ? "over" : "under"}</strong>.</p>{act.notes && <div style={{ padding: "7px 10px", borderRadius: 7, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>💡 {act.notes}</div>}</>}
                  {act.status === "unmatched" && <><div style={{ padding: "7px 10px", borderRadius: 7, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 12, color: "#991b1b", marginBottom: 6 }}>⚠️ No accrual — full {Dl(act.actualAmount)} hits P&L.</div>{act.notes && <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{act.notes}</p>}<div style={{ marginTop: 6, padding: "7px 10px", borderRadius: 7, background: "#ede9fe", border: "1px solid #ddd6fe", fontSize: 11, color: "#5b21b6" }}>🧠 Added to AI watchlist for future periods.</div></>}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>📝 Journal Entry</div>
                  <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    {act.accrualAmount > 0 && <><div style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600, color: "#475569" }}>Reverse Accrual</div><table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR 2100 — Accrued Exp</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.accrualAmount)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR {act.glCode}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.accrualAmount)}</td></tr></tbody></table></>}
                    <div style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: act.accrualAmount > 0 ? "1px solid #e2e8f0" : "none", fontSize: 10, fontWeight: 600, color: "#475569" }}>Book Actual</div>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR {act.glCode}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR 2000 — AP</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr></tbody></table>
                    {v !== 0 && act.accrualAmount > 0 && <div style={{ padding: "7px 10px", background: v > 0 ? "#fef3c7" : "#dcfce7", borderTop: "1px solid #e2e8f0", fontSize: 11, color: v > 0 ? "#92400e" : "#166534" }}><strong>Net:</strong> {v > 0 ? "+" : ""}{Dl(v)} to P&L</div>}
                  </div>
                </div>
              </div>
            </div>}
          </div>);
        })}
      </div>

      {/* Multi-period */}
      <div className="sp-section-label">📅 Multi-Period Invoices</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {ACTUALS_DATA.filter(a => a.spread).map(act => {
          const sp = act.spread, curAmt = sp.schedule.find(p => p.status === "current")?.amount || 0;
          const isExp = expandedActual === act.id, rS = reconcileStates[act.id];
          const mLbl = { "straight-line": "Straight-Line", weighted: "Weighted" }[sp.method] || sp.method;
          return (<div key={act.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${rS === "reconciled" ? "#bbf7d0" : "#c7d2fe"}`, opacity: rS === "reconciled" ? 0.7 : 1 }}>
            <div onClick={() => setExpandedActual(isExp ? null : act.id)} style={{ padding: "12px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: chatOpen ? "1fr 80px 80px 100px" : "1fr 100px 100px 100px 150px", alignItems: "center", gap: 12 }}>
              <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{act.vendor}</span><Badge color="purple">Multi-Period</Badge><Badge color="cyan">{mLbl}</Badge>{rS === "reconciled" && <Badge color="emerald">Posted</Badge>}</div><div style={{ fontSize: 11, color: "#64748b" }}>{act.glCode} · {sp.startMonth} → {sp.endMonth}</div></div>
              <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Total</div><div style={{ fontWeight: 700, fontSize: 13 }}>{Dl(act.actualAmount)}</div></div>
              <div><div style={{ fontSize: 10, color: "#94a3b8" }}>{pLabel}</div><div style={{ fontWeight: 700, fontSize: 13, color: "#6366f1" }}>{Dl(curAmt)}</div></div>
              <div><div style={{ fontSize: 10, color: "#94a3b8" }}>Deferred</div><div style={{ fontWeight: 600, fontSize: 13, color: "#8b5cf6" }}>{Dl(act.actualAmount - curAmt)}</div></div>
              <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                {rS !== "reconciled" ? <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "reconciled" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>✓ Post JE</button>
                : <button onClick={e => { e.stopPropagation(); setReconcileStates(p => ({ ...p, [act.id]: "pending" })); }} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>↩</button>}
              </div>
            </div>
            {isExp && <div style={{ borderTop: "1px solid #e0e7ff", padding: "14px 18px", background: "#fafbfe" }}>
              <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr" : "1fr 1fr", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", marginBottom: 8 }}>📅 Allocation — {mLbl}</div>
                  <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                      <thead><tr style={{ background: "#f8fafc" }}><th style={{ padding: "7px 10px", textAlign: "left", color: "#64748b", fontSize: 10 }}>Period</th><th style={{ padding: "7px 10px", textAlign: "right", color: "#64748b", fontSize: 10 }}>Amount</th>{sp.method !== "straight-line" && <th style={{ padding: "7px 10px", textAlign: "right", color: "#64748b", fontSize: 10 }}>Weight</th>}<th style={{ padding: "7px 10px", textAlign: "center", color: "#64748b", fontSize: 10 }}>Status</th></tr></thead>
                      <tbody>{sp.schedule.map((r, i) => <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: r.status === "current" ? "#f0fdf4" : "transparent" }}><td style={{ padding: "7px 10px", fontWeight: r.status === "current" ? 600 : 400 }}>{r.month}</td><td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(r.amount)}</td>{sp.method !== "straight-line" && <td style={{ padding: "7px 10px", textAlign: "right", fontSize: 11, color: "#64748b" }}>{r.weight || ""}</td>}<td style={{ padding: "7px 10px", textAlign: "center" }}>{r.status === "current" ? <Badge color="green">Current</Badge> : <Badge color="gray">Future</Badge>}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>📝 Journal Entries</div>
                  <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600 }}>1. Book to Prepaid</div>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR {sp.glPrepaid}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR 2000 — AP</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(act.actualAmount)}</td></tr></tbody></table>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ padding: "7px 10px", background: "#f0fdf4", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600, color: "#065f46" }}>2. {pLabel} Amortization</div>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody><tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR {act.glCode}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td></tr><tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR {sp.glPrepaid}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(curAmt)}</td></tr></tbody></table>
                    <div style={{ padding: "7px 10px", background: "#f0fdf4", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#065f46" }}><strong>P&L:</strong> {Dl(curAmt)} · <strong>Prepaid:</strong> {Dl(act.actualAmount - curAmt)}</div>
                  </div>
                </div>
              </div>
            </div>}
          </div>);
        })}
      </div>

      {Object.values(reconcileStates).some(s => s === "pending") && <div style={{ textAlign: "center" }}><button onClick={() => { const n = {}; ACTUALS_DATA.forEach(a => { n[a.id] = "reconciled"; }); setReconcileStates(n); }} className="sp-btn sp-btn--success-gradient" style={{ padding: "10px 28px" }}>✓ Post All ({ACTUALS_DATA.length - reconciledCount})</button></div>}
    </>
  );
}
