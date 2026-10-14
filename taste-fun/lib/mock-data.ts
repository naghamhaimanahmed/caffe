// All data below is mocked for the UI demo. No backend is involved.

export const BRANCHES = {
  qasr: "القصر الملكي",
  lulu: "لؤلؤة بحري",
} as const;
export type BranchId = keyof typeof BRANCHES;

/* ---------------------------- Owner ---------------------------- */

export interface DailySales {
  date: string; // ISO yyyy-mm-dd
  qasr: number;
  lulu: number;
}

export const SALES_14_DAYS: DailySales[] = [
  { date: "2026-10-01", qasr: 24150, lulu: 18420 },
  { date: "2026-10-02", qasr: 27890, lulu: 21360 },
  { date: "2026-10-03", qasr: 31420, lulu: 25880 },
  { date: "2026-10-04", qasr: 29760, lulu: 24110 },
  { date: "2026-10-05", qasr: 22340, lulu: 17650 },
  { date: "2026-10-06", qasr: 23180, lulu: 18930 },
  { date: "2026-10-07", qasr: 24910, lulu: 19840 },
  { date: "2026-10-08", qasr: 25560, lulu: 20410 },
  { date: "2026-10-09", qasr: 28930, lulu: 22770 },
  { date: "2026-10-10", qasr: 33150, lulu: 27240 },
  { date: "2026-10-11", qasr: 30880, lulu: 25190 },
  { date: "2026-10-12", qasr: 23640, lulu: 18870 },
  { date: "2026-10-13", qasr: 24720, lulu: 19960 },
  { date: "2026-10-14", qasr: 26930, lulu: 21820 },
];

export type ClosingStatus = "matched" | "short" | "over" | "pending" | "not_started";

export interface BranchClosing {
  branch: BranchId;
  manager: string;
  sales: number;
  tickets: number;
  cardSales: number;
  expectedCash: number;
  countedCash: number | null;
  status: ClosingStatus;
  submittedAt: string | null;
  foodCost: number;
  pettyCashSpent: number;
}

export const BRANCH_CLOSINGS: BranchClosing[] = [
  {
    branch: "qasr",
    manager: "أحمد يوسف",
    sales: 26930,
    tickets: 309,
    cardSales: 18640,
    expectedCash: 8290,
    countedCash: 8240,
    status: "short",
    submittedAt: "23:42",
    foodCost: 30.4,
    pettyCashSpent: 1260,
  },
  {
    branch: "lulu",
    manager: "رامي حداد",
    sales: 21820,
    tickets: 255,
    cardSales: 15930,
    expectedCash: 5890,
    countedCash: null,
    status: "pending",
    submittedAt: null,
    foodCost: 32.3,
    pettyCashSpent: 845,
  },
];

export interface Approval {
  id: string;
  title: string;
  branch: BranchId;
  amount: number;
  requestedBy: string;
  kind: "po" | "petty" | "variance";
}

export const PENDING_APPROVALS: Approval[] = [
  { id: "AP-311", title: "أمر شراء لحوم — مؤسسة الخليج للحوم", branch: "qasr", amount: 7850, requestedBy: "عمر الشامسي", kind: "po" },
  { id: "AP-312", title: "تجاوز سقف العهدة — صيانة مكيف", branch: "lulu", amount: 1450, requestedBy: "رامي حداد", kind: "petty" },
  { id: "AP-313", title: "عجز نقدي في إغلاق 13 أكتوبر", branch: "qasr", amount: 50, requestedBy: "أحمد يوسف", kind: "variance" },
  { id: "AP-314", title: "أمر شراء خضار وفواكه — مزارع العين", branch: "lulu", amount: 2310, requestedBy: "عمر الشامسي", kind: "po" },
  { id: "AP-315", title: "أمر شراء مأكولات بحرية — أسماك الحمرية", branch: "lulu", amount: 5620, requestedBy: "عمر الشامسي", kind: "po" },
  { id: "AP-316", title: "استبدال خلاط صناعي", branch: "qasr", amount: 2900, requestedBy: "الشيف مروان", kind: "petty" },
  { id: "AP-317", title: "مصروف نظافة إضافي", branch: "qasr", amount: 380, requestedBy: "أحمد يوسف", kind: "petty" },
];

/* ---------------------------- Manager ---------------------------- */

export const EXPENSE_CATEGORIES = [
  "مواد خام",
  "كهرباء",
  "مياه",
  "غاز",
  "صيانة",
  "نظافة ومستلزمات",
  "مواصلات وتوصيل",
  "أخرى",
] as const;

export interface PettyExpense {
  id: string;
  invoiceNo: string;
  amount: number;
  category: string;
  vendor: string;
  time: string;
}

export const INITIAL_PETTY_EXPENSES: PettyExpense[] = [
  { id: "PE-1", invoiceNo: "INV-88412", amount: 420, category: "مواد خام", vendor: "سوق الخضار المركزي", time: "09:15" },
  { id: "PE-2", invoiceNo: "DEWA-2210", amount: 610, category: "كهرباء", vendor: "هيئة كهرباء ومياه دبي", time: "11:40" },
  { id: "PE-3", invoiceNo: "C-5521", amount: 230, category: "نظافة ومستلزمات", vendor: "مؤسسة النقاء", time: "14:05" },
];

export const PETTY_CASH_FLOAT = 5000;

/* ---------------------------- Accountant ---------------------------- */

export type ReviewType = "petty" | "closing";
export type ReviewStatus = "pending" | "approved" | "returned";

export interface ReviewItem {
  id: string;
  type: ReviewType;
  branch: BranchId;
  submittedBy: string;
  submittedAt: string;
  amount: number;
  variance?: number;
  description: string;
  suggestedCategory: string;
  glCategory: string | null;
  attachments: number;
  status: ReviewStatus;
}

export const GL_CATEGORIES = [
  "تكلفة المواد الغذائية",
  "تكلفة المشروبات",
  "مرافق — كهرباء ومياه",
  "صيانة وإصلاحات",
  "مستلزمات تشغيل",
  "نقل ومواصلات",
  "فروقات نقدية",
  "إيرادات المبيعات",
];

export const REVIEW_QUEUE: ReviewItem[] = [
  { id: "CL-1013-Q", type: "closing", branch: "qasr", submittedBy: "أحمد يوسف", submittedAt: "2026-10-13 23:42", amount: 24720, variance: -50, description: "إغلاق يومي — 13 أكتوبر", suggestedCategory: "فروقات نقدية", glCategory: null, attachments: 2, status: "pending" },
  { id: "CL-1013-L", type: "closing", branch: "lulu", submittedBy: "رامي حداد", submittedAt: "2026-10-13 23:58", amount: 19960, variance: 0, description: "إغلاق يومي — 13 أكتوبر", suggestedCategory: "إيرادات المبيعات", glCategory: "إيرادات المبيعات", attachments: 2, status: "pending" },
  { id: "PC-4471", type: "petty", branch: "qasr", submittedBy: "أحمد يوسف", submittedAt: "2026-10-13 18:20", amount: 1260, description: "تقرير عهدة — 3 فواتير (مواد خام، كهرباء، نظافة)", suggestedCategory: "تكلفة المواد الغذائية", glCategory: null, attachments: 3, status: "pending" },
  { id: "PC-4472", type: "petty", branch: "lulu", submittedBy: "رامي حداد", submittedAt: "2026-10-13 16:05", amount: 845, description: "تقرير عهدة — غاز وصيانة شفاط", suggestedCategory: "صيانة وإصلاحات", glCategory: null, attachments: 2, status: "pending" },
  { id: "CL-1012-Q", type: "closing", branch: "qasr", submittedBy: "أحمد يوسف", submittedAt: "2026-10-12 23:31", amount: 23640, variance: 35, description: "إغلاق يومي — 12 أكتوبر", suggestedCategory: "فروقات نقدية", glCategory: null, attachments: 2, status: "pending" },
  { id: "PC-4468", type: "petty", branch: "lulu", submittedBy: "رامي حداد", submittedAt: "2026-10-12 12:47", amount: 310, description: "تقرير عهدة — توصيل وطلبات عاجلة", suggestedCategory: "نقل ومواصلات", glCategory: "نقل ومواصلات", attachments: 1, status: "pending" },
  { id: "PC-4465", type: "petty", branch: "qasr", submittedBy: "أحمد يوسف", submittedAt: "2026-10-12 10:12", amount: 2900, description: "خلاط صناعي — بانتظار موافقة المالك", suggestedCategory: "صيانة وإصلاحات", glCategory: null, attachments: 1, status: "pending" },
];

export interface PriceAlert {
  ingredient: string;
  supplier: string;
  unit: string;
  previous: number;
  current: number;
  history: number[]; // last 6 purchase prices, oldest first
  updatedAt: string;
}

export const PRICE_ALERTS: PriceAlert[] = [
  { ingredient: "طماطم", supplier: "مزارع العين", unit: "كغ", previous: 4.0, current: 4.4, history: [3.6, 3.7, 3.8, 3.9, 4.0, 4.4], updatedAt: "اليوم 08:20" },
  { ingredient: "روبيان جامبو", supplier: "أسماك الحمرية", unit: "كغ", previous: 58, current: 67, history: [54, 55, 55, 57, 58, 67], updatedAt: "اليوم 07:45" },
  { ingredient: "زيت زيتون بكر", supplier: "الفجر للمواد الغذائية", unit: "لتر", previous: 32, current: 36.5, history: [29, 30, 30, 31, 32, 36.5], updatedAt: "أمس" },
  { ingredient: "لحم غنم أسترالي", supplier: "مؤسسة الخليج للحوم", unit: "كغ", previous: 41, current: 44, history: [39, 40, 40, 41, 41, 44], updatedAt: "أمس" },
  { ingredient: "ليمون", supplier: "مزارع العين", unit: "كغ", previous: 6.5, current: 6.9, history: [6.0, 6.2, 6.2, 6.4, 6.5, 6.9], updatedAt: "قبل يومين" },
  { ingredient: "أرز بسمتي", supplier: "الفجر للمواد الغذائية", unit: "كغ", previous: 8.2, current: 8.5, history: [8.0, 8.0, 8.1, 8.2, 8.2, 8.5], updatedAt: "قبل 3 أيام" },
  { ingredient: "دجاج طازج", supplier: "مزارع الواحة للدواجن", unit: "كغ", previous: 15.5, current: 14.9, history: [16.0, 15.8, 15.8, 15.6, 15.5, 14.9], updatedAt: "قبل 3 أيام" },
];

/* ---------------------------- Chef ---------------------------- */

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  cost: number; // per unit
}

export const STOCK_ITEMS: StockItem[] = [
  { id: "tomato", name: "طماطم", unit: "كغ", cost: 4.4 },
  { id: "shrimp", name: "روبيان جامبو", unit: "كغ", cost: 67 },
  { id: "hammour", name: "سمك هامور", unit: "كغ", cost: 72 },
  { id: "lamb", name: "لحم غنم", unit: "كغ", cost: 44 },
  { id: "chicken", name: "دجاج طازج", unit: "كغ", cost: 14.9 },
  { id: "rice", name: "أرز بسمتي (مطبوخ)", unit: "كغ", cost: 8.5 },
  { id: "bread", name: "خبز عربي", unit: "ربطة", cost: 3 },
  { id: "cream", name: "كريمة طبخ", unit: "لتر", cost: 18 },
  { id: "lettuce", name: "خس روماني", unit: "حبة", cost: 4.5 },
  { id: "hummus", name: "حمص مجهز", unit: "كغ", cost: 12 },
];

export type WasteReason = "expired" | "burnt" | "staff_meal";

export const WASTE_REASONS: { id: WasteReason; label: string }[] = [
  { id: "expired", label: "منتهي الصلاحية" },
  { id: "burnt", label: "محروق / تالف" },
  { id: "staff_meal", label: "وجبة موظفين" },
];

export interface WasteEntry {
  id: string;
  itemId: string;
  qty: number;
  reason: WasteReason;
  note: string;
  time: string;
}

export const INITIAL_WASTE: WasteEntry[] = [
  { id: "W-1", itemId: "lettuce", qty: 6, reason: "expired", note: "ذبول بسبب حرارة غرفة التبريد", time: "08:10" },
  { id: "W-2", itemId: "rice", qty: 2.5, reason: "staff_meal", note: "", time: "15:30" },
  { id: "W-3", itemId: "shrimp", qty: 0.4, reason: "burnt", note: "طلب طاولة 12 أعيد تحضيره", time: "20:45" },
];

export interface Recipe {
  id: string;
  name: string;
  category: string;
  yield: number; // portions per batch
  portion: string;
  prepMinutes: number;
  ingredients: { name: string; qty: number; unit: string }[];
  notes?: string;
}

export const RECIPES: Recipe[] = [
  {
    id: "machboos",
    name: "مجبوس لحم",
    category: "أطباق رئيسية",
    yield: 10,
    portion: "450 غ",
    prepMinutes: 120,
    ingredients: [
      { name: "لحم غنم بالعظم", qty: 2.5, unit: "كغ" },
      { name: "أرز بسمتي", qty: 1.5, unit: "كغ" },
      { name: "بصل", qty: 0.6, unit: "كغ" },
      { name: "طماطم", qty: 0.5, unit: "كغ" },
      { name: "بهارات مجبوس", qty: 60, unit: "غ" },
      { name: "لومي (ليمون أسود)", qty: 4, unit: "حبة" },
      { name: "سمن", qty: 120, unit: "مل" },
    ],
    notes: "يُقدّم مع دقوس الطماطم. الحصة تشمل 180 غ لحم بعد الطبخ.",
  },
  {
    id: "shrimp-saloona",
    name: "صالونة روبيان",
    category: "مأكولات بحرية",
    yield: 6,
    portion: "350 غ",
    prepMinutes: 45,
    ingredients: [
      { name: "روبيان جامبو منظف", qty: 1.2, unit: "كغ" },
      { name: "طماطم", qty: 0.8, unit: "كغ" },
      { name: "كوسا", qty: 0.4, unit: "كغ" },
      { name: "بصل", qty: 0.3, unit: "كغ" },
      { name: "بهارات بزار", qty: 35, unit: "غ" },
      { name: "كزبرة طازجة", qty: 1, unit: "ربطة" },
    ],
  },
  {
    id: "grilled-hammour",
    name: "هامور مشوي",
    category: "مأكولات بحرية",
    yield: 4,
    portion: "300 غ",
    prepMinutes: 25,
    ingredients: [
      { name: "فيليه هامور", qty: 1.2, unit: "كغ" },
      { name: "ليمون", qty: 0.2, unit: "كغ" },
      { name: "ثوم", qty: 40, unit: "غ" },
      { name: "زيت زيتون", qty: 60, unit: "مل" },
      { name: "كمون وفلفل", qty: 15, unit: "غ" },
    ],
  },
  {
    id: "fattoush",
    name: "فتوش",
    category: "مقبلات وسلطات",
    yield: 8,
    portion: "220 غ",
    prepMinutes: 20,
    ingredients: [
      { name: "خس روماني", qty: 3, unit: "حبة" },
      { name: "طماطم", qty: 0.6, unit: "كغ" },
      { name: "خيار", qty: 0.5, unit: "كغ" },
      { name: "خبز عربي محمص", qty: 2, unit: "ربطة" },
      { name: "دبس رمان", qty: 80, unit: "مل" },
      { name: "سماق", qty: 20, unit: "غ" },
      { name: "زيت زيتون", qty: 100, unit: "مل" },
    ],
  },
  {
    id: "hummus",
    name: "حمص بالطحينة",
    category: "مقبلات وسلطات",
    yield: 12,
    portion: "180 غ",
    prepMinutes: 30,
    ingredients: [
      { name: "حمص مسلوق", qty: 1.6, unit: "كغ" },
      { name: "طحينة", qty: 0.45, unit: "كغ" },
      { name: "ليمون (عصير)", qty: 150, unit: "مل" },
      { name: "ثوم", qty: 30, unit: "غ" },
      { name: "ملح", qty: 18, unit: "غ" },
    ],
  },
  {
    id: "luqaimat",
    name: "لقيمات بالدبس",
    category: "حلويات",
    yield: 15,
    portion: "8 حبات",
    prepMinutes: 90,
    ingredients: [
      { name: "طحين", qty: 1, unit: "كغ" },
      { name: "خميرة", qty: 15, unit: "غ" },
      { name: "هيل مطحون", qty: 8, unit: "غ" },
      { name: "زعفران", qty: 1, unit: "غ" },
      { name: "دبس تمر", qty: 0.4, unit: "كغ" },
    ],
  },
];

/* ---------------------------- Purchaser ---------------------------- */

export type POStatus = "draft" | "sent" | "received";

export interface POLine {
  itemId: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  branch: BranchId;
  createdAt: string;
  expectedAt: string;
  status: POStatus;
  lines: POLine[];
}

/** Last purchase price per item; updated when goods are received. */
export const INITIAL_PRICE_BOOK: Record<string, { price: number; updatedAt: string }> = {
  tomato: { price: 4.4, updatedAt: "14 أكتوبر" },
  cucumber: { price: 3.8, updatedAt: "11 أكتوبر" },
  lemon: { price: 6.9, updatedAt: "12 أكتوبر" },
  onion: { price: 2.6, updatedAt: "10 أكتوبر" },
  shrimp: { price: 67, updatedAt: "14 أكتوبر" },
  hammour: { price: 72, updatedAt: "9 أكتوبر" },
  lamb: { price: 44, updatedAt: "13 أكتوبر" },
  chicken: { price: 14.9, updatedAt: "11 أكتوبر" },
  rice: { price: 8.5, updatedAt: "11 أكتوبر" },
  oil: { price: 36.5, updatedAt: "13 أكتوبر" },
};

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-2041",
    supplier: "مزارع العين",
    branch: "qasr",
    createdAt: "13 أكتوبر",
    expectedAt: "اليوم 10:00",
    status: "sent",
    lines: [
      { itemId: "tomato", name: "طماطم", unit: "كغ", qty: 40, price: 4.4 },
      { itemId: "cucumber", name: "خيار", unit: "كغ", qty: 25, price: 3.8 },
      { itemId: "lemon", name: "ليمون", unit: "كغ", qty: 15, price: 6.9 },
      { itemId: "onion", name: "بصل", unit: "كغ", qty: 30, price: 2.6 },
    ],
  },
  {
    id: "PO-2042",
    supplier: "أسماك الحمرية",
    branch: "lulu",
    createdAt: "13 أكتوبر",
    expectedAt: "اليوم 07:30",
    status: "sent",
    lines: [
      { itemId: "shrimp", name: "روبيان جامبو", unit: "كغ", qty: 20, price: 67 },
      { itemId: "hammour", name: "سمك هامور", unit: "كغ", qty: 18, price: 72 },
    ],
  },
  {
    id: "PO-2043",
    supplier: "مؤسسة الخليج للحوم",
    branch: "qasr",
    createdAt: "14 أكتوبر",
    expectedAt: "16 أكتوبر",
    status: "draft",
    lines: [
      { itemId: "lamb", name: "لحم غنم", unit: "كغ", qty: 120, price: 44 },
      { itemId: "chicken", name: "دجاج طازج", unit: "كغ", qty: 80, price: 14.9 },
    ],
  },
  {
    id: "PO-2044",
    supplier: "الفجر للمواد الغذائية",
    branch: "lulu",
    createdAt: "14 أكتوبر",
    expectedAt: "17 أكتوبر",
    status: "draft",
    lines: [
      { itemId: "rice", name: "أرز بسمتي", unit: "كغ", qty: 100, price: 8.5 },
      { itemId: "oil", name: "زيت زيتون بكر", unit: "لتر", qty: 20, price: 36.5 },
    ],
  },
  {
    id: "PO-2038",
    supplier: "مزارع الواحة للدواجن",
    branch: "lulu",
    createdAt: "10 أكتوبر",
    expectedAt: "11 أكتوبر",
    status: "received",
    lines: [{ itemId: "chicken", name: "دجاج طازج", unit: "كغ", qty: 60, price: 14.9 }],
  },
];
