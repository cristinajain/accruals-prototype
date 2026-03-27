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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
        <div className="sp-grid-stats" style={{ marginBottom: 24 }}>
          {[
            { label: "Properties", value: PORTFOLIO.length, sub: `${portfolioComplete} closed · ${portfolioInReview} in review · ${portfolioPending} pending`, icon: "🏢", accent: "var(--brand-primary)" },
            { label: "Accruals", value: portfolioTotalAccruals, sub: `${portfolioApproved} approved · ${portfolioPendingAccruals} pending`, icon: "🤖", accent: "var(--brand-secondary)" },
            { label: "Total Accrued", value: Dl(portfolioTotalAccrual), sub: `vs ${Dl(portfolioTotalBudget)} budget`, icon: "💰", accent: "#0ea5e9" },
            { label: "Net Variance", value: `${portfolioVariance >= 0 ? "+" : ""}${Dl(portfolioVariance)}`, sub: `${((portfolioVariance / portfolioTotalBudget) * 100).toFixed(1)}% over budget`, icon: "📊", accent: portfolioVariance > 0 ? "var(--red-500)" : "var(--green-500)" },
            { label: "Est. Time Saved", value: "~72 hrs", sub: "across portfolio this month", icon: "⏱️", accent: "var(--amber-500)" },
          ].map((c, i) => (
            <div key={i} className="sp-stat-card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="sp-stat-card__label">{c.label}</div>
                <span style={{ fontSize: "var(--font-size-2xl)" }}>{c.icon}</span>
              </div>
              <div className="sp-stat-card__value" style={{ color: c.accent }}>{c.value}</div>
              <div className="sp-stat-card__sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Close Progress */}
        <div className="sp-card sp-card--padded" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Portfolio Close Progress — {pLabel}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{portfolioComplete}/{PORTFOLIO.length} properties closed</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "#e2e8f0", overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${(portfolioComplete / PORTFOLIO.length) * 100}%`, background: "#22c55e", transition: "width 0.4s" }} />
            <div style={{ width: `${(portfolioInReview / PORTFOLIO.length) * 100}%`, background: "#f59e0b", transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#22c55e" }} /> Closed ({portfolioComplete})</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#f59e0b" }} /> In Review ({portfolioInReview})</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#e2e8f0" }} /> Not Started ({portfolioPending})</div>
          </div>
        </div>

        {/* Accountant Workload */}
        <div className="sp-grid-2" style={{ marginBottom: 20 }}>
          {[...new Set(PORTFOLIO.map(p => p.accountant))].map(name => {
            const props = PORTFOLIO.filter(p => p.accountant === name);
            const pend = props.reduce((s, p) => s + p.pendingCount, 0);
            const done = props.filter(p => p.closeStatus === "complete").length;
            return (
              <div key={name} className="sp-card sp-card--padded">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#4338ca" }}>{name.split(" ").map(n => n[0]).join("")}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div><div style={{ fontSize: 11, color: "#64748b" }}>{props.length} properties · {pend} accruals pending</div></div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: done === props.length ? "#22c55e" : "#f59e0b" }}>{done}/{props.length} closed</div>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${(done / props.length) * 100}%`, height: "100%", borderRadius: 2, background: "#22c55e" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Property Table */}
        <div className="sp-card">
          <div className="sp-card__header">
            <div className="sp-card__title">Properties</div>
            <div style={{ fontSize: "var(--font-size-base)", color: "var(--text-subtle)" }}>Click to open property detail</div>
          </div>
          <table className="sp-table">
            <thead><tr style={{ background: "#f8fafc" }}>
              {["Property", "Type", "Accountant", "Status", "Accruals", "Budget", "Variance", "Actuals"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: h === "Variance" ? "right" : "left", fontWeight: 600, color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PORTFOLIO.map(p => {
                const statusCfg = { complete: { color: "green", label: "Closed" }, "in-review": { color: "amber", label: "In Review" }, "not-started": { color: "blue", label: "Not Started" } }[p.closeStatus];
                const varColor = p.variance > 0 ? "#dc2626" : p.variance < 0 ? "#059669" : "#64748b";
                return (
                  <tr key={p.id} onClick={() => { if (p.active) setView("property"); }} style={{ cursor: p.active ? "pointer" : "default", borderBottom: "1px solid #f1f5f9", opacity: p.active ? 1 : 0.85 }} onMouseEnter={e => { if (p.active) e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{p.name} {p.active && <span style={{ fontSize: 10, color: "#6366f1" }}>●</span>}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.units} · {p.market}</div>
                    </td>
                    <td style={{ padding: "11px 14px" }}><Badge color="gray">{p.type}</Badge></td>
                    <td style={{ padding: "11px 14px", color: "#475569" }}>{p.accountant}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                      {p.daysToClose > 0 && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{p.daysToClose}d to close</div>}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontWeight: 600 }}>{p.approvedCount}</span><span style={{ color: "#94a3b8" }}>/{p.accrualCount}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: 50, marginTop: 3 }}><div style={{ width: `${(p.approvedCount / p.accrualCount) * 100}%`, height: "100%", borderRadius: 2, background: "#22c55e" }} /></div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12 }}>{Dl(p.totalBudget)}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: varColor }}>{p.variance >= 0 ? "+" : ""}{Dl(p.variance)}</div>
                      <div style={{ fontSize: 10, color: varColor }}>{p.totalBudget > 0 ? `${((p.variance / p.totalBudget) * 100).toFixed(1)}%` : ""}</div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 12 }}><span style={{ fontWeight: 600 }}>{p.actualsPosted}</span><span style={{ color: "#94a3b8" }}>/{p.actualsTotal}</span> posted</div>
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
