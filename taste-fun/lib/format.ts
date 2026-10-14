const whole = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const twoDecimals = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Latin digits with thousands separators, in both languages. */
export function fmt(n: number, decimals: 0 | 2 = 0) {
  return decimals === 2 ? twoDecimals.format(n) : whole.format(n);
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
