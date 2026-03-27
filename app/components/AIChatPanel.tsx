// @ts-nocheck

import { useState, useRef, useEffect } from "react";
import { PERIODS, BUDGET, SOURCE_TYPES } from "../lib/data";

export function AIChatPanel({ accruals, accrualStates, editAmounts, activeTab, selectedPeriod, journalEntries, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const btm = useRef(null), inp = useRef(null), prevKey = useRef("");
  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;

  useEffect(() => {
    const k = activeTab + selectedPeriod;
    if (prevKey.current !== k || !messages.length) { prevKey.current = k;
      setMessages([{ role: "assistant", content: `Copilot ready for **${pLabel}** — ${activeTab} tab. Ask me anything about accruals, variances, budget comparisons, journal entries, or reconciliation.` }]);
    }
  }, [activeTab, selectedPeriod, pLabel, messages.length]);
  useEffect(() => { btm.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ctx = accruals.map(a => `- ${a.vendor} | ${a.glCode} | $${(editAmounts[a.id] ?? a.amount).toLocaleString()} | Month: ${a.month} | Status: ${accrualStates[a.id]} | Source: ${SOURCE_TYPES[a.sourceType]?.label} | Conf: ${a.confidence}% | AutoReverse: ${a.autoReverse}${a.movedFrom ? ` | Moved from ${a.movedFrom}` : ""} | ${a.rationale}`).join("\n");
  const jeCtx = journalEntries.length ? journalEntries.map(j => `- ${j.date}: ${j.type} | ${j.vendor} | DR ${j.debitAcct} $${j.debitAmt.toLocaleString()} / CR ${j.creditAcct} $${j.creditAmt.toLocaleString()} | ${j.memo}`).join("\n") : "None yet";
  const budgetCtx = Object.entries(BUDGET).map(([gl, b]) => `- ${gl} (${b.vendor}): Jan $${b.jan.toLocaleString()}, Feb $${b.feb.toLocaleString()}, Mar $${b.mar.toLocaleString()}`).join("\n");

  const send = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput(""); setMessages(p => [...p, { role: "user", content: q }]); setLoading(true);
    try {
      const hist = messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `AI accounting copilot for Park Avenue Tower (245K sqft, NYC). Period: ${pLabel}.\n\nACCRUALS:\n${ctx}\n\nBUDGET:\n${budgetCtx}\n\nJOURNAL ENTRIES:\n${jeCtx}\n\nBe concise, use $ and GL codes. Under 150 words unless asked for detail.`,
          messages: [...hist, { role: "user", content: q }] }) });
      const d = await r.json();
      setMessages(p => [...p, { role: "assistant", content: d.content?.map(b => b.text || "").join("") || "Error." }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "Connection error." }]); }
    finally { setLoading(false); }
  };
  const renderMd = t => t.split("\n").map((ln, i) => {
    const f = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    if (/^[•-]\s/.test(ln)) return <div key={i} style={{ paddingLeft: 12, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: f.replace(/^[•-]\s*/, "") }} /></div>;
    if (!ln.trim()) return <div key={i} style={{ height: 6 }} />;
    return <div key={i} style={{ marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: f }} />;
  });
  return (
    <div className="sp-chat-panel">
      <div className="sp-chat-panel__header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="sp-logo-icon sp-logo-icon--sm">AI</div>
          <div>
            <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)" }}>Copilot</div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-subtle)" }}>{pLabel}</div>
          </div>
        </div>
        <button onClick={onClose} className="sp-chat-close-btn">×</button>
      </div>
      <div className="sp-chat-panel__messages">
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div className={`sp-chat-bubble sp-chat-bubble--${m.role}`}>{renderMd(m.content)}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div className="sp-chat-bubble sp-chat-bubble--assistant">
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(j => <div key={j} className="sp-typing-dot" />)}
              </div>
            </div>
          </div>
        )}
        <div ref={btm} />
      </div>
      <div className="sp-chat-panel__footer">
        <div style={{ display: "flex", gap: 6 }}>
          <input
            ref={inp}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            placeholder="Ask anything..."
            className="sp-chat-input"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className={`sp-chat-send-btn ${loading || !input.trim() ? "sp-chat-send-btn--disabled" : "sp-chat-send-btn--active"}`}
          >↑</button>
        </div>
      </div>
    </div>
  );
}
