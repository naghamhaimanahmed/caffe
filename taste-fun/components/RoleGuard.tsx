"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

/**
 * Renders children only for the allowed role. Any other (or missing) role is
 * sent back to the login page, so each role's area stays isolated.
 */
export function RoleGuard({ allow, children }: { allow: Role; children: React.ReactNode }) {
  const { role, ready } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const permitted = ready && role === allow;

  useEffect(() => {
    if (ready && role !== allow) router.replace("/");
  }, [ready, role, allow, router]);

  if (!permitted) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        {t("app.checkingAccess")}
      </div>
    );
  }

  return <>{children}</>;
}
