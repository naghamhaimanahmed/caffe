"use client";

import { useMemo, useState } from "react";
import { BarChart3, Clock, Download, FileSpreadsheet, ListOrdered, PieChart, Scale } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n, type Key } from "@/lib/i18n";
import { groupPnL, twelveMonths, type PnL } from "@/lib/finance";
import { BRANCH_IDS, PAYMENT_METHODS, PERIODS, SALES_CHANNELS, SLOW_SELLERS, TOP_ITEMS, type DailySales, type Period } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Button, Card, CardHeader, Segmented } from "../ui";
import { Bar, Kpi, KpiRow, Table, Td, Th } from "./common";

const CHANNEL_COLORS = ["var(--color-series-1)", "var(--color-series-2)", "#1baf7a", "#e87ba4", "#94a3b8"];

const PNL_ROWS: { key: keyof PnL; label: Key; cost?: boolean; strong?: boolean }[] = [
  { key: "sales", label: "pl.sales", strong: true },
  { key: "cogs", label: "pl.cogs", cost: true },
  { key: "gross", label: "pl.gross", strong: true },
  { key: "salaries", label: "pl.salaries", cost: true },
  { key: "rent", label: "pl.rent", cost: true },
  { key: "utilities", label: "pl.utilities", cost: true },
  { key: "commissions", label: "pl.commissions", cost: true },
  { key: "other", label: "pl.other", cost: true },
  { key: "net", label: "pl.net", strong: true },
];

export function ReportsTab() {
  const { names, history, today, notify } = useOwner();
  const { t, tr, money } = useI18n();
  const [period, setPeriod] = useState<Period>("month");
  const periodInfo = PERIODS.find((p) => p.id === period)!;
  const { perBranch, group } = useMemo(() => groupPnL(period, history, today), [period, history, today]);
  const expenses = group.salaries + group.rent + group.utilities + group.commissions + group.other;
  const columns = [...perBranch, group];
  const itemFactor = periodInfo.factor * (period === "today" ? 30 / 26 : 1);
  const pct = (n: number) => ((n / group.sales) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Segmented value={period} onChange={setPeriod} options={PERIODS.map((p) => ({ value: p.id, label: tr(p.label) }))} />
        <span className="flex-1" />
        <Button size="sm" variant="secondary" onClick={() => notify(t("toast.exported", { format: "Excel" }))}>
          <FileSpreadsheet className="size-4" />
          {t("rep.exportExcel")}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => notify(t("toast.exported", { format: "PDF" }))}>
          <Download className="size-4" />
          {t("rep.exportPdf")}
        </Button>
      </Card>

      <KpiRow>
        <Kpi
          hero
          label={t("rep.sales")}
          value={money(group.sales)}
          footer={
            <span className="text-emerald-300">
              <span className="num">▲ {periodInfo.change}%</span> {t("rep.vsPrev")}
            </span>
          }
        />
        <Kpi label={t("rep.cogs")} value={money(group.cogs)} footer={t("rep.ofSales", { pct: pct(group.cogs) })} />
        <Kpi label={t("rep.expenses")} value={money(expenses)} footer={t("rep.ofSales", { pct: pct(expenses) })} />
        <Kpi
          label={t("rep.net")}
          value={money(group.net)}
          valueClass={group.net >= 0 ? "text-emerald-600" : "text-red-600"}
          footer={t("rep.marginValue", { pct: pct(group.net) })}
        />
      </KpiRow>

      <Card>
        <CardHeader icon={<Scale className="size-5" />} title={t("rep.pl")} subtitle={t("rep.plSub", { period: tr(periodInfo.label) })} />
        <Table
          minWidth={560}
          head={
            <>
              <Th />
              {BRANCH_IDS.map((b) => (
                <Th key={b} end>
                  {tr(names.branches[b])}
                </Th>
              ))}
              <Th end>{t("rep.group")}</Th>
            </>
          }
        >
          {PNL_ROWS.map((r) => (
            <tr key={r.key} className={cn(r.strong && "font-semibold text-slate-900", r.key === "net" && "bg-slate-50")}>
              <Td className={r.strong ? "" : "text-slate-600"}>{t(r.label)}</Td>
              {columns.map((c, i) => (
                <Td
                  key={i}
                  end
                  className={cn("num", r.key === "net" && (c.net >= 0 ? "text-emerald-700" : "text-red-600"), !r.strong && "text-slate-600")}
                >
                  {r.cost ? "−" : ""}
                  {fmt(Math.round(c[r.key]))}
                </Td>
              ))}
            </tr>
          ))}
          <tr>
            <Td className="text-xs text-slate-500">{t("rep.margin")}</Td>
            {columns.map((c, i) => (
              <Td key={i} end className="num text-xs text-slate-500">
                {((c.net / c.sales) * 100).toFixed(1)}%
              </Td>
            ))}
          </tr>
        </Table>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader icon={<BarChart3 className="size-5" />} title={t("rep.months12")} subtitle={t("rep.months12Hint")} />
          <YearChart history={history} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader icon={<PieChart className="size-5" />} title={t("rep.byChannel")} />
          <div className="space-y-4 p-5">
            <div className="flex h-3.5 gap-[2px] overflow-hidden rounded-full">
              {SALES_CHANNELS.map((c, i) => (
                <span key={c.label.en} style={{ width: `${c.share * 100}%`, background: CHANNEL_COLORS[i] }} title={`${tr(c.label)} ${Math.round(c.share * 100)}%`} />
              ))}
            </div>
            <ul className="space-y-2 text-sm">
              {SALES_CHANNELS.map((c, i) => (
                <li key={c.label.en} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="size-2.5 rounded-sm" style={{ background: CHANNEL_COLORS[i] }} />
                    {tr(c.label)}
                  </span>
                  <span className="font-medium text-slate-900">
                    <span className="num">{money(group.sales * c.share)}</span> · <span className="num">{Math.round(c.share * 100)}%</span>
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="pt-2 text-sm font-semibold text-slate-900">{t("rep.byPayment")}</h3>
            <ul className="space-y-2.5">
              {PAYMENT_METHODS.map((p) => (
                <li key={p.label.en} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{tr(p.label)}</span>
                    <span className="num text-slate-900">{Math.round(p.share * 100)}%</span>
                  </div>
                  <Bar ratio={p.share} color="var(--color-brand-500)" />
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={<Clock className="size-5" />} title={t("rep.peak")} subtitle={t("rep.peakHint")} />
          <PeakHours />
        </Card>
        <Card>
          <CardHeader icon={<ListOrdered className="size-5" />} title={t("rep.topItems")} subtitle={tr(periodInfo.label)} />
          <Table
            minWidth={420}
            head={
              <>
                <Th>{t("rep.dish")}</Th>
                <Th end>{t("rep.qty")}</Th>
                <Th end>{t("rep.revenue")}</Th>
                <Th end>{t("rep.margin")}</Th>
              </>
            }
          >
            {TOP_ITEMS.map((m, i) => {
              const slow = i >= TOP_ITEMS.length - SLOW_SELLERS;
              return (
                <tr key={m.name.en} className={cn(i === TOP_ITEMS.length - SLOW_SELLERS && "!border-t-2 !border-slate-200")}>
                  <Td>
                    <span className={slow ? "text-red-500" : "text-emerald-600"}>{slow ? "▼" : "▲"}</span> {tr(m.name)}
                  </Td>
                  <Td end className="num">{fmt(Math.round(m.qty * itemFactor))}</Td>
                  <Td end className="num whitespace-nowrap">{money(m.qty * m.price * periodInfo.factor)}</Td>
                  <Td end>
                    <Badge tone={m.margin >= 65 ? "success" : m.margin >= 55 ? "warning" : "danger"}>
                      <span className="num">{m.margin}%</span>
                    </Badge>
                  </Td>
                </tr>
              );
            })}
          </Table>
        </Card>
      </div>
    </div>
  );
}

/** Twelve monthly bars in reading order (oldest first), with last year as a dashed line. */
function YearChart({ history }: { history: DailySales[] }) {
  const { t, money, locale, isRtl } = useI18n();
  const data = useMemo(() => twelveMonths(history, new Date()), [history]);
  const [hover, setHover] = useState<number | null>(null);
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "short" });
  const monthYearFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const W = 640, H = 240, P = { l: 48, r: 12, t: 12, b: 28 };
  const step = Math.ceil(Math.max(...data.flatMap((d) => [d.thisYear, d.lastYear])) / 4 / 10000) * 10000;
  const max = step * 4;
  const bw = (W - P.l - P.r) / 12;
  // In Arabic the oldest month sits at the right edge; in English at the left.
  const cx = (i: number) => (isRtl ? W - P.r - (i + 0.5) * bw : P.l + (i + 0.5) * bw);
  const y = (v: number) => P.t + (1 - v / max) * (H - P.t - P.b);
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const shown = hover ?? data.length - 1;

  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div>
          <span className="font-medium text-slate-900">{monthYearFmt.format(data[shown].month)}</span>
          <span className="text-slate-500"> · {t("rep.thisYear")} </span>
          <b className="num">{money(data[shown].thisYear)}</b>
          <span className="text-slate-500"> · {t("rep.lastYear")} </span>
          <span className="num text-slate-600">{money(data[shown].lastYear)}</span>
        </div>
        <ul className="flex items-center gap-4 text-xs text-slate-600">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-500" />
            {t("rep.thisYear")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-slate-400" />
            {t("rep.lastYear")}
          </li>
        </ul>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} direction="ltr" className="block h-auto w-full" role="img" aria-label={t("rep.months12")} onMouseLeave={() => setHover(null)}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray={v ? "3 3" : undefined} />
            <text x={P.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {Math.round(v / 1000)}k
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect x={cx(i) - bw / 2} y={P.t} width={bw} height={H - P.t - P.b} fill={hover === i ? "#f1f5f9" : "transparent"} />
            <rect
              x={cx(i) - bw * 0.3}
              y={y(d.thisYear)}
              width={bw * 0.6}
              height={y(0) - y(d.thisYear)}
              rx={4}
              fill="var(--color-brand-500)"
              opacity={hover === null ? (i === data.length - 1 ? 1 : 0.75) : hover === i ? 1 : 0.45}
            />
            <text x={cx(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={i === data.length - 1 ? "#334155" : "#94a3b8"}>
              {monthFmt.format(d.month)}
            </text>
          </g>
        ))}
        <polyline
          points={data.map((d, i) => `${cx(i)},${y(d.lastYear)}`).join(" ")}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="5 4"
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);

function PeakHours() {
  const { t, locale, isRtl } = useI18n();
  // Saturday first; 2026-10-10 is a Saturday.
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const days = Array.from({ length: 7 }, (_, i) => dayFmt.format(new Date(2026, 9, 10 + i)));
  // Lunch and dinner peaks, busier at the weekend (Thu–Sat).
  const value = (d: number, h: number) => {
    const lunch = Math.exp(-((h - 13.5) ** 2) / 3);
    const dinner = Math.exp(-((h - 21) ** 2) / 4);
    const morning = Math.exp(-((h - 9) ** 2) / 1.5) * 0.5;
    return (lunch * 0.8 + dinner + morning) * [1.15, 0.85, 0.8, 0.82, 0.9, 1.25, 1.3][d];
  };
  const max = Math.max(...days.flatMap((_, d) => HOURS.map((h) => value(d, h))));

  return (
    <div className="overflow-x-auto p-5">
      <div className="grid min-w-[460px] gap-[3px] text-[11px] text-slate-500" style={{ gridTemplateColumns: `76px repeat(${HOURS.length}, minmax(16px, 1fr))` }}>
        <span />
        {HOURS.map((h) => (
          <span key={h} className="num text-center">
            {h % 3 === 0 ? h : ""}
          </span>
        ))}
        {days.map((day, d) => (
          <div key={day} className="contents">
            <span className="self-center truncate">{day}</span>
            {HOURS.map((h) => {
              const v = value(d, h) / max;
              return (
                <span
                  key={h}
                  title={t("rep.peakCell", { day, h, n: Math.round(v * 42) })}
                  className="h-5 rounded-[3px]"
                  style={{ background: `color-mix(in srgb, var(--color-brand-600) ${Math.round(6 + v * 88)}%, #f1f5f9)` }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-slate-500">
        {t("rep.less")}
        <span
          className="h-2.5 w-24 rounded-sm"
          style={{ background: `linear-gradient(to ${isRtl ? "left" : "right"}, #f1f5f9, var(--color-brand-600))` }}
        />
        {t("rep.more")}
      </div>
    </div>
  );
}
