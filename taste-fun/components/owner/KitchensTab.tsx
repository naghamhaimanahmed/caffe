"use client";

import { FileText, Truck } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { BRANCH_IDS, KITCHEN_DELIVERIES, KITCHEN_INVOICES, type BranchId, type DeliveryStatus } from "@/lib/mock-data";
import { Badge, Card, CardHeader } from "../ui";
import { Kpi, KpiRow, Table, Td, Th } from "./common";

const STATUS: Record<DeliveryStatus, { label: string; tone: "success" | "info" | "warning" }> = {
  delivered: { label: "تم التسليم", tone: "success" },
  dispatched: { label: "خرجت", tone: "info" },
  preparing: { label: "قيد التجهيز", tone: "warning" },
};

const isBranch = (c: string): c is BranchId => (BRANCH_IDS as readonly string[]).includes(c);

export function KitchensTab() {
  const { names } = useOwner();
  const toRestaurants = KITCHEN_DELIVERIES.filter((d) => isBranch(d.client)).reduce((a, d) => a + d.amount, 0);
  const toClients = KITCHEN_DELIVERIES.filter((d) => !isBranch(d.client)).reduce((a, d) => a + d.amount, 0);
  const receivable = KITCHEN_INVOICES.reduce((a, v) => a + v.amount, 0);
  const overdue = KITCHEN_INVOICES.filter((v) => v.ageDays > 30).length;

  return (
    <div className="space-y-6">
      <KpiRow>
        <Kpi hero label={`طلبات اليوم · ${names.food}`} value={money(toRestaurants + toClients)} footer={<span><span className="num">{KITCHEN_DELIVERIES.length}</span> طلبات</span>} />
        <Kpi label="لمطاعمك" value={money(toRestaurants)} />
        <Kpi label="عملاء خارجيين" value={money(toClients)} />
        <Kpi
          label="فواتير غير مدفوعة"
          value={money(receivable)}
          footer={
            overdue > 0 && (
              <Badge tone="danger">
                <span className="num">{overdue}</span> أكثر من 30 يوم
              </Badge>
            )
          }
        />
      </KpiRow>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader icon={<Truck className="size-5" />} title="توصيلات اليوم" subtitle="الإنتاج والتوريد لمطاعمك وللعملاء الخارجيين." />
          <Table
            minWidth={620}
            head={
              <>
                <Th>الوقت</Th>
                <Th>العميل</Th>
                <Th>الأصناف</Th>
                <Th end>المبلغ</Th>
                <Th>الحالة</Th>
              </>
            }
          >
            {KITCHEN_DELIVERIES.map((d) => (
              <tr key={d.time}>
                <Td className="num">{d.time}</Td>
                <Td className="font-semibold text-slate-900">{isBranch(d.client) ? names.branches[d.client] : d.client}</Td>
                <Td className="text-slate-500">{d.items}</Td>
                <Td end className="num">{money(d.amount)}</Td>
                <Td>
                  <Badge tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Badge>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader icon={<FileText className="size-5" />} title="الفواتير" />
          <Table
            minWidth={400}
            head={
              <>
                <Th>فاتورة</Th>
                <Th>العميل</Th>
                <Th end>المبلغ</Th>
                <Th end>العمر</Th>
              </>
            }
          >
            {KITCHEN_INVOICES.map((v) => (
              <tr key={v.id}>
                <Td className="num">{v.id}</Td>
                <Td>{v.client}</Td>
                <Td end className="num">{money(v.amount)}</Td>
                <Td end>
                  <Badge tone={v.ageDays > 30 ? "danger" : "success"}>
                    <span className="num">{v.ageDays}</span> يوم
                  </Badge>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}
