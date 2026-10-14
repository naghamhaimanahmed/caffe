"use client";

import { useState } from "react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { BRANCH_IDS, FOOD_COST, FOOD_COST_LIMIT, KITCHEN_DELIVERIES, KITCHEN_INVOICES, both } from "@/lib/mock-data";
import { Button, Field, Input } from "../ui";
import { Modal } from "./common";

/** Preview of the summary the owner receives on WhatsApp every night. */
export function SummarySheet({ onClose }: { onClose: () => void }) {
  const { names, today, approvals, lowStockCount, uncategorized } = useOwner();
  const { t, tr, money, locale } = useI18n();
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" });
  const total = today.sales.qasr + today.sales.lulu;
  const yday = today.yesterdaySameTime.qasr + today.yesterdaySameTime.lulu;
  const change = ((total - yday) / yday) * 100;
  const overdue = KITCHEN_INVOICES.filter((v) => v.ageDays > 30).length;

  const lines: React.ReactNode[] = [
    <b key="h">{t("sum.heading", { date: dayFmt.format(new Date()) })}</b>,
    <span key="s">
      {t("sum.groupSales")} <b>{money(total)}</b> ({change >= 0 ? "+" : ""}
      {change.toFixed(1)}%)
    </span>,
    ...BRANCH_IDS.map((b) => <span key={b}>{t("sum.branchLine", { branch: tr(names.branches[b]), amount: money(today.sales[b]), n: today.orders[b] })}</span>),
    <span key="fc">{t("sum.foodCost", { branch: tr(names.branches.qasr), pct: FOOD_COST.qasr, limit: FOOD_COST_LIMIT })}</span>,
    <span key="u">{t("sum.uncat", { n: uncategorized.length, amount: money(uncategorized.reduce((a, e) => a + e.amount, 0)) })}</span>,
    <span key="p">{t("sum.price")}</span>,
    <span key="l">{t("sum.low", { n: lowStockCount })}</span>,
    <span key="a">{t("sum.approvals", { n: approvals.length })}</span>,
    <span key="k">{t("sum.kitchens", { n: KITCHEN_DELIVERIES.length, m: overdue })}</span>,
  ];

  return (
    <Modal title={t("sum.title")} onClose={onClose} width={420}>
      <p className="text-sm text-slate-500">{t("sum.hint")}</p>
      <div className="flex flex-col gap-2 rounded-2xl bg-[#0B141A] p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#E9EDEF]">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#1F7A5C]">{tr(names.group).charAt(0)}</span>
          {t("sum.reports", { group: tr(names.group) })}
        </div>
        <div className="max-w-[92%] self-end rounded-xl bg-[#005C4B] px-3 py-2.5 text-[13.5px] leading-relaxed text-[#E9EDEF]">
          <div className="flex flex-col gap-0.5">{lines}</div>
          <div className="num mt-1 text-end text-[11px] opacity-70">23:00 ✓✓</div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          {t("app.close")}
        </Button>
      </div>
    </Modal>
  );
}

/** Lets the owner type real names so the whole demo uses them, in both languages. */
export function CustomizeSheet({ onClose }: { onClose: () => void }) {
  const { names, setNames, notify } = useOwner();
  const { t, tr } = useI18n();
  const [draft, setDraft] = useState({
    group: tr(names.group),
    food: tr(names.food),
    qasr: tr(names.branches.qasr),
    lulu: tr(names.branches.lulu),
  });

  // A typed name replaces both the Arabic and English version; an untouched field keeps both.
  const pick = (typed: string, current: typeof names.group) => (typed.trim() && typed.trim() !== tr(current) ? both(typed.trim()) : current);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setNames({
      group: pick(draft.group, names.group),
      food: pick(draft.food, names.food),
      branches: { qasr: pick(draft.qasr, names.branches.qasr), lulu: pick(draft.lulu, names.branches.lulu) },
    });
    notify(t("toast.namesUpdated"));
    onClose();
  };

  return (
    <Modal title={t("cz.title")} onClose={onClose}>
      <p className="text-sm text-slate-500">{t("cz.hint")}</p>
      <form onSubmit={apply} className="space-y-4">
        <Field label={t("cz.group")}>
          <Input id="cust-group" value={draft.group} onChange={(e) => setDraft({ ...draft, group: e.target.value })} autoFocus />
        </Field>
        <Field label={t("cz.food")}>
          <Input id="cust-food" value={draft.food} onChange={(e) => setDraft({ ...draft, food: e.target.value })} />
        </Field>
        {BRANCH_IDS.map((b, i) => (
          <Field key={b} label={t("cz.restaurant", { n: i + 1 })}>
            <Input id={`cust-${b}`} value={draft[b]} onChange={(e) => setDraft({ ...draft, [b]: e.target.value })} />
          </Field>
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("app.cancel")}
          </Button>
          <Button type="submit">{t("app.apply")}</Button>
        </div>
      </form>
    </Modal>
  );
}
