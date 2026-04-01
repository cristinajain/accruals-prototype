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
    <div className="sp11-modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sp11-modal">
        <div className="sp11-modal__header">
          <div className="sp11-modal__title">Add Accrual — {pLabel}</div>
          <div className="sp11-modal-tabs">
            <button onClick={() => { setUploadMode(false); setParsedItems([]); }} className={`sp11-modal-tab${!uploadMode ? " sp11-modal-tab--active" : ""}`}>Manual</button>
            <button onClick={() => setUploadMode(true)} className={`sp11-modal-tab${uploadMode ? " sp11-modal-tab--active" : ""}`}>Paste &amp; Parse</button>
          </div>
        </div>
        {!uploadMode ? <div className="sp11-modal__body--md">
          <div className="sp11-form-grid sp11-mb-12">
            <div><label className="sp11-label">Vendor *</label><input value={newAccrual.vendor} onChange={e => setNewAccrual(p => ({ ...p, vendor: e.target.value }))} className="sp11-input" /></div>
            <div><label className="sp11-label">Amount *</label><input type="number" value={newAccrual.amount} onChange={e => setNewAccrual(p => ({ ...p, amount: e.target.value }))} className="sp11-input" /></div>
          </div>
          <div className="sp11-form-grid sp11-mb-12">
            <div><label className="sp11-label">GL Code</label><input value={newAccrual.glCode} onChange={e => setNewAccrual(p => ({ ...p, glCode: e.target.value }))} className="sp11-input" /></div>
            <div><label className="sp11-label">Source</label><select value={newAccrual.sourceType} onChange={e => setNewAccrual(p => ({ ...p, sourceType: e.target.value }))} className="sp11-select">{Object.entries(SOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
          </div>
          <div className="sp11-mb-14"><label className="sp11-label">Notes</label><textarea value={newAccrual.notes} onChange={e => setNewAccrual(p => ({ ...p, notes: e.target.value }))} rows={2} className="sp11-textarea" /></div>
          <button onClick={addManualAccrual} disabled={!newAccrual.vendor || !newAccrual.amount} className={`sp11-btn sp11-btn--full ${!newAccrual.vendor || !newAccrual.amount ? "sp11-btn--disabled" : "sp11-btn--primary"}`}>Add Accrual</button>
        </div> : <div className="sp11-modal__body--md">
          <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} placeholder="Paste PM email, invoice list, notes..." rows={6} className="sp11-textarea sp11-mb-10" />
          <button onClick={parseUpload} disabled={!uploadText.trim() || parseLoading} className={`sp11-btn sp11-btn--full sp11-mb-10 ${!uploadText.trim() || parseLoading ? "sp11-btn--disabled" : "sp11-btn--primary"}`}>{parseLoading ? "🤖 Parsing..." : "🤖 Extract Accruals"}</button>
          {parsedItems.length > 0 && <div>{parsedItems.map((item, i) => <div key={i} className="sp11-parsed-item"><span className="sp11-parsed-item__vendor">{item.vendor}</span><span className="sp11-parsed-item__amount">{Dl(item.amount)}</span></div>)}<button onClick={addParsedItems} className="sp11-btn sp11-btn--full sp11-btn--primary sp11-mt-4">✓ Add All ({parsedItems.length})</button></div>}
        </div>}
      </div>
    </div>
  );
}
