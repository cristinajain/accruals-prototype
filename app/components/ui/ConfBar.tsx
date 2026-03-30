// @ts-nocheck

export const ConfBar = ({ value }) => {
  if (value === 0) return <span className="sp-conf-bar__label" style={{ color: "var(--text-placeholder)" }}>Manual</span>;
  const cl = value >= 90 ? "var(--green-600)" : value >= 75 ? "var(--amber-500)" : value >= 60 ? "var(--orange-500)" : "var(--red-500)";
  return (
    <div className="sp-conf-bar">
      <div className="sp-conf-bar__track">
        <div className="sp-conf-bar__fill" style={{ width: `${value}%`, background: cl }} />
      </div>
      <span className="sp-conf-bar__label" style={{ color: cl }}>{value}%</span>
    </div>
  );
};
