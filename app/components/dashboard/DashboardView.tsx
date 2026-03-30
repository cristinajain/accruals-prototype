// @ts-nocheck

import { useRouter } from "next/navigation";
import { Badge } from "../ui/Badge";
import { Bar } from "../ui/Bar";
import { DesignSystemNavButton } from "../DesignSystemPanel";
import { Dl } from "../../lib/utils";

export function DashboardView({ PORTFOLIO, pLabel }) {
  const router = useRouter();
  const portfolioTotalBudget = PORTFOLIO.reduce((s, p) => s + p.totalBudget, 0);
  const portfolioTotalAccrual = PORTFOLIO.reduce((s, p) => s + p.totalAccrual, 0);
  const portfolioVariance = portfolioTotalAccrual - portfolioTotalBudget;
  const portfolioComplete = PORTFOLIO.filter(p => p.closeStatus === "complete").length;
  const portfolioInReview = PORTFOLIO.filter(p => p.closeStatus === "in-review").length;
  const portfolioPending = PORTFOLIO.filter(p => p.closeStatus === "not-started").length;
  const portfolioTotalAccruals = PORTFOLIO.reduce((s, p) => s + p.accrualCount, 0);
  const portfolioApproved = PORTFOLIO.reduce((s, p) => s + p.approvedCount, 0);
  const portfolioPendingAccruals = PORTFOLIO.reduce((s, p) => s + p.pendingCount, 0);

  const brand = "var(--brand-primary)";

  return (
    <div className="sp-app">
      <div className="sp-topbar">
        <div className="sp-flex-center sp-gap-12">
          <div className="sp-logo-icon" style={{ background: "var(--brand-primary)" }}>S</div>
          <div>
            <div className="sp-wordmark">Stackpoint</div>
            <div className="sp-wordmark-sub">AI Property Accounting</div>
          </div>
        </div>
        <div className="sp-flex-center sp-gap-8">
          <div className="sp-period-chip" style={{ borderRadius: 999, border: "1px solid var(--border)", background: "var(--bg-card)" }}>📅 {pLabel} Close</div>
          <DesignSystemNavButton />
        </div>
      </div>
      <div className="sp-content">
        {/* Portfolio Summary */}
        <div className="sp-grid-stats sp-mb-24">
          {[
            { label: "Properties", value: PORTFOLIO.length, sub: `${portfolioComplete} closed · ${portfolioInReview} in review · ${portfolioPending} pending`, icon: "🏢", accent: brand },
            { label: "Accruals", value: portfolioTotalAccruals, sub: `${portfolioApproved} approved · ${portfolioPendingAccruals} pending`, icon: "🤖", accent: brand },
            { label: "Total Accrued", value: Dl(portfolioTotalAccrual), sub: `vs ${Dl(portfolioTotalBudget)} budget`, icon: "💰", accent: brand },
            { label: "Net Variance", value: `${portfolioVariance >= 0 ? "+" : ""}${Dl(portfolioVariance)}`, sub: `${((portfolioVariance / portfolioTotalBudget) * 100).toFixed(1)}% over budget`, icon: "📊", accent: brand },
            { label: "Est. Time Saved", value: "~72 hrs", sub: "across portfolio this month", icon: "⏱️", accent: brand },
          ].map((c, i) => (
            <div key={i} className="sp-stat-card" style={{ background: "var(--bg-app)", boxShadow: "none", border: "1px solid var(--border)" }}>
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
            <div className="sp-progress-bar__seg" style={{ width: `${(portfolioComplete / PORTFOLIO.length) * 100}%`, background: brand }} />
          </div>
          <div className="sp-legend-row">
            <div className="sp-legend-item"><div className="sp-legend-dot" style={{ background: brand }} /> Closed ({portfolioComplete})</div>
            <div className="sp-legend-item"><div className="sp-legend-dot sp-legend-dot--gray" /> In Review ({portfolioInReview})</div>
            <div className="sp-legend-item"><div className="sp-legend-dot sp-legend-dot--gray" /> Not Started ({portfolioPending})</div>
          </div>
        </div>

        {/* Accountant Workload */}
        <div className="sp-mb-8">
          <div className="sp-card__title">Accountants</div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: 2, marginBottom: 14 }}>Quick overview by owner</div>
        </div>
        <div className="sp-grid-2 sp-mb-20">
          {[...new Set(PORTFOLIO.map(p => p.accountant))].map(name => {
            const props = PORTFOLIO.filter(p => p.accountant === name);
            const pend = props.reduce((s, p) => s + p.pendingCount, 0);
            const done = props.filter(p => p.closeStatus === "complete").length;
            return (
              <div key={name} className="sp-card sp-card--padded" style={{ background: "var(--bg-app)", boxShadow: "none", border: "1px solid var(--border)" }}>
                <div className="sp-accountant-card__header">
                  <div className="sp-accountant-card__info">
                    <div className="sp-accountant-avatar">{name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div className="sp-accountant-card__name">{name}</div>
                      <div className="sp-accountant-card__sub">{props.length} properties · {pend} accruals pending</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: brand }}>{done}/{props.length} closed</div>
                </div>
                <div className="sp-mini-progress">
                  <div className="sp-mini-progress__fill" style={{ width: `${(done / props.length) * 100}%`, background: brand }} />
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
                <th key={h} className={`sp-table__th-dash${h === "Variance" ? " sp-table__th-dash--right" : ""}`} style={{ textTransform: "uppercase", fontSize: "var(--font-size-xs)", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PORTFOLIO.map(p => {
                const statusCfg = { complete: { color: "green", label: "Closed" }, "in-review": { color: "amber", label: "In Review" }, "not-started": { color: "gray", label: "Not Started" } }[p.closeStatus];
                const dotColor = p.closeStatus === "not-started" ? "var(--border)" : brand;
                return (
                  <tr key={p.id} onClick={() => { if (p.active) router.push(`/property/${p.id}/accruals`); }} style={{ cursor: p.active ? "pointer" : "default", opacity: p.active ? 1 : 0.85 }} onMouseEnter={e => { if (p.active) e.currentTarget.style.background = "var(--bg-subtle)"; }} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="sp-table__td-dash">
                      <div className="sp-table__cell-name">{p.name} {p.active && <span className="sp-table__active-dot" style={{ color: dotColor }}>●</span>}</div>
                      <div className="sp-text-xs-muted">{p.units} · {p.market}</div>
                    </td>
                    <td className="sp-table__td-dash"><Badge color="gray">{p.type}</Badge></td>
                    <td className="sp-table__td-dash" style={{ color: "var(--text-muted)" }}>{p.accountant}</td>
                    <td className="sp-table__td-dash">
                      <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                      {p.daysToClose > 0 && <div className="sp-text-xs-muted sp-mt-2">{p.daysToClose}d to close</div>}
                    </td>
                    <td className="sp-table__td-dash">
                      <Bar variant="general" value={p.accrualCount > 0 ? Math.round((p.approvedCount / p.accrualCount) * 100) : 0} label={`${p.approvedCount}/${p.accrualCount}`} />
                    </td>
                    <td className="sp-table__td-dash sp-text-base-muted">{Dl(p.totalBudget)}</td>
                    <td className="sp-table__td-dash sp-text-right">
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: brand }}>{p.variance >= 0 ? "+" : ""}{Dl(p.variance)}</div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: brand }}>{p.totalBudget > 0 ? `${((p.variance / p.totalBudget) * 100).toFixed(1)}%` : ""}</div>
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
