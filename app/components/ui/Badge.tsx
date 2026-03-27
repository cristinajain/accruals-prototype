// @ts-nocheck

export const Badge = ({ children, color }) => (
  <span className={`sp-badge sp-badge--${color || "gray"}`}>{children}</span>
);
