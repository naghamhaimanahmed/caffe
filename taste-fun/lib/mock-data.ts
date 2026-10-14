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
