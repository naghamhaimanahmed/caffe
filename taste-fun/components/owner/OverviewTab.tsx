"use client";

import { AlertTriangle, LineChart, Radio } from "lucide-react";
import { useOwner, money, type TabId } from "@/lib/owner-store";
import {
  BASE_DAILY,
  BRANCH_IDS,
  FOOD_COST,
  FOOD_COST_LIMIT,
  FOOD_COST_OVER_AMOUNT,
  FOOD_COST_RANGE,
  SERIES_COLOR,
  isoDate,
} from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Button, Card, CardHeader } from "../ui";
import { SalesChart } from "../SalesChart";
import { ClosingStateBadge } from "../StatusBadges";
import { Bar, BranchDot, Kpi, KpiRow } from "./common";

export function OverviewTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { names, today, history, feed, approvals, alerts, lowStockCount, closings } = useOwner();

  const total = today.sales.qasr + today.sales.lulu;
  const yday = today.yesterdaySameTime.qasr + today.yesterdaySameTime.lulu;
  const orders = today.orders.qasr + today.orders.lulu;
  const change = ((total - yday) / yday) * 100;
  const badAlerts = alerts.filter((a) => a.severity === "bad");
  const cashDiffs = BRANCH_IDS.filter((b) => closings[b].variance).length;
  const chartData = [...history, { date: isoDate(new Date()), qasr: today.sales.qasr, lulu: today.sales.lulu }];

  return (
    <div className="space-y-6">
      {badAlerts.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="size-4 shrink-0" />
          <b>
            <span className="num">{badAlerts.length}</span> تنبيهات مهمة
          </b>
          <span className="min-w-0 flex-1">{badAlerts[0].text}</span>
          <Button size="sm" variant="danger" onClick={() => onNavigate("alerts")}>
            عرض
          </Button>
        </div>
      )}

      <KpiRow>
        <Kpi
          hero
          label="مبيعات المجموعة اليوم"
          value={money(total)}
          footer={
            <span className={change >= 0 ? "text-emerald-300" : "text-red-300"}>
              <span className="num">
                {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
              </span>{" "}
              مقارنة بنفس الوقت أمس
            </span>
          }
        />
        <Kpi label="الطلبات · متوسط الفاتورة" value={fmt(orders)} footer={<span className="num">{money(total / orders)}</span>} />
        <Kpi
          alert
          label={`تكلفة الأغذية · ${names.branches.qasr}`}
          value={`${FOOD_COST.qasr}%`}
          valueClass="text-red-600"
          footer={
            <>
              <Badge tone="danger">{money(FOOD_COST_OVER_AMOUNT)} فوق الحد هذا الشهر</Badge>
              <span>الحد <span className="num">{FOOD_COST_RANGE}</span></span>
            </>
          }
          onClick={() => onNavigate("reports")}
        />
        <Kpi
          label="بانتظار اعتمادك"
          value={approvals.length}
          footer={
            <>
              <Badge tone="danger">
                <span className="num">{lowStockCount}</span> أصناف منخفضة
              </Badge>
              {cashDiffs > 0 && (
                <Badge tone="warning">
                  <span className="num">{cashDiffs}</span> فروقات نقدية
                </Badge>
              )}
            </>
          }
          onClick={() => onNavigate("approvals")}
        />
      </KpiRow>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {BRANCH_IDS.map((b) => {
          const d = ((today.sales[b] - today.yesterdaySameTime[b]) / today.yesterdaySameTime[b]) * 100;
          return (
            <Card key={b} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <BranchDot branch={b} />
                <b className="text-slate-900">{names.branches[b]}</b>
              </div>
              <div className="num text-2xl font-bold text-slate-900">{money(today.sales[b])}</div>
              <Bar ratio={today.sales[b] / BASE_DAILY[b]} color={SERIES_COLOR[b]} />
              <Row label="الطلبات">
                <span className="num">
                  {today.orders[b]} ·{" "}
                  <span className={d >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {d >= 0 ? "+" : ""}
                    {d.toFixed(0)}%
                  </span>
                </span>
              </Row>
              <Row label="تكلفة الأغذية">
                <span className="flex items-center gap-2">
                  <span className={cn("num", FOOD_COST[b] > FOOD_COST_LIMIT && "font-semibold text-red-600")}>{FOOD_COST[b]}%</span>
                  {FOOD_COST[b] > FOOD_COST_LIMIT && <Badge tone="danger">فوق {FOOD_COST_LIMIT}%</Badge>}
                </span>
              </Row>
              <Row label="تقفيل أمس">
                <ClosingStateBadge state={closings[b].state} />
              </Row>
            </Card>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader icon={<LineChart className="size-5" />} title="المبيعات آخر 14 يوم" subtitle="لكل مطعم (د.إ)، واليوم يتحدث مباشرة. مرّر على العمود للتفاصيل" />
          <SalesChart data={chartData} names={names.branches} />
        </Card>
        <Card>
          <CardHeader
            icon={<Radio className="size-5" />}
            title="الطلبات المباشرة"
            subtitle="من الكاشير كل بضع ثوانٍ"
            action={
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                مباشر
              </span>
            }
          />
          <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto">
            {feed.map((o) => (
              <li key={o.no} className={cn("flex items-start gap-3 px-5 py-2.5 text-sm transition-colors duration-700", o.fresh && "bg-brand-50")}>
                <span className="mt-1.5">
                  <BranchDot branch={o.branch} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="num">#{o.no}</b> · {names.branches[o.branch]}
                  <div className="text-xs text-slate-500">{o.channel}</div>
                </div>
                <div className="text-end">
                  <div className="num font-medium text-slate-900">{money(o.amount)}</div>
                  <div className="num text-xs text-slate-400">{o.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      {children}
    </div>
  );
}
