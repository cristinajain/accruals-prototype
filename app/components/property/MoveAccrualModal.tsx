// @ts-nocheck

import { Dl } from "../../lib/utils";
import { MONTHS } from "../../lib/data";

export function MoveAccrualModal({ showMoveModal, accruals, editAmounts, moveAccrual, onClose }) {
  const acc = accruals.find(a => a.id === showMoveModal);
  return (
    <div className="sp11-modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sp11-modal sp11-modal--sm">
        <div className="sp11-move-modal__title">Move Accrual</div>
        <div className="sp11-move-modal__sub">{acc?.vendor} — {Dl(editAmounts[showMoveModal] ?? acc?.amount)}</div>
        <div className="sp11-move-modal__list">
          {MONTHS.filter(m => m !== acc?.month).map(m => <button key={m} onClick={() => moveAccrual(showMoveModal, m)} className="sp11-btn--move-option">{m}</button>)}
        </div>
      </div>
    </div>
  );
}
