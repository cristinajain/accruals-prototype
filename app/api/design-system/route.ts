import { NextRequest, NextResponse } from "next/server";

// Disabled in production — only used during local development to live-edit CSS variables.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  const body = await req.json() as {
    variables?: Record<string, string>;
    classProps?: Record<string, string>;
  };

  const cssPath = path.join(process.cwd(), "app", "globals.css");
  let css = await fs.readFile(cssPath, "utf-8");

  if (body.variables) {
    for (const [name, value] of Object.entries(body.variables)) {
      const escaped = name.replace(/-/g, "\\-");
      const regex = new RegExp(`(--${escaped}\\s*:\\s*)([^;]+)(;)`, "g");
      css = css.replace(regex, `$1${value}$3`);
    }
  }

  if (body.classProps) {
    for (const [key, newValue] of Object.entries(body.classProps)) {
      const colonIdx = key.indexOf(":");
      if (colonIdx === -1) continue;
      const className = key.slice(0, colonIdx);
      const cssProp   = key.slice(colonIdx + 1);
      const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedProp  = cssProp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const blockRegex = new RegExp(`(\\.${escapedClass}\\s*\\{)([^}]*)(\\})`, "gs");
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
