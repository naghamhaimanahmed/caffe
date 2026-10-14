"use client";

import { Check, Send, ShoppingCart, Truck } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { SUPPLIERS, type POStatus } from "@/lib/mock-data";
import { Badge, Button, Card, CardHeader } from "../ui";
import { Table, Td, Th } from "./common";

const STATUS_TONE: Record<POStatus, "warning" | "info" | "success"> = { draft: "warning", sent: "info", received: "success" };

export function PurchasingTab() {
  const { orders, sendOrder, receiveOrder } = useOwner();
  const { t, tr, money } = useI18n();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<ShoppingCart className="size-5" />} title={t("po.title")} subtitle={t("po.hint")} />
        <Table
          minWidth={680}
          head={
            <>
              <Th>{t("po.order")}</Th>
              <Th>{t("po.supplier")}</Th>
              <Th>{t("po.due")}</Th>
              <Th end>{t("po.total")}</Th>
              <Th>{t("po.status")}</Th>
              <Th />
            </>
          }
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <Td className="num font-semibold text-slate-900">{o.id}</Td>
              <Td>{o.supplier}</Td>
              <Td className="text-slate-500">{tr(o.due)}</Td>
              <Td end className="num">{money(o.total)}</Td>
              <Td>
                <Badge tone={STATUS_TONE[o.status]}>{t(`po.${o.status}`)}</Badge>
              </Td>
              <Td end>
                {o.status === "draft" && (
                  <Button size="sm" onClick={() => sendOrder(o.id)}>
                    <Send className="size-3.5" />
                    {t("po.send")}
                  </Button>
                )}
                {o.status === "sent" && (
                  <Button size="sm" variant="success" onClick={() => receiveOrder(o.id)}>
                    <Check className="size-3.5" />
                    {t("po.receive")}
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHeader icon={<Truck className="size-5" />} title={t("po.suppliers")} />
        <Table
          minWidth={520}
          head={
            <>
              <Th>{t("po.supplier")}</Th>
              <Th>{t("po.type")}</Th>
              <Th end>{t("po.spend")}</Th>
              <Th end>{t("po.onTime")}</Th>
            </>
          }
        >
          {SUPPLIERS.map((s) => (
            <tr key={s.name}>
              <Td className="font-semibold text-slate-900">{s.name}</Td>
              <Td className="text-slate-500">{tr(s.type)}</Td>
              <Td end className="num">{money(s.spend)}</Td>
              <Td end>
                <Badge tone={s.onTime >= 95 ? "success" : "warning"}>
                  <span className="num">{s.onTime}%</span>
                </Badge>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
