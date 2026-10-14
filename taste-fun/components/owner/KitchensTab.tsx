"use client";

import { FileText, Truck } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { KITCHEN_DELIVERIES, KITCHEN_INVOICES, type DeliveryStatus, type KitchenDelivery } from "@/lib/mock-data";
import { Badge, Card, CardHeader } from "../ui";
import { Kpi, KpiRow, Table, Td, Th } from "./common";

const STATUS_TONE: Record<DeliveryStatus, "success" | "info" | "warning"> = { delivered: "success", dispatched: "info", preparing: "warning" };

const toOurBranch = (d: KitchenDelivery) => typeof d.client === "string";

export function KitchensTab() {
  const { names } = useOwner();
  const { t, tr, money } = useI18n();
  const toRestaurants = KITCHEN_DELIVERIES.filter(toOurBranch).reduce((a, d) => a + d.amount, 0);
  const toClients = KITCHEN_DELIVERIES.filter((d) => !toOurBranch(d)).reduce((a, d) => a + d.amount, 0);
  const receivable = KITCHEN_INVOICES.reduce((a, v) => a + v.amount, 0);
  const overdue = KITCHEN_INVOICES.filter((v) => v.ageDays > 30).length;
  const clientName = (d: KitchenDelivery) => (typeof d.client === "string" ? tr(names.branches[d.client]) : tr(d.client));

  return (
    <div className="space-y-6">
      <KpiRow>
        <Kpi
          hero
          label={t("kt.ordersToday", { name: tr(names.food) })}
          value={money(toRestaurants + toClients)}
          footer={t("kt.ordersCount", { n: KITCHEN_DELIVERIES.length })}
        />
        <Kpi label={t("kt.toRestaurants")} value={money(toRestaurants)} />
        <Kpi label={t("kt.toClients")} value={money(toClients)} />
        <Kpi label={t("kt.unpaid")} value={money(receivable)} footer={overdue > 0 && <Badge tone="danger">{t("kt.overdue", { n: overdue })}</Badge>} />
      </KpiRow>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader icon={<Truck className="size-5" />} title={t("kt.deliveries")} subtitle={t("kt.deliveriesHint")} />
          <Table
            minWidth={620}
            head={
              <>
                <Th>{t("kt.time")}</Th>
                <Th>{t("kt.client")}</Th>
                <Th>{t("kt.items")}</Th>
                <Th end>{t("kt.amount")}</Th>
                <Th>{t("kt.status")}</Th>
              </>
            }
          >
            {KITCHEN_DELIVERIES.map((d) => (
              <tr key={d.time}>
                <Td className="num">{d.time}</Td>
                <Td className="font-semibold text-slate-900">{clientName(d)}</Td>
                <Td className="text-slate-500">{tr(d.items)}</Td>
                <Td end className="num">{money(d.amount)}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[d.status]}>{t(`kt.${d.status}`)}</Badge>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader icon={<FileText className="size-5" />} title={t("kt.invoices")} />
          <Table
            minWidth={400}
            head={
              <>
                <Th>{t("kt.invoice")}</Th>
                <Th>{t("kt.client")}</Th>
                <Th end>{t("kt.amount")}</Th>
                <Th end>{t("kt.age")}</Th>
              </>
            }
          >
            {KITCHEN_INVOICES.map((v) => (
              <tr key={v.id}>
                <Td className="num">{v.id}</Td>
                <Td>{tr(v.client)}</Td>
                <Td end className="num">{money(v.amount)}</Td>
                <Td end>
                  <Badge tone={v.ageDays > 30 ? "danger" : "success"}>{t("kt.days", { n: v.ageDays })}</Badge>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}
