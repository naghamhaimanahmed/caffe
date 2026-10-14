"use client";

import { ClipboardCheck, Target, Users } from "lucide-react";
import { useOwner, money } from "@/lib/owner-store";
import { branchPnL } from "@/lib/finance";
import { BRANCH_IDS, INITIAL_STOCK, MONTHLY_TARGETS, SERIES_COLOR, STAFF, STOCK_COUNT_DIFFS, WASTE_THIS_MONTH, type StaffStatus } from "@/lib/mock-data";
import { Badge, Card, CardHeader } from "../ui";
import { Bar, BranchDot, Phase2Banner, Table, Td, Th } from "./common";

const STAFF_STATUS: Record<StaffStatus, { label: string; tone: "success" | "warning" | "info" }> = {
  present: { label: "حاضر", tone: "success" },
  late: { label: "متأخر", tone: "warning" },
  off: { label: "إجازة", tone: "info" },
};

export function StaffTab() {
  const { names } = useOwner();
  return (
    <div className="space-y-6">
      <Phase2Banner />
      <Card>
        <CardHeader icon={<Users className="size-5" />} title="الموظفين والشيفتات" />
        <Table
          minWidth={560}
          head={
            <>
              <Th>الموظف</Th>
              <Th>الوظيفة</Th>
              <Th>المطعم</Th>
              <Th>الشيفت</Th>
              <Th>الحالة</Th>
            </>
          }
        >
          {STAFF.map((s) => (
            <tr key={s.name}>
              <Td className="font-semibold text-slate-900">{s.name}</Td>
              <Td className="text-slate-500">{s.role}</Td>
              <Td>
                <span className="flex items-center gap-2">
                  <BranchDot branch={s.branch} />
                  {names.branches[s.branch]}
                </span>
              </Td>
              <Td className="num">{s.shift}</Td>
              <Td>
                <Badge tone={STAFF_STATUS[s.status].tone}>{STAFF_STATUS[s.status].label}</Badge>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

export function StockCountTab() {
  const { names } = useOwner();
  return (
    <div className="space-y-6">
      <Phase2Banner />
      <Card>
        <CardHeader icon={<ClipboardCheck className="size-5" />} title="الجرد والهدر" subtitle={`آخر جرد · ${names.branches.qasr}`} />
        <Table
          minWidth={480}
          head={
            <>
              <Th>الصنف</Th>
              <Th end>في النظام</Th>
              <Th end>المعدود</Th>
              <Th end>الفرق</Th>
            </>
          }
        >
          {INITIAL_STOCK.slice(0, STOCK_COUNT_DIFFS.length).map((it, i) => {
            const diff = STOCK_COUNT_DIFFS[i];
            return (
              <tr key={it.name}>
                <Td>{it.name}</Td>
                <Td end className="num">{it.stock[1]}</Td>
                <Td end className="num">{it.stock[1] + diff}</Td>
                <Td end>
                  {diff ? (
                    <Badge tone="danger">
                      <span className="num">{diff}</span> {it.unit}
                    </Badge>
                  ) : (
                    <Badge tone="success">
                      <span className="num">0</span>
                    </Badge>
                  )}
                </Td>
              </tr>
            );
          })}
        </Table>
        <div className="m-5 flex justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <span>الهدر هذا الشهر</span>
          <b className="num">{money(WASTE_THIS_MONTH)}</b>
        </div>
      </Card>
    </div>
  );
}

export function TargetsTab() {
  const { names, history, today } = useOwner();
  return (
    <div className="space-y-6">
      <Phase2Banner />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {BRANCH_IDS.map((b) => {
          const target = MONTHLY_TARGETS[b];
          const achieved = branchPnL(b, "month", history, today).sales;
          const ratio = achieved / target;
          return (
            <Card key={b} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-slate-400" />
                <BranchDot branch={b} />
                <b className="text-slate-900">{names.branches[b]}</b>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">المستهدف الشهري</span>
                <span className="num">{money(target)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">المحقق</span>
                <span className="num">{money(achieved)}</span>
              </div>
              <Bar ratio={ratio} color={SERIES_COLOR[b]} className="h-2.5" />
              <b className={ratio >= 1 ? "num text-2xl text-emerald-600" : "num text-2xl text-slate-900"}>{Math.round(ratio * 100)}%</b>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
