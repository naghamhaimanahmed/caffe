"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { useAuth, ROLES, type Role } from "@/lib/auth";
import { Brand } from "./Brand";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/format";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  /** Shown under a "Phase 2" heading as a preview of planned modules. */
  phase2?: boolean;
}

/** Desktop-first layout: fixed side navigation + top bar. Collapses to a top bar on small screens. */
export function DesktopShell({
  role,
  nav,
  active,
  onNavigate,
  title,
  subtitle,
  actions,
  alertsCount,
  onAlerts,
  children,
}: {
  role: Role;
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  alertsCount?: number;
  onAlerts?: () => void;
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const { t, tr } = useI18n();
  const router = useRouter();
  const info = ROLES[role];

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen lg:ps-64">
      {/* Sidebar (start side = right in RTL) */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-slate-800 bg-slate-900 lg:flex">
        <div className="px-5 py-5">
          <Brand inverted />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-slate-500">{t("app.menu")}</p>
          {nav.map((item, i) => (
            <div key={item.id}>
              {item.phase2 && !nav[i - 1]?.phase2 && (
                <p className="px-3 pb-2 pt-4 text-[11px] font-semibold tracking-wide text-slate-500">{t("app.phase2")}</p>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active === item.id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                )}
              >
                <span className="[&>svg]:size-[18px]">{item.icon}</span>
                <span className="flex-1 text-start">{item.label}</span>
                {item.badge ? (
                  <span className="num rounded-full bg-red-500 px-2 py-0.5 text-[11px] text-white">{item.badge}</span>
                ) : null}
                {item.phase2 && <span className="rounded bg-amber-400/15 px-1.5 text-[10px] font-bold text-amber-300">P2</span>}
              </button>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {tr(info.user).charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{tr(info.user)}</div>
              <div className="truncate text-xs text-slate-400">
                {t(info.label)} · {t(info.scope)}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="size-[18px]" />
            {t("app.logout")}
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="min-w-0 flex-1 basis-44">
            <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>}
          </div>
          {actions}
          <LanguageToggle />
          <button
            onClick={onAlerts}
            className="relative flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label={t("app.alerts")}
          >
            <Bell className="size-5" />
            {alertsCount ? (
              <span className="num absolute -top-0.5 end-0 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-white">
                {alertsCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={handleLogout}
            className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <LogOut className="size-4" />
            {t("app.logout")}
          </button>
        </div>
        {/* Mobile nav strip */}
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                active === item.id ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600",
              )}
            >
              <span className="[&>svg]:size-4">{item.icon}</span>
              {item.label}
              {item.badge ? <span className="num rounded-full bg-red-500 px-1.5 text-[10px] text-white">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
