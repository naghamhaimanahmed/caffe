"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Calculator,
  Camera,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Trash2,
  Wallet,
} from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { MobileShell, type Tab } from "@/components/MobileShell";
import { Badge, Button, Card, EmptyState, Field, Input, NumberInput, Select, Textarea, useToast } from "@/components/ui";
import { ClosingBadge, varianceStatus } from "@/components/StatusBadges";
import { EXPENSE_CATEGORIES, INITIAL_PETTY_EXPENSES, PETTY_CASH_FLOAT, type PettyExpense } from "@/lib/mock-data";
import { CURRENCY, cn, fmt, fmtSigned } from "@/lib/format";

type TabId = "closing" | "petty";

export default function ManagerPage() {
  return (
    <RoleGuard allow="manager">
      <ManagerApp />
    </RoleGuard>
  );
}

function ManagerApp() {
  const [tab, setTab] = useState<TabId>("closing");
  const [expenses, setExpenses] = useState<PettyExpense[]>(INITIAL_PETTY_EXPENSES);
  const toast = useToast();

  const tabs: Tab<TabId>[] = [
    { id: "closing", label: "الإغلاق اليومي", icon: <Calculator /> },
    { id: "petty", label: "العهدة", icon: <Wallet />, badge: expenses.length },
  ];

  return (
    <MobileShell role="manager" tabs={tabs} active={tab} onTab={setTab}>
      <div className="mb-4">
        <p className="text-xs text-slate-500">الثلاثاء 14 أكتوبر 2026</p>
        <h1 className="text-xl font-bold text-slate-900">{tab === "closing" ? "الإغلاق اليومي للصندوق" : "العهدة النقدية"}</h1>
      </div>
      {tab === "closing" ? (
        <ClosingForm onToast={toast.show} />
      ) : (
        <PettyCash expenses={expenses} setExpenses={setExpenses} onToast={toast.show} />
      )}
      {toast.node}
    </MobileShell>
  );
}

/* ----------------------------- Daily closing ----------------------------- */

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

function ClosingForm({ onToast }: { onToast: (m: string) => void }) {
  const [expected, setExpected] = useState("8290");
  const [counted, setCounted] = useState("");
  const [cardTotal, setCardTotal] = useState("18640");
  const [notes, setNotes] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [denoms, setDenoms] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<null | { at: string }>(null);
  const [touched, setTouched] = useState(false);

  const expectedN = parseFloat(expected) || 0;
  const countedN = counted === "" ? null : parseFloat(counted) || 0;
  const variance = countedN === null ? null : +(countedN - expectedN).toFixed(2);
  const status = variance === null ? null : varianceStatus(variance);

  const denomTotal = DENOMINATIONS.reduce((a, d) => a + d * (parseInt(denoms[d] || "0") || 0), 0);

  const errors = {
    expected: expected === "" || expectedN < 0 ? "أدخل النقد المتوقع من نظام نقاط البيع" : undefined,
    counted: countedN === null ? "أدخل النقد المعدود فعليًا في الصندوق" : undefined,
    notes: status && status !== "matched" && notes.trim().length < 5 ? "يلزم توضيح سبب الفرق (5 أحرف على الأقل)" : undefined,
  };
  const valid = !errors.expected && !errors.counted && !errors.notes;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setSubmitted({ at: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) });
    onToast("تم إرسال الإغلاق اليومي للمحاسب");
  };

  if (submitted && status && variance !== null) {
    return (
      <Card className="p-5">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">تم إرسال الإغلاق</h2>
          <p className="mt-1 text-sm text-slate-500">
            أُرسل الساعة <span className="num">{submitted.at}</span> وهو الآن بانتظار مراجعة المحاسب.
          </p>
        </div>
        <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
          <Row label="النقد المتوقع" value={`${fmt(expectedN, 2)} ${CURRENCY}`} />
          <Row label="النقد المعدود" value={`${fmt(countedN!, 2)} ${CURRENCY}`} />
          <Row label="مبيعات البطاقات" value={`${fmt(parseFloat(cardTotal) || 0, 2)} ${CURRENCY}`} />
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-slate-500">الفرق</dt>
            <dd className="flex items-center gap-2">
              <span className="num font-semibold">{fmtSigned(variance)}</span>
              <ClosingBadge status={status} />
            </dd>
          </div>
        </dl>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setSubmitted(null)}>
          <Pencil className="size-4" />
          تعديل الإغلاق
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {/* Live variance */}
      <VarianceCard variance={variance} />

      <Card className="space-y-4 p-4">
        <SectionTitle icon={<Banknote className="size-4" />} title="النقد" />
        <Field label="النقد المتوقع (من نظام نقاط البيع)" error={touched ? errors.expected : undefined} hint="يُعبّأ تلقائيًا من تقرير Z — يمكن تعديله">
          <NumberInput suffix={CURRENCY} value={expected} onChange={(e) => setExpected(e.target.value)} min={0} step="0.01" />
        </Field>
        <Field label="النقد المعدود فعليًا" error={touched ? errors.counted : undefined}>
          <NumberInput suffix={CURRENCY} value={counted} placeholder="0.00" onChange={(e) => setCounted(e.target.value)} min={0} step="0.01" autoFocus />
        </Field>

        <div className="rounded-lg border border-slate-200">
          <button type="button" onClick={() => setShowCounter((s) => !s)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <Calculator className="size-4 text-slate-400" />
              عدّ حسب الفئات
            </span>
            <ChevronDown className={cn("size-4 text-slate-400 transition", showCounter && "rotate-180")} />
          </button>
          {showCounter && (
            <div className="border-t border-slate-100 p-3">
              <div className="grid grid-cols-3 gap-2">
                {DENOMINATIONS.map((d) => (
                  <label key={d} className="rounded-lg bg-slate-50 p-2">
                    <span className="num block text-xs text-slate-500">{d} × </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={denoms[d] ?? ""}
                      onChange={(e) => setDenoms((s) => ({ ...s, [d]: e.target.value }))}
                      placeholder="0"
                      className="num mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  المجموع: <span className="num font-semibold text-slate-900">{fmt(denomTotal, 2)}</span> {CURRENCY}
                </span>
                <Button type="button" size="sm" variant="secondary" onClick={() => setCounted(String(denomTotal))}>
                  استخدم المجموع
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <SectionTitle icon={<CreditCard className="size-4" />} title="المبيعات الأخرى" />
        <Field label="إجمالي مبيعات البطاقات">
          <NumberInput suffix={CURRENCY} value={cardTotal} onChange={(e) => setCardTotal(e.target.value)} min={0} step="0.01" />
        </Field>
        <Field
          label={status && status !== "matched" ? "سبب الفرق (إلزامي)" : "ملاحظات"}
          error={touched ? errors.notes : undefined}
        >
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: إرجاع نقدي لطلب ملغى رقم 1123" />
        </Field>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        <Send className="size-4" />
        إرسال الإغلاق للمحاسب
      </Button>
    </form>
  );
}

function VarianceCard({ variance }: { variance: number | null }) {
  if (variance === null) {
    return (
      <Card className="flex items-center gap-3 border-dashed p-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Calculator className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">الفرق يُحسب تلقائيًا</p>
          <p className="text-xs text-slate-500">أدخل النقد المعدود لعرض النتيجة.</p>
        </div>
      </Card>
    );
  }
  const status = varianceStatus(variance);
  const styles = {
    matched: { box: "border-emerald-200 bg-emerald-50", text: "text-emerald-700", label: "مطابق — لا يوجد فرق" },
    short: { box: "border-red-200 bg-red-50", text: "text-red-700", label: "عجز في الصندوق" },
    over: { box: "border-amber-200 bg-amber-50", text: "text-amber-800", label: "زيادة في الصندوق" },
  }[status];

  return (
    <div className={cn("rounded-xl border p-4 transition-colors", styles.box)} aria-live="polite">
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", styles.text)}>{styles.label}</span>
        <ClosingBadge status={status} />
      </div>
      <div className={cn("num mt-1 text-3xl font-bold", styles.text)}>
        {fmtSigned(variance)} <span className="text-base font-medium">{CURRENCY}</span>
      </div>
    </div>
  );
}

/* ------------------------------- Petty cash ------------------------------- */

function PettyCash({
  expenses,
  setExpenses,
  onToast,
}: {
  expenses: PettyExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<PettyExpense[]>>;
  onToast: (m: string) => void;
}) {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [attached, setAttached] = useState(false);
  const [touched, setTouched] = useState(false);

  const spent = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);
  const remaining = PETTY_CASH_FLOAT - spent;
  const amountN = parseFloat(amount);

  const errors = {
    invoiceNo: !invoiceNo.trim()
      ? "رقم الفاتورة مطلوب"
      : expenses.some((e) => e.invoiceNo.toLowerCase() === invoiceNo.trim().toLowerCase())
        ? "هذه الفاتورة مسجلة مسبقًا"
        : undefined,
    amount: !(amountN > 0) ? "أدخل مبلغًا صحيحًا" : amountN > remaining ? "المبلغ يتجاوز رصيد العهدة المتبقي" : undefined,
    category: !category ? "اختر التصنيف" : undefined,
  };
  const valid = !errors.invoiceNo && !errors.amount && !errors.category;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setExpenses((list) => [
      {
        id: `PE-${Date.now()}`,
        invoiceNo: invoiceNo.trim(),
        amount: amountN,
        category,
        vendor: vendor.trim() || "—",
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      },
      ...list,
    ]);
    setInvoiceNo("");
    setAmount("");
    setCategory("");
    setVendor("");
    setAttached(false);
    setTouched(false);
    onToast("تمت إضافة المصروف");
  };

  const usedPct = Math.min(spent / PETTY_CASH_FLOAT, 1) * 100;

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>الرصيد المتبقي</span>
          <span>
            العهدة <span className="num">{fmt(PETTY_CASH_FLOAT)}</span> {CURRENCY}
          </span>
        </div>
        <div className="num mt-1 text-3xl font-bold">
          {fmt(remaining, 2)} <span className="text-base font-medium text-slate-300">{CURRENCY}</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full rounded-full", usedPct > 80 ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${usedPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>
            مصروف <span className="num">{fmt(spent, 2)}</span>
          </span>
          <span className="num">{usedPct.toFixed(0)}%</span>
        </div>
      </div>

      {/* Add expense */}
      <Card className="p-4">
        <SectionTitle icon={<Plus className="size-4" />} title="إضافة مصروف" />
        <form onSubmit={add} className="mt-4 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="رقم الفاتورة" error={touched ? errors.invoiceNo : undefined}>
              <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="INV-0000" className="num text-right" />
            </Field>
            <Field label="المبلغ" error={touched ? errors.amount : undefined}>
              <NumberInput suffix={CURRENCY} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min={0} step="0.01" />
            </Field>
          </div>
          <Field label="التصنيف" error={touched ? errors.category : undefined}>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">اختر التصنيف…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="المورد / الوصف (اختياري)">
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="مثال: سوق الخضار المركزي" />
          </Field>
          <button
            type="button"
            onClick={() => setAttached((a) => !a)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm font-medium transition",
              attached ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-600",
            )}
          >
            {attached ? <Paperclip className="size-4" /> : <Camera className="size-4" />}
            {attached ? "تم إرفاق صورة الفاتورة" : "تصوير الفاتورة"}
          </button>
          <Button type="submit" className="w-full">
            <Plus className="size-4" />
            إضافة إلى العهدة
          </Button>
        </form>
      </Card>

      {/* List */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">مصروفات اليوم</h3>
          <Badge>
            <span className="num">{expenses.length}</span> فواتير
          </Badge>
        </div>
        {expenses.length === 0 ? (
          <EmptyState icon={<FileText className="size-6" />} title="لا توجد مصروفات بعد" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">{e.category}</span>
                    <span className="num text-[11px] text-slate-400">{e.invoiceNo}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {e.vendor} · <span className="num">{e.time}</span>
                  </p>
                </div>
                <span className="num text-sm font-semibold text-slate-900">{fmt(e.amount, 2)}</span>
                <button
                  onClick={() => setExpenses((l) => l.filter((x) => x.id !== e.id))}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="حذف"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Button
        size="lg"
        variant="success"
        className="w-full"
        disabled={expenses.length === 0}
        onClick={() => onToast(`تم إرسال تقرير العهدة (${expenses.length} فواتير) للمحاسب`)}
      >
        <Send className="size-4" />
        إرسال تقرير العهدة للمحاسب
      </Button>
    </div>
  );
}

/* --------------------------------- bits --------------------------------- */

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
      <span className="flex size-7 items-center justify-center rounded-md bg-brand-50 text-brand-600">{icon}</span>
      {title}
    </h2>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="num font-medium text-slate-900">{value}</dd>
    </div>
  );
}
