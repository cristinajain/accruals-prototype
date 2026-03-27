// @ts-nocheck

export const Dl = n => n == null ? "—" : (n < 0 ? "-$" + Math.abs(n).toLocaleString() : "$" + n.toLocaleString());
