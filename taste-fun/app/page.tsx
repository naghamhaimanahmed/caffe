"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { ROLES, useAuth, type Role } from "@/lib/auth";
import { Brand } from "@/components/Brand";
import { cn } from "@/lib/format";

const ROLE_ORDER: { role: Role; icon: React.ReactNode; accent: string; device: string }[] = [
  { role: "owner", icon: <Crown />, accent: "bg-amber-50 text-amber-700", device: "سطح المكتب" },
];

export default function LoginPage() {
  const { login, role: activeRole, ready } = useAuth();
  const router = useRouter();

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
        <div className="relative">
          <Brand inverted />
        </div>
        <div className="relative mt-10 lg:mt-0">
          <h1 className="text-3xl font-bold leading-snug lg:text-4xl">
            تحكّم كامل بالتشغيل
            <br />
            والتكاليف في كل فروعك
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            مبيعات الفروع وحالة الإغلاق اليومي والموافقات في لوحة واحدة لفرعي
            القصر الملكي ولؤلؤة بحري.
          </p>
          <dl className="mt-8 hidden grid-cols-3 gap-4 lg:grid">
            {[
              ["2", "فروع متصلة"],
              ["14", "يومًا من سجل المبيعات"],
              ["24/7", "رقابة لحظية"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="num text-2xl font-bold">{v}</dt>
                <dd className="mt-1 text-xs text-slate-400">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="relative mt-10 hidden text-xs text-slate-500 lg:block">© 2026 تيست آند فن · نسخة عرض تجريبية</p>
      </section>

      {/* Role picker */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <ShieldCheck className="size-3.5" />
              بيئة عرض — بدون كلمة مرور
            </div>
            <h2 className="text-2xl font-bold text-slate-900">تسجيل الدخول</h2>
            <p className="mt-1 text-sm text-slate-500">ادخل إلى لوحة المالك لمتابعة الفرعين.</p>
          </div>

          <div className="space-y-3">
            {ROLE_ORDER.map(({ role, icon, accent, device }) => {
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
                      <span className="text-base font-semibold text-slate-900">الدخول كـ {info.label}</span>
                      <span className="text-xs text-slate-400">{info.english}</span>
                      {isActive && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          الجلسة الحالية
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{info.description}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {info.user} · مُحسّن لـ{device}
                    </p>
                  </div>
                  <ArrowLeft className="size-5 shrink-0 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-brand-600" />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
