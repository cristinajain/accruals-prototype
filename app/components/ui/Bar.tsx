// @ts-nocheck

// variant="confidence" (default) — color-coded by tier: high / medium / low
// variant="general"              — single color via sp-bar__fill / sp-bar__label base classes
export const Bar = ({ value, variant = "confidence" }) => {
  if (value === 0) return <span className="sp-bar__label" style={{ color: "var(--text-placeholder)" }}>Manual</span>;

  if (variant === "general") {
    return (
      <div className="sp-bar">
        <div className="sp-bar__track">
          <div className="sp-bar__fill" style={{ width: `${value}%` }} />
        </div>
        <span className="sp-bar__label">{value}%</span>
      </div>
    );
  }

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
