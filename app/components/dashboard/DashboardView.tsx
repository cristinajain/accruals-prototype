// @ts-nocheck

import { Badge } from "../ui/Badge";
import { Dl } from "../../lib/utils";

export function DashboardView({ PORTFOLIO, pLabel, setView }) {
  const portfolioTotalBudget = PORTFOLIO.reduce((s, p) => s + p.totalBudget, 0);
  const portfolioTotalAccrual = PORTFOLIO.reduce((s, p) => s + p.totalAccrual, 0);
  const portfolioVariance = portfolioTotalAccrual - portfolioTotalBudget;
  const portfolioComplete = PORTFOLIO.filter(p => p.closeStatus === "complete").length;
  const portfolioInReview = PORTFOLIO.filter(p => p.closeStatus === "in-review").length;
  const portfolioPending = PORTFOLIO.filter(p => p.closeStatus === "not-started").length;
  const portfolioTotalAccruals = PORTFOLIO.reduce((s, p) => s + p.accrualCount, 0);
  const portfolioApproved = PORTFOLIO.reduce((s, p) => s + p.approvedCount, 0);
  const portfolioPendingAccruals = PORTFOLIO.reduce((s, p) => s + p.pendingCount, 0);

  return (
    <div className="sp-app">
      <div className="sp-topbar">
        <div className="sp-flex-center sp-gap-12">
          <div className="sp-logo-icon">S</div>
          <div>
            <div className="sp-wordmark">Stackpoint</div>
            <div className="sp-wordmark-sub">AI Property Accounting</div>
          </div>
        </div>
        <div className="sp-period-chip">📅 {pLabel} Close</div>
      </div>
      <div className="sp-content">
        {/* Portfolio Summary */}
        <div className="sp-grid-stats sp-mb-24">
          {[
            { label: "Properties", value: PORTFOLIO.length, sub: `${portfolioComplete} closed · ${portfolioInReview} in review · ${portfolioPending} pending`, icon: "🏢", accent: "var(--brand-primary)" },
            { label: "Accruals", value: portfolioTotalAccruals, sub: `${portfolioApproved} approved · ${portfolioPendingAccruals} pending`, icon: "🤖", accent: "var(--brand-secondary)" },
            { label: "Total Accrued", value: Dl(portfolioTotalAccrual), sub: `vs ${Dl(portfolioTotalBudget)} budget`, icon: "💰", accent: "#0ea5e9" },
            { label: "Net Variance", value: `${portfolioVariance >= 0 ? "+" : ""}${Dl(portfolioVariance)}`, sub: `${((portfolioVariance / portfolioTotalBudget) * 100).toFixed(1)}% over budget`, icon: "📊", accent: portfolioVariance > 0 ? "var(--red-500)" : "var(--green-500)" },
            { label: "Est. Time Saved", value: "~72 hrs", sub: "across portfolio this month", icon: "⏱️", accent: "var(--amber-500)" },
          ].map((c, i) => (
            <div key={i} className="sp-stat-card">
              <div className="sp-flex-between">
                <div className="sp-stat-card__label">{c.label}</div>
                <span className="sp-stat-icon">{c.icon}</span>
              </div>
              <div className="sp-stat-card__value" style={{ color: c.accent }}>{c.value}</div>
              <div className="sp-stat-card__sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Close Progress */}
        <div className="sp-card sp-card--padded sp-mb-20">
          <div className="sp-progress-label-row">
            <span className="sp-progress-label">Portfolio Close Progress — {pLabel}</span>
            <span className="sp-progress-count">{portfolioComplete}/{PORTFOLIO.length} properties closed</span>
          </div>
          <div className="sp-progress-bar">
            <div className="sp-progress-bar__seg sp-progress-bar__seg--green" style={{ width: `${(portfolioComplete / PORTFOLIO.length) * 100}%` }} />
            <div className="sp-progress-bar__seg sp-progress-bar__seg--amber" style={{ width: `${(portfolioInReview / PORTFOLIO.length) * 100}%` }} />
          </div>
          <div className="sp-legend-row">
            <div className="sp-legend-item"><div className="sp-legend-dot sp-legend-dot--green" /> Closed ({portfolioComplete})</div>
            <div className="sp-legend-item"><div className="sp-legend-dot sp-legend-dot--amber" /> In Review ({portfolioInReview})</div>
            <div className="sp-legend-item"><div className="sp-legend-dot sp-legend-dot--gray" /> Not Started ({portfolioPending})</div>
          </div>
        </div>

        {/* Accountant Workload */}
        <div className="sp-grid-2 sp-mb-20">
          {[...new Set(PORTFOLIO.map(p => p.accountant))].map(name => {
            const props = PORTFOLIO.filter(p => p.accountant === name);
            const pend = props.reduce((s, p) => s + p.pendingCount, 0);
            const done = props.filter(p => p.closeStatus === "complete").length;
            return (
              <div key={name} className="sp-card sp-card--padded">
                <div className="sp-accountant-card__header">
                  <div className="sp-accountant-card__info">
                    <div className="sp-accountant-avatar">{name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div className="sp-accountant-card__name">{name}</div>
                      <div className="sp-accountant-card__sub">{props.length} properties · {pend} accruals pending</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: done === props.length ? "var(--green-500)" : "var(--amber-500)" }}>{done}/{props.length} closed</div>
                </div>
                <div className="sp-mini-progress">
                  <div className="sp-mini-progress__fill" style={{ width: `${(done / props.length) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Property Table */}
        <div className="sp-card">
          <div className="sp-card__header">
            <div className="sp-card__title">Properties</div>
            <div className="sp-text-base-muted">Click to open property detail</div>
          </div>
          <table className="sp-table">
            <thead><tr>
              {["Property", "Type", "Accountant", "Status", "Accruals", "Budget", "Variance", "Actuals"].map(h => (
                <th key={h} className={`sp-table__th-dash${h === "Variance" ? " sp-table__th-dash--right" : ""}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PORTFOLIO.map(p => {
                const statusCfg = { complete: { color: "green", label: "Closed" }, "in-review": { color: "amber", label: "In Review" }, "not-started": { color: "blue", label: "Not Started" } }[p.closeStatus];
                const varColor = p.variance > 0 ? "var(--red-600)" : p.variance < 0 ? "var(--green-700)" : "var(--text-subtle)";
                return (
                  <tr key={p.id} onClick={() => { if (p.active) setView("property"); }} style={{ cursor: p.active ? "pointer" : "default", opacity: p.active ? 1 : 0.85 }} onMouseEnter={e => { if (p.active) e.currentTarget.style.background = "var(--bg-subtle)"; }} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="sp-table__td-dash">
                      <div className="sp-table__cell-name">{p.name} {p.active && <span className="sp-table__active-dot">●</span>}</div>
                      <div className="sp-text-xs-muted">{p.units} · {p.market}</div>
                    </td>
                    <td className="sp-table__td-dash"><Badge color="gray">{p.type}</Badge></td>
                    <td className="sp-table__td-dash" style={{ color: "var(--text-muted)" }}>{p.accountant}</td>
                    <td className="sp-table__td-dash">
                      <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                      {p.daysToClose > 0 && <div className="sp-text-xs-muted sp-mt-2">{p.daysToClose}d to close</div>}
                    </td>
                    <td className="sp-table__td-dash">
                      <div className="sp-flex-center sp-gap-4">
                        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{p.approvedCount}</span><span className="sp-text-xs-muted">/{p.accrualCount}</span>
                      </div>
                      <div className="sp-accrual-bar"><div className="sp-accrual-bar__fill" style={{ width: `${(p.approvedCount / p.accrualCount) * 100}%` }} /></div>
                    </td>
                    <td className="sp-table__td-dash sp-text-base-muted">{Dl(p.totalBudget)}</td>
                    <td className="sp-table__td-dash sp-text-right">
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: varColor }}>{p.variance >= 0 ? "+" : ""}{Dl(p.variance)}</div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: varColor }}>{p.totalBudget > 0 ? `${((p.variance / p.totalBudget) * 100).toFixed(1)}%` : ""}</div>
                    </td>
                    <td className="sp-table__td-dash">
                      <div className="sp-text-base-muted"><span style={{ fontWeight: "var(--font-weight-semibold)" }}>{p.actualsPosted}</span><span className="sp-text-xs-muted">/{p.actualsTotal}</span> posted</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
