// All data below is mocked for the UI demo. No backend is involved.

export const BRANCH_IDS = ["qasr", "lulu"] as const;
export type BranchId = (typeof BRANCH_IDS)[number];
export type PerBranch<T> = Record<BranchId, T>;

export const SERIES_COLOR: PerBranch<string> = {
  qasr: "var(--color-series-1)",
  lulu: "var(--color-series-2)",
};

export interface Names {
  group: string;
  food: string;
  branches: PerBranch<string>;
}

export const DEFAULT_NAMES: Names = {
  group: "تيست آند فن",
  food: "مطبخ ريحانة · مطبخ الأسمنت",
  branches: { qasr: "القصر الملكي", lulu: "لؤلؤة بحري" },
};

/* ------------------------------ Sales ------------------------------ */

export interface DailySales {
  date: string; // ISO yyyy-mm-dd
  qasr: number;
  lulu: number;
}

/** Typical daily sales per branch, used to size progress bars and generate history. */
export const BASE_DAILY: PerBranch<number> = { qasr: 3420, lulu: 2750 };

/** The 13 days before `today`, with a weekly pattern (weekends busier). Deterministic. */
export function buildHistory(today: Date): DailySales[] {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const days = 13;
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - i));
    return d;
  });
  const series = BRANCH_IDS.map((b) =>
    dates.map((d) => {
      const weekday = [1.0, 0.92, 0.95, 1.02, 1.18, 1.32, 1.12][d.getDay()];
      return Math.round(BASE_DAILY[b] * weekday * (0.9 + rnd() * 0.2));
    }),
  );
  return dates.map((d, i) => ({ date: isoDate(d), qasr: series[0][i], lulu: series[1][i] }));
}

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface TodayFigures {
  sales: PerBranch<number>;
  orders: PerBranch<number>;
  yesterdaySameTime: PerBranch<number>;
}

export const TODAY_START: TodayFigures = {
  sales: { qasr: 3910, lulu: 2640 },
  orders: { qasr: 61, lulu: 44 },
  yesterdaySameTime: { qasr: 3696, lulu: 2510 },
};

export const FOOD_COST: PerBranch<number> = { qasr: 45.5, lulu: 38.2 };
export const FOOD_COST_LIMIT = 35;
export const FOOD_COST_RANGE = "28–35%";
export const FOOD_COST_OVER_AMOUNT = 10811;

export const SALES_CHANNELS = [
  { label: "صالة · بطاقة", share: 0.54 },
  { label: "صالة · نقدي", share: 0.21 },
  { label: "أوردرات خارجية", share: 0.21 },
  { label: "كيتا", share: 0.02 },
  { label: "طلبات", share: 0.02 },
];

export const PAYMENT_METHODS = [
  { label: "بطاقة", share: 0.54 },
  { label: "نقدي", share: 0.21 },
  { label: "أوردرات خارجية", share: 0.21 },
  { label: "تطبيقات التوصيل", share: 0.04 },
];

export const LIVE_ORDER_CHANNELS = ["صالة · فيزا", "صالة · كاش", "طلبات", "كيتا", "أوردر خارجي"];

/* ------------------------------ P&L ------------------------------ */

export type Period = "today" | "week" | "month" | "year";

export const PERIODS: { id: Period; label: string; factor: number; change: number }[] = [
  { id: "today", label: "اليوم", factor: 1 / 30, change: 4.4 },
  { id: "week", label: "هذا الأسبوع", factor: 7 / 30, change: 3.2 },
  { id: "month", label: "هذا الشهر", factor: 1, change: 6.1 },
  { id: "year", label: "هذه السنة", factor: 12, change: 11.4 },
];

/** Cost structure per branch: salaries as a share of sales, rent as a fixed monthly amount. */
export const COST_MODEL: PerBranch<{ salaries: number; rentMonthly: number }> = {
  qasr: { salaries: 0.15, rentMonthly: 16000 },
  lulu: { salaries: 0.17, rentMonthly: 12000 },
};
export const UTILITIES_RATIO = 0.04;
export const COMMISSIONS_RATIO = 0.084;
export const OTHER_RATIO = 0.03;

export const TOP_ITEMS = [
  { name: "مشويات مشكلة", qty: 1180, price: 75, margin: 72 },
  { name: "كفتة مشوية", qty: 1640, price: 34, margin: 58 },
  { name: "شيش طاووق", qty: 1320, price: 42, margin: 70 },
  { name: "جمبري مشوي", qty: 610, price: 70, margin: 75 },
  { name: "هامور مشوي", qty: 540, price: 85, margin: 65 },
  { name: "شوربة عدس", qty: 190, price: 18, margin: 61 },
  { name: "سلطة سيزر", qty: 150, price: 29, margin: 52 },
  { name: "ورق عنب", qty: 120, price: 26, margin: 48 },
];
/** The last N entries of TOP_ITEMS are the slowest sellers. */
export const SLOW_SELLERS = 3;

/* ---------------------------- Closing ---------------------------- */

export type ClosingState = "submitted" | "approved" | "notSubmitted";

export interface BranchClosing {
  state: ClosingState;
  variance: number | null;
}

export const INITIAL_CLOSINGS: PerBranch<BranchClosing> = {
  qasr: { state: "submitted", variance: -35 },
  lulu: { state: "approved", variance: 0 },
};

/** Share of a day's POS total by channel, used to pre-fill the closing form. Cash is the remainder. */
export const CLOSING_SPLIT = { card: 0.54, talabat: 0.02, keeta: 0.02, external: 0.21 };

/* ---------------------------- Approvals ---------------------------- */

export type ApprovalType = "purchase" | "expense" | "discount" | "overtime";

export const APPROVAL_TYPE: Record<ApprovalType, { label: string; tone: "info" | "warning" | "neutral" | "danger" }> = {
  purchase: { label: "شراء", tone: "info" },
  expense: { label: "مصروف", tone: "warning" },
  discount: { label: "خصم", tone: "danger" },
  overtime: { label: "ساعات إضافية", tone: "neutral" },
};

export interface Approval {
  id: number;
  type: ApprovalType;
  title: string;
  amount: number;
  branch: BranchId;
  requestedBy: string;
}

export const INITIAL_APPROVALS: Approval[] = [
  { id: 1, type: "purchase", title: "لحم فرم برازيلي 120 كجم", amount: 3288, branch: "qasr", requestedBy: "مدير المطعم" },
  { id: 2, type: "expense", title: "صيانة خط الغاز الجديد", amount: 650, branch: "qasr", requestedBy: "مدير المطعم" },
  { id: 3, type: "discount", title: "خصم 25% على الطلب #4512", amount: 120, branch: "lulu", requestedBy: "كاشير 2" },
  { id: 4, type: "purchase", title: "جمبري طازج 40 كجم", amount: 1520, branch: "lulu", requestedBy: "مدير المطعم" },
  { id: 5, type: "overtime", title: "6 ساعات إضافية يوم الجمعة", amount: 180, branch: "lulu", requestedBy: "مدير المطعم" },
];

/** Expenses above this amount go to the owner for approval. */
export const EXPENSE_APPROVAL_LIMIT = 500;

/* ---------------------------- Custody ---------------------------- */

export const CUSTODY_CATEGORIES = {
  food: "مواد خام وأغذية",
  pack: "تغليف ومستلزمات تشغيل",
  fuel: "محروقات وسيارات ومواصلات",
  sal: "رواتب وسلف وحوافز",
  rent: "إيجارات",
  util: "كهرباء ومياه وإنترنت",
  legal: "مصروفات قانونية",
  maint: "صيانة",
  supp: "دفعات موردين",
  other: "أخرى",
} as const;
export type CustodyCategory = keyof typeof CUSTODY_CATEGORIES;

export const CUSTODY_FUNDING = { opening: 2099.75, bank: 5600, cash: 1224, owner: 400 };

export interface CustodyExpense {
  payee: string;
  description: string;
  invoiceNo: string;
  amount: number;
  category: CustodyCategory | "";
}

export const INITIAL_CUSTODY: CustodyExpense[] = [
  { payee: "البيان للغاز", description: "فاتورة قديمة بتاريخ 8/10", invoiceNo: "5666", amount: 770, category: "" },
  { payee: "مؤسسة البرج للأدوات المنزلية", description: "معالق وشوك وسكاكين", invoiceNo: "112847", amount: 294, category: "" },
  { payee: "التألق لخدمات التنظيف", description: "آخر دفعة من راتب عاملي نظافة", invoiceNo: "9453", amount: 1176, category: "sal" },
  { payee: "سوق العوير", description: "خضروات", invoiceNo: "8", amount: 433, category: "food" },
  { payee: "الشويهين لتأجير المواقف", description: "باركن سيارة دبي", invoiceNo: "38052", amount: 8, category: "fuel" },
  { payee: "ملحمة الشاهد", description: "لحوم هندي", invoiceNo: "4779", amount: 230, category: "food" },
  { payee: "مسافي", description: "فواكه مجمدة", invoiceNo: "51571", amount: 100, category: "food" },
  { payee: "محسن رأفت", description: "دفعة من حسابه", invoiceNo: "131", amount: 2000, category: "" },
  { payee: "برديس", description: "صيانة خط الغاز الجديد", invoiceNo: "130", amount: 200, category: "" },
  { payee: "أدنوك", description: "بترول", invoiceNo: "15303", amount: 100, category: "fuel" },
  { payee: "أدنوك", description: "بترول", invoiceNo: "15792", amount: 100, category: "fuel" },
  { payee: "أدنوك", description: "بترول", invoiceNo: "18555", amount: 50, category: "fuel" },
  { payee: "ماركة المدينة", description: "برتقال", invoiceNo: "904221", amount: 10, category: "food" },
  { payee: "ماركة المدينة", description: "برتقال", invoiceNo: "904212", amount: 10, category: "food" },
  { payee: "ماركة المدينة", description: "خبز لبناني", invoiceNo: "904116", amount: 9, category: "food" },
  { payee: "ماركة المدينة", description: "ثلج", invoiceNo: "904282", amount: 10, category: "food" },
  { payee: "القصر الملكي", description: "موصلات أوردر", invoiceNo: "18423", amount: 5, category: "fuel" },
  { payee: "أحمد الذاكر", description: "دفعة من مستحقاته", invoiceNo: "", amount: 400, category: "" },
];

/* ---------------------------- Supplier prices ---------------------------- */

export interface PriceRow {
  item: string;
  unit: string;
  supplier: string;
  last: number;
  avg3m: number;
  best: number;
  monthlyQty: number;
}

export const PRICE_ROWS: PriceRow[] = [
  { item: "لحم فرم برازيلي", unit: "كجم", supplier: "ملحمة الشاهد", last: 27.4, avg3m: 24.5, best: 25.1, monthlyQty: 420 },
  { item: "طماطم", unit: "كجم", supplier: "سوق العوير", last: 4.2, avg3m: 3.4, best: 3.6, monthlyQty: 300 },
  { item: "سلندر غاز صغير", unit: "قطعة", supplier: "البيان للغاز", last: 85.72, avg3m: 82, best: 82, monthlyQty: 13 },
  { item: "فحم", unit: "كجم", supplier: "الفرس الأسود للفحم", last: 5.38, avg3m: 5.2, best: 5.2, monthlyQty: 280 },
  { item: "جمبري طازج", unit: "كجم", supplier: "Fresh Shrimp Trading", last: 38, avg3m: 36.5, best: 36.5, monthlyQty: 90 },
  { item: "أرز مصري", unit: "كجم", supplier: "مورد أرز", last: 3.96, avg3m: 3.9, best: 3.9, monthlyQty: 275 },
  { item: "ورق برنت 80×80", unit: "قطعة", supplier: "الهلال", last: 125, avg3m: 125, best: 125, monthlyQty: 1 },
];

/** The same item bought at two prices by the two branches. */
export const GROUP_BUY = { item: "اللحم المفروم", qasrPrice: 27.4, luluPrice: 25.1, monthlyQty: 420 };

/* ---------------------------- Expenses ---------------------------- */

export const EXPENSE_CATEGORIES = {
  maint: "صيانة",
  util: "كهرباء وماء",
  clean: "نظافة",
  gas: "غاز",
  mkt: "تسويق",
  other: "أخرى",
} as const;
export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

export interface Expense {
  id: number;
  date: string; // dd/mm
  category: ExpenseCategory;
  note: string;
  branch: BranchId;
  amount: number;
  hasReceipt: boolean;
}

export const INITIAL_EXPENSES: Expense[] = [
  { id: 1, date: "12/10", category: "maint", note: "صيانة خط الغاز الجديد", branch: "qasr", amount: 200, hasReceipt: true },
  { id: 2, date: "12/10", category: "gas", note: "سلندرات غاز", branch: "qasr", amount: 770, hasReceipt: true },
  { id: 3, date: "12/10", category: "other", note: "معالق وشوك وسكاكين", branch: "qasr", amount: 294, hasReceipt: true },
  { id: 4, date: "11/10", category: "clean", note: "مواد تنظيف", branch: "lulu", amount: 145, hasReceipt: true },
  { id: 5, date: "10/10", category: "util", note: "فاتورة المياه", branch: "lulu", amount: 410, hasReceipt: true },
];

export interface SupplierBill {
  supplier: string;
  amount: number;
  dueInDays: number;
  paid: boolean;
}

export const INITIAL_BILLS: SupplierBill[] = [
  { supplier: "ملحمة الشاهد", amount: 6200, dueInDays: 2, paid: false },
  { supplier: "البيان للغاز", amount: 1170, dueInDays: 0, paid: false },
  { supplier: "محسن رأفت", amount: 2000, dueInDays: -3, paid: false },
];

export const RECURRING_EXPENSES = [
  { label: "إيجار", amount: 22000, every: "شهري", next: "01/11" },
  { label: "إنترنت", amount: 1197, every: "شهري", next: "05/11" },
  { label: "كهرباء وماء", amount: 4200, every: "شهري", next: "15/10" },
  { label: "مكافحة حشرات", amount: 450, every: "ربع سنوي", next: "01/12" },
];

/* ---------------------------- Inventory ---------------------------- */

export interface StockItem {
  name: string;
  unit: string;
  /** Minimum level and current stock, in location order: warehouse, then BRANCH_IDS. */
  par: [number, number, number];
  stock: [number, number, number];
}

export const INITIAL_STOCK: StockItem[] = [
  { name: "لحم فرم برازيلي", unit: "كجم", par: [150, 30, 10], stock: [180, 6, 12] },
  { name: "صدور دجاج", unit: "كجم", par: [120, 25, 15], stock: [140, 22, 9] },
  { name: "جمبري طازج", unit: "كجم", par: [40, 5, 15], stock: [30, 4, 3] },
  { name: "أرز مصري", unit: "كجم", par: [300, 50, 40], stock: [275, 38, 31] },
  { name: "طماطم", unit: "كجم", par: [100, 25, 15], stock: [60, 7, 12] },
  { name: "فحم", unit: "كجم", par: [300, 60, 30], stock: [280, 45, 8] },
  { name: "سلندر غاز صغير", unit: "قطعة", par: [10, 4, 3], stock: [6, 3, 1] },
  { name: "علب تغليف", unit: "قطعة", par: [3000, 500, 400], stock: [2600, 420, 150] },
];

/** Stock below this share of the minimum level counts as low. */
export const LOW_STOCK_RATIO = 0.35;

/* ---------------------------- Purchasing ---------------------------- */

export type POStatus = "draft" | "sent" | "received";

export interface PurchaseOrder {
  id: string;
  supplier: string;
  due: string;
  total: number;
  status: POStatus;
}

export const INITIAL_POS: PurchaseOrder[] = [
  { id: "PO-1042", supplier: "ملحمة الشاهد", due: "اليوم 14:00", total: 2860, status: "sent" },
  { id: "PO-1041", supplier: "سوق العوير", due: "اليوم 09:30", total: 433, status: "received" },
  { id: "PO-1043", supplier: "الفرس الأسود للفحم", due: "غدًا", total: 1505, status: "draft" },
];

/** Draft orders created by "create orders for low stock". */
export const LOW_STOCK_ORDERS = [
  { supplier: "ملحمة الشاهد", total: 1240 },
  { supplier: "سوق العوير", total: 860 },
  { supplier: "الفرس الأسود للفحم", total: 640 },
];

export const SUPPLIERS = [
  { name: "ملحمة الشاهد", type: "لحوم", spend: 18400, onTime: 96 },
  { name: "سوق العوير", type: "خضار وفواكه", spend: 6665, onTime: 99 },
  { name: "الفرس الأسود للفحم", type: "فحم", spend: 1580, onTime: 91 },
  { name: "البيان للغاز", type: "غاز", spend: 1170, onTime: 94 },
];

/* ---------------------------- Menu costing ---------------------------- */

export interface Recipe {
  name: string;
  price: number;
  /** [ingredient, quantity, unit, unit cost] */
  ingredients: [string, number, string, number][];
}

export const RECIPES: Recipe[] = [
  {
    name: "كفتة مشوية",
    price: 34,
    ingredients: [
      ["لحم فرم برازيلي", 0.3, "كجم", 27.4],
      ["بصل وبقدونس", 0.05, "كجم", 6],
      ["بهارات", 0.01, "كجم", 45],
      ["فحم", 0.15, "كجم", 5.38],
      ["أرز مصري", 0.2, "كجم", 3.96],
      ["خبز وسلطة", 1, "قطعة", 1.2],
    ],
  },
  {
    name: "مشويات مشكلة",
    price: 75,
    ingredients: [
      ["كباب لحم", 0.2, "كجم", 48],
      ["شيش طاووق", 0.15, "كجم", 22],
      ["كفتة", 0.15, "كجم", 27.4],
      ["فحم", 0.25, "كجم", 5.38],
      ["أرز مصري", 0.2, "كجم", 3.96],
      ["سلطات", 1, "قطعة", 2],
    ],
  },
  {
    name: "هامور مشوي",
    price: 85,
    ingredients: [
      ["هامور", 0.45, "كجم", 55],
      ["ليمون وبهارات", 1, "قطعة", 0.5],
      ["أرز صيادية", 0.25, "كجم", 4.5],
      ["سلطة", 1, "قطعة", 2],
      ["فحم", 0.2, "كجم", 5.38],
    ],
  },
  {
    name: "جمبري مشوي",
    price: 70,
    ingredients: [
      ["جمبري طازج", 0.35, "كجم", 38],
      ["زبدة وثوم", 0.03, "كجم", 30],
      ["أرز صيادية", 0.25, "كجم", 4.5],
      ["سلطة", 1, "قطعة", 2],
    ],
  },
  {
    name: "شيش طاووق",
    price: 42,
    ingredients: [
      ["صدور دجاج", 0.3, "كجم", 22],
      ["تتبيلة", 0.04, "كجم", 18],
      ["فحم", 0.15, "كجم", 5.38],
      ["أرز مصري", 0.2, "كجم", 3.96],
      ["خبز وثومية", 1, "قطعة", 1.4],
    ],
  },
];

export const TARGET_FOOD_COST = 0.3;

/* ---------------------------- Central kitchens ---------------------------- */

export type DeliveryStatus = "delivered" | "dispatched" | "preparing";

export interface KitchenDelivery {
  time: string;
  /** A branch id for deliveries to our restaurants, otherwise the outside client's name. */
  client: BranchId | string;
  items: string;
  amount: number;
  status: DeliveryStatus;
}

export const KITCHEN_DELIVERIES: KitchenDelivery[] = [
  { time: "07:30", client: "qasr", items: "كفتة متبلة 40 كجم، صوصات", amount: 2140, status: "delivered" },
  { time: "08:15", client: "lulu", items: "سمك متبل 25 كجم، أرز صيادية", amount: 1860, status: "delivered" },
  { time: "12:00", client: "عميل تموين شركات", items: "وجبات موظفين ×120", amount: 3600, status: "dispatched" },
  { time: "19:00", client: "مناسبة خاصة", items: "بوفيه 60 شخص", amount: 4800, status: "preparing" },
];

export const KITCHEN_INVOICES = [
  { id: "INV-2207", client: "عميل تموين شركات", amount: 12400, ageDays: 12 },
  { id: "INV-2211", client: "مناسبة خاصة", amount: 3150, ageDays: 5 },
  { id: "INV-2189", client: "تموين معسكر إنشاءات", amount: 6800, ageDays: 38 },
];

/* ---------------------------- Phase 2 previews ---------------------------- */

export type StaffStatus = "present" | "late" | "off";

export const STAFF: { name: string; role: string; branch: BranchId; shift: string; status: StaffStatus }[] = [
  { name: "رامي", role: "مدير", branch: "qasr", shift: "10:00–22:00", status: "present" },
  { name: "سناء", role: "مديرة", branch: "lulu", shift: "11:00–23:00", status: "present" },
  { name: "جوزيف", role: "كاشير", branch: "qasr", shift: "14:00–00:00", status: "late" },
  { name: "علي", role: "شيف", branch: "lulu", shift: "10:00–20:00", status: "present" },
  { name: "ماريا", role: "ويتر", branch: "lulu", shift: "07:00–15:00", status: "off" },
];

/** Counted minus system stock at Al Qasr for the first five inventory items. */
export const STOCK_COUNT_DIFFS = [0, -2, -1.5, 0, -0.5];
export const WASTE_THIS_MONTH = 1840;
export const MONTHLY_TARGETS: PerBranch<number> = { qasr: 110000, lulu: 85000 };
