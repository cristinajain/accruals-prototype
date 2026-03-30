import type { Metadata } from "next";
import "./globals.css";
import { DesignSystemProvider } from "./components/DesignSystemPanel";
import { AppShell } from "./components/AppShell";

export const metadata: Metadata = {
  title: "Stackpoint — AI Property Accounting",
  description: "AI-powered accruals and close management for property accounting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DesignSystemProvider>
          <AppShell>{children}</AppShell>
        </DesignSystemProvider>
      </body>
    </html>
  );
}
