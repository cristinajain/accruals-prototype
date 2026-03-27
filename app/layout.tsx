import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stackpoint — AI Property Accounting",
  description: "AI-powered accruals and close management for property accounting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
