"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Crown, ShieldCheck } from "lucide-react";
import { ROLES, useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_NAMES } from "@/lib/mock-data";
import { Brand } from "@/components/Brand";
import { LanguageToggle } from "@/components/LanguageToggle";
import { cn } from "@/lib/format";

const ROLE_ORDER: { role: Role; icon: React.ReactNode; accent: string }[] = [
  { role: "owner", icon: <Crown />, accent: "bg-amber-50 text-amber-700" },
];

export default function LoginPage() {
  const { login, role: activeRole, ready } = useAuth();
  const { t, tr, isRtl } = useI18n();
  const router = useRouter();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const handleLogin = (role: Role) => {
    login(role);
    router.push(ROLES[role].route);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-10 text-white lg:flex lg:w-[42%] lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px circle at 85% 10%, rgba(42,120,214,.45), transparent 60%), radial-gradient(500px circle at 10% 90%, rgba(235,104,52,.25), transparent 60%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <Brand inverted />
          <LanguageToggle dark />
        </div>
        <div className="relative mt-10 lg:mt-0">
          <h1 className="text-3xl font-bold leading-snug lg:text-4xl">
            {t("login.hero1")}
            <br />
            {t("login.hero2")}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            {t("login.heroText", { a: tr(DEFAULT_NAMES.branches.qasr), b: tr(DEFAULT_NAMES.branches.lulu) })}
          </p>
          <dl className="mt-8 hidden grid-cols-3 gap-4 lg:grid">
            {[
              ["2", t("login.statBranches")],
              ["14", t("login.statHistory")],
              ["24/7", t("login.statLive")],
            ].map(([v, l]) => (
              <div key={v} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="num text-2xl font-bold">{v}</dt>
                <dd className="mt-1 text-xs text-slate-400">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="relative mt-10 hidden text-xs text-slate-500 lg:block">{t("login.footer")}</p>
      </section>

      {/* Role picker */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <ShieldCheck className="size-3.5" />
              {t("login.badge")}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t("login.title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
          </div>

          <div className="space-y-3">
            {ROLE_ORDER.map(({ role, icon, accent }) => {
              const info = ROLES[role];
              const isActive = ready && activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => handleLogin(role)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-500",
                    isActive ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200",
                  )}
                >
                  <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl [&>svg]:size-6", accent)}>
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-900">{t("login.as", { role: t(info.label) })}</span>
                      {isActive && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          {t("login.current")}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{t(info.description)}</p>
                    <p className="mt-1 text-xs text-slate-400">{t("login.optimized", { user: tr(info.user) })}</p>
                  </div>
                  <Arrow className="size-5 shrink-0 text-slate-300 transition group-hover:text-brand-600" />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
