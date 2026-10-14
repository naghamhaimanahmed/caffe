"use client";

import { Lightbulb, TrendingUp } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { GROUP_BUY, PRICE_ROWS, UNITS } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Button, Card, CardHeader } from "../ui";
import { Kpi, KpiRow, Notice, Table, Td, Th } from "./common";

export function PricesTab() {
  const { names, notify } = useOwner();
  const { t, tr, money } = useI18n();
  const rows = PRICE_ROWS.map((p) => ({
    ...p,
    change: ((p.last - p.avg3m) / p.avg3m) * 100,
    extra: Math.max(0, (p.last - p.avg3m) * p.monthlyQty),
    saving: Math.max(0, (p.last - p.best) * p.monthlyQty),
  }));
  const increased = rows.filter((r) => r.change > 1).length;
  const extra = rows.reduce((a, r) => a + r.extra, 0);
  const saving = rows.reduce((a, r) => a + r.saving, 0);
  const groupBuy = Math.round((GROUP_BUY.qasrPrice - GROUP_BUY.luluPrice) * GROUP_BUY.monthlyQty);

  return (
    <div className="space-y-6">
      <KpiRow>
        <Kpi hero label={t("pr.increased")} value={t("pr.countOf", { a: increased, b: rows.length })} footer={t("pr.autoUpdate")} />
        <Kpi alert label={t("pr.extra")} value={money(extra)} valueClass="text-red-600" />
        <Kpi label={t("pr.saving")} value={money(saving)} valueClass="text-emerald-600" />
        <Kpi label={t("pr.groupBuy")} value={money(groupBuy)} footer={t("pr.perMonth")} />
      </KpiRow>

      <Card>
        <CardHeader
          icon={<TrendingUp className="size-5" />}
          title={t("pr.title")}
          subtitle={t("pr.hint")}
          action={
            <Button size="sm" variant="secondary" onClick={() => notify(t("toast.quotesSent"))}>
              {t("pr.askQuotes")}
            </Button>
          }
        />
        <Table
          minWidth={900}
          head={
            <>
              <Th>{t("pr.item")}</Th>
              <Th>{t("pr.supplier")}</Th>
              <Th end>{t("pr.last")}</Th>
              <Th end>{t("pr.avg")}</Th>
              <Th end>{t("pr.change")}</Th>
              <Th end>{t("pr.best")}</Th>
              <Th end>{t("pr.extraCol")}</Th>
              <Th>{t("pr.status")}</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.item.en}>
              <Td>
                <b className="text-slate-900">{tr(r.item)}</b> <span className="text-xs text-slate-400">/ {tr(UNITS[r.unit])}</span>
              </Td>
              <Td className="text-slate-600">{r.supplier}</Td>
              <Td end className="num font-semibold">{fmt(r.last, 2)}</Td>
              <Td end className="num text-slate-500">{fmt(r.avg3m, 2)}</Td>
              <Td end className={cn("num font-semibold", r.change > 8 ? "text-red-600" : r.change > 3 ? "text-amber-600" : "text-slate-600")}>
                {r.change > 0 ? "+" : ""}
                {r.change.toFixed(1)}%
              </Td>
              <Td end className="num">{fmt(r.best, 2)}</Td>
              <Td end className="num">{r.extra ? money(r.extra) : "—"}</Td>
              <Td>
                {r.change > 8 ? (
                  <Badge tone="danger">{t("pr.big")}</Badge>
                ) : r.change > 3 ? (
                  <Badge tone="warning">{t("pr.some")}</Badge>
                ) : (
                  <Badge tone="success">{t("pr.stable")}</Badge>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Notice tone="warning">
        <Lightbulb className="size-4 shrink-0" />
        <span>
          <b>{t("pr.groupBuy")}:</b>{" "}
          {t("pr.gbText", {
            a: tr(names.branches.qasr),
            b: tr(names.branches.lulu),
            item: tr(GROUP_BUY.item),
            pa: fmt(GROUP_BUY.qasrPrice, 2),
            pb: fmt(GROUP_BUY.luluPrice, 2),
            amount: money(groupBuy),
          })}
        </span>
      </Notice>
    </div>
  );
}
