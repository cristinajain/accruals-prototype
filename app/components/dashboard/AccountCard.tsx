// @ts-nocheck
"use client";

import { Building2, Building, Warehouse, Store } from "lucide-react";
import { RingProgress } from "../ui/RingProgress";
import { ProgressIndicator, INDICATOR_LABELS } from "../ui/ProgressIndicator";
import type { IndicatorStatus } from "../ui/ProgressIndicator";

const PROPERTY_TYPE_ICONS = {
  Office:      Building2,
  Multifamily: Building,
  Industrial:  Warehouse,
  Retail:      Store,
};

function deriveStatus(p): IndicatorStatus {
  if (p.closeStatus === "complete")    return "done";
  if (p.closeStatus === "in-review")   return "in-review";
  if (p.pendingCount > 0 && p.approvedCount > 0) return "in-progress";
  if (p.approvedCount > 0)             return "in-progress";
  return "not-started";
}

function deriveVarianceStatus(p): IndicatorStatus {
  if (p.closeStatus === "complete") return "done";
  if (p.closeStatus === "in-review") return "done";
  if (p.approvedCount > 0) return "in-progress";
  return "not-started";
}

function deriveReportsStatus(p): IndicatorStatus {
  if (p.closeStatus === "complete") return "done";
  if (p.closeStatus === "in-review") return "in-review";
  if (p.approvedCount > 0) return "in-progress";
  return "not-started";
}

interface AccountCardProps {
  accountant: string;
  properties: any[];
  onPropertyClick?: (id: number) => void;
}

function PropertyPanel({ p, onPropertyClick }) {
  const Icon          = PROPERTY_TYPE_ICONS[p.type] ?? Building2;
  const overallStatus = deriveStatus(p);
  const varianceStatus = deriveVarianceStatus(p);
  const reportsStatus  = deriveReportsStatus(p);
  const accrualPct    = p.accrualCount > 0 ? Math.round((p.approvedCount / p.accrualCount) * 100) : 0;
  const accrualLabel  = `${accrualPct}% of ${p.accrualCount}`;

  const ringColor = {
    "not-started": "var(--indicator-empty)",
    "in-progress":  "var(--indicator-progress)",
    "in-review":    "var(--indicator-review)",
    "done":         "var(--indicator-done)",
  }[overallStatus];

  return (
    <div
      className="sp11-account-card__prop"
      onClick={() => onPropertyClick?.(p.id)}
      style={{ cursor: p.active ? "pointer" : "default" }}
    >
      {/* Property header row */}
      <div className="sp11-account-card__prop-header">
        <span className="sp11-account-card__prop-icon">
          <Icon size={16} strokeWidth={1.5} />
        </span>
        <span className="sp11-account-card__prop-name">{p.name}</span>
      </div>

      {/* Detail rows */}
      <div className="sp11-account-card__rows">
        {/* Accruals */}
        <div className="sp11-account-card__row">
          <span className="sp11-account-card__row-label">Accruals</span>
          <span className="sp11-account-card__row-value">
            <RingProgress value={accrualPct} size={16} color={ringColor} />
            <span className="sp11-account-card__row-text">{accrualLabel}</span>
          </span>
        </div>

        {/* Variance */}
        <div className="sp11-account-card__row">
          <span className="sp11-account-card__row-label">Variance</span>
          <span className="sp11-account-card__row-value">
            <ProgressIndicator status={varianceStatus} size={16} />
            <span className="sp11-account-card__row-text">{INDICATOR_LABELS[varianceStatus]}</span>
          </span>
        </div>

        {/* Reports */}
        <div className="sp11-account-card__row">
          <span className="sp11-account-card__row-label">Reports</span>
          <span className="sp11-account-card__row-value">
            <ProgressIndicator status={reportsStatus} size={16} />
            <span className="sp11-account-card__row-text">{INDICATOR_LABELS[reportsStatus]}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function AccountCard({ accountant, properties, onPropertyClick }: AccountCardProps) {
  return (
    <div className="sp11-account-card">
      <div className="sp11-account-card__name">{accountant}</div>
      <div className="sp11-account-card__grid">
        {properties.map(p => (
          <PropertyPanel key={p.id} p={p} onPropertyClick={onPropertyClick} />
        ))}
      </div>
    </div>
  );
}
