// @ts-nocheck

export function SourceAction({ action, accrualId, actionStates, setActionStates }) {
  const key = `${accrualId}-${action}`, done = actionStates[key] === "done";
  return (
    <button
      onClick={e => { e.stopPropagation(); setActionStates(p => ({ ...p, [key]: done ? "available" : "done" })); }}
      className={`sp-btn sp-btn--icon ${done ? "sp-btn--action-done" : "sp-btn--ghost"}`}
    >
      {done ? "✓" : "•"} {action}
    </button>
  );
}
