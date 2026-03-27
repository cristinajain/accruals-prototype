// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";
import { ACTUALS_DATA } from "../../../lib/data";

export function VarianceTab({ varianceData, totBudget, totAccrual, totActual, pLabel, accruals }) {
  const fullVariance = varianceData.map(r => {
    // Best known = actual if available, otherwise accrual, otherwise 0
    const bestKnown = r.actualTotal > 0 ? r.actualTotal : r.accrualTotal;
    const totalVariance = bestKnown - r.budgetVal;
    const pctVariance = r.budgetVal > 0 ? ((totalVariance / r.budgetVal) * 100).toFixed(1) : (bestKnown > 0 ? "N/A" : "0.0");
    const source = r.actualTotal > 0 ? "actual" : r.accrualTotal > 0 ? "accrual" : "none";

    // Build explanation — only explain variances, not matches
    let explanation = "";
    const mAccruals = r.matchingAccruals || accruals.filter(a => a.glCode === r.glCode && a.month === pLabel);
    const mActuals = r.matchingActuals || ACTUALS_DATA.filter(a => a.glCode === r.glCode);

    // Skip explanation if on budget (within 1%)
    const isOnBudget = r.budgetVal > 0 && Math.abs(totalVariance) < r.budgetVal * 0.01;

    if (!isOnBudget && bestKnown > 0) {
      if (r.budgetVal === 0) {
        // Unbudgeted
        if (source === "actual" && r.accrualTotal > 0) explanation = `Unbudgeted. Actual received — prior accrual was ${Dl(r.accrualTotal)}. `;
        else if (source === "actual") explanation = `Unbudgeted — no accrual existed, full amount is a P&L surprise. `;
        else explanation = `Unbudgeted — `;
        mAccruals.forEach(a => {
          if (a.movedFrom) explanation += `Originally budgeted in ${a.movedFrom}, pulled forward due to early execution. `;
          else if (a.sourceType === "work-order") explanation += `Emergency work order — not in original budget. `;
          else if (a.sourceType === "pm-email") explanation += `Flagged by PM — unplanned expense. `;
        });
        mActuals.forEach(a => { if (a.notes) explanation += a.notes + " "; });
      } else if (totalVariance > 0) {
        // Over budget — explain why
        if (source === "actual" && r.accrualTotal > 0) {
          const accVsAct = r.actualTotal - r.accrualTotal;
          explanation = `Over budget by ${Dl(totalVariance)}. `;
          if (Math.abs(accVsAct) > r.accrualTotal * 0.02) explanation += `Actual came in ${accVsAct > 0 ? "above" : "below"} accrual estimate of ${Dl(r.accrualTotal)} by ${Dl(Math.abs(accVsAct))}. `;
        } else if (source === "actual") {
          explanation = `Over budget by ${Dl(totalVariance)}. `;
        } else {
          explanation = `Estimated ${Dl(totalVariance)} over budget. `;
        }
        mAccruals.forEach(a => {
          if (a.sourceType === "work-order") explanation += `Driven by emergency work order — scope exceeded budget assumptions. `;
          else if (a.sourceType === "pm-email") explanation += `PM-reported expense above budgeted amount. `;
          else if (a.sourceType === "utility-model") explanation += `Seasonal model: weather conditions drove higher usage than budgeted. `;
          else if (a.sourceType === "open-po") explanation += `PO includes extras beyond base budget (tenant move-in cleanings). `;
          else if (a.sourceType === "gl-pattern") explanation += `Historical trend running above budget — vendor rate creep. `;
          if (a.movedFrom) explanation += `Timing shift from ${a.movedFrom}. `;
        });
        mActuals.forEach(a => { if (a.notes) explanation += a.notes + " "; if (a.spread) explanation += `Multi-period invoice: ${Dl(a.spread.schedule.find(s => s.status === "current")?.amount || 0)} allocated to this period. `; });
      } else if (totalVariance < 0) {
        // Under budget — explain why
        explanation = `Under budget by ${Dl(Math.abs(totalVariance))}. `;
        if (source === "accrual") {
          mAccruals.forEach(a => {
            if (a.sourceType === "contract") explanation += `Contract rate below budgeted amount. `;
            else if (a.sourceType === "utility-model") explanation += `Milder conditions or lower occupancy than budgeted. `;
            else if (a.sourceType === "gl-pattern") explanation += `Vendor invoicing trending below budget. `;
          });
        } else {
          explanation += `Actual invoice came in below budget. `;
          mActuals.forEach(a => { if (a.notes) explanation += a.notes + " "; });
        }
      }
    } else if (r.budgetVal > 0 && bestKnown === 0) {
      explanation = "Budgeted but no activity or accrual this period.";
    }

    return { ...r, bestKnown, totalVariance, pctVariance, source, explanation: explanation.trim(), isOnBudget };
  });

  const totBestKnown = fullVariance.reduce((s, v) => s + v.bestKnown, 0);
  const totVar = totBestKnown - totBudget;
  const favorableCount = fullVariance.filter(v => v.totalVariance < 0).length;
  const unfavorableCount = fullVariance.filter(v => v.totalVariance > 0).length;
  const actualCount = fullVariance.filter(v => v.source === "actual").length;
  const accrualCount = fullVariance.filter(v => v.source === "accrual").length;

  return <>
  <div className="sp-banner sp-banner--purple" style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div><div style={{ fontWeight: 700, fontSize: 16, color: "#5b21b6" }}>Variance Report — {pLabel}</div><div style={{ fontSize: 12, color: "#7c3aed", marginTop: 2 }}>Full P&L view: budget vs. best known (actual where available, accrual estimate where not)</div></div>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Budget</div><div style={{ fontSize: 17, fontWeight: 700, color: "#5b21b6" }}>{Dl(totBudget)}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Best Known</div><div style={{ fontSize: 17, fontWeight: 700, color: "#5b21b6" }}>{Dl(totBestKnown)}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#7c3aed" }}>Variance</div><div style={{ fontSize: 17, fontWeight: 700, color: totVar > 0 ? "#dc2626" : totVar < 0 ? "#059669" : "#5b21b6" }}>{totVar >= 0 ? "+" : ""}{Dl(totVar)}</div></div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#7c3aed" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#059669" }} /> {actualCount} GL lines from actuals</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#7c3aed" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#6366f1" }} /> {accrualCount} from AI accrual estimates</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#7c3aed" }}>📈 {unfavorableCount} unfavorable · 📉 {favorableCount} favorable</div>
    </div>
  </div>

  <div style={{ background: "#fff", borderRadius: 11, border: "1px solid #e2e8f0", overflow: "hidden" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead><tr style={{ background: "#f8fafc" }}>
        <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", width: "16%" }}>GL Code</th>
        <th style={{ padding: "9px 8px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", width: "9%" }}>Budget</th>
        <th style={{ padding: "9px 8px", textAlign: "right", fontWeight: 600, color: "#059669", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", width: "9%" }}>Actual</th>
        <th style={{ padding: "9px 8px", textAlign: "right", fontWeight: 600, color: "#6366f1", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", background: "#fafaff", width: "9%" }}>Accrual</th>
        <th style={{ padding: "9px 8px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", width: "9%" }}>Best Known</th>
        <th style={{ padding: "9px 8px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", width: "9%" }}>Variance $</th>
        <th style={{ padding: "9px 6px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", width: "6%" }}>Var %</th>
        <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Variance Analysis</th>
      </tr></thead>
      <tbody>
        {fullVariance.map((r, i) => {
          const vColor = r.totalVariance > 0 ? "#dc2626" : r.totalVariance < 0 ? "#059669" : "#64748b";
          const sourceIcon = r.source === "actual" ? "✓" : r.source === "accrual" ? "◐" : "";
          return <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "9px 14px" }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{r.glCode}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{r.vendor}</div>
            </td>
            <td style={{ padding: "9px 8px", textAlign: "right", fontWeight: 500, color: "#475569" }}>{r.budgetVal > 0 ? Dl(r.budgetVal) : <span style={{ color: "#d1d5db" }}>—</span>}</td>
            <td style={{ padding: "9px 8px", textAlign: "right", fontWeight: r.actualTotal > 0 ? 600 : 400, color: r.actualTotal > 0 ? "#059669" : "#d1d5db" }}>{r.actualTotal > 0 ? Dl(r.actualTotal) : "—"}</td>
            <td style={{ padding: "9px 8px", textAlign: "right", fontWeight: r.accrualTotal > 0 && r.actualTotal === 0 ? 600 : 400, color: r.accrualTotal > 0 && r.actualTotal === 0 ? "#6366f1" : "#d1d5db", background: "#fafaff" }}>{r.accrualTotal > 0 && r.actualTotal === 0 ? Dl(r.accrualTotal) : "—"}</td>
            <td style={{ padding: "9px 8px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 10, color: r.source === "actual" ? "#059669" : r.source === "accrual" ? "#6366f1" : "#d1d5db" }}>{sourceIcon}</span>
                {r.bestKnown > 0 ? Dl(r.bestKnown) : <span style={{ color: "#d1d5db", fontWeight: 400 }}>—</span>}
              </div>
            </td>
            <td style={{ padding: "9px 8px", textAlign: "right", fontWeight: 600, color: vColor }}>
              {r.totalVariance === 0 && r.bestKnown === 0 ? "—" : r.totalVariance === 0 ? "✓" : `${r.totalVariance > 0 ? "+" : ""}${Dl(r.totalVariance)}`}
            </td>
            <td style={{ padding: "9px 6px", textAlign: "right", fontWeight: 500, fontSize: 11, color: vColor }}>
              {r.pctVariance === "0.0" || r.pctVariance === "N/A" ? (r.bestKnown > 0 && r.budgetVal === 0 ? "N/A" : "") : `${r.totalVariance > 0 ? "+" : ""}${r.pctVariance}%`}
            </td>
            <td style={{ padding: "9px 14px", fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
              {r.explanation ? <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 3 }}>
                  {r.source === "actual" && r.accrualTotal > 0 && !r.isOnBudget && <Badge color="green">Actual received</Badge>}
                  {r.source === "accrual" && !r.isOnBudget && <Badge color="indigo">AI estimate</Badge>}
                  {r.movedItems.map((m, j) => <Badge key={j} color="orange">↗ {m.movedFrom}</Badge>)}
                  {r.bestKnown > 0 && r.budgetVal === 0 && <Badge color="red">Unbudgeted</Badge>}
                  {r.bestKnown === 0 && r.budgetVal > 0 && <Badge color="gray">No activity</Badge>}
                  {r.matchingActuals.filter(a => a.spread).length > 0 && <Badge color="purple">Multi-period</Badge>}
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{r.explanation}</div>
              </> : null}
            </td>
          </tr>;
        })}
        <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
          <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13 }}>Total</td>
          <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{Dl(totBudget)}</td>
          <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#059669" }}>{totActual > 0 ? Dl(totActual) : "—"}</td>
          <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#6366f1", background: "#fafaff" }}>{Dl(fullVariance.filter(v => v.source === "accrual").reduce((s, v) => s + v.accrualTotal, 0))}</td>
          <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{Dl(totBestKnown)}</td>
          <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, fontSize: 13, color: totVar > 0 ? "#dc2626" : "#059669" }}>{totVar >= 0 ? "+" : ""}{Dl(totVar)}</td>
          <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700, fontSize: 11, color: totVar > 0 ? "#dc2626" : "#059669" }}>{totBudget > 0 ? `${totVar >= 0 ? "+" : ""}${((totVar / totBudget) * 100).toFixed(1)}%` : ""}</td>
          <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b" }}>{actualCount} actuals · {accrualCount} accrual estimates · {fullVariance.filter(v => v.source === "none").length} no activity</td>
        </tr>
      </tbody>
    </table>
  </div>
  </>;
}
