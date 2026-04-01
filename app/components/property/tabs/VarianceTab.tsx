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
  const actualCount = fullVariance.filter(v => v.source === "actual").length;
  const accrualCount = fullVariance.filter(v => v.source === "accrual").length;
  const unbudgetedCount = fullVariance.filter(v => v.bestKnown > 0 && v.budgetVal === 0).length;

  return <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: "var(--space-5)" }}>
  <div className="sp11-banner sp11-banner--green" style={{ flexShrink: 0, marginBottom: "4px", paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
    <div className="sp11-flex-between sp11-mb-8">
      <div>
        <div className="sp11-flex-center sp11-gap-5 sp11-mb-2"><span className="sp11-accruals-header__title">Variance Report</span><Badge color="white">{pLabel}</Badge></div>
        <div className="sp11-accruals-header__meta" style={{ display: "block", marginLeft: 0, marginTop: "5px" }}>
          Full P&amp;L view: budget vs. best known (actual where available, accrual estimate where not)
        </div>
      </div>
      <div className="sp11-flex" style={{ gap: 40 }}>
        <div className="sp11-text-right"><div className="sp11-var-banner__kpi-label">Budget</div><div className="sp11-var-banner__kpi-value">{Dl(totBudget)}</div></div>
        <div className="sp11-text-right"><div className="sp11-var-banner__kpi-label">Best Known</div><div className="sp11-var-banner__kpi-value">{Dl(totBestKnown)}</div></div>
        <div className="sp11-text-right"><div className="sp11-var-banner__kpi-label">Variance</div><div className="sp11-var-banner__kpi-value" style={{ color: totVar > 0 ? "var(--red-800)" : totVar < 0 ? "var(--green-600)" : "var(--text-subtle)" }}>{totVar >= 0 ? "+" : ""}{Dl(totVar)}</div></div>
      </div>
    </div>
    <div className="sp11-flex sp11-gap-10">
      <div className="sp11-var-legend-item"><Badge>{actualCount} GL lines from actuals</Badge></div>
      <div className="sp11-var-legend-item"><Badge color="green">{accrualCount} from AI accrual estimates</Badge></div>
      {unbudgetedCount > 0 && <div className="sp11-var-legend-item"><Badge color="red">{unbudgetedCount} unbudgeted</Badge></div>}
    </div>
  </div>

  <div className="sp11-var-table-wrap">
    {/* Header table — never scrolls, border-bottom travels with it */}
    <table className="sp11-var-table" style={{ flexShrink: 0 }}>
      <colgroup>
        <col style={{ width: "17%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "9%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "6%" }} />
        <col />
      </colgroup>
      <thead><tr>
        <th>GL Code</th>
        <th>Budget</th>
        <th>Actual</th>
        <th>Accrual</th>
        <th>Best Known</th>
        <th>Variance</th>
        <th>Var %</th>
        <th>Analysis</th>
      </tr></thead>
    </table>

    {/* Scrollable body */}
    <div className="sp11-var-tbody-scroll">
      <table className="sp11-var-table">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "6%" }} />
          <col />
        </colgroup>
        <tbody>
          {fullVariance.map((r, i) => {
            const vColor = r.totalVariance > 0 ? "var(--red-800)" : r.totalVariance < 0 ? "var(--green-600)" : "var(--text-subtle)";
            return <tr key={i}>
              <td>
                <div className="sp11-var-td__gl">{r.glCode}</div>
                <div className="sp11-text-xs-muted">{r.vendor}</div>
              </td>
              <td className="sp11-var-td--budget">{r.budgetVal > 0 ? Dl(r.budgetVal) : "—"}</td>
              <td style={{ fontWeight: r.actualTotal > 0 ? "var(--font-weight-semibold)" : undefined }}>{r.actualTotal > 0 ? Dl(r.actualTotal) : "—"}</td>
              <td>{r.accrualTotal > 0 && r.actualTotal === 0 ? Dl(r.accrualTotal) : "—"}</td>
              <td className="sp11-var-td--best-known">{r.bestKnown > 0 ? Dl(r.bestKnown) : "—"}</td>
              <td style={{ fontWeight: "var(--font-weight-semibold)", color: vColor }}>
                {r.totalVariance === 0 && r.bestKnown === 0 ? "—" : r.totalVariance === 0 ? "—" : `${r.totalVariance > 0 ? "+" : ""}${Dl(r.totalVariance)}`}
              </td>
              <td style={{ color: vColor }}>
                {r.pctVariance === "0.0" || r.pctVariance === "N/A" ? (r.bestKnown > 0 && r.budgetVal === 0 ? "N/A" : "—") : `${r.totalVariance > 0 ? "+" : ""}${r.pctVariance}%`}
              </td>
              <td className="sp11-var-td--analysis">
                {r.explanation ? <>
                  <div className="sp11-flex sp11-flex-wrap sp11-gap-4 sp11-mb-2">
                    {r.source === "actual" && r.accrualTotal > 0 && !r.isOnBudget && <Badge>Actual received</Badge>}
                    {r.source === "accrual" && !r.isOnBudget && <Badge color="green">AI estimate</Badge>}
                    {r.movedItems.map((m, j) => <Badge key={j}>↗ {m.movedFrom}</Badge>)}
                    {r.bestKnown > 0 && r.budgetVal === 0 && <Badge color="red">Unbudgeted</Badge>}
                    {r.bestKnown === 0 && r.budgetVal > 0 && <Badge>No activity</Badge>}
                    {r.matchingActuals.filter(a => a.spread).length > 0 && <Badge>Multi-period</Badge>}
                  </div>
                  <div className="sp11-text-sm-muted">{r.explanation}</div>
                </> : null}
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>

    {/* Footer table — never scrolls, border-top travels with it */}
    <table className="sp11-var-table sp11-var-table--footer" style={{ flexShrink: 0 }}>
      <colgroup>
        <col style={{ width: "17%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "9%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "6%" }} />
        <col />
      </colgroup>
      <tbody><tr>
        <td>Total</td>
        <td style={{ fontWeight: "var(--font-weight-medium)" }}>{Dl(totBudget)}</td>
        <td>{totActual > 0 ? Dl(totActual) : "—"}</td>
        <td style={{ fontWeight: "var(--font-weight-medium)" }}>{Dl(fullVariance.filter(v => v.source === "accrual").reduce((s, v) => s + v.accrualTotal, 0))}</td>
        <td>{Dl(totBestKnown)}</td>
        <td style={{ color: totVar > 0 ? "var(--red-800)" : "var(--green-600)" }}>{totVar >= 0 ? "+" : ""}{Dl(totVar)}</td>
        <td style={{ color: totVar > 0 ? "var(--red-800)" : "var(--green-600)", fontWeight: "var(--font-weight-medium)" }}>{totBudget > 0 ? `${totVar >= 0 ? "+" : ""}${((totVar / totBudget) * 100).toFixed(1)}%` : ""}</td>
        <td className="sp11-text-sm-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>{actualCount} actuals · {accrualCount} estimates · {fullVariance.filter(v => v.source === "none").length} no activity</td>
      </tr></tbody>
    </table>
  </div>
  </div>;
}
