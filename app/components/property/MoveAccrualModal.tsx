// @ts-nocheck

import { Dl } from "../../lib/utils";
import { MONTHS } from "../../lib/data";

export function MoveAccrualModal({ showMoveModal, accruals, editAmounts, moveAccrual, onClose }) {
  const acc = accruals.find(a => a.id === showMoveModal);
  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sp-modal sp-modal--sm">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Move Accrual</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{acc?.vendor} — {Dl(editAmounts[showMoveModal] ?? acc?.amount)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MONTHS.filter(m => m !== acc?.month).map(m => <button key={m} onClick={() => moveAccrual(showMoveModal, m)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{m}</button>)}
        </div>
      </div>
    </div>
  );
}
