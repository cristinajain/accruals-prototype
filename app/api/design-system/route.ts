import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    variables?: Record<string, string>;
    classProps?: Record<string, string>;
  };

  const cssPath = path.join(process.cwd(), "app", "globals.css");
  let css = await fs.readFile(cssPath, "utf-8");

  // ── CSS variable replacements (Foundations tab) ──────────────────────────────
  if (body.variables) {
    for (const [name, value] of Object.entries(body.variables)) {
      const escaped = name.replace(/-/g, "\\-");
      const regex = new RegExp(`(--${escaped}\\s*:\\s*)([^;]+)(;)`, "g");
      css = css.replace(regex, `$1${value}$3`);
    }
  }

  // ── CSS class property replacements (Components tab) ────────────────────────
  // key format: "cssClassName:cssPropertyName", e.g. "sp-badge--green:background"
  if (body.classProps) {
    for (const [key, newValue] of Object.entries(body.classProps)) {
      const colonIdx = key.indexOf(":");
      if (colonIdx === -1) continue;
      const className = key.slice(0, colonIdx);
      const cssProp   = key.slice(colonIdx + 1);

      // Escape special regex chars in the class name and property name
      const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedProp  = cssProp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Match exactly `.className {` blocks (single-level, non-nested)
      // and replace the target property value within the block
      const blockRegex = new RegExp(
        `(\\.${escapedClass}\\s*\\{)([^}]*)(\\})`,
        "gs"
      );
      css = css.replace(blockRegex, (_match, open, body, close) => {
        const propRegex = new RegExp(`(${escapedProp}\\s*:\\s*)([^;]+)(;)`);
        const newBody = body.replace(propRegex, `$1${newValue}$3`);
        return open + newBody + close;
      });
    }
  }

  await fs.writeFile(cssPath, css, "utf-8");
  return NextResponse.json({ ok: true });
}
