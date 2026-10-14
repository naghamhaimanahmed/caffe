"use client";

import { useMemo, useState } from "react";
import { BarChart3, Clock, Download, FileSpreadsheet, ListOrdered, PieChart, Scale } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { groupPnL, twelveMonths, type PnL } from "@/lib/finance";
import { BRANCH_IDS, PAYMENT_METHODS, PERIODS, SALES_CHANNELS, SLOW_SELLERS, TOP_ITEMS, type Period } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Button, Card, CardHeader, Segmented } from "../ui";
import { Bar, Kpi, KpiRow, Table, Td, Th } from "./common";

const CHANNEL_COLORS = ["var(--color-series-1)", "var(--color-series-2)", "#1baf7a", "#e87ba4", "#94a3b8"];
const monthFmt = new Intl.DateTimeFormat("ar-AE-u-nu-latn", { month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("ar-AE-u-nu-latn", { month: "long", year: "numeric" });

const PNL_ROWS: { key: keyof PnL; label: string; cost?: boolean; strong?: boolean }[] = [
  { key: "sales", label: "المبيعات", strong: true },
  { key: "cogs", label: "تكلفة الأغذية", cost: true },
  { key: "gross", label: "مجمل الربح", strong: true },
  { key: "salaries", label: "الرواتب", cost: true },
  { key: "rent", label: "الإيجار", cost: true },
  { key: "utilities", label: "الكهرباء والماء", cost: true },
  { key: "commissions", label: "عمولات تطبيقات التوصيل", cost: true },
  { key: "other", label: "مصروفات أخرى", cost: true },
  { key: "net", label: "صافي الربح", strong: true },
];

export function ReportsTab() {
  const { names, history, today, notify } = useOwner();
  const [period, setPeriod] = useState<Period>("month");
  const periodInfo = PERIODS.find((p) => p.id === period)!;
  const { perBranch, group } = useMemo(() => groupPnL(period, history, today), [period, history, today]);
  const expenses = group.salaries + group.rent + group.utilities + group.commissions + group.other;
  const columns = [...perBranch, group];
  const itemFactor = periodInfo.factor * (period === "today" ? 30 / 26 : 1);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Segmented value={period} onChange={setPeriod} options={PERIODS.map((p) => ({ value: p.id, label: p.label }))} />
        <span className="flex-1" />
        <Button size="sm" variant="secondary" onClick={() => notify("تم تصدير التقرير (Excel)")}>
          <FileSpreadsheet className="size-4" />
          تصدير Excel
        </Button>
        <Button size="sm" variant="secondary" onClick={() => notify("تم تصدير التقرير (PDF)")}>
          <Download className="size-4" />
          تصدير PDF
        </Button>
      </Card>

      <KpiRow>
        <Kpi
          hero
          label="المبيعات"
          value={money(group.sales)}
          footer={
            <span className="text-emerald-300">
              <span className="num">▲ {periodInfo.change}%</span> مقارنة بالفترة السابقة
            </span>
          }
        />
        <Kpi label="تكلفة الأغذية" value={money(group.cogs)} footer={<span><span className="num">{((group.cogs / group.sales) * 100).toFixed(1)}%</span> من المبيعات</span>} />
        <Kpi label="المصروفات" value={money(expenses)} footer={<span><span className="num">{((expenses / group.sales) * 100).toFixed(1)}%</span> من المبيعات</span>} />
        <Kpi
          label="صافي الربح"
          value={money(group.net)}
          valueClass={group.net >= 0 ? "text-emerald-600" : "text-red-600"}
          footer={<span>هامش الربح <span className="num">{((group.net / group.sales) * 100).toFixed(1)}%</span></span>}
        />
      </KpiRow>

      <Card>
        <CardHeader icon={<Scale className="size-5" />} title="الأرباح والخسائر" subtitle={`${periodInfo.label} · بالدرهم`} />
        <Table
          minWidth={560}
          head={
            <>
              <Th />
              {BRANCH_IDS.map((b) => (
                <Th key={b} end>
                  {names.branches[b]}
                </Th>
              ))}
              <Th end>المجموعة</Th>
            </>
          }
        >
          {PNL_ROWS.map((r) => (
            <tr key={r.key} className={cn(r.strong && "font-semibold text-slate-900", r.key === "net" && "bg-slate-50")}>
              <Td className={r.strong ? "" : "text-slate-600"}>{r.label}</Td>
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
            <Td className="text-xs text-slate-500">هامش الربح</Td>
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
          <CardHeader icon={<BarChart3 className="size-5" />} title="مبيعات المجموعة آخر 12 شهر" subtitle="الأعمدة هذه السنة، والخط المتقطع نفس الشهر السنة الماضية" />
          <YearChart history={history} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader icon={<PieChart className="size-5" />} title="المبيعات حسب القناة" />
          <div className="space-y-4 p-5">
            <div className="flex h-3.5 gap-[2px] overflow-hidden rounded-full">
              {SALES_CHANNELS.map((c, i) => (
                <span key={c.label} style={{ width: `${c.share * 100}%`, background: CHANNEL_COLORS[i] }} title={`${c.label} ${Math.round(c.share * 100)}%`} />
              ))}
            </div>
            <ul className="space-y-2 text-sm">
              {SALES_CHANNELS.map((c, i) => (
                <li key={c.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="size-2.5 rounded-sm" style={{ background: CHANNEL_COLORS[i] }} />
                    {c.label}
                  </span>
                  <span className="font-medium text-slate-900">
                    <span className="num">{money(group.sales * c.share)}</span> · <span className="num">{Math.round(c.share * 100)}%</span>
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="pt-2 text-sm font-semibold text-slate-900">حسب طريقة الدفع</h3>
            <ul className="space-y-2.5">
              {PAYMENT_METHODS.map((p) => (
                <li key={p.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{p.label}</span>
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
          <CardHeader icon={<Clock className="size-5" />} title="أوقات الذروة" subtitle="متوسط الطلبات لكل ساعة، آخر 4 أسابيع" />
          <PeakHours />
        </Card>
        <Card>
          <CardHeader icon={<ListOrdered className="size-5" />} title="الأصناف الأكثر والأقل مبيعًا" subtitle={periodInfo.label} />
          <Table
            minWidth={420}
            head={
              <>
                <Th>الصنف</Th>
                <Th end>الكمية</Th>
                <Th end>الإيراد</Th>
                <Th end>هامش الربح</Th>
              </>
            }
          >
            {TOP_ITEMS.map((m, i) => {
              const slow = i >= TOP_ITEMS.length - SLOW_SELLERS;
              return (
                <tr key={m.name} className={cn(i === TOP_ITEMS.length - SLOW_SELLERS && "!border-t-2 !border-slate-200")}>
                  <Td>
                    <span className={slow ? "text-red-500" : "text-emerald-600"}>{slow ? "▼" : "▲"}</span> {m.name}
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

/** Twelve monthly bars, oldest on the right (reading direction), with last year as a dashed line. */
function YearChart({ history }: { history: Parameters<typeof twelveMonths>[0] }) {
  const data = useMemo(() => twelveMonths(history, new Date()), [history]);
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 240, P = { l: 48, r: 12, t: 12, b: 28 };
  const step = Math.ceil(Math.max(...data.flatMap((d) => [d.thisYear, d.lastYear])) / 4 / 10000) * 10000;
  const max = step * 4;
  const bw = (W - P.l - P.r) / 12;
  // index 0 (oldest) sits at the right edge
  const cx = (i: number) => W - P.r - (i + 0.5) * bw;
  const y = (v: number) => P.t + (1 - v / max) * (H - P.t - P.b);
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const shown = hover ?? data.length - 1;

  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div>
          <span className="font-medium text-slate-900">{monthYearFmt.format(data[shown].month)}</span>
          <span className="text-slate-500"> · هذه السنة </span>
          <b className="num">{money(data[shown].thisYear)}</b>
          <span className="text-slate-500"> · السنة الماضية </span>
          <span className="num text-slate-600">{money(data[shown].lastYear)}</span>
        </div>
        <ul className="flex items-center gap-4 text-xs text-slate-600">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-500" />
            هذه السنة
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-slate-400" />
            السنة الماضية
          </li>
        </ul>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} direction="ltr" className="block h-auto w-full" role="img" aria-label="مبيعات المجموعة آخر 12 شهر" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t ? "3 3" : undefined} />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {Math.round(t / 1000)}k
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

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);

function PeakHours() {
  // Lunch and dinner peaks, busier at the weekend (Thu–Sat).
  const value = (d: number, h: number) => {
    const lunch = Math.exp(-((h - 13.5) ** 2) / 3);
    const dinner = Math.exp(-((h - 21) ** 2) / 4);
    const morning = Math.exp(-((h - 9) ** 2) / 1.5) * 0.5;
    return (lunch * 0.8 + dinner + morning) * [1.15, 0.85, 0.8, 0.82, 0.9, 1.25, 1.3][d];
  };
  const max = Math.max(...DAYS.flatMap((_, d) => HOURS.map((h) => value(d, h))));

  return (
    <div className="overflow-x-auto p-5">
      <div className="grid min-w-[460px] gap-[3px] text-[11px] text-slate-500" style={{ gridTemplateColumns: `56px repeat(${HOURS.length}, minmax(16px, 1fr))` }}>
        <span />
        {HOURS.map((h) => (
          <span key={h} className="num text-center">
            {h % 3 === 0 ? h : ""}
          </span>
        ))}
        {DAYS.map((day, d) => (
          <div key={day} className="contents">
            <span className="self-center">{day}</span>
            {HOURS.map((h) => {
              const v = value(d, h) / max;
              return (
                <span
                  key={h}
                  title={`${day} ${h}:00 · حوالي ${Math.round(v * 42)} طلب`}
                  className="h-5 rounded-[3px]"
                  style={{ background: `color-mix(in srgb, var(--color-brand-600) ${Math.round(6 + v * 88)}%, #f1f5f9)` }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-slate-500">
        أقل
        <span className="h-2.5 w-24 rounded-sm" style={{ background: "linear-gradient(to left, #f1f5f9, var(--color-brand-600))" }} />
        أكثر
      </div>
    </div>
  );
}
