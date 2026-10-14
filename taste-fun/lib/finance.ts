import {
  BRANCH_IDS,
  COMMISSIONS_RATIO,
  COST_MODEL,
  FOOD_COST,
  OTHER_RATIO,
  PERIODS,
  UTILITIES_RATIO,
  type BranchId,
  type DailySales,
  type Period,
  type TodayFigures,
} from "./mock-data";

export interface PnL {
  sales: number;
  cogs: number;
  gross: number;
  salaries: number;
  rent: number;
  utilities: number;
  commissions: number;
  other: number;
  net: number;
}

/** Profit & loss for one branch over a period, estimated from recent daily sales and the cost model. */
export function branchPnL(branch: BranchId, period: Period, history: DailySales[], today: TodayFigures): PnL {
  const factor = PERIODS.find((p) => p.id === period)!.factor;
  const daily = history.reduce((a, d) => a + d[branch], 0) / history.length;
  const sales = period === "today" ? today.sales[branch] : Math.round(daily * 30 * factor * (period === "year" ? 0.97 : 1));
  const cogs = (sales * FOOD_COST[branch]) / 100;
  const salaries = sales * COST_MODEL[branch].salaries;
  const rent = COST_MODEL[branch].rentMonthly * factor;
  const utilities = sales * UTILITIES_RATIO;
  const commissions = sales * COMMISSIONS_RATIO;
  const other = sales * OTHER_RATIO;
  return {
    sales,
    cogs,
    gross: sales - cogs,
    salaries,
    rent,
    utilities,
    commissions,
    other,
    net: sales - cogs - salaries - rent - utilities - commissions - other,
  };
}

export function sumPnL(list: PnL[]): PnL {
  const keys = Object.keys(list[0]) as (keyof PnL)[];
  return Object.fromEntries(keys.map((k) => [k, list.reduce((a, p) => a + p[k], 0)])) as unknown as PnL;
}

export function groupPnL(period: Period, history: DailySales[], today: TodayFigures) {
  const perBranch = BRANCH_IDS.map((b) => branchPnL(b, period, history, today));
  return { perBranch, group: sumPnL(perBranch) };
}

/** Group sales for the last 12 months (oldest first) with the same months a year earlier. */
export function twelveMonths(history: DailySales[], now: Date) {
  const monthly = (history.reduce((a, d) => a + d.qasr + d.lulu, 0) / history.length) * 30;
  // Seasonality by calendar month (Jan..Dec): busy winter, quiet summer.
  const season = [1.22, 1.1, 0.95, 1.0, 0.86, 0.78, 0.74, 0.8, 0.92, 1.0, 1.05, 1.18];
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const s = season[d.getMonth()];
    return { month: d, thisYear: Math.round(monthly * s * (0.96 + i * 0.004)), lastYear: Math.round(monthly * s * 0.88) };
  });
}
