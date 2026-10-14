"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  FileCheck2,
  Inbox,
  Paperclip,
  Scale,
  TrendingUp,
  Undo2,
  Wallet,
} from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { DesktopShell, type NavItem } from "@/components/DesktopShell";
import { Badge, Button, Card, CardHeader, EmptyState, Segmented, Select, useToast } from "@/components/ui";
import { ClosingBadge, varianceStatus } from "@/components/StatusBadges";
import {
  BRANCHES,
  GL_CATEGORIES,
  PRICE_ALERTS,
  REVIEW_QUEUE,
  type PriceAlert,
  type ReviewItem,
} from "@/lib/mock-data";
import { CURRENCY, cn, fmt, fmtSigned } from "@/lib/format";

type TypeFilter = "all" | "closing" | "petty";
type StatusFilter = "pending" | "done";

export default function AccountantPage() {
  return (
    <RoleGuard allow="accountant">
      <AccountantApp />
    </RoleGuard>
  );
}

function AccountantApp() {
  const [active, setActive] = useState("queue");
  const [items, setItems] = useState<ReviewItem[]>(REVIEW_QUEUE);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [threshold, setThreshold] = useState<"3" | "5" | "10">("3");
  const toast = useToast();

  const pending = items.filter((i) => i.status === "pending");
  const done = items.filter((i) => i.status !== "pending");

  const visible = (statusFilter === "pending" ? pending : done).filter((i) => typeFilter === "all" || i.type === typeFilter);

  const alerts = useMemo(
    () =>
      PRICE_ALERTS.map((a) => ({ ...a, change: ((a.current - a.previous) / a.previous) * 100 }))
        .filter((a) => Math.abs(a.change) >= Number(threshold))
        .sort((a, b) => b.change - a.change),
    [threshold],
  );

  const nav: NavItem[] = [
    { id: "queue", label: "قائمة المراجعة", icon: <ClipboardList />, badge: pending.length },
    { id: "alerts", label: "تنبيهات الأسعار", icon: <TrendingUp />, badge: PRICE_ALERTS.filter((a) => a.current > a.previous).length },
  ];

  const navigate = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setCategory = (id: string, gl: string) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, glCategory: gl || null } : i)));

  const decide = (item: ReviewItem, status: "approved" | "returned") => {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, status } : i)));
    toast.show(status === "approved" ? `تم اعتماد وترحيل ${item.id}` : `تمت إعادة ${item.id} إلى ${item.submittedBy}`);
  };

  const undo = (item: ReviewItem) => setItems((list) => list.map((i) => (i.id === item.id ? { ...i, status: "pending" } : i)));

  const pendingPetty = pending.filter((i) => i.type === "petty").reduce((a, b) => a + b.amount, 0);
  const netVariance = pending.filter((i) => i.type === "closing").reduce((a, b) => a + (b.variance ?? 0), 0);

  return (
    <DesktopShell
      role="accountant"
      nav={nav}
      active={active}
      onNavigate={navigate}
      title="مراجعة الحسابات"
      subtitle="مراجعة الإغلاقات اليومية وتقارير العهد وتصنيفها محاسبيًا"
    >
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={<Inbox />} label="بانتظار المراجعة" value={String(pending.length)} />
          <Stat icon={<FileCheck2 />} label="تمت معالجتها اليوم" value={String(done.length)} tone="success" />
          <Stat icon={<Wallet />} label="عهد معلّقة" value={fmt(pendingPetty)} unit={CURRENCY} />
          <Stat
            icon={<Scale />}
            label="صافي فروقات النقدية"
            value={fmtSigned(netVariance, 0)}
            unit={CURRENCY}
            tone={netVariance < 0 ? "danger" : netVariance > 0 ? "warning" : "success"}
          />
        </section>

        {/* Review queue */}
        <section id="queue" className="scroll-mt-24">
          <Card>
            <CardHeader
              icon={<ClipboardList className="size-5" />}
              title="قائمة المراجعة"
              subtitle="اختر الحساب المحاسبي لكل بند ثم اعتمده أو أعده للمرسل"
              action={
                <Segmented
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "pending", label: "معلّقة", count: pending.length },
                    { value: "done", label: "تمت معالجتها", count: done.length },
                  ]}
                />
              }
            />
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
              <Segmented
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: "الكل" },
                  { value: "closing", label: "إغلاقات يومية" },
                  { value: "petty", label: "تقارير عهدة" },
                ]}
              />
              <span className="text-xs text-slate-500">
                عرض <span className="num">{visible.length}</span> بند
              </span>
            </div>

            {visible.length === 0 ? (
              <EmptyState icon={<FileCheck2 className="size-6" />} title="لا توجد بنود هنا" text={statusFilter === "pending" ? "تمت مراجعة كل شيء." : "لم تتم معالجة أي بند بعد."} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                      <th className="px-5 py-3 text-start font-medium">المرجع</th>
                      <th className="px-3 py-3 text-start font-medium">النوع</th>
                      <th className="px-3 py-3 text-start font-medium">الفرع / المرسل</th>
                      <th className="px-3 py-3 text-start font-medium">الوصف</th>
                      <th className="px-3 py-3 text-end font-medium">المبلغ</th>
                      <th className="px-3 py-3 text-start font-medium">الفرق</th>
                      <th className="px-3 py-3 text-start font-medium">الحساب المحاسبي</th>
                      <th className="px-5 py-3 text-end font-medium">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                        <td className="px-5 py-3.5">
                          <div className="num whitespace-nowrap font-medium text-slate-900">{item.id}</div>
                          <div className="num whitespace-nowrap text-[11px] text-slate-400">{item.submittedAt}</div>
                        </td>
                        <td className="px-3 py-3.5">
                          {item.type === "closing" ? <Badge tone="info">إغلاق يومي</Badge> : <Badge tone="warning">عهدة</Badge>}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="whitespace-nowrap text-slate-900">{BRANCHES[item.branch]}</div>
                          <div className="whitespace-nowrap text-xs text-slate-500">{item.submittedBy}</div>
                        </td>
                        <td className="max-w-56 px-3 py-3.5">
                          <div className="truncate text-slate-700">{item.description}</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Paperclip className="size-3" />
                            <span className="num">{item.attachments}</span> مرفقات
                          </div>
                        </td>
                        <td className="num whitespace-nowrap px-3 py-3.5 text-end font-semibold text-slate-900">{fmt(item.amount, 2)}</td>
                        <td className="px-3 py-3.5">
                          {item.type === "closing" && item.variance !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className={cn("num text-sm font-medium", item.variance < 0 ? "text-red-600" : item.variance > 0 ? "text-amber-600" : "text-emerald-600")}>
                                {fmtSigned(item.variance, 0)}
                              </span>
                              <ClosingBadge status={varianceStatus(item.variance)} />
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {item.status === "pending" ? (
                            <div>
                              <Select
                                value={item.glCategory ?? ""}
                                onChange={(e) => setCategory(item.id, e.target.value)}
                                className={cn("h-9 min-w-40 text-xs", !item.glCategory && "border-amber-300 bg-amber-50/40")}
                              >
                                <option value="">— اختر الحساب —</option>
                                {GL_CATEGORIES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </Select>
                              {!item.glCategory && (
                                <button
                                  type="button"
                                  onClick={() => setCategory(item.id, item.suggestedCategory)}
                                  className="mt-1 text-[11px] text-brand-600 hover:underline"
                                >
                                  اقتراح: {item.suggestedCategory}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600">{item.glCategory ?? "—"}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="danger" onClick={() => decide(item, "returned")}>
                                <Undo2 className="size-3.5" />
                                إرجاع
                              </Button>
                              <Button
                                size="sm"
                                variant="success"
                                disabled={!item.glCategory}
                                title={!item.glCategory ? "اختر الحساب المحاسبي أولًا" : undefined}
                                onClick={() => decide(item, "approved")}
                              >
                                <Check className="size-3.5" />
                                اعتماد
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {item.status === "approved" ? <Badge tone="success">معتمد</Badge> : <Badge tone="danger">مُعاد</Badge>}
                              <Button size="sm" variant="ghost" onClick={() => undo(item)}>
                                تراجع
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        {/* Supplier price alerts */}
        <section id="alerts" className="scroll-mt-24">
          <Card>
            <CardHeader
              icon={<AlertTriangle className="size-5" />}
              title="تنبيهات أسعار الموردين"
              subtitle="مكونات تغيّر سعر شرائها مقارنة بآخر فاتورة"
              action={
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="hidden sm:inline">حد التنبيه</span>
                  <Segmented
                    value={threshold}
                    onChange={setThreshold}
                    options={[
                      { value: "3", label: "≥ 3%" },
                      { value: "5", label: "≥ 5%" },
                      { value: "10", label: "≥ 10%" },
                    ]}
                  />
                </div>
              }
            />
            {alerts.length === 0 ? (
              <EmptyState icon={<TrendingUp className="size-6" />} title="لا توجد تغيّرات فوق هذا الحد" />
            ) : (
              <ul className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-y-0">
                {alerts.map((a, i) => (
                  <PriceAlertRow key={a.ingredient} alert={a} change={a.change} className={cn("lg:border-b lg:border-slate-100", i % 2 === 0 && "lg:border-e")} />
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
      {toast.node}
    </DesktopShell>
  );
}

function PriceAlertRow({ alert: a, change, className }: { alert: PriceAlert; change: number; className?: string }) {
  const up = change > 0;
  const severity = !up ? "success" : change >= 10 ? "danger" : change >= 5 ? "warning" : "neutral";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <li className={cn("flex items-center gap-4 px-5 py-4", className)}>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          severity === "danger" && "bg-red-50 text-red-600",
          severity === "warning" && "bg-amber-50 text-amber-600",
          severity === "neutral" && "bg-slate-100 text-slate-600",
          severity === "success" && "bg-emerald-50 text-emerald-600",
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">{a.ingredient}</span>
          <Badge tone={severity === "neutral" ? "neutral" : severity}>
            <span className="num">
              {up ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            {up ? "زيادة" : "انخفاض"}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {a.supplier} · {a.updatedAt}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          <span className="num text-slate-400 line-through">{fmt(a.previous, 2)}</span>
          <span className="mx-1.5 text-slate-300">←</span>
          <span className="num font-semibold text-slate-900">{fmt(a.current, 2)}</span> {CURRENCY} / {a.unit}
        </p>
      </div>
      <Sparkline values={a.history} unit={a.unit} up={up} />
    </li>
  );
}

/** Single-series trend of the last purchase prices; oldest on the right (RTL). */
function Sparkline({ values, unit, up }: { values: number[]; unit: string; up: boolean }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  // RTL: index 0 (oldest) at the right edge
  const pts = values.map((v, i) => [w - (i / (values.length - 1)) * w, h - 4 - ((v - min) / range) * (h - 8)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const color = up ? "#d03b3b" : "#0f8a5f";
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible" role="img" aria-label={`آخر ${values.length} أسعار: ${values.join("، ")} ${unit}`}>
      <title>{values.map((v) => fmt(v, 2)).join(" ← ")}</title>
      <path d={d} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M${pts[pts.length - 2][0]},${pts[pts.length - 2][1]} L${last[0]},${last[1]}`} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={4} fill={color} stroke="white" strokeWidth={2} />
    </svg>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  tone?: "success" | "warning" | "danger";
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl [&>svg]:size-5",
          tone === "success" ? "bg-emerald-50 text-emerald-600" : tone === "warning" ? "bg-amber-50 text-amber-600" : tone === "danger" ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600",
        )}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="num text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-xs text-slate-500">{unit}</span>}
        </div>
      </div>
    </Card>
  );
}
