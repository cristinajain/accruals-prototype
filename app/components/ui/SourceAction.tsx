import type { Dispatch, SetStateAction } from "react";

interface SourceActionProps {
  action: string;
  accrualId: number;
  actionStates: Record<string, "available" | "done">;
  setActionStates: Dispatch<SetStateAction<Record<string, "available" | "done">>>;
}

export function SourceAction({ action, accrualId, actionStates, setActionStates }: SourceActionProps) {
  const key = `${accrualId}-${action}`, done = actionStates[key] === "done";
  return (
    <button
      onClick={e => { e.stopPropagation(); setActionStates(p => ({ ...p, [key]: done ? "available" : "done" })); }}
      className={`sp11-task-item ${done ? "sp11-task-item--done" : ""}`}
      type="button"
      aria-pressed={done}
    >
      <span className={`sp11-task-item__checkbox ${done ? "sp11-task-item__checkbox--done" : ""}`} aria-hidden="true">
        {done ? "✓" : ""}
      </span>
      <span className="sp11-task-item__text">{action}</span>
    </button>
  );
}
