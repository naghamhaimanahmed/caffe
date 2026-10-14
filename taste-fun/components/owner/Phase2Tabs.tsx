"use client";

import { ClipboardCheck, Target, Users } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { branchPnL } from "@/lib/finance";
import {
  BRANCH_IDS,
  INITIAL_STOCK,
  MONTHLY_TARGETS,
  SERIES_COLOR,
  STAFF,
  STOCK_COUNT_DIFFS,
  UNITS,
  WASTE_THIS_MONTH,
  type StaffStatus,
} from "@/lib/mock-data";
import { Badge, Card, CardHeader } from "../ui";
import { Bar, BranchDot, Phase2Banner, Table, Td, Th } from "./common";

const STAFF_TONE: Record<StaffStatus, "success" | "warning" | "info"> = { present: "success", late: "warning", off: "info" };

export function StaffTab() {
  const { names } = useOwner();
  const { t, tr } = useI18n();
  return (
    <div className="space-y-6">
      <Phase2Banner />
      <Card>
        <CardHeader icon={<Users className="size-5" />} title={t("nav.staff")} />
        <Table
          minWidth={560}
          head={
            <>
              <Th>{t("st.employee")}</Th>
              <Th>{t("st.role")}</Th>
              <Th>{t("st.restaurant")}</Th>
              <Th>{t("st.shift")}</Th>
              <Th>{t("st.status")}</Th>
            </>
          }
        >
          {STAFF.map((s) => (
            <tr key={s.name.en}>
              <Td className="font-semibold text-slate-900">{tr(s.name)}</Td>
              <Td className="text-slate-500">{tr(s.role)}</Td>
              <Td>
                <span className="flex items-center gap-2">
                  <BranchDot branch={s.branch} />
                  {tr(names.branches[s.branch])}
                </span>
              </Td>
              <Td className="num">{s.shift}</Td>
              <Td>
                <Badge tone={STAFF_TONE[s.status]}>{t(`st.${s.status}`)}</Badge>
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
  const { t, tr, money } = useI18n();
  return (
    <div className="space-y-6">
      <Phase2Banner />
      <Card>
        <CardHeader icon={<ClipboardCheck className="size-5" />} title={t("nav.stockcount")} subtitle={t("sc.sub", { branch: tr(names.branches.qasr) })} />
        <Table
          minWidth={480}
          head={
            <>
              <Th>{t("sc.item")}</Th>
              <Th end>{t("sc.system")}</Th>
              <Th end>{t("sc.counted")}</Th>
              <Th end>{t("sc.diff")}</Th>
            </>
          }
        >
          {INITIAL_STOCK.slice(0, STOCK_COUNT_DIFFS.length).map((it, i) => {
            const diff = STOCK_COUNT_DIFFS[i];
            return (
              <tr key={it.name.en}>
                <Td>{tr(it.name)}</Td>
                <Td end className="num">{it.stock[1]}</Td>
                <Td end className="num">{it.stock[1] + diff}</Td>
                <Td end>
                  <Badge tone={diff ? "danger" : "success"}>
                    <span className="num">{diff}</span> {diff ? tr(UNITS[it.unit]) : ""}
                  </Badge>
                </Td>
              </tr>
            );
          })}
        </Table>
        <div className="m-5 flex justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <span>{t("sc.waste")}</span>
          <b className="num">{money(WASTE_THIS_MONTH)}</b>
        </div>
      </Card>
    </div>
  );
}

export function TargetsTab() {
  const { names, history, today } = useOwner();
  const { t, tr, money } = useI18n();
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
                <b className="text-slate-900">{tr(names.branches[b])}</b>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("tg.target")}</span>
                <span className="num">{money(target)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("tg.achieved")}</span>
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
