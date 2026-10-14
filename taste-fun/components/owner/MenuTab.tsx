"use client";

import { useState } from "react";
import { ChefHat, UtensilsCrossed } from "lucide-react";
import { money } from "@/lib/owner-store";
import { RECIPES, TARGET_FOOD_COST, type Recipe } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Card, CardHeader } from "../ui";
import { Table, Td, Th } from "./common";

const recipeCost = (r: Recipe) => r.ingredients.reduce((a, [, qty, , unitCost]) => a + qty * unitCost, 0);

export function MenuTab() {
  const [selected, setSelected] = useState(0);
  const recipe = RECIPES[selected];
  const cost = recipeCost(recipe);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader icon={<UtensilsCrossed className="size-5" />} title="تكلفة كل صنف" subtitle="أسعار المكونات تتحدث من المشتريات، فتبقى التكلفة دقيقة. اختر صنفًا لعرض مكوناته." />
        <Table
          minWidth={420}
          head={
            <>
              <Th>الصنف</Th>
              <Th end>السعر</Th>
              <Th end>التكلفة</Th>
              <Th end>هامش الربح</Th>
            </>
          }
        >
          {RECIPES.map((r, i) => {
            const c = recipeCost(r);
            const margin = Math.round((1 - c / r.price) * 100);
            return (
              <tr
                key={r.name}
                onClick={() => setSelected(i)}
                className={cn("cursor-pointer hover:bg-slate-50", i === selected && "bg-brand-50 hover:bg-brand-50")}
                aria-selected={i === selected}
              >
                <Td className="font-semibold text-slate-900">{r.name}</Td>
                <Td end className="num">{money(r.price)}</Td>
                <Td end className="num">{fmt(c, 2)}</Td>
                <Td end>
                  <Badge tone={margin >= 65 ? "success" : margin >= 55 ? "warning" : "danger"}>
                    <span className="num">{margin}%</span>
                  </Badge>
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Card>
        <CardHeader icon={<ChefHat className="size-5" />} title={recipe.name} subtitle={`سعر البيع ${money(recipe.price)}`} />
        <Table
          minWidth={360}
          head={
            <>
              <Th>المكوّن</Th>
              <Th end>الكمية</Th>
              <Th end>التكلفة</Th>
            </>
          }
        >
          {recipe.ingredients.map(([name, qty, unit, unitCost]) => (
            <tr key={name}>
              <Td>{name}</Td>
              <Td end>
                <span className="num">{qty}</span> <span className="text-xs text-slate-500">{unit}</span>
              </Td>
              <Td end className="num">{fmt(qty * unitCost, 2)}</Td>
            </tr>
          ))}
          <tr className="font-semibold">
            <Td>التكلفة</Td>
            <Td />
            <Td end className="num">{fmt(cost, 2)}</Td>
          </tr>
        </Table>
        <div className="m-5 flex flex-wrap justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <span>
            تكلفة الأغذية: <b className="num text-base">{((cost / recipe.price) * 100).toFixed(1)}%</b>
          </span>
          <span>
            السعر المقترح لتكلفة <span className="num">{TARGET_FOOD_COST * 100}%</span>: <b className="num text-base">{money(Math.ceil(cost / TARGET_FOOD_COST))}</b>
          </span>
        </div>
      </Card>
    </div>
  );
}
