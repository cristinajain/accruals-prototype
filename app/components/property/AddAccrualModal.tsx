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
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 7, padding: 2 }}>
            <button onClick={() => { setUploadMode(false); setParsedItems([]); }} style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: !uploadMode ? "#fff" : "transparent", fontWeight: !uploadMode ? 600 : 400, fontSize: 11, cursor: "pointer", color: !uploadMode ? "#0f172a" : "#64748b" }}>Manual</button>
            <button onClick={() => setUploadMode(true)} style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: uploadMode ? "#fff" : "transparent", fontWeight: uploadMode ? 600 : 400, fontSize: 11, cursor: "pointer", color: uploadMode ? "#0f172a" : "#64748b" }}>Paste & Parse</button>
          </div>
        </div>
        {!uploadMode ? <div style={{ padding: "18px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Vendor *</label><input value={newAccrual.vendor} onChange={e => setNewAccrual(p => ({ ...p, vendor: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Amount *</label><input type="number" value={newAccrual.amount} onChange={e => setNewAccrual(p => ({ ...p, amount: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>GL Code</label><input value={newAccrual.glCode} onChange={e => setNewAccrual(p => ({ ...p, glCode: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Source</label><select value={newAccrual.sourceType} onChange={e => setNewAccrual(p => ({ ...p, sourceType: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" }}>{Object.entries(SOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>Notes</label><textarea value={newAccrual.notes} onChange={e => setNewAccrual(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} /></div>
          <button onClick={addManualAccrual} disabled={!newAccrual.vendor || !newAccrual.amount} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: !newAccrual.vendor || !newAccrual.amount ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: !newAccrual.vendor || !newAccrual.amount ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: !newAccrual.vendor || !newAccrual.amount ? "default" : "pointer" }}>Add Accrual</button>
        </div> : <div style={{ padding: "18px 22px" }}>
          <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} placeholder="Paste PM email, invoice list, notes..." rows={6} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }} />
          <button onClick={parseUpload} disabled={!uploadText.trim() || parseLoading} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: !uploadText.trim() || parseLoading ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: !uploadText.trim() || parseLoading ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: 13, cursor: !uploadText.trim() || parseLoading ? "default" : "pointer", marginBottom: 10 }}>{parseLoading ? "🤖 Parsing..." : "🤖 Extract Accruals"}</button>
          {parsedItems.length > 0 && <div>{parsedItems.map((item, i) => <div key={i} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", marginBottom: 6, display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 600, fontSize: 13 }}>{item.vendor}</span><span style={{ fontWeight: 700, color: "#6366f1" }}>{Dl(item.amount)}</span></div>)}<button onClick={addParsedItems} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 4 }}>✓ Add All ({parsedItems.length})</button></div>}
        </div>}
      </div>
    </div>
  );
}
