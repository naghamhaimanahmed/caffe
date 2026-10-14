"use client";

import { useState } from "react";
import { CalendarClock, Paperclip, Plus, Receipt, Repeat } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { BRANCH_IDS, EXPENSE_APPROVAL_LIMIT, EXPENSE_CATEGORIES, RECURRING_EXPENSES, type BranchId, type ExpenseCategory } from "@/lib/mock-data";
import { Badge, Button, Card, CardHeader, Field, Input, NumberInput, Select } from "../ui";
import { BranchDot, Table, Td, Th } from "./common";

function DueBadge({ days }: { days: number }) {
  if (days < 0) return <Badge tone="danger">متأخر</Badge>;
  if (days === 0) return <Badge tone="warning">اليوم</Badge>;
  if (days === 1) return <Badge tone="info">غدًا</Badge>;
  return (
    <Badge tone="info">
      بعد <span className="num">{days}</span> أيام
    </Badge>
  );
}

export function ExpensesTab() {
  const { names, expenses, addExpense, bills, markBillPaid } = useOwner();
  const [branch, setBranch] = useState<BranchId>("qasr");
  const [category, setCategory] = useState<ExpenseCategory>("maint");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const unpaid = bills.filter((b) => !b.paid).reduce((a, b) => a + b.amount, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!(value > 0)) {
      setError("أدخل مبلغًا أكبر من صفر");
      return;
    }
    addExpense({ branch, category, amount: value, note: note.trim() || EXPENSE_CATEGORIES[category], hasReceipt: !!receipt });
    setAmount("");
    setNote("");
    setReceipt(null);
    setError(undefined);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={<Plus className="size-5" />} title="إضافة مصروف" subtitle={`أي مصروف أكثر من ${EXPENSE_APPROVAL_LIMIT} درهم يذهب للاعتمادات تلقائيًا`} />
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2" noValidate>
            <Field label="المطعم">
              <Select id="exp-branch" value={branch} onChange={(e) => setBranch(e.target.value as BranchId)}>
                {BRANCH_IDS.map((b) => (
                  <option key={b} value={b}>
                    {names.branches[b]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="التصنيف">
              <Select id="exp-category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {EXPENSE_CATEGORIES[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="المبلغ" error={error}>
              <NumberInput id="exp-amount" suffix="د.إ" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="ملاحظة">
              <Input id="exp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثال: صيانة شفاط المطبخ" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="صورة الإيصال">
                <input
                  id="exp-receipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
                />
              </Field>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit">
                <Plus className="size-4" />
                إضافة
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            icon={<CalendarClock className="size-5" />}
            title="فواتير موردين مستحقة"
            action={<b className="num text-slate-900">{money(unpaid)}</b>}
          />
          <ul className="divide-y divide-slate-100 px-5">
            {bills.map((b, i) => (
              <li key={b.supplier} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <b className="text-slate-900">{b.supplier}</b>
                  <div className="mt-1">{b.paid ? <Badge tone="success">مدفوع</Badge> : <DueBadge days={b.dueInDays} />}</div>
                </div>
                <span className="num font-medium">{money(b.amount)}</span>
                {!b.paid && (
                  <Button size="sm" variant="success" onClick={() => markBillPaid(i)}>
                    تم الدفع
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <h3 className="flex items-center gap-2 border-t border-slate-100 px-5 pb-2 pt-4 text-sm font-semibold text-slate-900">
            <Repeat className="size-4 text-slate-400" />
            مصروفات متكررة
          </h3>
          <ul className="space-y-2 px-5 pb-5 text-sm">
            {RECURRING_EXPENSES.map((r) => (
              <li key={r.label} className="flex flex-wrap justify-between gap-2">
                <span>
                  {r.label} <span className="text-slate-400">· {r.every}</span>
                </span>
                <span>
                  <span className="num">{money(r.amount)}</span>{" "}
                  <span className="text-slate-400">
                    · القادم <span className="num">{r.next}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<Receipt className="size-5" />} title="آخر المصروفات" />
        <Table
          minWidth={720}
          head={
            <>
              <Th>التاريخ</Th>
              <Th>التصنيف</Th>
              <Th>ملاحظة</Th>
              <Th>المطعم</Th>
              <Th end>المبلغ</Th>
              <Th>الإيصال</Th>
            </>
          }
        >
          {expenses.map((e) => (
            <tr key={e.id}>
              <Td className="num text-slate-500">{e.date}</Td>
              <Td>
                <Badge tone="info">{EXPENSE_CATEGORIES[e.category]}</Badge>
              </Td>
              <Td className="text-slate-700">{e.note}</Td>
              <Td>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <BranchDot branch={e.branch} />
                  {names.branches[e.branch]}
                </span>
              </Td>
              <Td end className="num font-medium">{money(e.amount)}</Td>
              <Td>
                {e.hasReceipt ? (
                  <Badge tone="success" icon={<Paperclip className="size-3" />}>
                    إيصال
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">بدون إيصال</span>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
