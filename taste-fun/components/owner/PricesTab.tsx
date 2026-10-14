"use client";

import { Lightbulb, TrendingUp } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { GROUP_BUY, PRICE_ROWS } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Button, Card, CardHeader } from "../ui";
import { Kpi, KpiRow, Notice, Table, Td, Th } from "./common";

export function PricesTab() {
  const { names, notify } = useOwner();
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
        <Kpi
          hero
          label="أصناف سعرها زاد"
          value={
            <>
              {increased} <span className="text-lg font-medium text-slate-300">من {rows.length}</span>
            </>
          }
          footer="كل فاتورة شراء بتحدّث السعر تلقائيًا"
        />
        <Kpi alert label="دفعت زيادة هذا الشهر" value={money(extra)} valueClass="text-red-600" />
        <Kpi label="التوفير بأفضل الأسعار" value={money(saving)} valueClass="text-emerald-600" />
        <Kpi label="فرصة شراء مجمع" value={money(groupBuy)} footer="في الشهر" />
      </KpiRow>

      <Card>
        <CardHeader
          icon={<TrendingUp className="size-5" />}
          title="مراقبة أسعار الموردين"
          subtitle="كل فاتورة شراء بتحدّث السعر تلقائيًا، وبيوصلك تنبيه لما مورد يرفع سعره."
          action={
            <Button size="sm" variant="secondary" onClick={() => notify("تم إرسال طلب عرض سعر لـ3 موردين")}>
              اطلب عرض سعر من 3 موردين
            </Button>
          }
        />
        <Table
          minWidth={900}
          head={
            <>
              <Th>الصنف</Th>
              <Th>المورد</Th>
              <Th end>آخر سعر</Th>
              <Th end>متوسط 3 شهور</Th>
              <Th end>التغيير</Th>
              <Th end>أفضل سعر حديث</Th>
              <Th end>تكلفة إضافية هذا الشهر</Th>
              <Th>الحالة</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.item}>
              <Td>
                <b className="text-slate-900">{r.item}</b> <span className="text-xs text-slate-400">/ {r.unit}</span>
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
                {r.change > 8 ? <Badge tone="danger">زيادة كبيرة</Badge> : r.change > 3 ? <Badge tone="warning">زيادة</Badge> : <Badge tone="success">ثابت</Badge>}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Notice tone="warning">
        <Lightbulb className="size-4 shrink-0" />
        <span>
          <b>فرصة شراء مجمع:</b> {names.branches.qasr} بيشتري {GROUP_BUY.item} بـ<span className="num">{fmt(GROUP_BUY.qasrPrice, 2)}</span> درهم/كجم، و
          {names.branches.lulu} بـ<span className="num">{fmt(GROUP_BUY.luluPrice, 2)}</span>. لو اشتريتوا مع بعض من المورد الأرخص، التوفير حوالي{" "}
          <span className="num">{money(groupBuy)}</span> في الشهر.
        </span>
      </Notice>
    </div>
  );
}
