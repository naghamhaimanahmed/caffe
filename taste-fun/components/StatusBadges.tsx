"use client";

import { CheckCircle2, Clock, CircleDashed, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "./ui";
import type { ClosingState } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export function ClosingStateBadge({ state }: { state: ClosingState }) {
  const { t } = useI18n();
  switch (state) {
    case "approved":
      return <Badge tone="success" icon={<CheckCircle2 className="size-3.5" />}>{t("closing.approved")}</Badge>;
    case "submitted":
      return <Badge tone="warning" icon={<Clock className="size-3.5" />}>{t("closing.submitted")}</Badge>;
    default:
      return <Badge tone="danger" icon={<CircleDashed className="size-3.5" />}>{t("closing.notSubmitted")}</Badge>;
  }
}

/** Matched / short / over, with the amount for a difference. */
export function VarianceBadge({ variance }: { variance: number }) {
  const { t, money } = useI18n();
  if (Math.abs(variance) < 1) return <Badge tone="success" icon={<CheckCircle2 className="size-3.5" />}>{t("var.matched")}</Badge>;
  if (variance < 0)
    return (
      <Badge tone="danger" icon={<TrendingDown className="size-3.5" />}>
        {t("var.short", { amount: money(-variance) })}
      </Badge>
    );
  return (
    <Badge tone="warning" icon={<TrendingUp className="size-3.5" />}>
      {t("var.over", { amount: money(variance) })}
    </Badge>
  );
}
