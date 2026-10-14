import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/format";

export function Brand({ compact, inverted }: { compact?: boolean; inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <UtensilsCrossed className="size-5" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className={cn("text-sm font-bold", inverted ? "text-white" : "text-slate-900")}>تيست آند فن</div>
          <div className={cn("text-[11px]", inverted ? "text-slate-400" : "text-slate-500")}>
            التشغيل والتحكم بالتكاليف
          </div>
        </div>
      )}
    </div>
  );
}
