// @ts-nocheck

/**
 * Badge — three types matching the Figma design system:
 *   General  (default) — gray pill, for labels and tags
 *   Status             — colored pill: green | yellow | red
 *   Category           — 40×40 square tile with icon + short code
 *
 * Legacy `color` prop is accepted and mapped automatically:
 *   green / emerald          → status-green
 *   amber / yellow           → status-yellow
 *   red                      → status-red
 *   anything else / omitted  → general (gray)
 */

type BadgeProps = {
  children?: React.ReactNode;
  color?: string;
  variant?: "general" | "status" | "category";
  icon?: string;   // emoji for category badge
  code?: string;   // 2-char code for category badge
};

export const Badge = ({ children, color, variant, icon, code }: BadgeProps) => {
  // Category badge — square tile
  if (variant === "category" || (icon && code)) {
    return (
      <span className="sp-badge sp-badge--category">
        <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
        <span>{code}</span>
      </span>
    );
  }

  // Status badge — colored pill
  const c = color || "";
  if (c === "green" || c === "emerald") {
    return <span className="sp-badge sp-badge--status-green">{children}</span>;
  }
  if (c === "amber" || c === "yellow") {
    return <span className="sp-badge sp-badge--status-yellow">{children}</span>;
  }
  if (c === "red") {
    return <span className="sp-badge sp-badge--status-red">{children}</span>;
  }

  // General badge — gray pill (default, catches gray / purple / cyan / blue / orange / etc.)
  return <span className="sp-badge">{children}</span>;
};
