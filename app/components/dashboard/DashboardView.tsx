// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Building, Warehouse, Store, ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Bar } from "../ui/Bar";
import { TabGroup } from "../ui/TabGroup";
import { DesignSystemNavButton } from "../DesignSystemPanel";
import { AIChatPanel } from "../AIChatPanel";
import { AccountCard } from "./AccountCard";
import { Dl } from "../../lib/utils";
import { PERIODS } from "../../lib/data";

const PROPERTY_TYPE_ICONS = {
  Office: Building2,
  Multifamily: Building,
  Industrial: Warehouse,
  Retail: Store,
};

export function DashboardView({ PORTFOLIO, pLabel }) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.find(p => p.status === "active")?.key ?? PERIODS[0].key);
  const [chatOpen, setChatOpen] = useState(false);
  const accountCardsRef = useRef<HTMLDivElement | null>(null);
  const [accountVisibility, setAccountVisibility] = useState<number[]>([]);
  const [isAccountRailOverflowing, setIsAccountRailOverflowing] = useState(false);
  const portfolioTotalBudget = PORTFOLIO.reduce((s, p) => s + p.totalBudget, 0);
  const portfolioTotalAccrual = PORTFOLIO.reduce((s, p) => s + p.totalAccrual, 0);
  const portfolioVariance = portfolioTotalAccrual - portfolioTotalBudget;
  const portfolioComplete = PORTFOLIO.filter(p => p.closeStatus === "complete").length;
  const portfolioInReview = PORTFOLIO.filter(p => p.closeStatus === "in-review").length;
  const portfolioDraftOrProgress = PORTFOLIO.filter(p => p.closeStatus === "in-draft" || p.closeStatus === "in-progress").length;
  const portfolioNotStarted = PORTFOLIO.filter(p => p.closeStatus === "not-started").length;
  const portfolioTotalAccruals = PORTFOLIO.reduce((s, p) => s + p.accrualCount, 0);
  const portfolioApproved = PORTFOLIO.reduce((s, p) => s + p.approvedCount, 0);
  const portfolioPendingAccruals = PORTFOLIO.reduce((s, p) => s + p.pendingCount, 0);
  const accountantNames = [...new Set(PORTFOLIO.map(p => p.accountant))];


  function getAccountVisibility() {
    const rail = accountCardsRef.current;
    if (!rail) return [];
    const cards = Array.from(rail.querySelectorAll(".sp11-account-card")) as HTMLElement[];
    const viewportStart = rail.scrollLeft;
    const viewportEnd = viewportStart + rail.clientWidth;

    return cards.map(card => {
      const cardStart = card.offsetLeft;
      const cardEnd = card.offsetLeft + card.offsetWidth;
      const overlap = Math.max(0, Math.min(cardEnd, viewportEnd) - Math.max(cardStart, viewportStart));
      return Math.min(1, Math.max(0, overlap / Math.max(card.offsetWidth, 1)));
    });
  }

  useEffect(() => {
    const rail = accountCardsRef.current;
    if (!rail) return;

    const updateVisible = () => setAccountVisibility(getAccountVisibility());
    const updateRailState = () => {
      const nextVisibility = getAccountVisibility();
      setAccountVisibility(nextVisibility);
      setIsAccountRailOverflowing(rail.scrollWidth > rail.clientWidth + 1);
    };
    updateRailState();
    rail.addEventListener("scroll", updateVisible, { passive: true });
    window.addEventListener("resize", updateRailState);

    return () => {
      rail.removeEventListener("scroll", updateVisible);
      window.removeEventListener("resize", updateRailState);
    };
  }, [accountantNames.length]);

  function scrollAccountCardsTo(index: number) {
    const rail = accountCardsRef.current;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll(".sp11-account-card")) as HTMLElement[];
    const targetCard = cards[index];
    if (!targetCard) return;
    rail.scrollTo({ left: targetCard.offsetLeft, behavior: "smooth" });
  }

  function scrollAccountCardsLeft() {
    const rail = accountCardsRef.current;
    if (!rail) return;

    const cards = Array.from(rail.querySelectorAll(".sp11-account-card")) as HTMLElement[];
    if (!cards.length) return;

    const current = rail.scrollLeft;
    const previousCard = [...cards].reverse().find(card => card.offsetLeft < current - 8);
    const targetLeft = previousCard ? previousCard.offsetLeft : 0;

    rail.scrollTo({ left: targetLeft, behavior: "smooth" });
  }

  const brand = "var(--brand-primary)";

  return (
    <div className="sp11-app">
      <div className="sp11-topbar" style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
          <TabGroup
            tabs={PERIODS.map(p => ({ key: p.key, label: p.status === "active" ? `${p.short} Close` : p.short, dot: p.status === "active" }))}
            activeKey={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
        <div className="sp11-flex-center sp11-gap-5 sp11-ml-auto">
          <button onClick={() => setChatOpen(v => !v)} className="sp11-btn sp11-btn--secondary sp11-flex-center sp11-gap-4"><MessageCircle size={14} strokeWidth={2} />Ask AI</button>
          <DesignSystemNavButton />
        </div>
      </div>
      <div className="sp11-content">
        <div className="sp11-dashboard-top-row sp11-mb-20">
          {/* Close Progress */}
          <div className="sp11-card sp11-card--padded sp11-dashboard-top-row__progress" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
            <div className="sp11-progress-label-row">
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="sp11-progress-label">Portfolio Close Progress</span>
                  <Badge color="gray">{pLabel}</Badge>
                </div>
                <div className="sp11-stat-card__sub">{PORTFOLIO.length} properties</div>
              </div>
            </div>
            <div className="sp11-progress-bar">
              <div className="sp11-progress-bar__seg sp11-progress-bar__seg--closed" style={{ width: `${(portfolioComplete / PORTFOLIO.length) * 100}%` }} />
              <div className="sp11-progress-bar__seg sp11-progress-bar__seg--review" style={{ width: `${(portfolioInReview / PORTFOLIO.length) * 100}%` }} />
              <div className="sp11-progress-bar__seg sp11-progress-bar__seg--draft" style={{ width: `${(portfolioDraftOrProgress / PORTFOLIO.length) * 100}%` }} />
              <div className="sp11-progress-bar__seg sp11-progress-bar__seg--pending" style={{ width: `${(portfolioNotStarted / PORTFOLIO.length) * 100}%` }} />
            </div>
            <div className="sp11-legend-row">
              <div className="sp11-legend-item"><div className="sp11-legend-dot" style={{ background: brand }} /> Closed ({portfolioComplete})</div>
              <div className="sp11-legend-item"><div className="sp11-legend-dot sp11-legend-dot--green" /> In Review ({portfolioInReview})</div>
              <div className="sp11-legend-item"><div className="sp11-legend-dot sp11-legend-dot--amber" /> In Draft ({portfolioDraftOrProgress})</div>
              {portfolioNotStarted > 0 && (
                <div className="sp11-legend-item"><div className="sp11-legend-dot sp11-legend-dot--gray" /> Not Started ({portfolioNotStarted})</div>
              )}
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="sp11-grid-stats sp11-dashboard-top-row__stats">
            {[
              { label: "Accruals", value: portfolioTotalAccruals, sub: `${portfolioApproved} approved · ${portfolioPendingAccruals} pending`, accent: brand },
              {
                label: "Total Accrued",
                value: Dl(portfolioTotalAccrual),
                sub: `vs ${Dl(portfolioTotalBudget)} budget`,
                accent: brand,
                trend:
                  portfolioTotalAccrual > portfolioTotalBudget
                    ? "up"
                    : portfolioTotalAccrual < portfolioTotalBudget
                      ? "down"
                      : null,
              },
              {
                label: "Net Variance",
                value: Dl(portfolioVariance),
                sub: `${((portfolioVariance / portfolioTotalBudget) * 100).toFixed(1)}% over budget`,
                accent: brand,
                trend:
                  portfolioVariance > 0
                    ? "up"
                    : portfolioVariance < 0
                      ? "down"
                      : null,
              },
              { label: "Est. Time Saved", value: "~72 hrs", sub: "across portfolio this month", accent: brand },
            ].map((c, i) => (
              <div key={i} className="sp11-stat-card" style={{ background: "var(--bg-app)", boxShadow: "none", border: "none" }}>
                <div className="sp11-flex-between">
                  <div className="sp11-stat-card__label">{c.label}</div>
                </div>
                <div className="sp11-stat-card__value" style={{ color: c.accent, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {c.value}
                  {c.trend === "up" && <ArrowUp size={16} strokeWidth={2} style={{ color: "var(--red-600)" }} />}
                  {c.trend === "down" && <ArrowDown size={16} strokeWidth={2} style={{ color: "var(--green-600)" }} />}
                </div>
                <div className="sp11-stat-card__sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Cards */}
        <div className="sp11-mb-8 sp11-section-title-row">
          <div className="sp11-card__title">Accountants</div>
        </div>
        <div className={`sp11-account-cards-rail sp11-mb-20${isAccountRailOverflowing ? " sp11-account-cards-rail--overflow" : ""}`}>
          <button
            type="button"
            className="sp11-account-cards-rail__left-hit"
            onClick={scrollAccountCardsLeft}
            aria-label="Scroll accountant cards left"
            title="Scroll left"
          />
          <div ref={accountCardsRef} className={`sp11-account-cards${!isAccountRailOverflowing ? " sp11-account-cards--fit" : ""}`}>
            {accountantNames.map(name => (
              <AccountCard
                key={name}
                accountant={name}
                properties={PORTFOLIO.filter(p => p.accountant === name)}
                onPropertyClick={id => router.push(`/property/${id}/accruals`)}
              />
            ))}
          </div>
          <div className="sp11-account-cards-dots" aria-label="Visible accountant cards">
            {accountantNames.map((name, index) => (
              <button
                key={name}
                type="button"
                className={`sp11-account-cards-dots__dot${(accountVisibility[index] ?? 0) > 0 ? " sp11-account-cards-dots__dot--active" : ""}`}
                aria-label={`Show ${name}`}
                title={name}
                onClick={() => scrollAccountCardsTo(index)}
                style={{ width: `${6 + 12 * (accountVisibility[index] ?? 0)}px` }}
              />
            ))}
          </div>
        </div>

        {/* Property Table */}
        <div className="sp11-mb-8 sp11-section-title-row">
          <div className="sp11-card__title">Properties</div>
        </div>
        <div className="sp11-card">
          <table className="sp11-table">
            <thead><tr>
              {["", "Type", "Accountant", "Status", "Accruals", "Budget", "Variance", "Actuals"].map(h => (
                <th key={h} className={`sp11-table__th-dash${h === "Variance" ? " sp11-table__th-dash--right" : ""}`} style={{ textTransform: "uppercase", fontSize: "var(--font-size-xs)", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PORTFOLIO.map(p => {
                const statusCfg = {
                  complete: { color: "primary", label: "Closed" },
                  "in-review": { color: "green", label: "In Review" },
                  "in-progress": { color: "yellow", label: "In Progress" },
                  "in-draft": { color: "yellow", label: "In Draft" },
                  "not-started": { color: "gray", label: "Not Started" },
                }[p.closeStatus];
                const dotColor = p.closeStatus === "not-started" ? "var(--border)" : brand;
                const PropertyIcon = PROPERTY_TYPE_ICONS[p.type] ?? Building2;
                return (
                  <tr key={p.id} onClick={() => { if (p.active) router.push(`/property/${p.id}/accruals`); }} style={{ cursor: p.active ? "pointer" : "default", opacity: p.active ? 1 : 0.85 }}>
                    <td className="sp11-table__td-dash">
                      <div className="sp11-table__cell-name">{p.name} {p.active && <span className="sp11-table__active-dot" style={{ color: dotColor }}>●</span>}</div>
                      <div className="sp11-text-xs-muted">{p.units} · {p.market}</div>
                    </td>
                    <td className="sp11-table__td-dash">
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <PropertyIcon size={14} strokeWidth={1.5} />
                        <Badge color="gray">{p.type}</Badge>
                      </div>
                    </td>
                    <td className="sp11-table__td-dash" style={{ color: "var(--text-muted)" }}>{p.accountant}</td>
                    <td className="sp11-table__td-dash">
                      <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                      {p.daysToClose > 0 && <div className="sp11-text-xs-muted sp11-mt-2">{p.daysToClose}d to close</div>}
                    </td>
                    <td className="sp11-table__td-dash">
                      <Bar variant="general" value={p.accrualCount > 0 ? Math.round((p.approvedCount / p.accrualCount) * 100) : 0} label={`${p.approvedCount}/${p.accrualCount}`} />
                    </td>
                    <td className="sp11-table__td-dash sp11-text-base-muted">{Dl(p.totalBudget)}</td>
                    <td className="sp11-table__td-dash sp11-text-right">
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: brand }}>{p.variance >= 0 ? "+" : ""}{Dl(p.variance)}</div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: brand }}>{p.totalBudget > 0 ? `${((p.variance / p.totalBudget) * 100).toFixed(1)}%` : ""}</div>
                    </td>
                    <td className="sp11-table__td-dash">
                      <div className="sp11-text-base-muted"><span style={{ fontWeight: "var(--font-weight-semibold)" }}>{p.actualsPosted}</span><span className="sp11-text-xs-muted">/{p.actualsTotal}</span> posted</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {chatOpen && (
        <AIChatPanel
          accruals={[]}
          accrualStates={{}}
          editAmounts={{}}
          activeTab="dashboard"
          selectedPeriod={selectedPeriod}
          journalEntries={[]}
          propertyName="Park Avenue Tower"
          portfolioData={PORTFOLIO}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
