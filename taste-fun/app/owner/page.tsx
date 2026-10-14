"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  Download,
  LayoutDashboard,
  LineChart,
  Percent,
  Receipt,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { DesktopShell, type NavItem } from "@/components/DesktopShell";
import { Badge, Button, Card, CardHeader, EmptyState, useToast } from "@/components/ui";
import { ClosingBadge, TrendPill } from "@/components/StatusBadges";
import { SalesChart } from "@/components/SalesChart";
import {
  BRANCHES,
  BRANCH_CLOSINGS,
  PENDING_APPROVALS,
  SALES_14_DAYS,
  type Approval,
} from "@/lib/mock-data";
import { CURRENCY, cn, fmt, fmtSigned, pct } from "@/lib/format";

const FOOD_COST_TARGET = 30;

const KIND_LABEL: Record<Approval["kind"], { label: string; tone: "info" | "warning" | "danger" }> = {
  po: { label: "أمر شراء", tone: "info" },
  petty: { label: "عهدة", tone: "warning" },
  variance: { label: "فرق نقدي", tone: "danger" },
};

export default function OwnerPage() {
  return (
    <RoleGuard allow="owner">
      <OwnerDashboard />
    </RoleGuard>
  );
}

function OwnerDashboard() {
  const [active, setActive] = useState("overview");
  const [approvals, setApprovals] = useState(PENDING_APPROVALS);
  const toast = useToast();

  const nav: NavItem[] = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard /> },
    { id: "branches", label: "إغلاق الفروع", icon: <Building2 /> },
    { id: "sales", label: "المبيعات", icon: <LineChart /> },
    { id: "approvals", label: "الموافقات", icon: <ClipboardCheck />, badge: approvals.length },
  ];

  const navigate = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const kpis = useMemo(() => {
    const today = SALES_14_DAYS[SALES_14_DAYS.length - 1];
    const yesterday = SALES_14_DAYS[SALES_14_DAYS.length - 2];
    const todayTotal = today.qasr + today.lulu;
    const yTotal = yesterday.qasr + yesterday.lulu;
    const tickets = BRANCH_CLOSINGS.reduce((a, b) => a + b.tickets, 0);
    const foodCost =
      BRANCH_CLOSINGS.reduce((a, b) => a + b.foodCost * b.sales, 0) /
      BRANCH_CLOSINGS.reduce((a, b) => a + b.sales, 0);
    return {
      todayTotal,
      salesDelta: ((todayTotal - yTotal) / yTotal) * 100,
      avgTicket: todayTotal / tickets,
      tickets,
      foodCost,
    };
  }, []);

  const decide = (a: Approval, approved: boolean) => {
    setApprovals((list) => list.filter((x) => x.id !== a.id));
    toast.show(approved ? `تم اعتماد ${a.id}` : `تم رفض ${a.id}`);
  };

  const pendingValue = approvals.reduce((a, b) => a + b.amount, 0);

  return (
    <DesktopShell
      role="owner"
      nav={nav}
      active={active}
      onNavigate={navigate}
      title="لوحة المالك"
      subtitle="الثلاثاء 14 أكتوبر 2026 · جميع الفروع"
      actions={
        <Button variant="secondary" size="md" className="hidden md:inline-flex" onClick={() => toast.show("تم تجهيز التقرير اليومي (عرض تجريبي)")}>
          <Download className="size-4" />
          تصدير التقرير
        </Button>
      }
    >
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* KPIs */}
        <section id="overview" className="scroll-mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<Wallet />}
            label="مبيعات المجموعة اليوم"
            value={fmt(kpis.todayTotal)}
            unit={CURRENCY}
            footer={
              <>
                <TrendPill value={kpis.salesDelta} />
                <span>مقارنة بالأمس</span>
              </>
            }
          />
          <KpiCard
            icon={<Receipt />}
            label="متوسط الفاتورة"
            value={fmt(kpis.avgTicket, 2)}
            unit={CURRENCY}
            footer={
              <span>
                من <span className="num font-medium text-slate-700">{fmt(kpis.tickets)}</span> فاتورة اليوم
              </span>
            }
          />
          <KpiCard
            icon={<Percent />}
            label="نسبة تكلفة الطعام"
            value={pct(kpis.foodCost)}
            tone={kpis.foodCost > FOOD_COST_TARGET ? "warning" : "success"}
            footer={
              <>
                <Badge tone={kpis.foodCost > FOOD_COST_TARGET ? "warning" : "success"}>
                  الهدف <span className="num">{FOOD_COST_TARGET}%</span>
                </Badge>
                <span>
                  {kpis.foodCost > FOOD_COST_TARGET ? "أعلى من الهدف بـ" : "ضمن الهدف"}{" "}
                  {kpis.foodCost > FOOD_COST_TARGET && <><span className="num">{(kpis.foodCost - FOOD_COST_TARGET).toFixed(1)}</span> نقطة</>}
                </span>
              </>
            }
          >
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", kpis.foodCost > FOOD_COST_TARGET ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${Math.min(kpis.foodCost / 50, 1) * 100}%` }}
              />
            </div>
          </KpiCard>
          <KpiCard
            icon={<ClipboardCheck />}
            label="موافقات معلّقة"
            value={String(approvals.length)}
            footer={
              <span>
                بقيمة <span className="num font-medium text-slate-700">{fmt(pendingValue)}</span> {CURRENCY}
              </span>
            }
            onClick={() => navigate("approvals")}
          />
        </section>

        {/* Branch closing comparison */}
        <section id="branches" className="scroll-mt-24">
          <Card>
            <CardHeader
              icon={<Building2 className="size-5" />}
              title="حالة إغلاق الفروع — اليوم"
              subtitle="مقارنة الإغلاق اليومي للصندوق بين الفرعين"
              action={<Badge tone="info">آخر تحديث 23:58</Badge>}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    {["الفرع", "المدير", "المبيعات", "الفواتير", "متوسط الفاتورة", "النقد المتوقع", "النقد المعدود", "الفرق", "تكلفة الطعام", "العهدة المصروفة", "حالة الإغلاق"].map((h, i) => (
                      <th key={h} className={cn("px-4 py-3 font-medium", i < 2 || i === 10 ? "text-start" : "text-end")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BRANCH_CLOSINGS.map((b) => {
                    const variance = b.countedCash === null ? null : b.countedCash - b.expectedCash;
                    return (
                      <tr key={b.branch} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="size-2.5 rounded-sm" style={{ background: b.branch === "qasr" ? "var(--color-series-1)" : "var(--color-series-2)" }} />
                            <span className="font-semibold text-slate-900">{BRANCHES[b.branch]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{b.manager}</td>
                        <td className="num px-4 py-4 text-end font-medium text-slate-900">{fmt(b.sales)}</td>
                        <td className="num px-4 py-4 text-end text-slate-600">{b.tickets}</td>
                        <td className="num px-4 py-4 text-end text-slate-600">{fmt(b.sales / b.tickets, 2)}</td>
                        <td className="num px-4 py-4 text-end text-slate-600">{fmt(b.expectedCash)}</td>
                        <td className="num px-4 py-4 text-end text-slate-600">{b.countedCash === null ? "—" : fmt(b.countedCash)}</td>
                        <td className={cn("num px-4 py-4 text-end font-medium", variance === null ? "text-slate-400" : variance < 0 ? "text-red-600" : variance > 0 ? "text-amber-600" : "text-emerald-600")}>
                          {variance === null ? "—" : fmtSigned(variance, 0)}
                        </td>
                        <td className={cn("num px-4 py-4 text-end", b.foodCost > FOOD_COST_TARGET ? "text-amber-700" : "text-slate-600")}>{pct(b.foodCost)}</td>
                        <td className="num px-4 py-4 text-end text-slate-600">{fmt(b.pettyCashSpent)}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <ClosingBadge status={b.status} />
                            <span className="text-[11px] text-slate-400">
                              {b.submittedAt ? <>أُرسل <span className="num">{b.submittedAt}</span></> : "لم يُرسل بعد"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 text-sm font-semibold text-slate-900">
                    <td className="px-4 py-3" colSpan={2}>إجمالي المجموعة</td>
                    <td className="num px-4 py-3 text-end">{fmt(BRANCH_CLOSINGS.reduce((a, b) => a + b.sales, 0))}</td>
                    <td className="num px-4 py-3 text-end">{kpis.tickets}</td>
                    <td className="num px-4 py-3 text-end">{fmt(kpis.avgTicket, 2)}</td>
                    <td className="num px-4 py-3 text-end">{fmt(BRANCH_CLOSINGS.reduce((a, b) => a + b.expectedCash, 0))}</td>
                    <td className="px-4 py-3" colSpan={2} />
                    <td className="num px-4 py-3 text-end">{pct(kpis.foodCost)}</td>
                    <td className="num px-4 py-3 text-end">{fmt(BRANCH_CLOSINGS.reduce((a, b) => a + b.pettyCashSpent, 0))}</td>
                    <td className="px-4 py-3 text-xs font-normal text-slate-500">1 من 2 مُغلق</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Sales chart */}
          <section id="sales" className="scroll-mt-24 xl:col-span-2">
            <Card>
              <CardHeader icon={<LineChart className="size-5" />} title="مبيعات آخر 14 يوم" subtitle="المبيعات اليومية لكل فرع (د.إ) — مرّر على العمود للتفاصيل" />
              <SalesChart data={SALES_14_DAYS} />
            </Card>
          </section>

          {/* Approvals */}
          <section id="approvals" className="scroll-mt-24">
            <Card className="h-full">
              <CardHeader
                icon={<ClipboardCheck className="size-5" />}
                title="الموافقات المعلّقة"
                subtitle="طلبات تتجاوز صلاحيات المدير أو المشتريات"
                action={<Badge tone="warning"><span className="num">{approvals.length}</span></Badge>}
              />
              {approvals.length === 0 ? (
                <EmptyState icon={<BadgeCheck className="size-6" />} title="لا توجد موافقات معلّقة" text="تمت معالجة جميع الطلبات." />
              ) : (
                <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                  {approvals.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        {a.kind === "po" ? <ShoppingBag className="size-4" /> : a.kind === "petty" ? <Wallet className="size-4" /> : <Receipt className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge tone={KIND_LABEL[a.kind].tone}>{KIND_LABEL[a.kind].label}</Badge>
                          <span className="num text-[11px] text-slate-400">{a.id}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-900">{a.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {BRANCHES[a.branch]} · {a.requestedBy} · <span className="num font-medium text-slate-700">{fmt(a.amount)}</span> {CURRENCY}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <button onClick={() => decide(a, false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-200" aria-label="رفض">
                          <X className="size-4" />
                        </button>
                        <button onClick={() => decide(a, true)} className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" aria-label="اعتماد">
                          <Check className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>
      </div>
      {toast.node}
    </DesktopShell>
  );
}

function KpiCard({
  icon,
  label,
  value,
  unit,
  footer,
  tone,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  footer?: React.ReactNode;
  tone?: "warning" | "success";
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Card
      className={cn("p-5", onClick && "cursor-pointer transition hover:border-brand-500 hover:shadow-md")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg [&>svg]:size-[18px]",
            tone === "warning" ? "bg-amber-50 text-amber-600" : tone === "success" ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600",
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="num text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {children}
      {footer && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">{footer}</div>}
    </Card>
  );
}
