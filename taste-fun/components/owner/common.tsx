"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { SERIES_COLOR, type BranchId } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import { Badge } from "../ui";
import { useI18n } from "@/lib/i18n";

/** Headline figure tile. `hero` is the dark lead tile; `alert` outlines a figure that needs attention. */
export function Kpi({
  label,
  value,
  footer,
  hero,
  alert,
  valueClass,
  onClick,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  footer?: React.ReactNode;
  hero?: boolean;
  alert?: boolean;
  valueClass?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-xl border p-5 shadow-sm",
        hero ? "border-transparent bg-slate-900 text-white" : "border-slate-200 bg-white",
        alert && "border-red-300 ring-1 ring-red-300",
        onClick && "cursor-pointer transition hover:shadow-md",
      )}
    >
      <span className={cn("text-sm font-medium", hero ? "text-slate-300" : "text-slate-500")}>{label}</span>
      <span className={cn("num text-[28px] font-bold leading-tight tracking-tight", hero ? "text-white" : "text-slate-900", valueClass)}>
        {value}
      </span>
      {footer && <div className={cn("flex flex-wrap items-center gap-1.5 text-xs", hero ? "text-slate-300" : "text-slate-500")}>{footer}</div>}
    </div>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</section>;
}

export function BranchDot({ branch }: { branch: BranchId }) {
  return <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: SERIES_COLOR[branch] }} />;
}

export function Bar({ ratio, color, className }: { ratio: number; color: string; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-slate-100", className)}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, background: color }} />
    </div>
  );
}

/** Table with the app's header and row styling; scrolls sideways inside its card on narrow screens. */
export function Table({ head, children, minWidth = 640 }: { head: React.ReactNode; children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">{head}</tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-slate-100 [&>tr:last-child]:border-0">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children, end }: { children?: React.ReactNode; end?: boolean }) {
  return <th className={cn("whitespace-nowrap px-4 py-2.5 font-medium", end ? "text-end" : "text-start")}>{children}</th>;
}

export function Td({ children, end, className }: { children?: React.ReactNode; end?: boolean; className?: string }) {
  return <td className={cn("px-4 py-3", end && "text-end", className)}>{children}</td>;
}

export function Notice({ tone, children }: { tone: "danger" | "success" | "warning"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium",
        tone === "danger" && "bg-red-50 text-red-700",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-800",
      )}
    >
      {children}
    </div>
  );
}

export function Phase2Banner() {
  const { t } = useI18n();
  return (
    <Notice tone="warning">
      <Badge tone="warning">{t("app.phase2")}</Badge>
      {t("p2.banner")}
    </Notice>
  );
}

export function Modal({ title, onClose, children, width = 520 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label={t("app.close")}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
