// @ts-nocheck
import { PropertyProvider } from "./PropertyContext";

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <PropertyProvider>{children}</PropertyProvider>;
}
