// @ts-nocheck

import { Dl } from "../../lib/utils";
import { MONTHS } from "../../lib/data";

export function MoveAccrualModal({ showMoveModal, accruals, editAmounts, moveAccrual, onClose }) {
  const acc = accruals.find(a => a.id === showMoveModal);
  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sp-modal sp-modal--sm">
        <div className="sp-move-modal__title">Move Accrual</div>
        <div className="sp-move-modal__sub">{acc?.vendor} — {Dl(editAmounts[showMoveModal] ?? acc?.amount)}</div>
        <div className="sp-move-modal__list">
          {MONTHS.filter(m => m !== acc?.month).map(m => <button key={m} onClick={() => moveAccrual(showMoveModal, m)} className="sp-btn--move-option">{m}</button>)}
        </div>
      </div>
    </div>
  );
}
