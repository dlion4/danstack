import { addDays, todayISO } from "./lib";

const T = todayISO();
const dt = (h: number, m: number) => `${T}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

/* ── money helpers ── */

export const fmtMoney = (n: number, c = "KES") =>
  c === "KES"
    ? `KES ${Math.round(n).toLocaleString("en-KE")}`
    : `${c} ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const currencySign = (c: string) => (c === "KES" ? "KES" : c);

/* ── Accounts (3.1) ───────────────────────────────────────────────── */

export interface Account {
  id: string;
  name: string;
  kind: "bank" | "mpesa" | "virtual" | "fx";
  bank?: string;
  number: string;
  currency: "KES" | "USD" | "EUR" | "GBP";
  balance: number;
  reserved: number;
  spark: number[];
  monthlyIn: number;
  monthlyOut: number;
  status: "active" | "paused" | "closing";
  purpose: string;
  linked: boolean;
  lowThreshold?: number;
}

export const accountsSeed: Account[] = [
  { id: "a1", name: "KCB Current Account", kind: "bank", bank: "KCB", number: "•••• 4491", currency: "KES", balance: 2410300, reserved: 350000, spark: [22, 24, 23, 26, 25, 27, 24], monthlyIn: 486200, monthlyOut: 412300, status: "active", purpose: "Main operating account — all collections land here, then sweep to reserves.", linked: true, lowThreshold: 500000 },
  { id: "a2", name: "M-Pesa Business Wallet", kind: "mpesa", number: "Paybill 880321", currency: "KES", balance: 612400, reserved: 50000, spark: [6, 8, 7, 9, 8, 10, 9], monthlyIn: 324000, monthlyOut: 301500, status: "active", purpose: "Paybill & Till collections and the B2B supplier float.", linked: true, lowThreshold: 100000 },
  { id: "a3", name: "VAT Reserve", kind: "virtual", number: "VA-03", currency: "KES", balance: 182300, reserved: 182300, spark: [1, 2, 2, 1, 2, 2, 1], monthlyIn: 96400, monthlyOut: 96400, status: "active", purpose: "Auto-sweeps 16% of VATable collections for the KRA 20th remittance.", linked: false },
  { id: "a4", name: "Payroll Reserve", kind: "virtual", number: "VA-04", currency: "KES", balance: 450500, reserved: 450500, spark: [4, 5, 4, 5, 4, 4, 5], monthlyIn: 450500, monthlyOut: 450500, status: "active", purpose: "Accumulates weekly so the monthly payroll run is never tight.", linked: false },
  { id: "a5", name: "Tax & Statutory", kind: "virtual", number: "VA-05", currency: "KES", balance: 96400, reserved: 96400, spark: [1, 1, 2, 1, 1, 2, 1], monthlyIn: 136200, monthlyOut: 136200, status: "active", purpose: "PAYE, NSSF & SHIF remittance buffer.", linked: false },
  { id: "a6", name: "Emergency Buffer", kind: "virtual", number: "VA-06", currency: "KES", balance: 350000, reserved: 350000, spark: [3, 3, 3, 4, 3, 4, 4], monthlyIn: 50000, monthlyOut: 0, status: "active", purpose: "3-month runway target — internal sweeps only.", linked: false },
  { id: "a7", name: "Kilimani Rent Collections", kind: "virtual", number: "VA-07", currency: "KES", balance: 312400, reserved: 0, spark: [3, 2, 4, 3, 4, 3, 3], monthlyIn: 150000, monthlyOut: 30000, status: "active", purpose: "Rental income ring-fenced from day-to-day operations.", linked: false },
  { id: "a8", name: "USD Operations Wallet", kind: "fx", number: "FX-USD", currency: "USD", balance: 8420, reserved: 0, spark: [8, 9, 8, 9, 9, 8, 9], monthlyIn: 1240, monthlyOut: 860, status: "active", purpose: "USD supplier payments and international client billing.", linked: false },
  { id: "a9", name: "EUR Receivables", kind: "fx", number: "FX-EUR", currency: "EUR", balance: 1240, reserved: 0, spark: [1, 2, 1, 2, 1, 2, 2], monthlyIn: 400, monthlyOut: 0, status: "active", purpose: "EU client deposits held until conversion.", linked: false },
  { id: "a10", name: "Equity Bank — Rent Account", kind: "bank", bank: "Equity", number: "•••• 8812", currency: "KES", balance: 486900, reserved: 0, spark: [5, 5, 6, 5, 6, 5, 5], monthlyIn: 150000, monthlyOut: 45000, status: "active", purpose: "Kilimani House 1 & 2 rent deposits.", linked: true },
];

/* ── Ledger feed (3.2) ────────────────────────────────────────────── */

export interface CashTx {
  id: string;
  date: string;
  desc: string;
  category: string;
  accountId: string;
  amount: number;
  balance: number;
  type: "collection" | "payment" | "transfer" | "fx" | "fee" | "reserve";
  status: "settled" | "pending";
  ref: string;
}

export const txsSeed: CashTx[] = [
  { id: "t1", date: dt(8, 42), desc: "INV-0141 paid — Kimani Hardware", category: "Collections", accountId: "a1", amount: 12500, balance: 2422800, type: "collection", status: "settled", ref: "SLK9X2QR3H" },
  { id: "t2", date: dt(9, 5), desc: "INV-0137 partial — B.O Digital", category: "Collections", accountId: "a1", amount: 24000, balance: 2446800, type: "collection", status: "settled", ref: "SLK2BB8KJ1" },
  { id: "t3", date: dt(9, 31), desc: "Till walk-in — Esther Muthoni", category: "Collections", accountId: "a2", amount: 22750, balance: 635150, type: "collection", status: "settled", ref: "TLL8PW33XK" },
  { id: "t4", date: dt(10, 12), desc: "Fuel float top-up — Rift Valley Logistics", category: "Suppliers", accountId: "a2", amount: -15000, balance: 620150, type: "payment", status: "settled", ref: "B2B4481XK" },
  { id: "t5", date: dt(10, 47), desc: "INV-0136 paid — Chebet Farms", category: "Collections", accountId: "a1", amount: 84500, balance: 2531300, type: "collection", status: "settled", ref: "SLK3XQ2RH9" },
  { id: "t6", date: dt(11, 20), desc: "Auto-sweep → VAT Reserve (16% of VATable)", category: "Reserves", accountId: "a3", amount: 96400, balance: 182300, type: "reserve", status: "settled", ref: "SWEEP-R2" },
  { id: "t7", date: dt(12, 3), desc: "USD invoice FX — Acme Inc. (USD 352)", category: "FX", accountId: "a8", amount: 352, balance: 8420, type: "fx", status: "settled", ref: "FX-8841" },
  { id: "t8", date: dt(12, 44), desc: "PesaLink in — Kimani Hardware (INV-0133)", category: "Collections", accountId: "a1", amount: 45000, balance: 2576300, type: "collection", status: "settled", ref: "PSL009123" },
  { id: "t9", date: dt(13, 15), desc: "KCB monthly account fee", category: "Fees", accountId: "a1", amount: -450, balance: 2575850, type: "fee", status: "settled", ref: "FEE-0326" },
  { id: "t10", date: dt(14, 2), desc: "QR collection — Samuel Mwangi", category: "Collections", accountId: "a2", amount: 27500, balance: 647650, type: "collection", status: "pending", ref: "QR9LSD43MN" },
  { id: "t11", date: dt(15, 26), desc: "M-Pesa B2B — Soko Agri (partial)", category: "Suppliers", accountId: "a2", amount: -42000, balance: 605650, type: "payment", status: "pending", ref: "B2B-TX882" },
  { id: "t12", date: dt(16, 9), desc: "Card settlement — Coastal Wholesale", category: "Collections", accountId: "a1", amount: 61200, balance: 2637050, type: "collection", status: "settled", ref: "CHRG-88412" },
  { id: "t13", date: dt(16, 48), desc: "Transfer → Emergency Buffer", category: "Transfers", accountId: "a6", amount: 50000, balance: 350000, type: "transfer", status: "settled", ref: "XFR-2291" },
  { id: "t14", date: dt(17, 22), desc: "Rent deposit — Kilimani House 1, Unit 2B", category: "Rent", accountId: "a7", amount: 30000, balance: 312400, type: "collection", status: "settled", ref: "RNT-02B" },
  { id: "t15", date: dt(17, 45), desc: "EUR deposit — Berlin client (EUR 400)", category: "FX", accountId: "a9", amount: 400, balance: 1240, type: "fx", status: "pending", ref: "FX-EUR-112" },
  { id: "t16", date: dt(18, 10), desc: "PesaLink out — Quick Copy Supplies", category: "Suppliers", accountId: "a1", amount: -8700, balance: 2628350, type: "payment", status: "settled", ref: "PSL009845" },
];

/* ── Internal transfers (3.3) ─────────────────────────────────────── */

export interface InternalTransfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  status: "completed" | "scheduled";
  memo: string;
}

export const transfersSeed: InternalTransfer[] = [
  { id: "it1", from: "a1", to: "a6", amount: 50000, date: dt(16, 48), status: "completed", memo: "Weekly buffer top-up" },
  { id: "it2", from: "a1", to: "a3", amount: 96400, date: dt(11, 20), status: "completed", memo: "VAT sweep (rule R-2)" },
  { id: "it3", from: "a2", to: "a1", amount: 180000, date: addDays(T, -1) + "T18:00:00", status: "completed", memo: "Consolidate M-Pesa → KCB" },
  { id: "it4", from: "a1", to: "a4", amount: 50000, date: addDays(T, -4) + "T06:00:00", status: "completed", memo: "Weekly payroll top-up" },
  { id: "it5", from: "a1", to: "a4", amount: 50000, date: addDays(T, 4) + "T06:00:00", status: "scheduled", memo: "Weekly payroll top-up" },
];

/* ── Beneficiaries & external (3.5) ────────────────────────────────── */

export interface Beneficiary {
  id: string;
  name: string;
  kind: "bank" | "mpesa";
  bank?: string;
  account?: string;
  phone?: string;
  email: string;
  limit: number;
}

export const beneficiariesSeed: Beneficiary[] = [
  { id: "be1", name: "Soko Agri Supplies Ltd", kind: "bank", bank: "KCB", account: "•••• 2441", email: "ap@sokoagri.co.ke", limit: 500000 },
  { id: "be2", name: "Rift Valley Logistics", kind: "mpesa", phone: "0722 118 900", email: "billing@rvlogistics.co.ke", limit: 150000 },
  { id: "be3", name: "Cedar Properties Ltd", kind: "bank", bank: "Equity", account: "•••• 7712", email: "rent@cedarprop.co.ke", limit: 300000 },
  { id: "be4", name: "KRA — VAT & PAYE", kind: "bank", bank: "KCB", account: "•••• 0900", email: "filing@kra.go.ke", limit: 1000000 },
  { id: "be5", name: "Freelance — Kevin Otieno", kind: "mpesa", phone: "0733 221 006", email: "kevin@example.com", limit: 50000 },
];

export const bulkSample = [
  { name: "James K.", target: "0722 664 118", method: "M-Pesa", amount: 25000 },
  { name: "Grace M.", target: "01124459012", method: "Bank", amount: 18000 },
  { name: "David O.", target: "0740 118 923", method: "M-Pesa", amount: 9600 },
  { name: "Fatuma A.", target: "01123344556", method: "Bank", amount: 31000 },
  { name: "Peter N.", target: "0735 887 902", method: "M-Pesa", amount: 12400 },
];

/* ── FX (3.6) ─────────────────────────────────────────────────────── */

export interface RateRow {
  ccy: string;
  rate: number;
  chg: number;
  spark: number[];
}

export const ratesSeed: RateRow[] = [
  { ccy: "USD", rate: 129.4, chg: 0.8, spark: [127.9, 128.1, 128.6, 128.4, 129.0, 128.8, 129.4] },
  { ccy: "EUR", rate: 140.2, chg: -0.3, spark: [141.0, 140.8, 141.2, 140.9, 140.5, 140.6, 140.2] },
  { ccy: "GBP", rate: 165.9, chg: 1.1, spark: [163.8, 164.2, 164.0, 164.8, 165.2, 165.5, 165.9] },
];

/* ── Sweep rules (3.7) ────────────────────────────────────────────── */

export interface SweepRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused";
  lastRun: string;
  runs30d: number;
  moved30d: number;
}

export const sweepsSeed: SweepRule[] = [
  { id: "R1", name: "M-Pesa float top-up", trigger: "When M-Pesa wallet < KES 20,000", action: "Move KES 30,000 from KCB Current", status: "active", lastRun: "today 07:02", runs30d: 12, moved30d: 360000 },
  { id: "R2", name: "VAT auto-reserve", trigger: "Every day at 18:00", action: "Sweep 16% of VATable collections → VAT Reserve", status: "active", lastRun: "today 18:00", runs30d: 30, moved30d: 96400 },
  { id: "R3", name: "Weekly payroll top-up", trigger: "Every Monday 06:00", action: "Move KES 50,000 → Payroll Reserve", status: "active", lastRun: "4 days ago", runs30d: 4, moved30d: 200000 },
  { id: "R4", name: "Rent ring-fence", trigger: "On any deposit to Equity •••• 8812", action: "Sweep excess above KES 150,000 → Kilimani VA", status: "paused", lastRun: "12 days ago", runs30d: 2, moved30d: 60000 },
];

/* ── Cards (3.8) ──────────────────────────────────────────────────── */

export interface VCard {
  id: string;
  name: string;
  type: "virtual" | "physical";
  number: string;
  currency: string;
  owner: string;
  spent30d: number;
  limit: number;
  online: boolean;
  status: "active" | "frozen" | "blocked";
  gradient: string;
}

export const cardsSeed: VCard[] = [
  { id: "vc1", name: "Marketing Team Card", type: "virtual", number: "•••• 4831", currency: "KES", owner: "Mercy J.", spent30d: 80000, limit: 100000, online: true, status: "active", gradient: "linear-gradient(135deg, #0e7490, #155e75)" },
  { id: "vc2", name: "Dev Tools Card", type: "virtual", number: "•••• 9027", currency: "USD", owner: "Kevin O.", spent30d: 214, limit: 500, online: true, status: "active", gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)" },
  { id: "vc3", name: "Travel Card", type: "physical", number: "•••• 1122", currency: "KES", owner: "Wanjiru K.", spent30d: 0, limit: 250000, online: true, status: "frozen", gradient: "linear-gradient(135deg, #0f2744, #1d4e89)" },
  { id: "vc4", name: "Suppliers Card", type: "physical", number: "•••• 6634", currency: "KES", owner: "Peter N.", spent30d: 156000, limit: 200000, online: false, status: "active", gradient: "linear-gradient(135deg, #be123c, #7f1028)" },
];

/* ── Notifications ────────────────────────────────────────────────── */

export interface CashNotification {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const cashNotificationsSeed: CashNotification[] = [
  { id: "cn1", tone: "danger", title: "KCB near low-water mark", body: "KCB •••• 4491 dropped to KES 2.41M — the projection hits your KES 500K floor in 18 days.", time: "9 min ago", read: false },
  { id: "cn2", tone: "warning", title: "USD rate moved 1.8% overnight", body: "USD/KES now 129.4. Your unlocked USD 1,730 exposure on BILL-0038 drifted KES 3,900.", time: "34 min ago", read: false },
  { id: "cn3", tone: "success", title: "Sweep executed — VAT Reserve", body: "KES 96,400 swept to VAT Reserve per rule R-2.", time: "2 h ago", read: true },
  { id: "cn4", tone: "info", title: "Statement ready — KCB March", body: "Bank statement imported & auto-reconciled: 4 unmatched items need review.", time: "4 h ago", read: false },
  { id: "cn5", tone: "warning", title: "Marketing card at 80% of limit", body: "Virtual card •••• 4831 has spent KES 80,000 of its KES 100,000 monthly limit.", time: "Yesterday", read: true },
];
