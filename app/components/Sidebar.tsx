// @ts-nocheck
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Building2,
  Warehouse,
  Store,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ListTodo,
  Inbox,
  Users,
  MoreHorizontal,
  Grid2x2,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  ChartNoAxesColumn,
  ArrowLeftRight,
  BookOpen,
  CheckCircle,
  BarChart2,
} from "lucide-react";
import { PORTFOLIO } from "../lib/portfolio";

const SUB_ITEMS = [
  { label: "Accrual",         tab: "accruals",  Icon: Receipt },
  { label: "Variance",        tab: "variance",  Icon: ChartNoAxesColumn },
  { label: "Reconciliation",  tab: "reconcile", Icon: ArrowLeftRight },
  { label: "JE",              tab: "journal",   Icon: BookOpen },
  { label: "Close",           tab: null,        Icon: CheckCircle },
  { label: "Report",          tab: null,        Icon: BarChart2 },
];

const PROPERTY_TYPE_ICONS = {
  Office: Building2,
  Multifamily: Building,
  Industrial: Warehouse,
  Retail: Store,
};

/* ── Sidebar ─────────────────────────────────────────────────────── */
export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
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
    <aside className={`sp11-sidebar${open ? "" : " sp11-sidebar--collapsed"}`}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="sp11-sidebar__header-wrap">
        <div className="sp11-sidebar__header-row">
          <div className="sp11-sidebar__logo sp11-sidebar__fade-on-collapse">
            <Grid2x2 size={16} strokeWidth={1.5} />
          </div>
          <div className="sp11-sidebar__brand-group sp11-sidebar__fade-on-collapse">
            <button className="sp11-sidebar__portfolio-selector sp11-sidebar__fade-on-collapse">
              <span className="sp11-sidebar__brand-name">ACME Group</span>
              <span className="sp11-sidebar__icon-muted"><ChevronsUpDown size={14} strokeWidth={1.5} /></span>
            </button>
            <div className="sp11-sidebar__brand-sub sp11-sidebar__fade-on-collapse">Portfolio Alpha</div>
          </div>
          <button
            className="sp11-sidebar-toggle"
            onClick={onToggle}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? <PanelLeftClose size={16} strokeWidth={1.5} /> : <PanelLeftOpen size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* ── Properties ─────────────────────────────────── */}
      <div className="sp11-sidebar__section sp11-sidebar__section--scroll">
        <nav className="sp11-sidebar__menu">
          {/* Dashboard */}
          <button
            className={`sp11-sidebar__menu-btn${isDashboard ? " sp11-sidebar__menu-btn--active" : ""}`}
            onClick={() => go("/")}
            title="Dashboard"
          >
            <span className="sp11-sidebar__menu-icon"><LayoutDashboard size={16} strokeWidth={1.5} /></span>
            <span className="sp11-sidebar__fade-on-collapse">Dashboard</span>
          </button>
          <div className="sp11-sidebar__section-label sp11-sidebar__fade-on-collapse">
            Properties
          </div>

          {/* Property rows */}
          {PORTFOLIO.map((p) => {
            const isExpanded      = open && expandedId === p.id;
            const isActive        = currentPropertyId === p.id;
            const showCollapsedSub = !open && expandedId === p.id;
            const PropertyIcon = PROPERTY_TYPE_ICONS[p.type] ?? Building2;

            return (
              <div key={p.id} className="sp11-sidebar__menu-item">
                <button
                  className={`sp11-sidebar__menu-btn${isActive ? " sp11-sidebar__menu-btn--active" : ""}`}
                  onClick={() => toggleProperty(p.id)}
                  title={p.name}
                >
                  <span className="sp11-sidebar__menu-icon"><PropertyIcon size={16} strokeWidth={1.5} /></span>
                  <span className="sp11-sidebar__menu-label sp11-sidebar__fade-on-collapse">{p.name}</span>
                  <span className="sp11-sidebar__menu-chevron sp11-sidebar__fade-on-collapse">
                    {isExpanded ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
                  </span>
                </button>

                {/* Full text drawer — animated, only when sidebar is open */}
                <div className={`sp11-sidebar__sub${isExpanded ? "" : " sp11-sidebar__sub--closed"}`}>
                  <div className="sp11-sidebar__sub-clip">
                    <div className="sp11-sidebar__sub-list">
                      {SUB_ITEMS.map(({ label, tab, Icon }) => {
                        const isActiveSub = isActive && currentTab === tab;
                        return (
                          <button
                            key={label}
                            disabled={!tab}
                            className={`sp11-sidebar__sub-btn${isActiveSub ? " sp11-sidebar__sub-btn--active" : ""}${!tab ? " sp11-sidebar__sub-btn--disabled" : ""}`}
                            onClick={tab ? (e) => { e.stopPropagation(); go(`/property/${p.id}/${tab}`); } : undefined}
                          >
                            <span className="sp11-sidebar__sub-btn-icon">
                              <Icon size={14} strokeWidth={1.5} />
                            </span>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Icon-only sub-items — visible when sidebar is collapsed and property is expanded */}
                {showCollapsedSub && (
                  <div className="sp11-sidebar__sub-icons">
                    {SUB_ITEMS.map(({ label, tab, Icon }) => {
                      const isActiveSub = isActive && currentTab === tab;
                      return (
                        <button
                          key={label}
                          disabled={!tab}
                          title={label}
                          className={`sp11-sidebar__sub-icon-btn${isActiveSub ? " sp11-sidebar__sub-icon-btn--active" : ""}${!tab ? " sp11-sidebar__sub-icon-btn--disabled" : ""}`}
                          onClick={tab ? (e) => { e.stopPropagation(); go(`/property/${p.id}/${tab}`); } : undefined}
                        >
                          <Icon size={15} strokeWidth={1.5} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Tools ──────────────────────────────────────── */}
      <div className="sp11-sidebar__section sp11-sidebar__section--tools">
        <nav className="sp11-sidebar__menu">
          <button className="sp11-sidebar__menu-btn" title="Inbox">
            <span className="sp11-sidebar__menu-icon"><Inbox size={16} strokeWidth={1.5} /></span>
            <span className="sp11-sidebar__fade-on-collapse">Inbox</span>
          </button>
          <button className="sp11-sidebar__menu-btn" title="To-do">
            <span className="sp11-sidebar__menu-icon"><ListTodo size={16} strokeWidth={1.5} /></span>
            <span className="sp11-sidebar__fade-on-collapse">To-do</span>
          </button>
          <button className="sp11-sidebar__menu-btn" title="Team">
            <span className="sp11-sidebar__menu-icon"><Users size={16} strokeWidth={1.5} /></span>
            <span className="sp11-sidebar__fade-on-collapse">Team</span>
          </button>
          <button className="sp11-sidebar__menu-btn sp11-sidebar__menu-btn--muted" title="More">
            <span className="sp11-sidebar__menu-icon"><MoreHorizontal size={16} strokeWidth={1.5} /></span>
            <span className="sp11-sidebar__fade-on-collapse">More</span>
          </button>
        </nav>
      </div>

      {/* ── User footer ────────────────────────────────── */}
      <div className="sp11-sidebar__footer">
        <div className="sp11-sidebar__user">
          <div className="sp11-sidebar__avatar">SC</div>
          <div className="sp11-sidebar__user-info sp11-sidebar__fade-on-collapse">
            <div className="sp11-sidebar__user-name">Sarah Smith</div>
            <div className="sp11-sidebar__user-email">s.smith@acme.com</div>
          </div>
          <span className="sp11-sidebar__icon-muted sp11-sidebar__fade-on-collapse"><ChevronsUpDown size={14} strokeWidth={1.5} /></span>
        </div>
      </div>

    </aside>
  );
}
