import { CheckCircle2, Clock, CircleDashed, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "./ui";
import type { ClosingState } from "@/lib/mock-data";
import { money } from "@/lib/owner-store";

export function ClosingStateBadge({ state }: { state: ClosingState }) {
  switch (state) {
    case "approved":
      return <Badge tone="success" icon={<CheckCircle2 className="size-3.5" />}>معتمد</Badge>;
    case "submitted":
      return <Badge tone="warning" icon={<Clock className="size-3.5" />}>بانتظار الاعتماد</Badge>;
    default:
      return <Badge tone="danger" icon={<CircleDashed className="size-3.5" />}>لم يُرسل</Badge>;
  }
}

/** Matched / short / over, with the amount for a difference. */
export function VarianceBadge({ variance }: { variance: number }) {
  if (Math.abs(variance) < 1) return <Badge tone="success" icon={<CheckCircle2 className="size-3.5" />}>مطابق</Badge>;
  if (variance < 0)
    return (
      <Badge tone="danger" icon={<TrendingDown className="size-3.5" />}>
        عجز <span className="num">{money(-variance)}</span>
      </Badge>
    );
  return (
    <Badge tone="warning" icon={<TrendingUp className="size-3.5" />}>
      زيادة <span className="num">{money(variance)}</span>
    </Badge>
  );
}
