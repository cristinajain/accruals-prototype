// @ts-nocheck

/**
 * Badge — three types matching the Figma design system:
 *   General  (default) — gray pill, for labels and tags
 *   Status             — colored pill: green | yellow | red
 *   Category           — 40×40 square tile with icon + short code
 *
 * Legacy `color` prop is accepted and mapped automatically:
 *   primary                  → status-primary
 *   green / emerald          → status-green
 *   amber / yellow           → status-yellow
 *   red                      → status-red
 *   anything else / omitted  → general (gray)
 */

type BadgeProps = {
  children?: React.ReactNode;
  color?: string;
  variant?: "general" | "status" | "category";
  icon?: React.ReactNode;  // lucide icon element for category badge
  code?: string;           // 2-char code for category badge
};

export const Badge = ({ children, color, variant, icon, code }: BadgeProps) => {
  // Category badge — square tile (icon stacked above code)
  if (variant === "category" || (icon && code)) {
    return (
      <span className="sp11-badge sp11-badge--category">
        <span className="sp11-badge__cat-icon">{icon}</span>
        <span>{code}</span>
      </span>
    );
  }

  // Status badge — colored pill
  const c = color || "";
  if (c === "primary") {
    return <span className="sp11-badge sp11-badge--status-primary">{children}</span>;
  }
  if (c === "green" || c === "emerald") {
    return <span className="sp11-badge sp11-badge--status-green">{children}</span>;
  }
  if (c === "amber" || c === "yellow") {
    return <span className="sp11-badge sp11-badge--status-yellow">{children}</span>;
  }
  if (c === "red") {
    return <span className="sp11-badge sp11-badge--status-red">{children}</span>;
  }

  // White badge — white bg + border, for use on tinted or colored surfaces
  if (c === "white") {
    return <span className="sp11-badge sp11-badge--white">{children}</span>;
  }

  // General badge — gray pill (default, catches gray / purple / cyan / blue / orange / etc.)
  return <span className="sp11-badge">{children}</span>;
};
