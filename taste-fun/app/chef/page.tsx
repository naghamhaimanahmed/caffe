"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarX2,
  ChevronDown,
  Clock,
  Flame,
  Plus,
  Scale,
  Search,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { MobileShell, type Tab } from "@/components/MobileShell";
import { Badge, Button, Card, EmptyState, Field, Input, NumberInput, Select, Textarea, useToast } from "@/components/ui";
import {
  INITIAL_WASTE,
  RECIPES,
  STOCK_ITEMS,
  WASTE_REASONS,
  type Recipe,
  type WasteEntry,
  type WasteReason,
} from "@/lib/mock-data";
import { CURRENCY, cn, fmt } from "@/lib/format";

type TabId = "waste" | "recipes";

const REASON_ICON: Record<WasteReason, React.ReactNode> = {
  expired: <CalendarX2 className="size-5" />,
  burnt: <Flame className="size-5" />,
  staff_meal: <Users className="size-5" />,
};

const REASON_TONE: Record<WasteReason, "warning" | "danger" | "info"> = {
  expired: "warning",
  burnt: "danger",
  staff_meal: "info",
};

const itemById = (id: string) => STOCK_ITEMS.find((s) => s.id === id)!;

export default function ChefPage() {
  return (
    <RoleGuard allow="chef">
      <ChefApp />
    </RoleGuard>
  );
}

function ChefApp() {
  const [tab, setTab] = useState<TabId>("waste");
  const [entries, setEntries] = useState<WasteEntry[]>(INITIAL_WASTE);
  const toast = useToast();

  const tabs: Tab<TabId>[] = [
    { id: "waste", label: "سجل الهدر", icon: <Trash2 />, badge: entries.length },
    { id: "recipes", label: "الوصفات", icon: <BookOpen /> },
  ];

  return (
    <MobileShell role="chef" tabs={tabs} active={tab} onTab={setTab} width="2xl">
      <div className="mb-4">
        <p className="text-xs text-slate-500">مطبخ القصر الملكي · الثلاثاء 14 أكتوبر</p>
        <h1 className="text-xl font-bold text-slate-900">{tab === "waste" ? "سجل الهدر" : "الوصفات القياسية"}</h1>
      </div>
      {tab === "waste" ? <WasteLog entries={entries} setEntries={setEntries} onToast={toast.show} /> : <Recipes />}
      {toast.node}
    </MobileShell>
  );
}

/* -------------------------------- Waste log -------------------------------- */

function WasteLog({
  entries,
  setEntries,
  onToast,
}: {
  entries: WasteEntry[];
  setEntries: React.Dispatch<React.SetStateAction<WasteEntry[]>>;
  onToast: (m: string) => void;
}) {
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState<WasteReason | null>(null);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  const item = itemId ? itemById(itemId) : null;
  const qtyN = parseFloat(qty);
  const estimate = item && qtyN > 0 ? item.cost * qtyN : 0;

  const errors = {
    item: !itemId ? "اختر الصنف" : undefined,
    qty: !(qtyN > 0) ? "أدخل كمية صحيحة" : undefined,
    reason: !reason ? "اختر سبب الهدر" : undefined,
  };
  const valid = !errors.item && !errors.qty && !errors.reason;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setEntries((l) => [
      {
        id: `W-${Date.now()}`,
        itemId,
        qty: qtyN,
        reason: reason!,
        note: note.trim(),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      },
      ...l,
    ]);
    setItemId("");
    setQty("");
    setReason(null);
    setNote("");
    setTouched(false);
    onToast("تم تسجيل الهدر");
  };

  const totals = useMemo(() => {
    const byReason: Record<WasteReason, number> = { expired: 0, burnt: 0, staff_meal: 0 };
    for (const e of entries) byReason[e.reason] += itemById(e.itemId).cost * e.qty;
    return { byReason, total: Object.values(byReason).reduce((a, b) => a + b, 0) };
  }, [entries]);

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card className="p-4 md:col-span-3">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="الصنف" error={touched ? errors.item : undefined}>
            <Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">اختر الصنف…</option>
              {STOCK_ITEMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.unit})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="الكمية" error={touched ? errors.qty : undefined}>
            <NumberInput suffix={item?.unit ?? ""} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" min={0} step="0.1" />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">السبب</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {WASTE_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={reason === r.id}
                  onClick={() => setReason(r.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-medium transition sm:text-sm",
                    reason === r.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {REASON_ICON[r.id]}
                  {r.label}
                </button>
              ))}
            </div>
            {touched && errors.reason && <span className="mt-1 block text-xs text-red-600">{errors.reason}</span>}
          </div>

          <Field label="ملاحظة (اختياري)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثال: انقطاع تبريد الثلاجة رقم 2" />
          </Field>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
            <span className="text-slate-500">التكلفة التقديرية</span>
            <span className="num font-semibold text-slate-900">
              {fmt(estimate, 2)} {CURRENCY}
            </span>
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Plus className="size-4" />
            تسجيل الهدر
          </Button>
        </form>
      </Card>

      <div className="space-y-4 md:col-span-2">
        <Card className="p-4">
          <div className="text-sm text-slate-500">إجمالي هدر اليوم</div>
          <div className="num mt-1 text-2xl font-bold text-slate-900">
            {fmt(totals.total, 2)} <span className="text-sm font-normal text-slate-500">{CURRENCY}</span>
          </div>
          <ul className="mt-3 space-y-2">
            {WASTE_REASONS.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 [&>svg]:size-4">
                  {REASON_ICON[r.id]}
                  {r.label}
                </span>
                <span className="num font-medium text-slate-900">{fmt(totals.byReason[r.id], 2)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">سجلات اليوم</div>
          {entries.length === 0 ? (
            <EmptyState icon={<Trash2 className="size-6" />} title="لا يوجد هدر مسجّل اليوم" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {entries.map((e) => {
                const it = itemById(e.itemId);
                const reasonLabel = WASTE_REASONS.find((r) => r.id === e.reason)!.label;
                return (
                  <li key={e.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{it.name}</span>
                      <span className="num text-sm font-semibold text-slate-900">{fmt(it.cost * e.qty, 2)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge tone={REASON_TONE[e.reason]}>{reasonLabel}</Badge>
                      <span>
                        <span className="num">{e.qty}</span> {it.unit}
                      </span>
                      <span>·</span>
                      <span className="num">{e.time}</span>
                    </div>
                    {e.note && <p className="mt-1 text-xs text-slate-500">{e.note}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* --------------------------------- Recipes --------------------------------- */

function Recipes() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [open, setOpen] = useState<string | null>(RECIPES[0].id);

  const categories = ["الكل", ...Array.from(new Set(RECIPES.map((r) => r.category)))];
  const list = RECIPES.filter((r) => (cat === "الكل" || r.category === cat) && (r.name.includes(q.trim()) || r.ingredients.some((i) => i.name.includes(q.trim()))));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن طبق أو مكوّن…" className="ps-9" />
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              cat === c ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <BookOpen className="size-4 shrink-0" />
        عرض للقراءة فقط — أي تعديل على الوصفات يتم من الإدارة.
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<UtensilsCrossed className="size-6" />} title="لا توجد نتائج" text="جرّب كلمة بحث أخرى." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((r) => (
            <RecipeCard key={r.id} recipe={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe: r, open, onToggle }: { recipe: Recipe; open: boolean; onToggle: () => void }) {
  return (
    <Card className={cn("overflow-hidden self-start", open && "ring-2 ring-brand-100")}>
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-4 text-start" aria-expanded={open}>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <UtensilsCrossed className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.category}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="info" icon={<Users className="size-3" />}>
              العائد <span className="num">{r.yield}</span> حصص
            </Badge>
            <Badge icon={<Scale className="size-3" />}>
              الحصة <span className="num">{r.portion}</span>
            </Badge>
            <Badge icon={<Clock className="size-3" />}>
              <span className="num">{r.prepMinutes}</span> د
            </Badge>
          </div>
        </div>
        <ChevronDown className={cn("mt-1 size-5 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500">
                <th className="px-4 py-2 text-start font-medium">المكوّن</th>
                <th className="px-4 py-2 text-end font-medium">للدفعة</th>
                <th className="px-4 py-2 text-end font-medium">للحصة</th>
              </tr>
            </thead>
            <tbody>
              {r.ingredients.map((i) => (
                <tr key={i.name} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-700">{i.name}</td>
                  <td className="px-4 py-2 text-end">
                    <span className="num font-medium text-slate-900">{i.qty}</span> <span className="text-xs text-slate-500">{i.unit}</span>
                  </td>
                  <td className="px-4 py-2 text-end">
                    <span className="num text-slate-600">{+(i.qty / r.yield).toFixed(3)}</span> <span className="text-xs text-slate-400">{i.unit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {r.notes && <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs leading-6 text-slate-600">{r.notes}</p>}
        </div>
      )}
    </Card>
  );
}
