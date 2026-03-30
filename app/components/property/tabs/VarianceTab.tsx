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
  <div className="sp-banner sp-banner--green sp-mb-16">
    <div className="sp-flex-between sp-mb-12">
      <div><div className="sp-var-banner__title">Variance Report — {pLabel}</div><div className="sp-var-banner__sub">Full P&amp;L view: budget vs. best known (actual where available, accrual estimate where not)</div></div>
      <div className="sp-flex sp-gap-14">
        <div className="sp-text-right"><div className="sp-var-banner__kpi-label">Budget</div><div className="sp-var-banner__kpi-value">{Dl(totBudget)}</div></div>
        <div className="sp-text-right"><div className="sp-var-banner__kpi-label">Best Known</div><div className="sp-var-banner__kpi-value">{Dl(totBestKnown)}</div></div>
        <div className="sp-text-right"><div className="sp-var-banner__kpi-label">Variance</div><div className="sp-var-banner__kpi-value" style={{ color: totVar > 0 ? "var(--red-600)" : totVar < 0 ? "var(--green-600)" : "var(--text-subtle)" }}>{totVar >= 0 ? "+" : ""}{Dl(totVar)}</div></div>
      </div>
    </div>
    <div className="sp-flex sp-gap-16">
      <div className="sp-var-legend-item"><div className="sp-legend-dot" style={{ background: "var(--green-600)" }} /> {actualCount} GL lines from actuals</div>
      <div className="sp-var-legend-item"><div className="sp-legend-dot" style={{ background: "var(--brand-primary)" }} /> {accrualCount} from AI accrual estimates</div>
      <div className="sp-var-legend-item">📈 {unfavorableCount} unfavorable · 📉 {favorableCount} favorable</div>
    </div>
  </div>

  <div className="sp-var-table-wrap">
    <table className="sp-var-table">
      <thead><tr>
        <th style={{ width: "16%" }}>GL Code</th>
        <th style={{ width: "9%" }}>Budget</th>
        <th className="sp-var-table th--actual" style={{ width: "9%" }}>Actual</th>
        <th className="sp-var-table th--accrual" style={{ width: "9%" }}>Accrual</th>
        <th style={{ width: "9%" }}>Best Known</th>
        <th style={{ width: "9%" }}>Variance $</th>
        <th style={{ width: "6%" }}>Var %</th>
        <th>Variance Analysis</th>
      </tr></thead>
      <tbody>
        {fullVariance.map((r, i) => {
          const vColor = r.totalVariance > 0 ? "var(--red-600)" : r.totalVariance < 0 ? "var(--green-600)" : "var(--text-subtle)";
          const sourceIcon = r.source === "actual" ? "✓" : r.source === "accrual" ? "◐" : "";
          return <tr key={i}>
            <td>
              <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>{r.glCode}</div>
              <div className="sp-text-xs-muted">{r.vendor}</div>
            </td>
            <td style={{ fontWeight: "var(--font-weight-medium)", color: "var(--text-muted)" }}>{r.budgetVal > 0 ? Dl(r.budgetVal) : <span style={{ color: "var(--text-disabled)" }}>—</span>}</td>
            <td style={{ fontWeight: r.actualTotal > 0 ? "var(--font-weight-semibold)" : "var(--font-weight-normal)", color: r.actualTotal > 0 ? "var(--green-600)" : "var(--text-disabled)" }}>{r.actualTotal > 0 ? Dl(r.actualTotal) : "—"}</td>
            <td className="sp-var-table td--accrual" style={{ fontWeight: r.accrualTotal > 0 && r.actualTotal === 0 ? "var(--font-weight-semibold)" : "var(--font-weight-normal)", color: r.accrualTotal > 0 && r.actualTotal === 0 ? "var(--brand-primary)" : "var(--text-disabled)" }}>{r.accrualTotal > 0 && r.actualTotal === 0 ? Dl(r.accrualTotal) : "—"}</td>
            <td style={{ fontWeight: "var(--font-weight-bold)", color: "var(--text-primary)" }}>
              <div className="sp-flex-end sp-gap-4">
                <span style={{ fontSize: "var(--font-size-xs)", color: r.source === "actual" ? "var(--green-600)" : r.source === "accrual" ? "var(--brand-primary)" : "var(--text-disabled)" }}>{sourceIcon}</span>
                {r.bestKnown > 0 ? Dl(r.bestKnown) : <span style={{ color: "var(--text-disabled)", fontWeight: "var(--font-weight-normal)" }}>—</span>}
              </div>
            </td>
            <td style={{ fontWeight: "var(--font-weight-semibold)", color: vColor }}>
              {r.totalVariance === 0 && r.bestKnown === 0 ? "—" : r.totalVariance === 0 ? "✓" : `${r.totalVariance > 0 ? "+" : ""}${Dl(r.totalVariance)}`}
            </td>
            <td style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: vColor }}>
              {r.pctVariance === "0.0" || r.pctVariance === "N/A" ? (r.bestKnown > 0 && r.budgetVal === 0 ? "N/A" : "") : `${r.totalVariance > 0 ? "+" : ""}${r.pctVariance}%`}
            </td>
            <td style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", lineHeight: "var(--line-height-normal)" }}>
              {r.explanation ? <>
                <div className="sp-flex sp-flex-wrap sp-gap-4 sp-mb-2">
                  {r.source === "actual" && r.accrualTotal > 0 && !r.isOnBudget && <Badge color="green">Actual received</Badge>}
                  {r.source === "accrual" && !r.isOnBudget && <Badge color="green">AI estimate</Badge>}
                  {r.movedItems.map((m, j) => <Badge key={j} color="orange">↗ {m.movedFrom}</Badge>)}
                  {r.bestKnown > 0 && r.budgetVal === 0 && <Badge color="red">Unbudgeted</Badge>}
                  {r.bestKnown === 0 && r.budgetVal > 0 && <Badge color="gray">No activity</Badge>}
                  {r.matchingActuals.filter(a => a.spread).length > 0 && <Badge color="purple">Multi-period</Badge>}
                </div>
                <div className="sp-text-sm-muted">{r.explanation}</div>
              </> : null}
            </td>
          </tr>;
        })}
        <tr>
          <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)" }}>Total</td>
          <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)" }}>{Dl(totBudget)}</td>
          <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", color: "var(--green-600)" }}>{totActual > 0 ? Dl(totActual) : "—"}</td>
          <td className="sp-var-table td--accrual" style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", color: "var(--brand-primary)" }}>{Dl(fullVariance.filter(v => v.source === "accrual").reduce((s, v) => s + v.accrualTotal, 0))}</td>
          <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)" }}>{Dl(totBestKnown)}</td>
          <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", color: totVar > 0 ? "var(--red-600)" : "var(--green-600)" }}>{totVar >= 0 ? "+" : ""}{Dl(totVar)}</td>
          <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-sm)", color: totVar > 0 ? "var(--red-600)" : "var(--green-600)" }}>{totBudget > 0 ? `${totVar >= 0 ? "+" : ""}${((totVar / totBudget) * 100).toFixed(1)}%` : ""}</td>
          <td className="sp-text-sm-muted">{actualCount} actuals · {accrualCount} accrual estimates · {fullVariance.filter(v => v.source === "none").length} no activity</td>
        </tr>
      </tbody>
    </table>
  </div>
  </>;
}
