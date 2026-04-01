// @ts-nocheck

import { File } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";

export function JournalTab({ journalEntries }) {
  const pending = journalEntries.filter(j => j.status !== "cleared");
  const cleared = journalEntries.filter(j => j.status === "cleared");

  const JECard = ({ je, dimmed }) => (
    <div key={je.id} className={`sp11-accrual-row${dimmed ? " sp11-je-row--cleared" : ""}`}>
      <div className="sp11-accrual-row__body">
        <div className="sp11-je-card__row">
          <div className="sp11-flex-center sp11-gap-5">
            <Badge color={je.type === "Auto-Reverse" ? "amber" : "green"}>{je.type === "Auto-Reverse" ? "Auto-Reverse" : "Accrual"}</Badge>
            <span className="sp11-text-md-semibold">{je.vendor}</span>
          </div>
          <div className="sp11-flex-center sp11-gap-5">
            {dimmed && <Badge>Cleared</Badge>}
            <span className="sp11-je-card__meta">{je.date} · {je.period}</span>
          </div>
        </div>
        <div className="sp11-je-body">
          <table className="sp11-je-table-inner"><tbody>
            <tr><td>DR: {je.debitAcct}</td><td>{Dl(je.debitAmt)}</td></tr>
            <tr><td className="sp11-je-td--cr">CR: {je.creditAcct}</td><td>{Dl(je.creditAmt)}</td></tr>
          </tbody></table>
        </div>
        <div className="sp11-je-card__memo">{je.memo}</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sp11-journal-header">
        <span className="sp11-journal-header__title">Journal Entries</span>
        <span className="sp11-journal-header__meta">{pending.length} pending · {cleared.length} cleared · {journalEntries.filter(j => j.type === "Auto-Reverse").length} auto-reversals</span>
      </div>

      {journalEntries.length === 0 ? (
        <div className="sp11-empty-state">
          <div className="sp11-empty-state__icon" aria-hidden>
            <File size={40} strokeWidth={1.5} style={{ color: "var(--border)" }} />
          </div>
          <div className="sp11-empty-state__title">No journal entries yet</div>
          <div className="sp11-empty-state__body">Book accruals to auto-generate pending JEs.</div>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <div className="sp11-section-header sp11-mb-8">
                <span className="sp11-section-header__title">📋 Pending Journal Entries</span>
                <Badge>{pending.length}</Badge>
              </div>
              <div className="sp11-accrual-list sp11-mb-24">
                {pending.map(je => <JECard key={je.id} je={je} dimmed={false} />)}
              </div>
            </>
          )}

          {cleared.length > 0 && (
            <>
              <div className="sp11-section-header sp11-mb-8">
                <span className="sp11-section-header__title">✓ Cleared</span>
                <Badge>{cleared.length}</Badge>
              </div>
              <div className="sp11-accrual-list">
                {cleared.map(je => <JECard key={je.id} je={je} dimmed={true} />)}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
