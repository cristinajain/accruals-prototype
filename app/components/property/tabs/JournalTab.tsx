// @ts-nocheck

import { Badge } from "../../ui/Badge";
import { Dl } from "../../../lib/utils";

export function JournalTab({ journalEntries }) {
  return (
    <>
      <div style={{ marginBottom: 14 }}><span style={{ fontWeight: 600, fontSize: 14 }}>Journal Entries</span><span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>{journalEntries.length} entries · {journalEntries.filter(j => j.type === "Auto-Reverse").length} auto-reversals</span></div>
      {journalEntries.length === 0 ? (
        <div className="sp-empty-state">
          <div className="sp-empty-state__icon">📝</div>
          <div className="sp-empty-state__title">No journal entries yet</div>
          <div className="sp-empty-state__body">Approve accruals on the Estimate tab to auto-generate JEs and reversals.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {journalEntries.map(je => (
            <div key={je.id} style={{ background: "#fff", borderRadius: 11, border: `1px solid ${je.type === "Auto-Reverse" ? "#fde68a" : "#bbf7d0"}`, padding: "12px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Badge color={je.type === "Auto-Reverse" ? "amber" : "green"}>{je.type === "Auto-Reverse" ? "🔄 Auto-Reverse" : "✓ Accrual"}</Badge>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{je.vendor}</span>
                </div>
                <span style={{ fontSize: 12, color: "#64748b" }}>{je.date} · {je.period}</span>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 7, overflow: "hidden" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}><tbody>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "5px 10px" }}>DR: {je.debitAcct}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(je.debitAmt)}</td></tr>
                  <tr><td style={{ padding: "5px 10px", paddingLeft: 20 }}>CR: {je.creditAcct}</td><td style={{ padding: "5px 10px", textAlign: "right", fontWeight: 600 }}>{Dl(je.creditAmt)}</td></tr>
                </tbody></table>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{je.memo}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
