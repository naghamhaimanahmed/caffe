"use client";

import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { BRANCHES, type DailySales } from "@/lib/mock-data";
import { CURRENCY, cn, fmt } from "@/lib/format";
import { Segmented } from "./ui";

const SERIES = [
  { key: "qasr" as const, label: BRANCHES.qasr, color: "var(--color-series-1)" },
  { key: "lulu" as const, label: BRANCHES.lulu, color: "var(--color-series-2)" },
];

const dayFmt = new Intl.DateTimeFormat("ar-AE-u-nu-latn", { day: "numeric", month: "short" });
const weekdayFmt = new Intl.DateTimeFormat("ar-AE", { weekday: "long" });

function niceMax(v: number) {
  const step = 20000;
  return Math.ceil(v / step) * step;
}

/**
 * Stacked daily sales per branch. Time runs in reading direction (RTL):
 * oldest day on the right, today on the left.
 */
export function SalesChart({ data }: { data: DailySales[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [hover, setHover] = useState<number | null>(null);

  const totals = data.map((d) => d.qasr + d.lulu);
  const max = niceMax(Math.max(...totals));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const sum = totals.reduce((a, b) => a + b, 0);
  const avg = sum / data.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-baseline gap-3">
          <div>
            <div className="text-xs text-slate-500">إجمالي 14 يوم</div>
            <div className="num text-xl font-semibold text-slate-900">
              {fmt(sum)} <span className="text-sm font-normal text-slate-500">{CURRENCY}</span>
            </div>
          </div>
          <div className="border-s border-slate-200 ps-3">
            <div className="text-xs text-slate-500">المتوسط اليومي</div>
            <div className="num text-sm font-medium text-slate-700">{fmt(avg)} {CURRENCY}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-4 text-xs text-slate-600" aria-label="مفتاح الرسم">
            {SERIES.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                {s.label}
              </li>
            ))}
          </ul>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "chart", label: "رسم", icon: <BarChart3 className="size-4" /> },
              { value: "table", label: "جدول", icon: <Table2 className="size-4" /> },
            ]}
          />
        </div>
      </div>

      {view === "chart" ? (
        <div className="px-5 pb-5 pt-6">
          <div className="flex gap-3">
            {/* Plot */}
            <div className="relative h-64 flex-1">
              {/* gridlines */}
              {ticks.map((t) => (
                <div
                  key={t}
                  className={cn("absolute inset-x-0 border-t", t === 0 ? "border-slate-300" : "border-dashed border-slate-100")}
                  style={{ bottom: `${(t / max) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-[2px] sm:gap-2">
                {data.map((d, i) => {
                  const total = totals[i];
                  const isToday = i === data.length - 1;
                  return (
                    <div
                      key={d.date}
                      className="relative flex h-full flex-1 cursor-default flex-col justify-end"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      {hover === i && <div className="absolute inset-0 -mx-0.5 rounded-md bg-slate-100/70" />}
                      <div
                        className={cn("relative mx-auto flex w-full max-w-9 flex-col gap-[2px] transition-opacity", hover !== null && hover !== i && "opacity-50")}
                        style={{ height: `${(total / max) * 100}%` }}
                      >
                        <div className="rounded-t-[4px]" style={{ flex: d.lulu, background: SERIES[1].color }} />
                        <div style={{ flex: d.qasr, background: SERIES[0].color }} />
                      </div>
                      {isToday && hover === null && (
                        <div className="num absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-slate-700" style={{ bottom: `calc(${(total / max) * 100}% + 4px)` }}>
                          {fmt(total)}
                        </div>
                      )}
                      {hover === i && (
                        <div
                          className="pointer-events-none absolute left-1/2 z-10 w-48 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg"
                          style={{ bottom: `calc(${Math.min((total / max) * 100, 70)}% + 10px)` }}
                        >
                          <div className="mb-2 font-semibold text-slate-900">
                            {weekdayFmt.format(new Date(d.date))} · {dayFmt.format(new Date(d.date))}
                          </div>
                          {SERIES.map((s) => (
                            <div key={s.key} className="flex items-center justify-between gap-2 py-0.5">
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <span className="size-2 rounded-sm" style={{ background: s.color }} />
                                {s.label}
                              </span>
                              <span className="num font-medium text-slate-900">{fmt(d[s.key])}</span>
                            </div>
                          ))}
                          <div className="mt-1.5 flex justify-between border-t border-slate-100 pt-1.5">
                            <span className="text-slate-600">الإجمالي</span>
                            <span className="num font-semibold text-slate-900">
                              {fmt(total)} {CURRENCY}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Y axis (logical end = left in RTL) */}
            <div className="relative h-64 w-10 shrink-0 text-[11px] text-slate-400">
              {ticks.map((t) => (
                <span key={t} className="num absolute start-0 translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
                  {t === 0 ? "0" : `${t / 1000}k`}
                </span>
              ))}
            </div>
          </div>
          {/* X axis */}
          <div className="me-13 mt-2 flex gap-[2px] sm:gap-2">
            {data.map((d, i) => (
              <div
                key={d.date}
                className={cn(
                  "num flex-1 text-center text-[10px] sm:text-[11px]",
                  i === data.length - 1 ? "font-semibold text-slate-700" : "text-slate-400",
                  i % 2 === 1 && i !== data.length - 1 && "max-sm:invisible",
                )}
              >
                {i === data.length - 1 ? "اليوم" : dayFmt.format(new Date(d.date))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-h-80 overflow-auto px-5 pb-5 pt-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-xs text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2 text-start font-medium">التاريخ</th>
                <th className="py-2 text-end font-medium">{BRANCHES.qasr}</th>
                <th className="py-2 text-end font-medium">{BRANCHES.lulu}</th>
                <th className="py-2 text-end font-medium">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.date} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">
                    {weekdayFmt.format(new Date(d.date))} {dayFmt.format(new Date(d.date))}
                  </td>
                  <td className="num py-2 text-end text-slate-700">{fmt(d.qasr)}</td>
                  <td className="num py-2 text-end text-slate-700">{fmt(d.lulu)}</td>
                  <td className="num py-2 text-end font-medium text-slate-900">{fmt(d.qasr + d.lulu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
