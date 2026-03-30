// @ts-nocheck

import { Dl } from "../../lib/utils";
import { SOURCE_TYPES } from "../../lib/data";

export function AddAccrualModal({
  pLabel,
  uploadMode,
  setUploadMode,
  parsedItems,
  setParsedItems,
  uploadText,
  setUploadText,
  parseLoading,
  parseUpload,
  addParsedItems,
  newAccrual,
  setNewAccrual,
  addManualAccrual,
  onClose,
}) {
  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sp-modal">
        <div className="sp-modal__header">
          <div className="sp-modal__title">Add Accrual — {pLabel}</div>
          <div className="sp-modal-tabs">
            <button onClick={() => { setUploadMode(false); setParsedItems([]); }} className={`sp-modal-tab${!uploadMode ? " sp-modal-tab--active" : ""}`}>Manual</button>
            <button onClick={() => setUploadMode(true)} className={`sp-modal-tab${uploadMode ? " sp-modal-tab--active" : ""}`}>Paste &amp; Parse</button>
          </div>
        </div>
        {!uploadMode ? <div className="sp-modal__body--md">
          <div className="sp-form-grid sp-mb-12">
            <div><label className="sp-label">Vendor *</label><input value={newAccrual.vendor} onChange={e => setNewAccrual(p => ({ ...p, vendor: e.target.value }))} className="sp-input" /></div>
            <div><label className="sp-label">Amount *</label><input type="number" value={newAccrual.amount} onChange={e => setNewAccrual(p => ({ ...p, amount: e.target.value }))} className="sp-input" /></div>
          </div>
          <div className="sp-form-grid sp-mb-12">
            <div><label className="sp-label">GL Code</label><input value={newAccrual.glCode} onChange={e => setNewAccrual(p => ({ ...p, glCode: e.target.value }))} className="sp-input" /></div>
            <div><label className="sp-label">Source</label><select value={newAccrual.sourceType} onChange={e => setNewAccrual(p => ({ ...p, sourceType: e.target.value }))} className="sp-select">{Object.entries(SOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
          </div>
          <div className="sp-mb-14"><label className="sp-label">Notes</label><textarea value={newAccrual.notes} onChange={e => setNewAccrual(p => ({ ...p, notes: e.target.value }))} rows={2} className="sp-textarea" /></div>
          <button onClick={addManualAccrual} disabled={!newAccrual.vendor || !newAccrual.amount} className={`sp-btn sp-btn--full ${!newAccrual.vendor || !newAccrual.amount ? "sp-btn--disabled" : "sp-btn--primary"}`}>Add Accrual</button>
        </div> : <div className="sp-modal__body--md">
          <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} placeholder="Paste PM email, invoice list, notes..." rows={6} className="sp-textarea sp-mb-10" />
          <button onClick={parseUpload} disabled={!uploadText.trim() || parseLoading} className={`sp-btn sp-btn--full sp-mb-10 ${!uploadText.trim() || parseLoading ? "sp-btn--disabled" : "sp-btn--primary"}`}>{parseLoading ? "🤖 Parsing..." : "🤖 Extract Accruals"}</button>
          {parsedItems.length > 0 && <div>{parsedItems.map((item, i) => <div key={i} className="sp-parsed-item"><span className="sp-parsed-item__vendor">{item.vendor}</span><span className="sp-parsed-item__amount">{Dl(item.amount)}</span></div>)}<button onClick={addParsedItems} className="sp-btn sp-btn--full sp-btn--primary sp-mt-4">✓ Add All ({parsedItems.length})</button></div>}
        </div>}
      </div>
    </div>
  );
}
