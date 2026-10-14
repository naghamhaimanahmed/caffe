const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const money2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CURRENCY = "د.إ";

export function fmt(n: number, decimals: 0 | 2 = 0) {
  return decimals === 2 ? money2.format(n) : money.format(n);
}

export function fmtSigned(n: number, decimals: 0 | 2 = 2) {
  const s = fmt(Math.abs(n), decimals);
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s;
}

export function pct(n: number, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
