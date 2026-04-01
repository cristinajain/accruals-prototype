// @ts-nocheck

// variant="confidence" (default) — color-coded by tier: high / medium / low
// variant="general"              — single color via sp11-bar__fill / sp11-bar__label base classes
export const Bar = ({ value, variant = "confidence", label = null }) => {
  if (value === 0) return <span className="sp11-bar__label" style={{ color: "var(--text-placeholder)" }}>Manual</span>;

  if (variant === "general") {
    return (
      <div className="sp11-bar">
        <div className="sp11-bar__track">
          <div className="sp11-bar__fill" style={{ width: `${value}%` }} />
        </div>
        <span className="sp11-bar__label">{label ?? `${value}%`}</span>
      </div>
    );
  }

  const tier = value >= 90 ? "high" : value >= 60 ? "medium" : "low";
  return (
    <div className="sp11-bar sp11-bar--dot">
      <span className={`sp11-bar__dot sp11-bar__dot--${tier}`} />
      <span className="sp11-bar__label" style={{ color: "var(--text-muted)", fontWeight: "var(--font-weight-normal)" }}>{value}% confident</span>
    </div>
  );
};
