"use client";

import { useState } from "react";
import { ClipboardList, ListChecks, Pencil, Zap } from "lucide-react";
import { useOwner } from "@/lib/owner-store";
import { useI18n, type Key } from "@/lib/i18n";
import { BRANCH_IDS, CLOSING_SPLIT, type BranchId } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Button, Card, CardHeader, Field, NumberInput, Segmented } from "../ui";
import { ClosingStateBadge, VarianceBadge } from "../StatusBadges";
import { BranchDot, Table, Td, Th } from "./common";

type Source = "pos" | "manual";
const CHANNEL_FIELDS = [
  { key: "card", label: "cl.card" },
  { key: "cash", label: "cl.cash" },
  { key: "talabat", label: "cl.talabat" },
  { key: "keeta", label: "cl.keeta" },
  { key: "external", label: "cl.external" },
] as const satisfies readonly { key: string; label: Key }[];
type Channel = (typeof CHANNEL_FIELDS)[number]["key"];
const EMPTY_MANUAL: Record<Channel, string> = { card: "", cash: "", talabat: "", keeta: "", external: "" };

export function ClosingTab() {
  const { names, today, history, closings, updateClosing, notify } = useOwner();
  const { t, tr, money, currency } = useI18n();
  const [branch, setBranch] = useState<BranchId>("qasr");
  const [source, setSource] = useState<Source>("pos");
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [petty, setPetty] = useState("85");
  const [counted, setCounted] = useState("");

  const posTotal = today.sales[branch];
  const fromPos: Record<Channel, number> = {
    card: Math.round(posTotal * CLOSING_SPLIT.card),
    talabat: Math.round(posTotal * CLOSING_SPLIT.talabat),
    keeta: Math.round(posTotal * CLOSING_SPLIT.keeta),
    external: Math.round(posTotal * CLOSING_SPLIT.external),
    cash: 0,
  };
  fromPos.cash = posTotal - fromPos.card - fromPos.talabat - fromPos.keeta - fromPos.external;
  const values: Record<Channel, number> =
    source === "pos" ? fromPos : (Object.fromEntries(CHANNEL_FIELDS.map((f) => [f.key, Number(manual[f.key]) || 0])) as Record<Channel, number>);
  const total = CHANNEL_FIELDS.reduce((a, f) => a + values[f.key], 0);
  const expected = values.cash - (Number(petty) || 0);
  const variance = counted === "" ? null : Number(counted) - expected;
  const state = closings[branch].state;

  const switchBranch = (b: BranchId) => {
    setBranch(b);
    setCounted("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          icon={<ClipboardList className="size-5" />}
          title={t("nav.closing")}
          subtitle={t(source === "pos" ? "cl.hintPos" : "cl.hintManual")}
          action={<Segmented value={branch} onChange={switchBranch} options={BRANCH_IDS.map((b) => ({ value: b, label: tr(names.branches[b]) }))} />}
        />
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">{t("cl.source")}</span>
            <Segmented
              value={source}
              onChange={(s) => {
                setSource(s);
                setCounted("");
              }}
              options={[
                { value: "pos", label: t("cl.srcPos"), icon: <Zap className="size-4" /> },
                { value: "manual", label: t("cl.srcManual"), icon: <Pencil className="size-4" /> },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNEL_FIELDS.map((f) =>
              source === "pos" ? (
                <AutoField key={f.key} label={t(f.label)} value={values[f.key]} />
              ) : (
                <Field key={f.key} label={t(f.label)} hint={t("cl.enteredBy")}>
                  <NumberInput
                    id={`manual-${f.key}`}
                    suffix={currency}
                    placeholder="0"
                    value={manual[f.key]}
                    onChange={(e) => setManual((m) => ({ ...m, [f.key]: e.target.value }))}
                  />
                </Field>
              ),
            )}
            <AutoField label={t(source === "pos" ? "cl.posTotal" : "cl.total")} value={total} strong />
            <Field label={t("cl.petty")}>
              <NumberInput id="closing-petty" suffix={currency} value={petty} onChange={(e) => setPetty(e.target.value)} />
            </Field>
            <Field label={t("cl.counted")}>
              <NumberInput id="closing-counted" suffix={currency} placeholder={fmt(expected)} value={counted} onChange={(e) => setCounted(e.target.value)} />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span>
              {t("cl.expected")}: <b className="num text-lg text-slate-900">{money(expected)}</b>
            </span>
            <span className="flex items-center gap-2">
              {t("cl.variance")}: {variance === null ? <span className="text-slate-400">—</span> : <VarianceBadge variance={variance} />}
            </span>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {state === "approved" ? (
              <ClosingStateBadge state="approved" />
            ) : state === "submitted" ? (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    updateClosing(branch, { state: "notSubmitted" });
                    notify(t("toast.closingRejected"));
                  }}
                >
                  {t("app.reject")}
                </Button>
                <Button
                  onClick={() => {
                    updateClosing(branch, { state: "approved" });
                    notify(t("toast.closingApproved"));
                  }}
                >
                  {t("app.approve")}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  updateClosing(branch, { state: "submitted", variance: variance === null ? 0 : Math.round(variance) });
                  notify(t("toast.closingSubmitted"));
                }}
              >
                {t("cl.submit")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<ListChecks className="size-5" />} title={t("cl.yesterday")} />
        <Table
          minWidth={520}
          head={
            <>
              <Th>{t("cl.restaurant")}</Th>
              <Th end>{t("cl.sales")}</Th>
              <Th end>{t("cl.variance")}</Th>
              <Th>{t("cl.status")}</Th>
            </>
          }
        >
          {BRANCH_IDS.map((b) => {
            const v = closings[b].variance;
            return (
              <tr key={b}>
                <Td>
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    <BranchDot branch={b} />
                    {tr(names.branches[b])}
                  </span>
                </Td>
                <Td end className="num">{money(history[history.length - 1][b])}</Td>
                <Td end>{v === null ? "—" : <VarianceBadge variance={v} />}</Td>
                <Td>
                  <ClosingStateBadge state={closings[b].state} />
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

function AutoField({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  const { t, money } = useI18n();
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className={cn("num flex h-11 items-center justify-end rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm", strong ? "font-bold text-slate-900" : "text-slate-600")}>
        {money(value)}
      </div>
      <span className="mt-1 flex items-center gap-1 text-xs text-brand-600">
        <span className="size-1.5 rounded-full bg-brand-500" />
        {t("cl.auto")}
      </span>
    </div>
  );
}
