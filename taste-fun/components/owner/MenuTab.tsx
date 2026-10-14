"use client";

import { useState } from "react";
import { ChefHat, UtensilsCrossed } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { RECIPES, TARGET_FOOD_COST, UNITS, type Recipe } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/format";
import { Badge, Card, CardHeader } from "../ui";
import { Table, Td, Th } from "./common";

const recipeCost = (r: Recipe) => r.ingredients.reduce((a, [, qty, , unitCost]) => a + qty * unitCost, 0);

export function MenuTab() {
  const { t, tr, money } = useI18n();
  const [selected, setSelected] = useState(0);
  const recipe = RECIPES[selected];
  const cost = recipeCost(recipe);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader icon={<UtensilsCrossed className="size-5" />} title={t("mn.title")} subtitle={t("mn.hint")} />
        <Table
          minWidth={420}
          head={
            <>
              <Th>{t("mn.dish")}</Th>
              <Th end>{t("mn.price")}</Th>
              <Th end>{t("mn.cost")}</Th>
              <Th end>{t("mn.margin")}</Th>
            </>
          }
        >
          {RECIPES.map((r, i) => {
            const c = recipeCost(r);
            const margin = Math.round((1 - c / r.price) * 100);
            return (
              <tr
                key={r.name.en}
                onClick={() => setSelected(i)}
                className={cn("cursor-pointer hover:bg-slate-50", i === selected && "bg-brand-50 hover:bg-brand-50")}
                aria-selected={i === selected}
              >
                <Td className="font-semibold text-slate-900">{tr(r.name)}</Td>
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
        <CardHeader icon={<ChefHat className="size-5" />} title={tr(recipe.name)} subtitle={t("mn.sellPrice", { amount: money(recipe.price) })} />
        <Table
          minWidth={360}
          head={
            <>
              <Th>{t("mn.ingredient")}</Th>
              <Th end>{t("mn.qty")}</Th>
              <Th end>{t("mn.cost")}</Th>
            </>
          }
        >
          {recipe.ingredients.map(([name, qty, unit, unitCost]) => (
            <tr key={name.en}>
              <Td>{tr(name)}</Td>
              <Td end>
                <span className="num">{qty}</span> <span className="text-xs text-slate-500">{tr(UNITS[unit])}</span>
              </Td>
              <Td end className="num">{fmt(qty * unitCost, 2)}</Td>
            </tr>
          ))}
          <tr className="font-semibold">
            <Td>{t("mn.cost")}</Td>
            <Td />
            <Td end className="num">{fmt(cost, 2)}</Td>
          </tr>
        </Table>
        <div className="m-5 flex flex-wrap justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <span>
            {t("mn.foodCost")}: <b className="num text-base">{((cost / recipe.price) * 100).toFixed(1)}%</b>
          </span>
          <span>
            {t("mn.suggest", { pct: TARGET_FOOD_COST * 100 })}: <b className="num text-base">{money(Math.ceil(cost / TARGET_FOOD_COST))}</b>
          </span>
        </div>
      </Card>
    </div>
  );
}
