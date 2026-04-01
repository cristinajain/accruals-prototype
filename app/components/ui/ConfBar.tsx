// @ts-nocheck

function tierClass(value: number): string {
  if (value >= 90) return "sp11-conf-bar--high";
  if (value >= 75) return "sp11-conf-bar--medium";
  if (value >= 60) return "sp11-conf-bar--warning";
  return "sp11-conf-bar--low";
}

export const ConfBar = ({ value }) => {
  if (value === 0) return <span className="sp11-conf-bar__label" style={{ color: "var(--text-placeholder)" }}>Manual</span>;
  return (
    <div className={`sp11-conf-bar ${tierClass(value)}`}>
      <div className="sp11-conf-bar__track">
        <div className="sp11-conf-bar__fill" style={{ width: `${value}%` }} />
      </div>
      <span className="sp11-conf-bar__label">{value}%</span>
    </div>
  );
};
