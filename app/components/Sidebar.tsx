// @ts-nocheck
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PORTFOLIO } from "../lib/portfolio";

const SUB_ITEMS = [
  { label: "Accruals",        tab: "accruals" },
  { label: "Variance",        tab: "variance" },
  { label: "Reconciliations", tab: "reconcile" },
  { label: "JEs",             tab: "journal" },
  { label: "Close",           tab: null },
  { label: "Reports",         tab: null },
];

/* ── Icons ───────────────────────────────────────────────────────── */
const Icon = ({ d, d2 = null, children = null }: { d?: string; d2?: string; children?: React.ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d && <path d={d} />}
    {d2 && <path d={d2} />}
    {children}
  </svg>
);

const IconDashboard    = () => <Icon><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 11v-1M16 11v-1"/></Icon>;
const IconBuilding     = () => <Icon><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22V12h6v10M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/></Icon>;
const IconChevronDown  = () => <Icon d="m6 9 6 6 6-6" />;
const IconChevronRight = () => <Icon d="m9 18 6-6-6-6" />;
const IconChevronsUD   = () => <Icon d="m7 15 5 5 5-5M7 9l5-5 5 5" />;
const IconAgents       = () => <Icon><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></Icon>;
const IconIntegrations = () => <Icon d="M21.21 15.89A10 10 0 1 1 8 2.83" d2="M22 12A10 10 0 0 0 12 2v10z" />;
const IconMore         = () => <Icon><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Icon>;
const IconLogo         = () => <Icon><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></Icon>;

/* ── Sidebar ─────────────────────────────────────────────────────── */
export function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();

  const match             = pathname.match(/^\/property\/(\d+)(?:\/(\w+))?/);
  const currentPropertyId = match ? Number(match[1]) : null;
  const currentTab        = match?.[2] ?? null;
  const isDashboard       = !currentPropertyId;

  const [expandedId, setExpandedId] = useState<number | null>(currentPropertyId);

  const go = (path: string) => router.push(path);

  const toggleProperty = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      go(`/property/${id}/accruals`);
    }
  };

  return (
    <aside className="sp-sidebar">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="sp-sidebar__header-wrap">
        <div className="sp-sidebar__brand">
          <div className="sp-sidebar__logo"><IconLogo /></div>
          <div className="sp-sidebar__brand-text">
            <div className="sp-sidebar__brand-name">Portfolio Alpha</div>
            <div className="sp-sidebar__brand-sub">Jan 2026 Close</div>
          </div>
          <span className="sp-sidebar__icon-muted"><IconChevronsUD /></span>
        </div>
      </div>

      {/* ── Properties ─────────────────────────────────── */}
      <div className="sp-sidebar__section sp-sidebar__section--scroll">
        <div className="sp-sidebar__section-label">{PORTFOLIO.length} Properties</div>

        <nav className="sp-sidebar__menu">
          {/* Dashboard */}
          <button
            className={`sp-sidebar__menu-btn${isDashboard ? " sp-sidebar__menu-btn--active" : ""}`}
            onClick={() => go("/")}
          >
            <span className="sp-sidebar__menu-icon"><IconDashboard /></span>
            <span>Dashboard</span>
          </button>

          {/* Property rows */}
          {PORTFOLIO.map((p) => {
            const isExpanded = expandedId === p.id;
            const isActive   = currentPropertyId === p.id;
            return (
              <div key={p.id} className="sp-sidebar__menu-item">
                <button
                  className={`sp-sidebar__menu-btn${isActive ? " sp-sidebar__menu-btn--active" : ""}`}
                  onClick={() => toggleProperty(p.id)}
                >
                  <span className="sp-sidebar__menu-icon"><IconBuilding /></span>
                  <span className="sp-sidebar__menu-label">{p.name}</span>
                  <span className="sp-sidebar__menu-chevron">
                    {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
                  </span>
                </button>

                {/* Sub-items drawer */}
                <div className={`sp-sidebar__sub${isExpanded ? "" : " sp-sidebar__sub--closed"}`}>
                  <div className="sp-sidebar__sub-clip">
                    <div className="sp-sidebar__sub-list">
                      {SUB_ITEMS.map(({ label, tab }) => {
                        const isActiveSub = isActive && currentTab === tab;
                        return (
                          <button
                            key={label}
                            disabled={!tab}
                            className={`sp-sidebar__sub-btn${isActiveSub ? " sp-sidebar__sub-btn--active" : ""}${!tab ? " sp-sidebar__sub-btn--disabled" : ""}`}
                            onClick={tab ? (e) => { e.stopPropagation(); go(`/property/${p.id}/${tab}`); } : undefined}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Tools ──────────────────────────────────────── */}
      <div className="sp-sidebar__section sp-sidebar__section--tools">
        <div className="sp-sidebar__section-label">Tools</div>
        <nav className="sp-sidebar__menu">
          <button className="sp-sidebar__menu-btn">
            <span className="sp-sidebar__menu-icon"><IconAgents /></span>
            <span>Agents</span>
          </button>
          <button className="sp-sidebar__menu-btn">
            <span className="sp-sidebar__menu-icon"><IconIntegrations /></span>
            <span>Integrations</span>
          </button>
          <button className="sp-sidebar__menu-btn sp-sidebar__menu-btn--muted">
            <span className="sp-sidebar__menu-icon"><IconMore /></span>
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* ── User footer ────────────────────────────────── */}
      <div className="sp-sidebar__footer">
        <div className="sp-sidebar__user">
          <div className="sp-sidebar__avatar">SC</div>
          <div className="sp-sidebar__user-info">
            <div className="sp-sidebar__user-name">Sarah Chen</div>
            <div className="sp-sidebar__user-email">s.chen@stackpoint.com</div>
          </div>
          <span className="sp-sidebar__icon-muted"><IconChevronsUD /></span>
        </div>
      </div>

    </aside>
  );
}
