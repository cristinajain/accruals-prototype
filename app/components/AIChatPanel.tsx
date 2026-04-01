// @ts-nocheck

import { useState, useRef, useEffect } from "react";
import { PERIODS, BUDGET, SOURCE_TYPES } from "../lib/data";

export function AIChatPanel({ accruals, accrualStates, editAmounts, activeTab, selectedPeriod, journalEntries, onClose, propertyName, portfolioData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const btm = useRef(null), inp = useRef(null), prevKey = useRef("");
  const pLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;

  useEffect(() => {
    const k = activeTab + selectedPeriod;
    if (prevKey.current !== k || !messages.length) { prevKey.current = k;
      setMessages([{ role: "assistant", content: propertyName
        ? `Copilot ready — ask me anything about ${propertyName}.`
        : `Copilot ready for **${pLabel}** — ${activeTab} tab. Ask me anything about accruals, variances, budget comparisons, journal entries, or reconciliation.` }]);
    }
  }, [activeTab, selectedPeriod, pLabel, propertyName, messages.length]);
  useEffect(() => { btm.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ctx = accruals.map(a => `- ${a.vendor} | ${a.glCode} | $${(editAmounts[a.id] ?? a.amount).toLocaleString()} | Month: ${a.month} | Status: ${accrualStates[a.id]} | Source: ${SOURCE_TYPES[a.sourceType]?.label} | Conf: ${a.confidence}% | AutoReverse: ${a.autoReverse}${a.movedFrom ? ` | Moved from ${a.movedFrom}` : ""} | ${a.rationale}`).join("\n");
  const jeCtx = journalEntries.length ? journalEntries.map(j => `- ${j.date}: ${j.type} | ${j.vendor} | DR ${j.debitAcct} $${j.debitAmt.toLocaleString()} / CR ${j.creditAcct} $${j.creditAmt.toLocaleString()} | ${j.memo}`).join("\n") : "None yet";
  const budgetCtx = Object.entries(BUDGET).map(([gl, b]) => `- ${gl} (${b.vendor}): Jan $${b.jan.toLocaleString()}, Feb $${b.feb.toLocaleString()}, Mar $${b.mar.toLocaleString()}`).join("\n");
  const portfolioCtx = portfolioData?.length ? portfolioData.map(p => `- ${p.name} | ${p.type} | ${p.units} | ${p.market} | Accountant: ${p.accountant} | Accruals: ${p.approvedCount}/${p.accrualCount} approved | Budget: $${p.totalBudget.toLocaleString()} | Variance: $${p.variance.toLocaleString()} | Close: ${p.closeStatus}`).join("\n") : "";

  const send = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput(""); setMessages(p => [...p, { role: "user", content: q }]); setLoading(true);
    try {
      const hist = messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `AI accounting copilot for Park Avenue Tower (245K sqft, NYC). Period: ${pLabel}.\n\n${portfolioCtx ? `PORTFOLIO:\n${portfolioCtx}\n\n` : ""}${ctx ? `ACCRUALS:\n${ctx}\n\n` : ""}BUDGET:\n${budgetCtx}\n\nJOURNAL ENTRIES:\n${jeCtx}\n\nBe concise, use $ and GL codes. Under 150 words unless asked for detail.`,
          messages: [...hist, { role: "user", content: q }] }) });
      const d = await r.json();
      setMessages(p => [...p, { role: "assistant", content: d.content?.map(b => b.text || "").join("") || "Error." }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "Connection error." }]); }
    finally { setLoading(false); }
  };
  const renderMd = t => t.split("\n").map((ln, i) => {
    const f = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    if (/^[•-]\s/.test(ln)) return <div key={i} className="sp11-md-bullet"><span style={{ position: "absolute", left: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: f.replace(/^[•-]\s*/, "") }} /></div>;
    if (!ln.trim()) return <div key={i} className="sp11-md-spacer" />;
    return <div key={i} className="sp11-md-line" dangerouslySetInnerHTML={{ __html: f }} />;
  });
  return (
    <div className="sp11-chat-panel">
      <div className="sp11-chat-panel__header">
        <div className="sp11-flex-center sp11-gap-6">
          <div className="sp11-logo-icon sp11-logo-icon--sm">AI</div>
          <div>
            <div className="sp11-chat-panel__title">Copilot</div>
            <div className="sp11-chat-panel__subtitle">{pLabel}</div>
          </div>
        </div>
        <button onClick={onClose} className="sp11-chat-close-btn">×</button>
      </div>
      <div className="sp11-chat-panel__messages">
        {messages.map((m, i) => (
          <div key={i} className={`sp11-chat-msg-row sp11-chat-msg-row--${m.role === "user" ? "user" : "ai"}`}>
            <div className={`sp11-chat-bubble sp11-chat-bubble--${m.role}`}>{renderMd(m.content)}</div>
          </div>
        ))}
        {loading && (
          <div className="sp11-chat-msg-row">
            <div className="sp11-chat-bubble sp11-chat-bubble--assistant">
              <div className="sp11-chat-typing-dots">
                {[0, 1, 2].map(j => <div key={j} className="sp11-typing-dot" />)}
              </div>
            </div>
          </div>
        )}
        <div ref={btm} />
      </div>
      <div className="sp11-chat-panel__footer">
        <div className="sp11-chat-footer-row">
          <input
            ref={inp}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            placeholder="Ask anything..."
            className="sp11-chat-input"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className={`sp11-chat-send-btn ${loading || !input.trim() ? "sp11-chat-send-btn--disabled" : "sp11-chat-send-btn--active"}`}
          >↑</button>
        </div>
      </div>
    </div>
  );
}
