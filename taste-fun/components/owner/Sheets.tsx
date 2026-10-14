"use client";

import { useState } from "react";
import { useOwner, money } from "@/lib/owner-store";
import { BRANCH_IDS, FOOD_COST, FOOD_COST_LIMIT, KITCHEN_DELIVERIES, KITCHEN_INVOICES } from "@/lib/mock-data";
import { Button, Field, Input } from "../ui";
import { Modal } from "./common";

const dayFmt = new Intl.DateTimeFormat("ar-AE-u-nu-latn", { weekday: "short", day: "numeric", month: "short" });

/** Preview of the summary the owner receives on WhatsApp every night. */
export function SummarySheet({ onClose }: { onClose: () => void }) {
  const { names, today, approvals, lowStockCount, uncategorized } = useOwner();
  const total = today.sales.qasr + today.sales.lulu;
  const yday = today.yesterdaySameTime.qasr + today.yesterdaySameTime.lulu;
  const change = ((total - yday) / yday) * 100;
  const overdue = KITCHEN_INVOICES.filter((v) => v.ageDays > 30).length;

  const lines: React.ReactNode[] = [
    <b key="h">📊 الملخص اليومي – {dayFmt.format(new Date())}</b>,
    <span key="s">
      مبيعات المجموعة: <b>{money(total)}</b> ({change >= 0 ? "+" : ""}
      {change.toFixed(1)}%)
    </span>,
    ...BRANCH_IDS.map((b) => (
      <span key={b}>
        • {names.branches[b]}: {money(today.sales[b])} · {today.orders[b]} طلب
      </span>
    )),
    <span key="fc">
      ⚠️ تكلفة الأغذية {names.branches.qasr}: {FOOD_COST.qasr}% (الحد {FOOD_COST_LIMIT}%)
    </span>,
    <span key="u">
      🧾 مصروفات بدون بند: {uncategorized.length} ({money(uncategorized.reduce((a, e) => a + e.amount, 0))})
    </span>,
    <span key="p">📈 لحم فرم برازيلي: +11.8% من المورد</span>,
    <span key="l">📦 أصناف منخفضة: {lowStockCount}</span>,
    <span key="a">✅ بانتظار اعتمادك: {approvals.length}</span>,
    <span key="k">
      🚚 المطابخ: {KITCHEN_DELIVERIES.length} توصيلات، فاتورة متأخرة {overdue}
    </span>,
  ];

  return (
    <Modal title="الملخص اليومي على واتساب" onClose={onClose} width={420}>
      <p className="text-sm text-slate-500">يُرسل تلقائيًا للمالك كل يوم الساعة 11 مساءً.</p>
      <div className="flex flex-col gap-2 rounded-2xl bg-[#0B141A] p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#E9EDEF]">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#1F7A5C]">ت</span>
          {names.group} · التقارير
        </div>
        <div className="max-w-[92%] self-end rounded-xl bg-[#005C4B] px-3 py-2.5 text-[13.5px] leading-relaxed text-[#E9EDEF]">
          <div className="flex flex-col gap-0.5">{lines}</div>
          <div className="num mt-1 text-end text-[11px] opacity-70">23:00 ✓✓</div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          إغلاق
        </Button>
      </div>
    </Modal>
  );
}

/** Lets the owner type real names so the whole demo uses them. */
export function CustomizeSheet({ onClose }: { onClose: () => void }) {
  const { names, setNames, notify } = useOwner();
  const [draft, setDraft] = useState(names);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setNames({
      group: draft.group.trim() || names.group,
      food: draft.food.trim() || names.food,
      branches: {
        qasr: draft.branches.qasr.trim() || names.branches.qasr,
        lulu: draft.branches.lulu.trim() || names.branches.lulu,
      },
    });
    notify("تم تحديث الأسماء في كل النظام");
    onClose();
  };

  return (
    <Modal title="تخصيص الديمو" onClose={onClose}>
      <p className="text-sm text-slate-500">اكتب أسماءك الحقيقية وسيتحدث النظام كله.</p>
      <form onSubmit={apply} className="space-y-4">
        <Field label="اسم المجموعة">
          <Input id="cust-group" value={draft.group} onChange={(e) => setDraft({ ...draft, group: e.target.value })} autoFocus />
        </Field>
        <Field label="اسم شركة الأغذية">
          <Input id="cust-food" value={draft.food} onChange={(e) => setDraft({ ...draft, food: e.target.value })} />
        </Field>
        {BRANCH_IDS.map((b, i) => (
          <Field key={b} label={`المطعم ${i + 1}`}>
            <Input
              id={`cust-${b}`}
              value={draft.branches[b]}
              onChange={(e) => setDraft({ ...draft, branches: { ...draft.branches, [b]: e.target.value } })}
            />
          </Field>
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">تطبيق</Button>
        </div>
      </form>
    </Modal>
  );
}
