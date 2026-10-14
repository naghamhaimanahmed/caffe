"use client";

import { BadgeCheck, Check, ClipboardCheck, X } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { APPROVAL_TYPE } from "@/lib/mock-data";
import { Badge, Button, Card, CardHeader, EmptyState } from "../ui";
import { BranchDot, Table, Td, Th } from "./common";

export function ApprovalsTab() {
  const { names, approvals, decideApproval } = useOwner();
  const total = approvals.reduce((a, x) => a + x.amount, 0);

  return (
    <Card>
      <CardHeader
        icon={<ClipboardCheck className="size-5" />}
        title="الاعتمادات"
        subtitle="المشتريات والمصروفات والخصومات فوق حدّك تنتظر هنا."
        action={
          approvals.length > 0 && (
            <Badge tone="warning">
              <span className="num">{approvals.length}</span> بقيمة <span className="num">{money(total)}</span>
            </Badge>
          )
        }
      />
      {approvals.length === 0 ? (
        <EmptyState icon={<BadgeCheck className="size-6" />} title="لا يوجد شيء بانتظارك" text="تمت معالجة كل الطلبات." />
      ) : (
        <Table
          minWidth={760}
          head={
            <>
              <Th>النوع</Th>
              <Th>الطلب</Th>
              <Th>المطعم</Th>
              <Th>مقدم الطلب</Th>
              <Th end>المبلغ</Th>
              <Th />
            </>
          }
        >
          {approvals.map((a) => (
            <tr key={a.id}>
              <Td>
                <Badge tone={APPROVAL_TYPE[a.type].tone}>{APPROVAL_TYPE[a.type].label}</Badge>
              </Td>
              <Td className="font-medium text-slate-900">{a.title}</Td>
              <Td>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <BranchDot branch={a.branch} />
                  {names.branches[a.branch]}
                </span>
              </Td>
              <Td className="text-slate-500">{a.requestedBy}</Td>
              <Td end className="num font-semibold text-slate-900">{money(a.amount)}</Td>
              <Td end>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="danger" onClick={() => decideApproval(a.id, false)}>
                    <X className="size-3.5" />
                    رفض
                  </Button>
                  <Button size="sm" variant="success" onClick={() => decideApproval(a.id, true)}>
                    <Check className="size-3.5" />
                    اعتماد
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}
