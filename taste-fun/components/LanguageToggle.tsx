"use client";

import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/format";

const OPTIONS: { value: Lang; label: string; name: string }[] = [
  { value: "ar", label: "ع", name: "العربية" },
  { value: "en", label: "EN", name: "English" },
];

export function LanguageToggle({ dark }: { dark?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("app.language")}
      className={cn("inline-flex overflow-hidden rounded-lg ring-1", dark ? "ring-white/20" : "ring-slate-200")}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.value}
          title={o.name}
          aria-pressed={lang === o.value}
          onClick={() => setLang(o.value)}
          className={cn(
            "h-8 min-w-10 px-2.5 text-xs font-semibold transition",
            lang === o.value
              ? dark
                ? "bg-white text-slate-900"
                : "bg-slate-900 text-white"
              : dark
                ? "text-slate-300 hover:bg-white/10"
                : "bg-white text-slate-500 hover:bg-slate-50",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
