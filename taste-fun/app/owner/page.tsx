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

const dateFmt = new Intl.DateTimeFormat("ar-AE-u-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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
  const [tab, setTab] = useState<TabId>("overview");
  const [sheet, setSheet] = useState<"summary" | "customize" | null>(null);

  const nav: (NavItem & { id: TabId })[] = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard /> },
    { id: "reports", label: "التقارير", icon: <BarChart3 /> },
    { id: "closing", label: "التقفيل اليومي", icon: <ClipboardList /> },
    { id: "custody", label: "العهدة اليومية", icon: <Wallet /> },
    { id: "approvals", label: "الاعتمادات", icon: <ClipboardCheck />, badge: approvals.length },
    { id: "prices", label: "أسعار الموردين", icon: <TrendingUp /> },
    { id: "expenses", label: "المصروفات", icon: <Receipt /> },
    { id: "inventory", label: "المخزون", icon: <Package /> },
    { id: "menu", label: "تكلفة المنيو", icon: <UtensilsCrossed /> },
    { id: "purchasing", label: "الموردين والطلبات", icon: <ShoppingCart /> },
    { id: "kitchens", label: "المطابخ المركزية", icon: <Truck /> },
    { id: "alerts", label: "التنبيهات", icon: <Bell />, badge: alerts.length },
    { id: "staff", label: "الموظفين والشيفتات", icon: <Users />, phase2: true },
    { id: "stockcount", label: "الجرد والهدر", icon: <ListChecks />, phase2: true },
    { id: "targets", label: "الأهداف الشهرية", icon: <Target />, phase2: true },
  ];

  const navigate = (id: string) => {
    setTab(id as TabId);
    window.scrollTo({ top: 0 });
  };

  const current = nav.find((n) => n.id === tab)!;
  const title = tab === "kitchens" ? names.food : current.label;

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
      subtitle={`${dateFmt.format(new Date())} · ${names.group}`}
      alertsCount={alerts.length}
      onAlerts={() => navigate("alerts")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            مباشر
          </span>
          <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 md:inline">بيانات تجريبية</span>
          <Button size="sm" variant="secondary" onClick={() => setSheet("summary")}>
            <MessageCircle className="size-4" />
            الملخص اليومي
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSheet("customize")}>
            <PencilLine className="size-4" />
            تخصيص الأسماء
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
            <button onClick={dismissToast} className="ms-2 text-slate-400 hover:text-white" aria-label="إغلاق">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </DesktopShell>
  );
}
