// @ts-nocheck

export const Bar = ({ value }) => {
  if (value === 0) return <span className="sp-bar__label" style={{ color: "var(--text-placeholder)" }}>Manual</span>;
  const fillClass = value >= 90 ? "sp-bar__fill--high" : value >= 60 ? "sp-bar__fill--medium" : "sp-bar__fill--low";
  const cl = value >= 90 ? "var(--green-600)" : value >= 60 ? "var(--amber-500)" : "var(--red-500)";
  return (
    <div className="sp-bar">
      <div className="sp-bar__track">
        <div className={`sp-bar__fill ${fillClass}`} style={{ width: `${value}%` }} />
      </div>
      <span className="sp-bar__label" style={{ color: cl }}>{value}%</span>
    </div>
  );
};
