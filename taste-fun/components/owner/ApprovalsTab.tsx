"use client";

import { BadgeCheck, Check, ClipboardCheck, X } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { APPROVAL_TONE } from "@/lib/mock-data";
import { Badge, Button, Card, CardHeader, EmptyState } from "../ui";
import { BranchDot, Table, Td, Th } from "./common";

export function ApprovalsTab() {
  const { names, approvals, decideApproval } = useOwner();
  const { t, tr, money } = useI18n();
  const total = approvals.reduce((a, x) => a + x.amount, 0);

  return (
    <Card>
      <CardHeader
        icon={<ClipboardCheck className="size-5" />}
        title={t("nav.approvals")}
        subtitle={t("ap.hint")}
        action={approvals.length > 0 && <Badge tone="warning">{t("ap.summary", { n: approvals.length, amount: money(total) })}</Badge>}
      />
      {approvals.length === 0 ? (
        <EmptyState icon={<BadgeCheck className="size-6" />} title={t("ap.none")} text={t("ap.noneText")} />
      ) : (
        <Table
          minWidth={760}
          head={
            <>
              <Th>{t("ap.type")}</Th>
              <Th>{t("ap.request")}</Th>
              <Th>{t("ap.restaurant")}</Th>
              <Th>{t("ap.by")}</Th>
              <Th end>{t("ap.amount")}</Th>
              <Th />
            </>
          }
        >
          {approvals.map((a) => (
            <tr key={a.id}>
              <Td>
                <Badge tone={APPROVAL_TONE[a.type]}>{t(`apType.${a.type}`)}</Badge>
              </Td>
              <Td className="font-medium text-slate-900">{tr(a.title)}</Td>
              <Td>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <BranchDot branch={a.branch} />
                  {tr(names.branches[a.branch])}
                </span>
              </Td>
              <Td className="text-slate-500">{tr(a.requestedBy)}</Td>
              <Td end className="num font-semibold text-slate-900">{money(a.amount)}</Td>
              <Td end>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="danger" onClick={() => decideApproval(a.id, false)}>
                    <X className="size-3.5" />
                    {t("app.reject")}
                  </Button>
                  <Button size="sm" variant="success" onClick={() => decideApproval(a.id, true)}>
                    <Check className="size-3.5" />
                    {t("app.approve")}
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
