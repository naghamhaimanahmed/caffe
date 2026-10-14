"use client";

import { useState } from "react";
import { CalendarClock, Paperclip, Plus, Receipt, Repeat } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { BRANCH_IDS, EXPENSE_APPROVAL_LIMIT, EXPENSE_CATEGORIES, RECURRING_EXPENSES, both, type BranchId, type ExpenseCategory } from "@/lib/mock-data";
import { Badge, Button, Card, CardHeader, Field, Input, NumberInput, Select } from "../ui";
import { BranchDot, Table, Td, Th } from "./common";

function DueBadge({ days }: { days: number }) {
  const { t } = useI18n();
  if (days < 0) return <Badge tone="danger">{t("ex.overdue")}</Badge>;
  if (days === 0) return <Badge tone="warning">{t("app.today")}</Badge>;
  if (days === 1) return <Badge tone="info">{t("ex.tomorrow")}</Badge>;
  return <Badge tone="info">{t("ex.inDays", { n: days })}</Badge>;
}

export function ExpensesTab() {
  const { names, expenses, addExpense, bills, markBillPaid } = useOwner();
  const { t, tr, money, currency } = useI18n();
  const [branch, setBranch] = useState<BranchId>("qasr");
  const [category, setCategory] = useState<ExpenseCategory>("maint");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const unpaid = bills.filter((b) => !b.paid).reduce((a, b) => a + b.amount, 0);
  const categories = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!(value > 0)) {
      setError(t("ex.amountError"));
      return;
    }
    addExpense({ branch, category, amount: value, note: note.trim() ? both(note.trim()) : EXPENSE_CATEGORIES[category], hasReceipt: !!receipt });
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
          <CardHeader icon={<Plus className="size-5" />} title={t("ex.add")} subtitle={t("ex.addHint", { limit: EXPENSE_APPROVAL_LIMIT })} />
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2" noValidate>
            <Field label={t("ex.restaurant")}>
              <Select id="exp-branch" value={branch} onChange={(e) => setBranch(e.target.value as BranchId)}>
                {BRANCH_IDS.map((b) => (
                  <option key={b} value={b}>
                    {tr(names.branches[b])}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("ex.category")}>
              <Select id="exp-category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {tr(EXPENSE_CATEGORIES[c])}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("ex.amount")} error={error}>
              <NumberInput id="exp-amount" suffix={currency} placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label={t("ex.note")}>
              <Input id="exp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("ex.notePh")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("ex.receipt")}>
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
                {t("app.add")}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader icon={<CalendarClock className="size-5" />} title={t("ex.billsDue")} action={<b className="num text-slate-900">{money(unpaid)}</b>} />
          <ul className="divide-y divide-slate-100 px-5">
            {bills.map((b, i) => (
              <li key={b.supplier} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <b className="text-slate-900">{b.supplier}</b>
                  <div className="mt-1">{b.paid ? <Badge tone="success">{t("ex.paid")}</Badge> : <DueBadge days={b.dueInDays} />}</div>
                </div>
                <span className="num font-medium">{money(b.amount)}</span>
                {!b.paid && (
                  <Button size="sm" variant="success" onClick={() => markBillPaid(i)}>
                    {t("ex.markPaid")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <h3 className="flex items-center gap-2 border-t border-slate-100 px-5 pb-2 pt-4 text-sm font-semibold text-slate-900">
            <Repeat className="size-4 text-slate-400" />
            {t("ex.recurring")}
          </h3>
          <ul className="space-y-2 px-5 pb-5 text-sm">
            {RECURRING_EXPENSES.map((r) => (
              <li key={r.label.en} className="flex flex-wrap justify-between gap-2">
                <span>
                  {tr(r.label)} <span className="text-slate-400">· {tr(r.every)}</span>
                </span>
                <span>
                  <span className="num">{money(r.amount)}</span> <span className="text-slate-400">· {t("ex.next", { d: r.next })}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<Receipt className="size-5" />} title={t("ex.recent")} />
        <Table
          minWidth={720}
          head={
            <>
              <Th>{t("ex.date")}</Th>
              <Th>{t("ex.category")}</Th>
              <Th>{t("ex.note")}</Th>
              <Th>{t("ex.restaurant")}</Th>
              <Th end>{t("ex.amount")}</Th>
              <Th>{t("ex.receiptCol")}</Th>
            </>
          }
        >
          {expenses.map((e) => (
            <tr key={e.id}>
              <Td className="num text-slate-500">{e.date}</Td>
              <Td>
                <Badge tone="info">{tr(EXPENSE_CATEGORIES[e.category])}</Badge>
              </Td>
              <Td className="text-slate-700">{tr(e.note)}</Td>
              <Td>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <BranchDot branch={e.branch} />
                  {tr(names.branches[e.branch])}
                </span>
              </Td>
              <Td end className="num font-medium">{money(e.amount)}</Td>
              <Td>
                {e.hasReceipt ? (
                  <Badge tone="success" icon={<Paperclip className="size-3" />}>
                    {t("ex.hasReceipt")}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">{t("ex.noReceipt")}</span>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
