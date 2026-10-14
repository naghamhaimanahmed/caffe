"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BRANCH_IDS,
  buildHistory,
  DEFAULT_NAMES,
  EXPENSE_APPROVAL_LIMIT,
  EXPENSE_CATEGORIES,
  FOOD_COST,
  FOOD_COST_LIMIT,
  FOOD_COST_OVER_AMOUNT,
  GROUP_BUY,
  INITIAL_APPROVALS,
  INITIAL_BILLS,
  INITIAL_CLOSINGS,
  INITIAL_CUSTODY,
  INITIAL_EXPENSES,
  INITIAL_POS,
  INITIAL_STOCK,
  LIVE_ORDER_CHANNELS,
  LOW_STOCK_ORDERS,
  LOW_STOCK_RATIO,
  TODAY_START,
  type Approval,
  type BranchClosing,
  type BranchId,
  type CustodyCategory,
  type CustodyExpense,
  type Expense,
  type ExpenseCategory,
  type Names,
  type PerBranch,
  type PurchaseOrder,
  type StockItem,
  type SupplierBill,
  type TodayFigures,
} from "./mock-data";
import { CURRENCY, fmt } from "./format";

export type TabId =
  | "overview"
  | "reports"
  | "closing"
  | "custody"
  | "approvals"
  | "prices"
  | "expenses"
  | "inventory"
  | "menu"
  | "purchasing"
  | "kitchens"
  | "alerts"
  | "staff"
  | "stockcount"
  | "targets";

export interface LiveOrder {
  no: number;
  branch: BranchId;
  amount: number;
  channel: string;
  time: string;
  fresh: boolean;
}

export interface Alert {
  severity: "bad" | "warn";
  text: string;
  branch: BranchId | null;
  time: string;
  goTo: TabId;
}

const timeNow = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const money = (n: number) => `${fmt(Math.round(n))} ${CURRENCY}`;

export function isLow(item: StockItem, loc: number) {
  return item.stock[loc] < item.par[loc] * LOW_STOCK_RATIO;
}

function randomOrder(no: number, fresh: boolean): LiveOrder {
  return {
    no,
    branch: Math.random() < 0.58 ? "qasr" : "lulu",
    amount: Math.round(28 + Math.random() * 140),
    channel: LIVE_ORDER_CHANNELS[Math.floor(Math.random() * LIVE_ORDER_CHANNELS.length)],
    time: timeNow(),
    fresh,
  };
}

function useOwnerState() {
  const [names, setNames] = useState<Names>(DEFAULT_NAMES);
  const [history] = useState(() => buildHistory(new Date()));
  const [today, setToday] = useState<TodayFigures>(TODAY_START);
  const [feed, setFeed] = useState<LiveOrder[]>(() => Array.from({ length: 7 }, (_, i) => randomOrder(4636 - i, false)));
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [closings, setClosings] = useState<PerBranch<BranchClosing>>(INITIAL_CLOSINGS);
  const [custody, setCustody] = useState<CustodyExpense[]>(INITIAL_CUSTODY);
  const [custodyApproved, setCustodyApproved] = useState(false);
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [bills, setBills] = useState<SupplierBill[]>(INITIAL_BILLS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const nextOrderNo = useRef(4637);

  const notify = useCallback((msg: string) => setToastMsg(msg), []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // A new POS order arrives every few seconds and is added to today's figures.
  useEffect(() => {
    const id = setInterval(() => {
      const order = randomOrder(nextOrderNo.current++, true);
      setFeed((f) => [order, ...f.map((o) => ({ ...o, fresh: false }))].slice(0, 12));
      setToday((t) => ({
        ...t,
        sales: { ...t.sales, [order.branch]: t.sales[order.branch] + order.amount },
        orders: { ...t.orders, [order.branch]: t.orders[order.branch] + 1 },
      }));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const decideApproval = useCallback(
    (id: number, approved: boolean) => {
      setApprovals((list) => list.filter((a) => a.id !== id));
      notify(approved ? "تم الاعتماد" : "تم الرفض");
    },
    [notify],
  );

  const updateClosing = useCallback((branch: BranchId, patch: Partial<BranchClosing>) => {
    setClosings((c) => ({ ...c, [branch]: { ...c[branch], ...patch } }));
  }, []);

  const setCustodyCategory = useCallback((index: number, category: CustodyCategory | "") => {
    setCustody((list) => list.map((e, i) => (i === index ? { ...e, category } : e)));
    setCustodyApproved(false);
  }, []);

  const approveCustody = useCallback(() => {
    setCustodyApproved(true);
    notify("تم اعتماد تقرير العهدة");
  }, [notify]);

  const transferStock = useCallback(
    (itemIndex: number, loc: number) => {
      const item = stock[itemIndex];
      const need = Math.max(0, Math.round(item.par[loc] * 1.1 - item.stock[loc]));
      const moved = Math.min(need, item.stock[0]);
      setStock((list) =>
        list.map((it, i) => {
          if (i !== itemIndex) return it;
          const s = [...it.stock] as StockItem["stock"];
          s[0] -= moved;
          s[loc] += moved;
          return { ...it, stock: s };
        }),
      );
      notify(`تم التحويل من المستودع: ${fmt(moved)} ${item.unit} ${item.name}`);
    },
    [stock, notify],
  );

  const createLowStockOrders = useCallback(() => {
    setOrders((list) => {
      let next = Math.max(...list.map((o) => Number(o.id.slice(3)))) + 1;
      const created = LOW_STOCK_ORDERS.map((o) => ({ id: `PO-${next++}`, supplier: o.supplier, due: "غدًا", total: o.total, status: "draft" as const }));
      return [...created, ...list];
    });
    notify(`تم إنشاء ${LOW_STOCK_ORDERS.length} طلبات شراء للأصناف المنخفضة`);
  }, [notify]);

  const sendOrder = useCallback(
    (id: string) => {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: "sent" } : o)));
      notify("تم إرسال الطلب للمورد بالإيميل والواتساب");
    },
    [notify],
  );

  const receiveOrder = useCallback(
    (id: string) => {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: "received" } : o)));
      // Receiving restocks the branches that were low.
      setStock((list) =>
        list.map((it) => ({
          ...it,
          stock: it.stock.map((s, loc) => (loc > 0 && s < it.par[loc] * LOW_STOCK_RATIO ? Math.round(it.par[loc] * 1.05) : s)) as StockItem["stock"],
        })),
      );
      notify("تم الاستلام وتحديث المخزون");
    },
    [notify],
  );

  const addExpense = useCallback(
    (e: Omit<Expense, "id" | "date">) => {
      const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
      setExpenses((list) => [{ ...e, id: Date.now(), date }, ...list]);
      if (e.amount > EXPENSE_APPROVAL_LIMIT) {
        setApprovals((list) => [
          ...list,
          { id: Date.now(), type: "expense", title: e.note || EXPENSE_CATEGORIES[e.category as ExpenseCategory], amount: e.amount, branch: e.branch, requestedBy: "المالك" },
        ]);
        notify(`تمت إضافة المصروف، وأكثر من ${EXPENSE_APPROVAL_LIMIT} درهم فأُرسل للاعتماد`);
      } else {
        notify("تمت إضافة المصروف");
      }
    },
    [notify],
  );

  const markBillPaid = useCallback(
    (index: number) => {
      setBills((list) => list.map((b, i) => (i === index ? { ...b, paid: true } : b)));
      notify("تم تسجيل الدفع");
    },
    [notify],
  );

  const lowStockCount = useMemo(() => stock.reduce((n, it) => n + [0, 1, 2].filter((loc) => isLow(it, loc)).length, 0), [stock]);
  const uncategorized = useMemo(() => custody.filter((e) => !e.category), [custody]);

  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = [
      {
        severity: "bad",
        text: `تكلفة الأغذية ${FOOD_COST.qasr}% في ${names.branches.qasr} هذا الشهر (الحد ${FOOD_COST_LIMIT}%): ${money(FOOD_COST_OVER_AMOUNT)} فوق الحد`,
        branch: "qasr",
        time: "08:00",
        goTo: "reports",
      },
      { severity: "bad", text: "المورد رفع السعر: لحم فرم برازيلي +11.8% (ملحمة الشاهد)", branch: "qasr", time: "10:20", goTo: "prices" },
    ];
    if (uncategorized.length) {
      const sum = uncategorized.reduce((a, e) => a + e.amount, 0);
      list.push({ severity: "warn", text: `${uncategorized.length} مصروفات في العهدة بدون بند (${money(sum)})`, branch: "qasr", time: "23:05", goTo: "custody" });
    }
    for (const b of BRANCH_IDS) {
      const c = closings[b];
      if (c.state !== "approved" && c.variance && c.variance < 0)
        list.push({ severity: "warn", text: `عجز نقدي ${money(-c.variance)} في التقفيل`, branch: b, time: "23:12", goTo: "closing" });
    }
    stock.forEach((it) =>
      BRANCH_IDS.forEach((b, i) => {
        if (it.name === "جمبري طازج" && isLow(it, i + 1))
          list.push({ severity: "warn", text: `${it.name} أقل من الحد الأدنى: باقي ${it.stock[i + 1]} ${it.unit}`, branch: b, time: "18:05", goTo: "inventory" });
      }),
    );
    list.push({
      severity: "warn",
      text: `نفس الصنف بسعرين: ${GROUP_BUY.item} ${GROUP_BUY.qasrPrice.toFixed(2)} مقابل ${GROUP_BUY.luluPrice.toFixed(2)} درهم بين الفرعين`,
      branch: null,
      time: "09:00",
      goTo: "prices",
    });
    return list;
  }, [names, uncategorized, closings, stock]);

  return {
    names,
    setNames,
    history,
    today,
    feed,
    approvals,
    decideApproval,
    closings,
    updateClosing,
    custody,
    custodyApproved,
    setCustodyCategory,
    approveCustody,
    stock,
    transferStock,
    createLowStockOrders,
    orders,
    sendOrder,
    receiveOrder,
    expenses,
    addExpense,
    bills,
    markBillPaid,
    lowStockCount,
    uncategorized,
    alerts,
    notify,
    toastMsg,
    dismissToast: () => setToastMsg(null),
  };
}

export type OwnerStore = ReturnType<typeof useOwnerState>;

const OwnerContext = createContext<OwnerStore | null>(null);

export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const store = useOwnerState();
  return <OwnerContext.Provider value={store}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error("useOwner must be used inside <OwnerProvider>");
  return ctx;
}

