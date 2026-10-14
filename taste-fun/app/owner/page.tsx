"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Package,
  PencilLine,
  Receipt,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { DesktopShell, type NavItem } from "@/components/DesktopShell";
import { Button } from "@/components/ui";
import { OwnerProvider, useOwner, type TabId } from "@/lib/owner-store";
import { useI18n } from "@/lib/i18n";
import { OverviewTab } from "@/components/owner/OverviewTab";
import { ReportsTab } from "@/components/owner/ReportsTab";
import { ClosingTab } from "@/components/owner/ClosingTab";
import { CustodyTab } from "@/components/owner/CustodyTab";
import { ApprovalsTab } from "@/components/owner/ApprovalsTab";
import { PricesTab } from "@/components/owner/PricesTab";
import { ExpensesTab } from "@/components/owner/ExpensesTab";
import { InventoryTab } from "@/components/owner/InventoryTab";
import { MenuTab } from "@/components/owner/MenuTab";
import { PurchasingTab } from "@/components/owner/PurchasingTab";
import { KitchensTab } from "@/components/owner/KitchensTab";
import { AlertsTab } from "@/components/owner/AlertsTab";
import { StaffTab, StockCountTab, TargetsTab } from "@/components/owner/Phase2Tabs";
import { CustomizeSheet, SummarySheet } from "@/components/owner/Sheets";

export default function OwnerPage() {
  return (
    <RoleGuard allow="owner">
      <OwnerProvider>
        <OwnerConsole />
      </OwnerProvider>
    </RoleGuard>
  );
}

function OwnerConsole() {
  const store = useOwner();
  const { names, approvals, alerts, toastMsg, dismissToast } = store;
  const { t, tr, locale } = useI18n();
  const dateFmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const [tab, setTab] = useState<TabId>("overview");
  const [sheet, setSheet] = useState<"summary" | "customize" | null>(null);

  const nav: (NavItem & { id: TabId })[] = [
    { id: "overview", label: t("nav.overview"), icon: <LayoutDashboard /> },
    { id: "reports", label: t("nav.reports"), icon: <BarChart3 /> },
    { id: "closing", label: t("nav.closing"), icon: <ClipboardList /> },
    { id: "custody", label: t("nav.custody"), icon: <Wallet /> },
    { id: "approvals", label: t("nav.approvals"), icon: <ClipboardCheck />, badge: approvals.length },
    { id: "prices", label: t("nav.prices"), icon: <TrendingUp /> },
    { id: "expenses", label: t("nav.expenses"), icon: <Receipt /> },
    { id: "inventory", label: t("nav.inventory"), icon: <Package /> },
    { id: "menu", label: t("nav.menu"), icon: <UtensilsCrossed /> },
    { id: "purchasing", label: t("nav.purchasing"), icon: <ShoppingCart /> },
    { id: "kitchens", label: t("nav.kitchens"), icon: <Truck /> },
    { id: "alerts", label: t("nav.alerts"), icon: <Bell />, badge: alerts.length },
    { id: "staff", label: t("nav.staff"), icon: <Users />, phase2: true },
    { id: "stockcount", label: t("nav.stockcount"), icon: <ListChecks />, phase2: true },
    { id: "targets", label: t("nav.targets"), icon: <Target />, phase2: true },
  ];

  const navigate = (id: string) => {
    setTab(id as TabId);
    window.scrollTo({ top: 0 });
  };

  const current = nav.find((n) => n.id === tab)!;
  const title = tab === "kitchens" ? tr(names.food) : current.label;

  const content: Record<TabId, React.ReactNode> = {
    overview: <OverviewTab onNavigate={navigate} />,
    reports: <ReportsTab />,
    closing: <ClosingTab />,
    custody: <CustodyTab />,
    approvals: <ApprovalsTab />,
    prices: <PricesTab />,
    expenses: <ExpensesTab />,
    inventory: <InventoryTab onNavigate={navigate} />,
    menu: <MenuTab />,
    purchasing: <PurchasingTab />,
    kitchens: <KitchensTab />,
    alerts: <AlertsTab onNavigate={navigate} />,
    staff: <StaffTab />,
    stockcount: <StockCountTab />,
    targets: <TargetsTab />,
  };

  return (
    <DesktopShell
      role="owner"
      nav={nav}
      active={tab}
      onNavigate={navigate}
      title={title}
      subtitle={`${dateFmt.format(new Date())} · ${tr(names.group)}`}
      alertsCount={alerts.length}
      onAlerts={() => navigate("alerts")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("app.live")}
          </span>
          <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 md:inline">{t("app.sampleData")}</span>
          <Button size="sm" variant="secondary" onClick={() => setSheet("summary")}>
            <MessageCircle className="size-4" />
            {t("app.dailySummary")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSheet("customize")}>
            <PencilLine className="size-4" />
            {t("app.customize")}
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-[1400px]">{content[tab]}</div>

      {sheet === "summary" && <SummarySheet onClose={() => setSheet(null)} />}
      {sheet === "customize" && <CustomizeSheet onClose={() => setSheet(null)} />}

      {toastMsg && (
        <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4" role="status">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            {toastMsg}
            <button onClick={dismissToast} className="ms-2 text-slate-400 hover:text-white" aria-label={t("app.close")}>
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </DesktopShell>
  );
}
