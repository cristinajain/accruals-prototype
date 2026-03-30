// @ts-nocheck

export const Bar = ({ value }) => {
  if (value === 0) return <span className="sp-bar__label" style={{ color: "var(--text-placeholder)" }}>Manual</span>;
  const tier = value >= 90 ? "high" : value >= 60 ? "medium" : "low";
  return (
    <div className="sp-bar">
      <div className="sp-bar__track">
        <div className={`sp-bar__fill sp-bar__fill--${tier}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`sp-bar__label sp-bar__label--${tier}`}>{value}%</span>
    </div>
  );
};
