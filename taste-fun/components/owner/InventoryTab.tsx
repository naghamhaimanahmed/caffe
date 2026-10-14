"use client";

import { ArrowLeftRight, Package, ShoppingCart } from "lucide-react";
import { useOwner, isLow, type TabId } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { BRANCH_IDS, LOW_STOCK_RATIO, UNITS } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Button, Card, CardHeader } from "../ui";
import { Bar, BranchDot, Table, Td, Th } from "./common";

function levelColor(ratio: number) {
  return ratio < LOW_STOCK_RATIO ? "#dc2626" : ratio < 0.7 ? "#d97706" : "#059669";
}

export function InventoryTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { names, stock, transferStock, createLowStockOrders } = useOwner();
  const { t, tr } = useI18n();

  return (
    <Card>
      <CardHeader
        icon={<Package className="size-5" />}
        title={t("inv.title")}
        subtitle={t("inv.hint")}
        action={
          <Button
            size="sm"
            onClick={() => {
              createLowStockOrders();
              onNavigate("purchasing");
            }}
          >
            <ShoppingCart className="size-4" />
            {t("inv.createPo")}
          </Button>
        }
      />
      <Table
        minWidth={760}
        head={
          <>
            <Th>{t("inv.item")}</Th>
            <Th>{t("inv.unit")}</Th>
            <Th>{t("inv.warehouse")}</Th>
            {BRANCH_IDS.map((b) => (
              <Th key={b}>
                <span className="flex items-center gap-1.5">
                  <BranchDot branch={b} />
                  {tr(names.branches[b])}
                </span>
              </Th>
            ))}
          </>
        }
      >
        {stock.map((item, i) => (
          <tr key={item.name.en}>
            <Td className="font-semibold text-slate-900">{tr(item.name)}</Td>
            <Td className="text-slate-500">{tr(UNITS[item.unit])}</Td>
            {item.stock.map((qty, loc) => {
              const ratio = qty / item.par[loc];
              const low = loc > 0 && isLow(item, loc);
              const cell = (
                <div className="flex min-w-32 items-center gap-2">
                  <span className={cn("num w-12", low ? "font-bold text-red-600" : "text-slate-700")}>{fmt(qty)}</span>
                  <Bar ratio={ratio} color={levelColor(ratio)} className="flex-1" />
                  {low && <ArrowLeftRight className="size-4 shrink-0 text-red-600" />}
                </div>
              );
              return (
                <Td key={loc}>
                  {low ? (
                    <button
                      onClick={() => transferStock(i, loc)}
                      className="-m-1.5 block w-full rounded-lg p-1.5 text-start hover:bg-red-50"
                      title={t("inv.transferTip", { par: item.par[loc] })}
                    >
                      {cell}
                    </button>
                  ) : (
                    cell
                  )}
                </Td>
              );
            })}
          </tr>
        ))}
      </Table>
    </Card>
  );
}
