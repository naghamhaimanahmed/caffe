"use client";

import { Bell, CheckCircle2 } from "lucide-react";
import { useOwner, type TabId } from "@/lib/owner-store";
import { cn } from "@/lib/format";
import { Button, Card, CardHeader, EmptyState } from "../ui";
import { BranchDot } from "./common";

export function AlertsTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { names, alerts } = useOwner();

  return (
    <Card>
      <CardHeader icon={<Bell className="size-5" />} title="التنبيهات" subtitle="كل تنبيه يفتح الصفحة اللي تحتاج تتصرف فيها." />
      {alerts.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="size-6" />} title="لا توجد تنبيهات" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {alerts.map((a, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  a.severity === "bad" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700",
                )}
                aria-label={a.severity === "bad" ? "مهم" : "تنبيه"}
              >
                {a.severity === "bad" ? "!" : "•"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{a.text}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  {a.branch ? (
                    <>
                      <BranchDot branch={a.branch} />
                      {names.branches[a.branch]}
                    </>
                  ) : (
                    names.group
                  )}
                  <span>·</span>
                  <span className="num">{a.time}</span>
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onNavigate(a.goTo)}>
                عرض
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
