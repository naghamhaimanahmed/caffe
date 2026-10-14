import { AlertTriangle, CheckCircle2, Clock, TrendingDown, TrendingUp, CircleDashed } from "lucide-react";
import { Badge } from "./ui";
import type { ClosingStatus } from "@/lib/mock-data";

export function ClosingBadge({ status }: { status: ClosingStatus }) {
  switch (status) {
    case "matched":
      return <Badge tone="success" icon={<CheckCircle2 className="size-3.5" />}>مطابق</Badge>;
    case "short":
      return <Badge tone="danger" icon={<TrendingDown className="size-3.5" />}>عجز</Badge>;
    case "over":
      return <Badge tone="warning" icon={<TrendingUp className="size-3.5" />}>زيادة</Badge>;
    case "pending":
      return <Badge tone="info" icon={<Clock className="size-3.5" />}>بانتظار الإغلاق</Badge>;
    default:
      return <Badge icon={<CircleDashed className="size-3.5" />}>لم يبدأ</Badge>;
  }
}

export function TrendPill({ value, inverse }: { value: number; inverse?: boolean }) {
  // inverse: a rise is bad (e.g. cost %)
  const good = inverse ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      <Icon className="size-3.5" />
      <span className="num">
        {value > 0 ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    </span>
  );
}

export function WarnIcon() {
  return <AlertTriangle className="size-4 text-amber-500" />;
}
