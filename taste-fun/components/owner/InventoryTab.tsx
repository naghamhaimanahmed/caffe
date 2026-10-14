"use client";

import { ArrowLeftRight, Package, ShoppingCart } from "lucide-react";
import { useOwner, isLow, type TabId } from "@/lib/owner-store";
import { BRANCH_IDS, LOW_STOCK_RATIO } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Button, Card, CardHeader } from "../ui";
import { Bar, BranchDot, Table, Td, Th } from "./common";

function levelColor(ratio: number) {
  return ratio < LOW_STOCK_RATIO ? "#dc2626" : ratio < 0.7 ? "#d97706" : "#059669";
}

export function InventoryTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { names, stock, transferStock, createLowStockOrders } = useOwner();

  return (
    <Card>
      <CardHeader
        icon={<Package className="size-5" />}
        title="المخزون في كل المواقع"
        subtitle="كل خانة تعرض الرصيد مقابل الحد الأدنى. اضغط على الخانة الحمراء للتحويل من المستودع."
        action={
          <Button
            size="sm"
            onClick={() => {
              createLowStockOrders();
              onNavigate("purchasing");
            }}
          >
            <ShoppingCart className="size-4" />
            إنشاء طلبات للأصناف المنخفضة
          </Button>
        }
      />
      <Table
        minWidth={760}
        head={
          <>
            <Th>الصنف</Th>
            <Th>الوحدة</Th>
            <Th>المستودع الرئيسي</Th>
            {BRANCH_IDS.map((b) => (
              <Th key={b}>
                <span className="flex items-center gap-1.5">
                  <BranchDot branch={b} />
                  {names.branches[b]}
                </span>
              </Th>
            ))}
          </>
        }
      >
        {stock.map((item, i) => (
          <tr key={item.name}>
            <Td className="font-semibold text-slate-900">{item.name}</Td>
            <Td className="text-slate-500">{item.unit}</Td>
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
                      title={`تحويل من المستودع (الحد الأدنى ${item.par[loc]})`}
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
