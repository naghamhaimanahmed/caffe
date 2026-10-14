"use client";

import { Paperclip, Receipt, Wallet } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { CUSTODY_CATEGORIES, CUSTODY_FUNDING, type CustodyCategory } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Button, Card, CardHeader } from "../ui";
import { Bar, Notice, Table, Td, Th } from "./common";

const dateFmt = new Intl.DateTimeFormat("ar-AE-u-nu-latn", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" });

export function CustodyTab() {
  const { names, custody, custodyApproved, setCustodyCategory, approveCustody, uncategorized } = useOwner();
  const funding = CUSTODY_FUNDING.opening + CUSTODY_FUNDING.bank + CUSTODY_FUNDING.cash + CUSTODY_FUNDING.owner;
  const spent = custody.reduce((a, e) => a + e.amount, 0);
  const uncategorizedSum = uncategorized.reduce((a, e) => a + e.amount, 0);
  const byCategory = (Object.keys(CUSTODY_CATEGORIES) as CustodyCategory[])
    .map((k) => [k, custody.filter((e) => e.category === k).reduce((a, e) => a + e.amount, 0)] as const)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...byCategory.map(([, v]) => v), uncategorizedSum, 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={<Wallet className="size-5" />} title="تقرير العهدة اليومي" subtitle={`${names.branches.qasr} · ${dateFmt.format(new Date())}`} />
          <dl className="divide-y divide-slate-100 px-5 py-2 text-sm">
            <Line label="رصيد أول اليوم (المرحّل)" value={CUSTODY_FUNDING.opening} />
            <Line label="+ تمويل البنك" value={CUSTODY_FUNDING.bank} />
            <Line label="+ تمويل الكاش" value={CUSTODY_FUNDING.cash} />
            <Line label="+ تمويل المالك" value={CUSTODY_FUNDING.owner} />
            <Line label="إجمالي العهدة" value={funding} strong />
            <Line label="إجمالي المصروفات" value={spent} danger />
          </dl>
          <div className="mx-5 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 font-bold text-white">
            <span>المتبقي في العهدة</span>
            <span className="num">{fmt(funding - spent, 2)}</span>
          </div>
          <dl className="divide-y divide-slate-100 px-5 py-2 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">عدد الفواتير</dt>
              <dd className="num font-semibold">{custody.length}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">نسبة الصرف من العهدة</dt>
              <dd className="num font-semibold">{((spent / funding) * 100).toFixed(1)}%</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader icon={<Receipt className="size-5" />} title="المصروفات حسب البند" />
          <div className="space-y-3 p-5">
            {byCategory.map(([k, v]) => (
              <CategoryBar key={k} label={CUSTODY_CATEGORIES[k]} value={v} ratio={v / maxCat} color="#d97706" />
            ))}
            {uncategorized.length > 0 && <CategoryBar label="بدون بند" value={uncategorizedSum} ratio={uncategorizedSum / maxCat} color="#dc2626" danger />}
            {uncategorized.length > 0 ? (
              <Notice tone="danger">
                يوجد <span className="num">{uncategorized.length}</span> مصروفات بدون بند (<span className="num">{money(uncategorizedSum)}</span>). لازم تتصنف قبل اعتماد التقرير.
              </Notice>
            ) : (
              <Notice tone="success">✓ كل المصروفات متصنفة. التقرير جاهز للاعتماد.</Notice>
            )}
            <div className="flex justify-end">
              <Button disabled={uncategorized.length > 0 || custodyApproved} onClick={approveCustody}>
                {custodyApproved ? "✓ معتمد" : "اعتماد التقرير"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="فواتير العهدة" subtitle={`${custody.length} فاتورة · صنّف كل مصروف من القائمة`} />
        <Table
          minWidth={820}
          head={
            <>
              <Th>#</Th>
              <Th>الجهة</Th>
              <Th>الوصف</Th>
              <Th>رقم الفاتورة</Th>
              <Th end>المبلغ</Th>
              <Th>البند</Th>
            </>
          }
        >
          {custody.map((e, i) => (
            <tr key={i} className={cn(!e.category && "bg-red-50/70")}>
              <Td className="num text-slate-400">{i + 1}</Td>
              <Td className="font-medium text-slate-900">{e.payee}</Td>
              <Td className="text-slate-600">{e.description}</Td>
              <Td className="num text-slate-500">
                {e.invoiceNo ? (
                  <span className="flex items-center gap-1">
                    <Paperclip className="size-3" />
                    {e.invoiceNo}
                  </span>
                ) : (
                  "—"
                )}
              </Td>
              <Td end className="num font-medium">{fmt(e.amount, 2)}</Td>
              <Td>
                <select
                  id={`custody-cat-${i}`}
                  aria-label={`بند ${e.payee}`}
                  value={e.category}
                  onChange={(ev) => setCustodyCategory(i, ev.target.value as CustodyCategory | "")}
                  className={cn(
                    "h-9 w-full min-w-44 rounded-lg border bg-white px-2 text-xs focus:border-brand-500 focus:outline-none",
                    e.category ? "border-slate-300" : "border-red-300 text-red-700",
                  )}
                >
                  <option value="">— اختر البند —</option>
                  {(Object.keys(CUSTODY_CATEGORIES) as CustodyCategory[]).map((k) => (
                    <option key={k} value={k}>
                      {CUSTODY_CATEGORIES[k]}
                    </option>
                  ))}
                </select>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function Line({ label, value, strong, danger }: { label: string; value: number; strong?: boolean; danger?: boolean }) {
  return (
    <div className="flex justify-between py-2.5">
      <dt className={strong ? "font-semibold text-slate-900" : "text-slate-500"}>{label}</dt>
      <dd className={cn("num font-semibold", danger && "text-red-600", strong && "text-slate-900")}>{fmt(value, 2)}</dd>
    </div>
  );
}

function CategoryBar({ label, value, ratio, color, danger }: { label: string; value: number; ratio: number; color: string; danger?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[minmax(0,10rem)_1fr_5.5rem] items-center gap-3 text-sm", danger && "font-semibold text-red-700")}>
      <span className="truncate">{label}</span>
      <Bar ratio={ratio} color={color} className="h-2" />
      <span className="num text-end">{fmt(value, 2)}</span>
    </div>
  );
}
