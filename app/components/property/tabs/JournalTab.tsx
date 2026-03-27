// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";

export function JournalTab({ journalEntries }) {
  return (
    <>
      <div className="sp-journal-header"><span className="sp-journal-header__title">Journal Entries</span><span className="sp-journal-header__meta">{journalEntries.length} entries · {journalEntries.filter(j => j.type === "Auto-Reverse").length} auto-reversals</span></div>
      {journalEntries.length === 0 ? (
        <div className="sp-empty-state">
          <div className="sp-empty-state__icon">📝</div>
          <div className="sp-empty-state__title">No journal entries yet</div>
          <div className="sp-empty-state__body">Approve accruals on the Estimate tab to auto-generate JEs and reversals.</div>
        </div>
      ) : (
        <div className="sp-accrual-list">
          {journalEntries.map(je => (
            <div key={je.id} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-3xl)", border: `1px solid ${je.type === "Auto-Reverse" ? "var(--amber-200)" : "var(--green-200)"}`, padding: "12px 18px" }}>
              <div className="sp-je-card__row">
                <div className="sp-flex-center sp-gap-5">
                  <Badge color={je.type === "Auto-Reverse" ? "amber" : "green"}>{je.type === "Auto-Reverse" ? "🔄 Auto-Reverse" : "✓ Accrual"}</Badge>
                  <span className="sp-text-md-semibold">{je.vendor}</span>
                </div>
                <span className="sp-je-card__meta">{je.date} · {je.period}</span>
              </div>
              <div className="sp-je-body">
                <table className="sp-je-table-inner"><tbody>
                  <tr><td>DR: {je.debitAcct}</td><td>{Dl(je.debitAmt)}</td></tr>
                  <tr><td style={{ paddingLeft: 20 }}>CR: {je.creditAcct}</td><td>{Dl(je.creditAmt)}</td></tr>
                </tbody></table>
              </div>
              <div className="sp-je-card__memo">{je.memo}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
