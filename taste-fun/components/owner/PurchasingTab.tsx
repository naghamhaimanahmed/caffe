"use client";

import { Check, Send, ShoppingCart, Truck } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { SUPPLIERS, type POStatus } from "@/lib/mock-data";
import { Badge, Button, Card, CardHeader } from "../ui";
import { Table, Td, Th } from "./common";

const STATUS: Record<POStatus, { label: string; tone: "warning" | "info" | "success" }> = {
  draft: { label: "مسودة", tone: "warning" },
  sent: { label: "مُرسل", tone: "info" },
  received: { label: "مستلم", tone: "success" },
};

export function PurchasingTab() {
  const { orders, sendOrder, receiveOrder } = useOwner();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<ShoppingCart className="size-5" />} title="طلبات الشراء" subtitle="طلبات الموردين من الطلب حتى الاستلام." />
        <Table
          minWidth={680}
          head={
            <>
              <Th>الطلب</Th>
              <Th>المورد</Th>
              <Th>التسليم</Th>
              <Th end>الإجمالي</Th>
              <Th>الحالة</Th>
              <Th />
            </>
          }
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <Td className="num font-semibold text-slate-900">{o.id}</Td>
              <Td>{o.supplier}</Td>
              <Td className="text-slate-500">{o.due}</Td>
              <Td end className="num">{money(o.total)}</Td>
              <Td>
                <Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge>
              </Td>
              <Td end>
                {o.status === "draft" && (
                  <Button size="sm" onClick={() => sendOrder(o.id)}>
                    <Send className="size-3.5" />
                    إرسال للمورد
                  </Button>
                )}
                {o.status === "sent" && (
                  <Button size="sm" variant="success" onClick={() => receiveOrder(o.id)}>
                    <Check className="size-3.5" />
                    تأكيد الاستلام
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHeader icon={<Truck className="size-5" />} title="الموردين" />
        <Table
          minWidth={520}
          head={
            <>
              <Th>المورد</Th>
              <Th>النوع</Th>
              <Th end>المشتريات هذا الشهر</Th>
              <Th end>الالتزام بالمواعيد</Th>
            </>
          }
        >
          {SUPPLIERS.map((s) => (
            <tr key={s.name}>
              <Td className="font-semibold text-slate-900">{s.name}</Td>
              <Td className="text-slate-500">{s.type}</Td>
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
