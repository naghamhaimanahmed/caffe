"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth, ROLES, type Role } from "@/lib/auth";
import { Brand } from "./Brand";
import { cn } from "@/lib/format";

export interface Tab<T extends string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

/**
 * Mobile-first layout: compact header + bottom tab bar, content in a
 * max-width container. `width` widens the container for tablet-oriented roles.
 */
export function MobileShell<T extends string>({
  role,
  tabs,
  active,
  onTab,
  width = "md",
  children,
}: {
  role: Role;
  tabs: Tab<T>[];
  active: T;
  onTab: (id: T) => void;
  width?: "md" | "2xl" | "3xl";
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const info = ROLES[role];
  const container = width === "md" ? "max-w-md" : width === "2xl" ? "max-w-2xl" : "max-w-3xl";

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className={cn("mx-auto flex h-16 items-center gap-3 px-4", container)}>
          <Brand compact />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-slate-900">{info.user}</div>
            <div className="truncate text-xs text-slate-500">
              {info.label} · {info.scope}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-200"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
      </header>

      <main className={cn("mx-auto px-4 py-5", container)}>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className={cn("mx-auto grid", container)} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition",
                active === t.id ? "text-brand-600" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {active === t.id && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand-600" />}
              <span className="relative [&>svg]:size-[22px]">
                {t.icon}
                {t.badge ? (
                  <span className="num absolute -top-1.5 -end-2.5 min-w-4 rounded-full bg-red-500 px-1 text-[10px] leading-4 text-white">
                    {t.badge}
                  </span>
                ) : null}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
