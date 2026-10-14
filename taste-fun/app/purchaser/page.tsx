"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  PackageOpen,
  Send,
  Tags,
  Truck,
} from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { MobileShell, type Tab } from "@/components/MobileShell";
import { Badge, Button, Card, EmptyState, Field, Segmented, Select, useToast } from "@/components/ui";
import {
  BRANCHES,
  INITIAL_PRICE_BOOK,
  PURCHASE_ORDERS,
  type POStatus,
  type PurchaseOrder,
} from "@/lib/mock-data";
import { CURRENCY, cn, fmt } from "@/lib/format";

type TabId = "orders" | "receiving" | "prices";
type PriceBook = Record<string, { price: number; updatedAt: string; previous?: number }>;

const STATUS: Record<POStatus, { label: string; tone: "neutral" | "info" | "success" }> = {
  draft: { label: "مسودة", tone: "neutral" },
  sent: { label: "مُرسل للمورد", tone: "info" },
  received: { label: "مُستلم", tone: "success" },
};

// item id -> display name/unit, derived from PO lines
const ITEM_META = Object.fromEntries(PURCHASE_ORDERS.flatMap((po) => po.lines.map((l) => [l.itemId, { name: l.name, unit: l.unit }])));

const poTotal = (po: PurchaseOrder) => po.lines.reduce((a, l) => a + l.qty * l.price, 0);

export default function PurchaserPage() {
  return (
    <RoleGuard allow="purchaser">
      <PurchaserApp />
    </RoleGuard>
  );
}

function PurchaserApp() {
  const [tab, setTab] = useState<TabId>("orders");
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [priceBook, setPriceBook] = useState<PriceBook>(INITIAL_PRICE_BOOK);
  const [receivingId, setReceivingId] = useState<string>("");
  const toast = useToast();

  const sentCount = orders.filter((o) => o.status === "sent").length;
  const tabs: Tab<TabId>[] = [
    { id: "orders", label: "أوامر الشراء", icon: <ClipboardList /> },
    { id: "receiving", label: "الاستلام", icon: <PackageCheck />, badge: sentCount },
    { id: "prices", label: "آخر الأسعار", icon: <Tags /> },
  ];

  const startReceiving = (id: string) => {
    setReceivingId(id);
    setTab("receiving");
    window.scrollTo({ top: 0 });
  };

  const titles: Record<TabId, string> = { orders: "أوامر الشراء", receiving: "استلام البضائع", prices: "سجل آخر الأسعار" };

  return (
    <MobileShell role="purchaser" tabs={tabs} active={tab} onTab={setTab} width="3xl">
      <div className="mb-4">
        <p className="text-xs text-slate-500">المشتريات المركزية · الثلاثاء 14 أكتوبر</p>
        <h1 className="text-xl font-bold text-slate-900">{titles[tab]}</h1>
      </div>

      {tab === "orders" && (
        <Orders
          orders={orders}
          onSend={(id) => {
            setOrders((l) => l.map((o) => (o.id === id ? { ...o, status: "sent" } : o)));
            toast.show(`تم إرسال ${id} إلى المورد`);
          }}
          onReceive={startReceiving}
        />
      )}
      {tab === "receiving" && (
        <Receiving
          orders={orders}
          priceBook={priceBook}
          selectedId={receivingId}
          onSelect={setReceivingId}
          onConfirm={(po, received) => {
            setOrders((l) => l.map((o) => (o.id === po.id ? { ...o, status: "received" } : o)));
            setPriceBook((pb) => {
              const next = { ...pb };
              for (const r of received) next[r.itemId] = { price: r.price, updatedAt: "اليوم", previous: pb[r.itemId]?.price };
              return next;
            });
            setReceivingId("");
            toast.show(`تم استلام ${po.id} وتحديث آخر الأسعار`);
          }}
        />
      )}
      {tab === "prices" && <Prices priceBook={priceBook} />}
      {toast.node}
    </MobileShell>
  );
}

/* --------------------------------- Orders --------------------------------- */

function Orders({
  orders,
  onSend,
  onReceive,
}: {
  orders: PurchaseOrder[];
  onSend: (id: string) => void;
  onReceive: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | POStatus>("all");
  const count = (s: POStatus) => orders.filter((o) => o.status === s).length;
  const list = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <Segmented
          value={filter}
          onChange={setFilter}
          className="w-full min-w-max"
          options={[
            { value: "all", label: "الكل", count: orders.length },
            { value: "draft", label: "مسودات", count: count("draft") },
            { value: "sent", label: "مُرسلة", count: count("sent") },
            { value: "received", label: "مُستلمة", count: count("received") },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<ClipboardList className="size-6" />} title="لا توجد أوامر بهذه الحالة" />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((po) => (
            <Card key={po.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="num text-xs text-slate-400">{po.id}</div>
                  <div className="font-semibold text-slate-900">{po.supplier}</div>
                  <div className="text-xs text-slate-500">فرع {BRANCHES[po.branch]}</div>
                </div>
                <Badge tone={STATUS[po.status].tone}>{STATUS[po.status].label}</Badge>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {po.lines.slice(0, 3).map((l) => (
                  <li key={l.itemId} className="flex justify-between text-slate-600">
                    <span>{l.name}</span>
                    <span>
                      <span className="num">{l.qty}</span> {l.unit}
                    </span>
                  </li>
                ))}
                {po.lines.length > 3 && <li className="text-xs text-slate-400">+ {po.lines.length - 3} أصناف أخرى</li>}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarClock className="size-3.5" />
                  التسليم: {po.expectedAt}
                </span>
                <span className="num font-semibold text-slate-900">
                  {fmt(poTotal(po), 2)} <span className="text-xs font-normal text-slate-500">{CURRENCY}</span>
                </span>
              </div>
              <div className="mt-3 flex-1" />
              {po.status === "draft" && (
                <Button variant="secondary" className="w-full" onClick={() => onSend(po.id)}>
                  <Send className="size-4" />
                  إرسال للمورد
                </Button>
              )}
              {po.status === "sent" && (
                <Button className="w-full" onClick={() => onReceive(po.id)}>
                  <Truck className="size-4" />
                  بدء الاستلام
                </Button>
              )}
              {po.status === "received" && (
                <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-50 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  تم الاستلام
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Receiving -------------------------------- */

interface ReceiveLine {
  itemId: string;
  received: string;
  price: string;
}

function Receiving({
  orders,
  priceBook,
  selectedId,
  onSelect,
  onConfirm,
}: {
  orders: PurchaseOrder[];
  priceBook: PriceBook;
  selectedId: string;
  onSelect: (id: string) => void;
  onConfirm: (po: PurchaseOrder, lines: { itemId: string; qty: number; price: number }[]) => void;
}) {
  const open = orders.filter((o) => o.status === "sent");
  const po = open.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Field label="أمر الشراء المراد استلامه">
          <Select value={po?.id ?? ""} onChange={(e) => onSelect(e.target.value)}>
            <option value="">اختر أمر شراء مُرسل…</option>
            {open.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.supplier} ({BRANCHES[o.branch]})
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {open.length === 0 ? (
        <Card>
          <EmptyState icon={<PackageOpen className="size-6" />} title="لا توجد شحنات بانتظار الاستلام" text="أرسل أمر شراء للمورد أولًا." />
        </Card>
      ) : !po ? (
        <Card>
          <EmptyState icon={<Truck className="size-6" />} title="اختر أمر شراء لبدء الاستلام" />
        </Card>
      ) : (
        <ReceivingForm key={po.id} po={po} priceBook={priceBook} onConfirm={onConfirm} />
      )}
    </div>
  );
}

function ReceivingForm({
  po,
  priceBook,
  onConfirm,
}: {
  po: PurchaseOrder;
  priceBook: PriceBook;
  onConfirm: (po: PurchaseOrder, lines: { itemId: string; qty: number; price: number }[]) => void;
}) {
  const [lines, setLines] = useState<ReceiveLine[]>(() => po.lines.map((l) => ({ itemId: l.itemId, received: String(l.qty), price: String(l.price) })));
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const update = (itemId: string, patch: Partial<ReceiveLine>) => setLines((ls) => ls.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)));

  const total = lines.reduce((a, l) => a + (parseFloat(l.received) || 0) * (parseFloat(l.price) || 0), 0);
  const allChecked = po.lines.every((l) => checked[l.itemId]);
  const invalid = lines.some((l) => !(parseFloat(l.price) > 0) || !(parseFloat(l.received) >= 0));

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <div className="font-semibold text-slate-900">{po.supplier}</div>
          <div className="num text-xs text-slate-500">
            {po.id} · {BRANCHES[po.branch]}
          </div>
        </div>
        <Badge tone="info">
          <span className="num">
            {Object.values(checked).filter(Boolean).length}/{po.lines.length}
          </span>{" "}
          تم فحصه
        </Badge>
      </div>

      <ul className="divide-y divide-slate-100">
        {po.lines.map((ordered) => {
          const line = lines.find((l) => l.itemId === ordered.itemId)!;
          const last = priceBook[ordered.itemId]?.price ?? ordered.price;
          const priceN = parseFloat(line.price) || 0;
          const diff = last ? ((priceN - last) / last) * 100 : 0;
          const recN = parseFloat(line.received) || 0;
          const short = recN < ordered.qty;
          const isChecked = !!checked[ordered.itemId];
          return (
            <li key={ordered.itemId} className={cn("p-4 transition", isChecked && "bg-emerald-50/40")}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChecked((c) => ({ ...c, [ordered.itemId]: !c[ordered.itemId] }))}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border-2 transition",
                    isChecked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white",
                  )}
                  aria-label={`تم فحص ${ordered.name}`}
                  aria-pressed={isChecked}
                >
                  {isChecked && <CheckCircle2 className="size-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">{ordered.name}</div>
                  <div className="text-xs text-slate-500">
                    المطلوب <span className="num">{ordered.qty}</span> {ordered.unit} · آخر سعر{" "}
                    <span className="num">{fmt(last, 2)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 ps-10">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500">الكمية المستلمة</span>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={line.received}
                      onChange={(e) => update(ordered.itemId, { received: e.target.value })}
                      className={cn(
                        "num h-10 w-full rounded-lg border bg-white px-3 pl-10 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-100",
                        short ? "border-amber-400" : "border-slate-300 focus:border-brand-500",
                      )}
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">{ordered.unit}</span>
                  </div>
                  {short && <span className="mt-1 block text-[11px] text-amber-700">نقص {fmt(ordered.qty - recN, 2)} {ordered.unit}</span>}
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500">سعر الوحدة بالفاتورة</span>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={line.price}
                      onChange={(e) => update(ordered.itemId, { price: e.target.value })}
                      className="num h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pl-12 text-right text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">{CURRENCY}</span>
                  </div>
                  {Math.abs(diff) >= 0.05 && priceN > 0 && (
                    <span className={cn("mt-1 flex items-center gap-0.5 text-[11px] font-medium", diff > 0 ? "text-red-600" : "text-emerald-600")}>
                      {diff > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      <span className="num">
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}%
                      </span>
                      عن آخر سعر
                    </span>
                  )}
                </label>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">إجمالي الاستلام</span>
          <span className="num text-lg font-bold text-slate-900">
            {fmt(total, 2)} <span className="text-xs font-normal text-slate-500">{CURRENCY}</span>
          </span>
        </div>
        <Button
          size="lg"
          variant="success"
          className="w-full"
          disabled={!allChecked || invalid}
          onClick={() =>
            onConfirm(
              po,
              lines.map((l) => ({ itemId: l.itemId, qty: parseFloat(l.received) || 0, price: parseFloat(l.price) })),
            )
          }
        >
          <PackageCheck className="size-5" />
          تأكيد الاستلام وتحديث الأسعار
        </Button>
        {!allChecked && <p className="text-center text-xs text-slate-500">حدّد كل صنف بعد فحصه لتفعيل التأكيد.</p>}
      </div>
    </Card>
  );
}

/* ---------------------------------- Prices ---------------------------------- */

function Prices({ priceBook }: { priceBook: PriceBook }) {
  const rows = useMemo(
    () =>
      Object.entries(priceBook)
        .map(([id, p]) => ({ id, ...p, ...ITEM_META[id] }))
        .sort((a, b) => Number(b.updatedAt === "اليوم") - Number(a.updatedAt === "اليوم")),
    [priceBook],
  );

  return (
    <Card>
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => {
          const changed = r.previous !== undefined;
          const diff = changed && r.previous ? ((r.price - r.previous) / r.previous) * 100 : 0;
          return (
            <li key={r.id} className={cn("flex items-center gap-3 px-4 py-3", changed && "bg-brand-50/40")}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{r.name ?? r.id}</span>
                  {changed && <Badge tone="info">تم التحديث</Badge>}
                </div>
                <div className="text-xs text-slate-500">آخر تحديث: {r.updatedAt}</div>
              </div>
              <div className="text-end">
                <div className="num font-semibold text-slate-900">
                  {fmt(r.price, 2)} <span className="text-xs font-normal text-slate-500">{CURRENCY}/{r.unit}</span>
                </div>
                {changed && Math.abs(diff) >= 0.05 && (
                  <div className={cn("text-xs", diff > 0 ? "text-red-600" : "text-emerald-600")}>
                    كان <span className="num">{fmt(r.previous!, 2)}</span> ·{" "}
                    <span className="num">
                      {diff > 0 ? "+" : ""}
                      {diff.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
