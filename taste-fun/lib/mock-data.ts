// All data below is mocked for the UI demo. No backend is involved.
// Text shown to users is bilingual: `L` holds the Arabic and English versions.

export interface L {
  ar: string;
  en: string;
}

/** The same text in both languages, for proper names and user-typed values. */
export const both = (s: string): L => ({ ar: s, en: s });

export const UNITS = {
  kg: { ar: "كجم", en: "kg" },
  pcs: { ar: "قطعة", en: "pcs" },
} satisfies Record<string, L>;
export type Unit = keyof typeof UNITS;

export const BRANCH_IDS = ["qasr", "lulu"] as const;
export type BranchId = (typeof BRANCH_IDS)[number];
export type PerBranch<T> = Record<BranchId, T>;

export const SERIES_COLOR: PerBranch<string> = {
  qasr: "var(--color-series-1)",
  lulu: "var(--color-series-2)",
};

export interface Names {
  group: L;
  food: L;
  branches: PerBranch<L>;
}

export const DEFAULT_NAMES: Names = {
  group: { ar: "تيست آند فن", en: "Taste & Fun" },
  food: { ar: "مطبخ ريحانة · مطبخ الأسمنت", en: "Rayhana Kitchen · Al Asmant Kitchen" },
  branches: {
    qasr: { ar: "القصر الملكي", en: "Al Qasr Al Malaki" },
    lulu: { ar: "لؤلؤة بحري", en: "Lulu'at Bahri" },
  },
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

export const SALES_CHANNELS: { label: L; share: number }[] = [
  { label: { ar: "صالة · بطاقة", en: "Dine-in · Card" }, share: 0.54 },
  { label: { ar: "صالة · نقدي", en: "Dine-in · Cash" }, share: 0.21 },
  { label: { ar: "أوردرات خارجية", en: "External orders" }, share: 0.21 },
  { label: { ar: "كيتا", en: "Keeta" }, share: 0.02 },
  { label: { ar: "طلبات", en: "Talabat" }, share: 0.02 },
];

export const PAYMENT_METHODS: { label: L; share: number }[] = [
  { label: { ar: "بطاقة", en: "Card" }, share: 0.54 },
  { label: { ar: "نقدي", en: "Cash" }, share: 0.21 },
  { label: { ar: "أوردرات خارجية", en: "External orders" }, share: 0.21 },
  { label: { ar: "تطبيقات التوصيل", en: "Delivery apps" }, share: 0.04 },
];

export const LIVE_ORDER_CHANNELS: L[] = [
  { ar: "صالة · فيزا", en: "Dine-in · Visa" },
  { ar: "صالة · كاش", en: "Dine-in · Cash" },
  { ar: "طلبات", en: "Talabat" },
  { ar: "كيتا", en: "Keeta" },
  { ar: "أوردر خارجي", en: "External order" },
];

/* ------------------------------ P&L ------------------------------ */

export type Period = "today" | "week" | "month" | "year";

export const PERIODS: { id: Period; label: L; factor: number; change: number }[] = [
  { id: "today", label: { ar: "اليوم", en: "Today" }, factor: 1 / 30, change: 4.4 },
  { id: "week", label: { ar: "هذا الأسبوع", en: "This week" }, factor: 7 / 30, change: 3.2 },
  { id: "month", label: { ar: "هذا الشهر", en: "This month" }, factor: 1, change: 6.1 },
  { id: "year", label: { ar: "هذه السنة", en: "This year" }, factor: 12, change: 11.4 },
];

/** Cost structure per branch: salaries as a share of sales, rent as a fixed monthly amount. */
export const COST_MODEL: PerBranch<{ salaries: number; rentMonthly: number }> = {
  qasr: { salaries: 0.15, rentMonthly: 16000 },
  lulu: { salaries: 0.17, rentMonthly: 12000 },
};
export const UTILITIES_RATIO = 0.04;
export const COMMISSIONS_RATIO = 0.084;
export const OTHER_RATIO = 0.03;

export const TOP_ITEMS: { name: L; qty: number; price: number; margin: number }[] = [
  { name: { ar: "مشويات مشكلة", en: "Mixed grill" }, qty: 1180, price: 75, margin: 72 },
  { name: { ar: "كفتة مشوية", en: "Grilled kofta" }, qty: 1640, price: 34, margin: 58 },
  { name: { ar: "شيش طاووق", en: "Shish tawook" }, qty: 1320, price: 42, margin: 70 },
  { name: { ar: "جمبري مشوي", en: "Grilled shrimp" }, qty: 610, price: 70, margin: 75 },
  { name: { ar: "هامور مشوي", en: "Grilled hammour" }, qty: 540, price: 85, margin: 65 },
  { name: { ar: "شوربة عدس", en: "Lentil soup" }, qty: 190, price: 18, margin: 61 },
  { name: { ar: "سلطة سيزر", en: "Caesar salad" }, qty: 150, price: 29, margin: 52 },
  { name: { ar: "ورق عنب", en: "Stuffed vine leaves" }, qty: 120, price: 26, margin: 48 },
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

export const APPROVAL_TONE: Record<ApprovalType, "info" | "warning" | "neutral" | "danger"> = {
  purchase: "info",
  expense: "warning",
  discount: "danger",
  overtime: "neutral",
};

export interface Approval {
  id: number;
  type: ApprovalType;
  title: L;
  amount: number;
  branch: BranchId;
  requestedBy: L;
}

const MANAGER: L = { ar: "مدير المطعم", en: "Restaurant manager" };

export const INITIAL_APPROVALS: Approval[] = [
  { id: 1, type: "purchase", title: { ar: "لحم فرم برازيلي 120 كجم", en: "Brazilian minced beef 120 kg" }, amount: 3288, branch: "qasr", requestedBy: MANAGER },
  { id: 2, type: "expense", title: { ar: "صيانة خط الغاز الجديد", en: "New gas line maintenance" }, amount: 650, branch: "qasr", requestedBy: MANAGER },
  { id: 3, type: "discount", title: { ar: "خصم 25% على الطلب #4512", en: "25% discount on order #4512" }, amount: 120, branch: "lulu", requestedBy: { ar: "كاشير 2", en: "Cashier 2" } },
  { id: 4, type: "purchase", title: { ar: "جمبري طازج 40 كجم", en: "Fresh shrimp 40 kg" }, amount: 1520, branch: "lulu", requestedBy: MANAGER },
  { id: 5, type: "overtime", title: { ar: "6 ساعات إضافية يوم الجمعة", en: "6 hours overtime, Friday" }, amount: 180, branch: "lulu", requestedBy: MANAGER },
];

/** Expenses above this amount go to the owner for approval. */
export const EXPENSE_APPROVAL_LIMIT = 500;

/* ---------------------------- Custody ---------------------------- */

export const CUSTODY_CATEGORIES = {
  food: { ar: "مواد خام وأغذية", en: "Raw materials & food" },
  pack: { ar: "تغليف ومستلزمات تشغيل", en: "Packaging & supplies" },
  fuel: { ar: "محروقات وسيارات ومواصلات", en: "Fuel, cars & transport" },
  sal: { ar: "رواتب وسلف وحوافز", en: "Salaries, advances & bonuses" },
  rent: { ar: "إيجارات", en: "Rent" },
  util: { ar: "كهرباء ومياه وإنترنت", en: "Electricity, water & internet" },
  legal: { ar: "مصروفات قانونية", en: "Legal & government" },
  maint: { ar: "صيانة", en: "Maintenance" },
  supp: { ar: "دفعات موردين", en: "Supplier payments" },
  other: { ar: "أخرى", en: "Other" },
} satisfies Record<string, L>;
export type CustodyCategory = keyof typeof CUSTODY_CATEGORIES;

export const CUSTODY_FUNDING = { opening: 2099.75, bank: 5600, cash: 1224, owner: 400 };

export interface CustodyExpense {
  /** Supplier or person paid; a proper name, shown as written. */
  payee: string;
  description: L;
  invoiceNo: string;
  amount: number;
  category: CustodyCategory | "";
}

const PETROL: L = { ar: "بترول", en: "Petrol" };
const ORANGES: L = { ar: "برتقال", en: "Oranges" };

export const INITIAL_CUSTODY: CustodyExpense[] = [
  { payee: "البيان للغاز", description: { ar: "فاتورة قديمة بتاريخ 8/10", en: "Old invoice dated 8/10" }, invoiceNo: "5666", amount: 770, category: "" },
  { payee: "مؤسسة البرج للأدوات المنزلية", description: { ar: "معالق وشوك وسكاكين", en: "Spoons, forks and knives" }, invoiceNo: "112847", amount: 294, category: "" },
  { payee: "التألق لخدمات التنظيف", description: { ar: "آخر دفعة من راتب عاملي نظافة", en: "Last salary payment, 2 cleaners" }, invoiceNo: "9453", amount: 1176, category: "sal" },
  { payee: "سوق العوير", description: { ar: "خضروات", en: "Vegetables" }, invoiceNo: "8", amount: 433, category: "food" },
  { payee: "الشويهين لتأجير المواقف", description: { ar: "باركن سيارة دبي", en: "Car parking, Dubai" }, invoiceNo: "38052", amount: 8, category: "fuel" },
  { payee: "ملحمة الشاهد", description: { ar: "لحوم هندي", en: "Indian meat" }, invoiceNo: "4779", amount: 230, category: "food" },
  { payee: "مسافي", description: { ar: "فواكه مجمدة", en: "Frozen fruit" }, invoiceNo: "51571", amount: 100, category: "food" },
  { payee: "محسن رأفت", description: { ar: "دفعة من حسابه", en: "Payment on account" }, invoiceNo: "131", amount: 2000, category: "" },
  { payee: "برديس", description: { ar: "صيانة خط الغاز الجديد", en: "New gas line maintenance" }, invoiceNo: "130", amount: 200, category: "" },
  { payee: "أدنوك", description: PETROL, invoiceNo: "15303", amount: 100, category: "fuel" },
  { payee: "أدنوك", description: PETROL, invoiceNo: "15792", amount: 100, category: "fuel" },
  { payee: "أدنوك", description: PETROL, invoiceNo: "18555", amount: 50, category: "fuel" },
  { payee: "ماركة المدينة", description: ORANGES, invoiceNo: "904221", amount: 10, category: "food" },
  { payee: "ماركة المدينة", description: ORANGES, invoiceNo: "904212", amount: 10, category: "food" },
  { payee: "ماركة المدينة", description: { ar: "خبز لبناني", en: "Lebanese bread" }, invoiceNo: "904116", amount: 9, category: "food" },
  { payee: "ماركة المدينة", description: { ar: "ثلج", en: "Ice" }, invoiceNo: "904282", amount: 10, category: "food" },
  { payee: "القصر الملكي", description: { ar: "موصلات أوردر", en: "Order delivery" }, invoiceNo: "18423", amount: 5, category: "fuel" },
  { payee: "أحمد الذاكر", description: { ar: "دفعة من مستحقاته", en: "Payment from his dues" }, invoiceNo: "", amount: 400, category: "" },
];

/* ---------------------------- Supplier prices ---------------------------- */

export interface PriceRow {
  item: L;
  unit: Unit;
  supplier: string;
  last: number;
  avg3m: number;
  best: number;
  monthlyQty: number;
}

export const PRICE_ROWS: PriceRow[] = [
  { item: { ar: "لحم فرم برازيلي", en: "Brazilian minced beef" }, unit: "kg", supplier: "ملحمة الشاهد", last: 27.4, avg3m: 24.5, best: 25.1, monthlyQty: 420 },
  { item: { ar: "طماطم", en: "Tomatoes" }, unit: "kg", supplier: "سوق العوير", last: 4.2, avg3m: 3.4, best: 3.6, monthlyQty: 300 },
  { item: { ar: "سلندر غاز صغير", en: "Small gas cylinder" }, unit: "pcs", supplier: "البيان للغاز", last: 85.72, avg3m: 82, best: 82, monthlyQty: 13 },
  { item: { ar: "فحم", en: "Charcoal" }, unit: "kg", supplier: "الفرس الأسود للفحم", last: 5.38, avg3m: 5.2, best: 5.2, monthlyQty: 280 },
  { item: { ar: "جمبري طازج", en: "Fresh shrimp" }, unit: "kg", supplier: "Fresh Shrimp Trading", last: 38, avg3m: 36.5, best: 36.5, monthlyQty: 90 },
  { item: { ar: "أرز مصري", en: "Egyptian rice" }, unit: "kg", supplier: "مورد أرز", last: 3.96, avg3m: 3.9, best: 3.9, monthlyQty: 275 },
  { item: { ar: "ورق برنت 80×80", en: "Receipt paper 80×80" }, unit: "pcs", supplier: "الهلال", last: 125, avg3m: 125, best: 125, monthlyQty: 1 },
];

/** The same item bought at two prices by the two branches. */
export const GROUP_BUY = { item: { ar: "اللحم المفروم", en: "minced beef" } as L, qasrPrice: 27.4, luluPrice: 25.1, monthlyQty: 420 };

/* ---------------------------- Expenses ---------------------------- */

export const EXPENSE_CATEGORIES = {
  maint: { ar: "صيانة", en: "Maintenance" },
  util: { ar: "كهرباء وماء", en: "Utilities" },
  clean: { ar: "نظافة", en: "Cleaning" },
  gas: { ar: "غاز", en: "Gas" },
  mkt: { ar: "تسويق", en: "Marketing" },
  other: { ar: "أخرى", en: "Other" },
} satisfies Record<string, L>;
export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

export interface Expense {
  id: number;
  date: string; // dd/mm
  category: ExpenseCategory;
  note: L;
  branch: BranchId;
  amount: number;
  hasReceipt: boolean;
}

export const INITIAL_EXPENSES: Expense[] = [
  { id: 1, date: "12/10", category: "maint", note: { ar: "صيانة خط الغاز الجديد", en: "New gas line maintenance" }, branch: "qasr", amount: 200, hasReceipt: true },
  { id: 2, date: "12/10", category: "gas", note: { ar: "سلندرات غاز", en: "Gas cylinders" }, branch: "qasr", amount: 770, hasReceipt: true },
  { id: 3, date: "12/10", category: "other", note: { ar: "معالق وشوك وسكاكين", en: "Cutlery: spoons, forks, knives" }, branch: "qasr", amount: 294, hasReceipt: true },
  { id: 4, date: "11/10", category: "clean", note: { ar: "مواد تنظيف", en: "Cleaning supplies" }, branch: "lulu", amount: 145, hasReceipt: true },
  { id: 5, date: "10/10", category: "util", note: { ar: "فاتورة المياه", en: "Water bill" }, branch: "lulu", amount: 410, hasReceipt: true },
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

const MONTHLY: L = { ar: "شهري", en: "Monthly" };

export const RECURRING_EXPENSES: { label: L; amount: number; every: L; next: string }[] = [
  { label: { ar: "إيجار", en: "Rent" }, amount: 22000, every: MONTHLY, next: "01/11" },
  { label: { ar: "إنترنت", en: "Internet" }, amount: 1197, every: MONTHLY, next: "05/11" },
  { label: { ar: "كهرباء وماء", en: "Utilities" }, amount: 4200, every: MONTHLY, next: "15/10" },
  { label: { ar: "مكافحة حشرات", en: "Pest control" }, amount: 450, every: { ar: "ربع سنوي", en: "Quarterly" }, next: "01/12" },
];

/* ---------------------------- Inventory ---------------------------- */

export interface StockItem {
  name: L;
  unit: Unit;
  /** Minimum level and current stock, in location order: warehouse, then BRANCH_IDS. */
  par: [number, number, number];
  stock: [number, number, number];
}

export const SHRIMP: L = { ar: "جمبري طازج", en: "Fresh shrimp" };

export const INITIAL_STOCK: StockItem[] = [
  { name: { ar: "لحم فرم برازيلي", en: "Brazilian minced beef" }, unit: "kg", par: [150, 30, 10], stock: [180, 6, 12] },
  { name: { ar: "صدور دجاج", en: "Chicken breast" }, unit: "kg", par: [120, 25, 15], stock: [140, 22, 9] },
  { name: SHRIMP, unit: "kg", par: [40, 5, 15], stock: [30, 4, 3] },
  { name: { ar: "أرز مصري", en: "Egyptian rice" }, unit: "kg", par: [300, 50, 40], stock: [275, 38, 31] },
  { name: { ar: "طماطم", en: "Tomatoes" }, unit: "kg", par: [100, 25, 15], stock: [60, 7, 12] },
  { name: { ar: "فحم", en: "Charcoal" }, unit: "kg", par: [300, 60, 30], stock: [280, 45, 8] },
  { name: { ar: "سلندر غاز صغير", en: "Small gas cylinder" }, unit: "pcs", par: [10, 4, 3], stock: [6, 3, 1] },
  { name: { ar: "علب تغليف", en: "Takeaway boxes" }, unit: "pcs", par: [3000, 500, 400], stock: [2600, 420, 150] },
];

/** Stock below this share of the minimum level counts as low. */
export const LOW_STOCK_RATIO = 0.35;

/* ---------------------------- Purchasing ---------------------------- */

export type POStatus = "draft" | "sent" | "received";

export interface PurchaseOrder {
  id: string;
  supplier: string;
  due: L;
  total: number;
  status: POStatus;
}

export const TOMORROW: L = { ar: "غدًا", en: "Tomorrow" };

export const INITIAL_POS: PurchaseOrder[] = [
  { id: "PO-1042", supplier: "ملحمة الشاهد", due: { ar: "اليوم 14:00", en: "Today 14:00" }, total: 2860, status: "sent" },
  { id: "PO-1041", supplier: "سوق العوير", due: { ar: "اليوم 09:30", en: "Today 09:30" }, total: 433, status: "received" },
  { id: "PO-1043", supplier: "الفرس الأسود للفحم", due: TOMORROW, total: 1505, status: "draft" },
];

/** Draft orders created by "create orders for low stock". */
export const LOW_STOCK_ORDERS = [
  { supplier: "ملحمة الشاهد", total: 1240 },
  { supplier: "سوق العوير", total: 860 },
  { supplier: "الفرس الأسود للفحم", total: 640 },
];

export const SUPPLIERS: { name: string; type: L; spend: number; onTime: number }[] = [
  { name: "ملحمة الشاهد", type: { ar: "لحوم", en: "Meat" }, spend: 18400, onTime: 96 },
  { name: "سوق العوير", type: { ar: "خضار وفواكه", en: "Vegetables & fruit" }, spend: 6665, onTime: 99 },
  { name: "الفرس الأسود للفحم", type: { ar: "فحم", en: "Charcoal" }, spend: 1580, onTime: 91 },
  { name: "البيان للغاز", type: { ar: "غاز", en: "Gas" }, spend: 1170, onTime: 94 },
];

/* ---------------------------- Menu costing ---------------------------- */

export interface Recipe {
  name: L;
  price: number;
  /** [ingredient, quantity, unit, unit cost] */
  ingredients: [L, number, Unit, number][];
}

const ing = (ar: string, en: string): L => ({ ar, en });
const CHARCOAL = ing("فحم", "Charcoal");
const RICE = ing("أرز مصري", "Egyptian rice");
const SAYADEYA = ing("أرز صيادية", "Sayadeya rice");
const SALAD = ing("سلطة", "Salad");

export const RECIPES: Recipe[] = [
  {
    name: ing("كفتة مشوية", "Grilled kofta"),
    price: 34,
    ingredients: [
      [ing("لحم فرم برازيلي", "Brazilian minced beef"), 0.3, "kg", 27.4],
      [ing("بصل وبقدونس", "Onion & parsley"), 0.05, "kg", 6],
      [ing("بهارات", "Spices"), 0.01, "kg", 45],
      [CHARCOAL, 0.15, "kg", 5.38],
      [RICE, 0.2, "kg", 3.96],
      [ing("خبز وسلطة", "Bread & salad"), 1, "pcs", 1.2],
    ],
  },
  {
    name: ing("مشويات مشكلة", "Mixed grill"),
    price: 75,
    ingredients: [
      [ing("كباب لحم", "Lamb kebab"), 0.2, "kg", 48],
      [ing("شيش طاووق", "Shish tawook"), 0.15, "kg", 22],
      [ing("كفتة", "Kofta"), 0.15, "kg", 27.4],
      [CHARCOAL, 0.25, "kg", 5.38],
      [RICE, 0.2, "kg", 3.96],
      [ing("سلطات", "Salads"), 1, "pcs", 2],
    ],
  },
  {
    name: ing("هامور مشوي", "Grilled hammour"),
    price: 85,
    ingredients: [
      [ing("هامور", "Hammour"), 0.45, "kg", 55],
      [ing("ليمون وبهارات", "Lemon & spices"), 1, "pcs", 0.5],
      [SAYADEYA, 0.25, "kg", 4.5],
      [SALAD, 1, "pcs", 2],
      [CHARCOAL, 0.2, "kg", 5.38],
    ],
  },
  {
    name: ing("جمبري مشوي", "Grilled shrimp"),
    price: 70,
    ingredients: [
      [SHRIMP, 0.35, "kg", 38],
      [ing("زبدة وثوم", "Butter & garlic"), 0.03, "kg", 30],
      [SAYADEYA, 0.25, "kg", 4.5],
      [SALAD, 1, "pcs", 2],
    ],
  },
  {
    name: ing("شيش طاووق", "Shish tawook"),
    price: 42,
    ingredients: [
      [ing("صدور دجاج", "Chicken breast"), 0.3, "kg", 22],
      [ing("تتبيلة", "Marinade"), 0.04, "kg", 18],
      [CHARCOAL, 0.15, "kg", 5.38],
      [RICE, 0.2, "kg", 3.96],
      [ing("خبز وثومية", "Bread & garlic sauce"), 1, "pcs", 1.4],
    ],
  },
];

export const TARGET_FOOD_COST = 0.3;

/* ---------------------------- Central kitchens ---------------------------- */

export type DeliveryStatus = "delivered" | "dispatched" | "preparing";

export interface KitchenDelivery {
  time: string;
  /** A branch id for deliveries to our restaurants, otherwise the outside client's name. */
  client: BranchId | L;
  items: L;
  amount: number;
  status: DeliveryStatus;
}

const CORPORATE: L = { ar: "عميل تموين شركات", en: "Corporate catering client" };
const PRIVATE_EVENT: L = { ar: "مناسبة خاصة", en: "Private event" };

export const KITCHEN_DELIVERIES: KitchenDelivery[] = [
  { time: "07:30", client: "qasr", items: { ar: "كفتة متبلة 40 كجم، صوصات", en: "Marinated kofta 40 kg, sauces" }, amount: 2140, status: "delivered" },
  { time: "08:15", client: "lulu", items: { ar: "سمك متبل 25 كجم، أرز صيادية", en: "Marinated fish 25 kg, sayadeya rice" }, amount: 1860, status: "delivered" },
  { time: "12:00", client: CORPORATE, items: { ar: "وجبات موظفين ×120", en: "Staff meals ×120" }, amount: 3600, status: "dispatched" },
  { time: "19:00", client: PRIVATE_EVENT, items: { ar: "بوفيه 60 شخص", en: "Buffet, 60 guests" }, amount: 4800, status: "preparing" },
];

export const KITCHEN_INVOICES: { id: string; client: L; amount: number; ageDays: number }[] = [
  { id: "INV-2207", client: CORPORATE, amount: 12400, ageDays: 12 },
  { id: "INV-2211", client: PRIVATE_EVENT, amount: 3150, ageDays: 5 },
  { id: "INV-2189", client: { ar: "تموين معسكر إنشاءات", en: "Construction camp catering" }, amount: 6800, ageDays: 38 },
];

/* ---------------------------- Phase 2 previews ---------------------------- */

export type StaffStatus = "present" | "late" | "off";

export const STAFF: { name: L; role: L; branch: BranchId; shift: string; status: StaffStatus }[] = [
  { name: { ar: "رامي", en: "Rami" }, role: { ar: "مدير", en: "Manager" }, branch: "qasr", shift: "10:00–22:00", status: "present" },
  { name: { ar: "سناء", en: "Sana" }, role: { ar: "مديرة", en: "Manager" }, branch: "lulu", shift: "11:00–23:00", status: "present" },
  { name: { ar: "جوزيف", en: "Joseph" }, role: { ar: "كاشير", en: "Cashier" }, branch: "qasr", shift: "14:00–00:00", status: "late" },
  { name: { ar: "علي", en: "Ali" }, role: { ar: "شيف", en: "Chef" }, branch: "lulu", shift: "10:00–20:00", status: "present" },
  { name: { ar: "ماريا", en: "Maria" }, role: { ar: "ويتر", en: "Waiter" }, branch: "lulu", shift: "07:00–15:00", status: "off" },
];

/** Counted minus system stock at Al Qasr for the first five inventory items. */
export const STOCK_COUNT_DIFFS = [0, -2, -1.5, 0, -0.5];
export const WASTE_THIS_MONTH = 1840;
export const MONTHLY_TARGETS: PerBranch<number> = { qasr: 110000, lulu: 85000 };
