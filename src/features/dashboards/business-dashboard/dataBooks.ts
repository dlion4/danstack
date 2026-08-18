import { addDays, todayISO } from "./lib";

const T = todayISO();
const dt = (d: number, h = 9, m = 0) => `${addDays(T, -d)}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

/* ── Chart of Accounts (4.2) ──────────────────────────────────────── */

export interface CoaAccount {
  id: string;
  code: string;
  name: string;
  type: "Income" | "Expense" | "Asset" | "Liability" | "Equity";
  vat: "16%" | "Exempt" | "Zero-rated" | "N/A";
  balance: number;
  txCount: number;
  system: boolean;
}

export const coaSeed: CoaAccount[] = [
  { id: "c4000", code: "4000", name: "Sales — Services", type: "Income", vat: "16%", balance: 1846200, txCount: 128, system: true },
  { id: "c4010", code: "4010", name: "Sales — Goods", type: "Income", vat: "16%", balance: 612400, txCount: 84, system: true },
  { id: "c4050", code: "4050", name: "Rental Income", type: "Income", vat: "Exempt", balance: 450000, txCount: 15, system: false },
  { id: "c4900", code: "4900", name: "Other Income", type: "Income", vat: "16%", balance: 38400, txCount: 6, system: true },
  { id: "c5000", code: "5000", name: "Cost of Goods Sold", type: "Expense", vat: "16%", balance: 486300, txCount: 62, system: true },
  { id: "c6000", code: "6000", name: "Salaries & Wages", type: "Expense", vat: "N/A", balance: 1860000, txCount: 3, system: true },
  { id: "c6010", code: "6010", name: "Rent — Premises", type: "Expense", vat: "16%", balance: 435000, txCount: 3, system: true },
  { id: "c6020", code: "6020", name: "Transport & Fuel", type: "Expense", vat: "16%", balance: 186400, txCount: 41, system: false },
  { id: "c6030", code: "6030", name: "Utilities", type: "Expense", vat: "16%", balance: 96200, txCount: 12, system: true },
  { id: "c6040", code: "6040", name: "Professional Fees", type: "Expense", vat: "16%", balance: 148000, txCount: 9, system: true },
  { id: "c6050", code: "6050", name: "Software & Subscriptions", type: "Expense", vat: "16%", balance: 82400, txCount: 24, system: false },
  { id: "c6060", code: "6060", name: "Marketing & Advertising", type: "Expense", vat: "16%", balance: 124000, txCount: 18, system: false },
  { id: "c6070", code: "6070", name: "Bank Charges", type: "Expense", vat: "Exempt", balance: 12400, txCount: 34, system: true },
  { id: "c6080", code: "6080", name: "Repairs & Maintenance", type: "Expense", vat: "16%", balance: 64800, txCount: 11, system: false },
  { id: "c6900", code: "6900", name: "Bad Debts Written Off", type: "Expense", vat: "N/A", balance: 62000, txCount: 2, system: true },
  { id: "c1000", code: "1000", name: "Cash & Bank", type: "Asset", vat: "N/A", balance: 3421900, txCount: 214, system: true },
  { id: "c1100", code: "1100", name: "Accounts Receivable", type: "Asset", vat: "N/A", balance: 218400, txCount: 11, system: true },
  { id: "c1200", code: "1200", name: "Inventory", type: "Asset", vat: "N/A", balance: 342000, txCount: 28, system: true },
  { id: "c1500", code: "1500", name: "Equipment & Fixtures", type: "Asset", vat: "N/A", balance: 890000, txCount: 8, system: true },
  { id: "c2000", code: "2000", name: "Accounts Payable", type: "Liability", vat: "N/A", balance: 272200, txCount: 14, system: true },
  { id: "c2100", code: "2100", name: "VAT Payable", type: "Liability", vat: "N/A", balance: 182300, txCount: 6, system: true },
  { id: "c2200", code: "2200", name: "PAYE Payable", type: "Liability", vat: "N/A", balance: 98000, txCount: 3, system: true },
  { id: "c2300", code: "2300", name: "Security Deposits Held", type: "Liability", vat: "N/A", balance: 120000, txCount: 4, system: false },
  { id: "c3000", code: "3000", name: "Owner's Equity", type: "Equity", vat: "N/A", balance: 2400000, txCount: 5, system: true },
  { id: "c3100", code: "3100", name: "Retained Earnings", type: "Equity", vat: "N/A", balance: 1842300, txCount: 12, system: true },
];

/* ── Uncategorized / categorized transactions (4.2) ───────────────── */

export interface BookTx {
  id: string;
  date: string;
  desc: string;
  source: string;
  amount: number;
  coa?: string;
  suggestion?: string;
  confidence?: number;
  vat: number;
  status: "uncategorized" | "categorized" | "review";
  ref: string;
  attachment?: string;
}

export const bookTxsSeed: BookTx[] = [
  { id: "bt1", date: dt(0, 8, 42), desc: "M-Pesa — SHELL WESTLANDS", source: "M-Pesa Paybill", amount: -6400, suggestion: "c6020", confidence: 94, vat: 883, status: "uncategorized", ref: "SLK9X2QR3H" },
  { id: "bt2", date: dt(0, 9, 12), desc: "Card — GOOGLE ADS 8821", source: "Card (Visa)", amount: -24000, suggestion: "c6060", confidence: 97, vat: 3310, status: "uncategorized", ref: "CHRG-8821" },
  { id: "bt3", date: dt(0, 10, 4), desc: "Transfer — CEDAR PROPERTIES", source: "PesaLink", amount: -145000, suggestion: "c6010", confidence: 91, vat: 20000, status: "uncategorized", ref: "PSL-2291" },
  { id: "bt4", date: dt(1, 14, 30), desc: "M-Pesa — QUICKCOPY SUPPLIES", source: "M-Pesa B2B", amount: -8700, suggestion: "c5000", confidence: 78, vat: 1200, status: "uncategorized", ref: "B2B-4481" },
  { id: "bt5", date: dt(1, 16, 15), desc: "Deposit — CHEBET FARM SUPPLIES", source: "M-Pesa Paybill", amount: 84500, suggestion: "c4000", confidence: 96, vat: 11655, status: "uncategorized", ref: "SLK3XQ2RH9" },
  { id: "bt6", date: dt(2, 11, 20), desc: "Card — AWS CLOUD SERVICES", source: "Card (USD)", amount: -18400, suggestion: "c6050", confidence: 93, vat: 2538, status: "uncategorized", ref: "CHRG-9027" },
  { id: "bt7", date: dt(2, 13, 45), desc: "Cash withdrawal — ATM WESTLANDS", source: "Card (Visa)", amount: -20000, suggestion: undefined, confidence: 0, vat: 0, status: "review", ref: "ATM-3391" },
  { id: "bt8", date: dt(3, 9, 5), desc: "KPLC prepaid token", source: "M-Pesa Paybill", amount: -12000, suggestion: "c6030", confidence: 98, vat: 1655, status: "uncategorized", ref: "KPLC-8821" },
  { id: "bt9", date: dt(3, 15, 22), desc: "Deposit — KIMANI HARDWARE", source: "PesaLink", amount: 45000, coa: "c4010", confidence: 99, vat: 6207, status: "categorized", ref: "PSL009123" },
  { id: "bt10", date: dt(4, 10, 0), desc: "Salary run — March", source: "Bank bulk", amount: -450500, coa: "c6000", vat: 0, status: "categorized", ref: "PAYROLL-03" },
  { id: "bt11", date: dt(4, 12, 8), desc: "Bank charge — monthly fee", source: "KCB", amount: -450, coa: "c6070", vat: 0, status: "categorized", ref: "FEE-0326" },
  { id: "bt12", date: dt(5, 8, 30), desc: "Deposit — COASTAL WHOLESALE", source: "Card (Visa)", amount: 61200, coa: "c4010", vat: 8441, status: "categorized", ref: "CHRG-88412" },
];

/* ── Journal entries (4.3) ────────────────────────────────────────── */

export interface JournalLine {
  coa: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface JournalEntry {
  id: string;
  number: string;
  date: string;
  narration: string;
  lines: JournalLine[];
  source: "manual" | "auto" | "adjustment" | "closing";
  status: "posted" | "draft";
  createdBy: string;
  attachment?: string;
}

export const journalsSeed: JournalEntry[] = [
  {
    id: "je1", number: "JE-0104", date: addDays(T, 0), narration: "Depreciation — March (equipment, straight line)",
    lines: [{ coa: "c6080", debit: 18500, credit: 0, memo: "Depreciation expense" }, { coa: "c1500", debit: 0, credit: 18500, memo: "Accumulated depreciation" }],
    source: "adjustment", status: "posted", createdBy: "Wanjiru K.",
  },
  {
    id: "je2", number: "JE-0103", date: addDays(T, -1), narration: "Accrue March rent — Cedar Properties",
    lines: [{ coa: "c6010", debit: 145000, credit: 0, memo: "Rent expense" }, { coa: "c2000", debit: 0, credit: 145000, memo: "Accrued rent payable" }],
    source: "manual", status: "posted", createdBy: "Peter N.",
  },
  {
    id: "je3", number: "JE-0102", date: addDays(T, -3), narration: "Write off INV-0130 — Kariuki Logistics (uncollectible)",
    lines: [{ coa: "c6900", debit: 62000, credit: 0, memo: "Bad debt expense" }, { coa: "c1100", debit: 0, credit: 62000, memo: "Clear receivable" }],
    source: "manual", status: "posted", createdBy: "Wanjiru K.", attachment: "write-off-approval.pdf",
  },
  {
    id: "je4", number: "JE-0101", date: addDays(T, -6), narration: "Payroll journal — March (gross, PAYE, NSSF, SHIF)",
    lines: [
      { coa: "c6000", debit: 620000, credit: 0, memo: "Gross salaries" },
      { coa: "c2200", debit: 0, credit: 98000, memo: "PAYE payable" },
      { coa: "c1000", debit: 0, credit: 522000, memo: "Net paid from bank" },
    ],
    source: "auto", status: "posted", createdBy: "System",
  },
  {
    id: "je5", number: "JE-0105", date: addDays(T, 0), narration: "Prepaid insurance amortisation — draft",
    lines: [{ coa: "c6040", debit: 12500, credit: 0, memo: "Insurance expense" }, { coa: "c1200", debit: 0, credit: 12500, memo: "Prepaid insurance" }],
    source: "adjustment", status: "draft", createdBy: "Peter N.",
  },
];

/* ── P&L / reports (4.1, 4.4) ─────────────────────────────────────── */

export const plMonths = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
export const plRevenue = [386000, 412000, 448000, 432000, 468000, 486200];
export const plExpenses = [312000, 328000, 356000, 341000, 372000, 384600];

export interface ReportRow {
  label: string;
  amount: number;
  bold?: boolean;
  indent?: boolean;
  divider?: boolean;
}

export const plReport: ReportRow[] = [
  { label: "REVENUE", amount: 0, bold: true },
  { label: "Sales — Services", amount: 1846200, indent: true },
  { label: "Sales — Goods", amount: 612400, indent: true },
  { label: "Rental Income", amount: 450000, indent: true },
  { label: "Other Income", amount: 38400, indent: true },
  { label: "Total Revenue", amount: 2947000, bold: true, divider: true },
  { label: "COST OF SALES", amount: 0, bold: true },
  { label: "Cost of Goods Sold", amount: -486300, indent: true },
  { label: "Gross Profit", amount: 2460700, bold: true, divider: true },
  { label: "OPERATING EXPENSES", amount: 0, bold: true },
  { label: "Salaries & Wages", amount: -1860000, indent: true },
  { label: "Rent — Premises", amount: -435000, indent: true },
  { label: "Transport & Fuel", amount: -186400, indent: true },
  { label: "Professional Fees", amount: -148000, indent: true },
  { label: "Marketing & Advertising", amount: -124000, indent: true },
  { label: "Utilities", amount: -96200, indent: true },
  { label: "Software & Subscriptions", amount: -82400, indent: true },
  { label: "Repairs & Maintenance", amount: -64800, indent: true },
  { label: "Bad Debts Written Off", amount: -62000, indent: true },
  { label: "Bank Charges", amount: -12400, indent: true },
  { label: "Total Operating Expenses", amount: -3071200, bold: true, divider: true },
  { label: "NET PROFIT / (LOSS)", amount: -610500, bold: true },
];

export const bsReport: ReportRow[] = [
  { label: "ASSETS", amount: 0, bold: true },
  { label: "Cash & Bank", amount: 3421900, indent: true },
  { label: "Accounts Receivable", amount: 218400, indent: true },
  { label: "Inventory", amount: 342000, indent: true },
  { label: "Equipment & Fixtures (net)", amount: 890000, indent: true },
  { label: "Total Assets", amount: 4872300, bold: true, divider: true },
  { label: "LIABILITIES", amount: 0, bold: true },
  { label: "Accounts Payable", amount: 272200, indent: true },
  { label: "VAT Payable", amount: 182300, indent: true },
  { label: "PAYE Payable", amount: 98000, indent: true },
  { label: "Security Deposits Held", amount: 120000, indent: true },
  { label: "Total Liabilities", amount: 672500, bold: true, divider: true },
  { label: "EQUITY", amount: 0, bold: true },
  { label: "Owner's Equity", amount: 2400000, indent: true },
  { label: "Retained Earnings", amount: 1842300, indent: true },
  { label: "Current Period Profit", amount: -42500, indent: true },
  { label: "Total Equity", amount: 4199800, bold: true, divider: true },
  { label: "TOTAL LIABILITIES + EQUITY", amount: 4872300, bold: true },
];

export const cfReport: ReportRow[] = [
  { label: "OPERATING ACTIVITIES", amount: 0, bold: true },
  { label: "Cash received from customers", amount: 2884600, indent: true },
  { label: "Cash paid to suppliers", amount: -486300, indent: true },
  { label: "Cash paid to employees", amount: -1860000, indent: true },
  { label: "Taxes paid (VAT, PAYE)", amount: -394200, indent: true },
  { label: "Net cash from operations", amount: 144100, bold: true, divider: true },
  { label: "INVESTING ACTIVITIES", amount: 0, bold: true },
  { label: "Equipment purchases", amount: -218000, indent: true },
  { label: "Net cash from investing", amount: -218000, bold: true, divider: true },
  { label: "FINANCING ACTIVITIES", amount: 0, bold: true },
  { label: "Owner capital injection", amount: 400000, indent: true },
  { label: "Net cash from financing", amount: 400000, bold: true, divider: true },
  { label: "NET CHANGE IN CASH", amount: 326100, bold: true },
];

export const trialBalance = [
  { code: "1000", name: "Cash & Bank", debit: 3421900, credit: 0 },
  { code: "1100", name: "Accounts Receivable", debit: 218400, credit: 0 },
  { code: "1200", name: "Inventory", debit: 342000, credit: 0 },
  { code: "1500", name: "Equipment & Fixtures", debit: 890000, credit: 0 },
  { code: "2000", name: "Accounts Payable", debit: 0, credit: 272200 },
  { code: "2100", name: "VAT Payable", debit: 0, credit: 182300 },
  { code: "2200", name: "PAYE Payable", debit: 0, credit: 98000 },
  { code: "2300", name: "Security Deposits Held", debit: 0, credit: 120000 },
  { code: "3000", name: "Owner's Equity", debit: 0, credit: 2400000 },
  { code: "3100", name: "Retained Earnings", debit: 0, credit: 1842300 },
  { code: "4000", name: "Sales — Services", debit: 0, credit: 1846200 },
  { code: "4010", name: "Sales — Goods", debit: 0, credit: 612400 },
  { code: "4050", name: "Rental Income", debit: 0, credit: 450000 },
  { code: "4900", name: "Other Income", debit: 0, credit: 38400 },
  { code: "5000", name: "Cost of Goods Sold", debit: 486300, credit: 0 },
  { code: "6000", name: "Salaries & Wages", debit: 1860000, credit: 0 },
  { code: "6010", name: "Rent — Premises", debit: 435000, credit: 0 },
  { code: "6020", name: "Transport & Fuel", debit: 186400, credit: 0 },
  { code: "6030", name: "Utilities", debit: 96200, credit: 0 },
  { code: "6040", name: "Professional Fees", debit: 148000, credit: 0 },
  { code: "6050", name: "Software & Subscriptions", debit: 82400, credit: 0 },
  { code: "6060", name: "Marketing & Advertising", debit: 124000, credit: 0 },
  { code: "6070", name: "Bank Charges", debit: 12400, credit: 0 },
  { code: "6080", name: "Repairs & Maintenance", debit: 64800, credit: 0 },
  { code: "6900", name: "Bad Debts Written Off", debit: 62000, credit: 0 },
];

/* ── VAT (4.5) ────────────────────────────────────────────────────── */

export interface VatPeriod {
  id: string;
  period: string;
  outputVat: number;
  inputVat: number;
  net: number;
  due: string;
  status: "filed" | "open" | "overdue";
  filedOn?: string;
  ackNumber?: string;
}

export const vatPeriodsSeed: VatPeriod[] = [
  { id: "v1", period: "March 2026", outputVat: 396400, inputVat: 214100, net: 182300, due: addDays(T, 8), status: "open" },
  { id: "v2", period: "February 2026", outputVat: 372800, inputVat: 198400, net: 174400, due: addDays(T, -22), status: "filed", filedOn: addDays(T, -24), ackNumber: "KRA-VAT-2026-0284412" },
  { id: "v3", period: "January 2026", outputVat: 341200, inputVat: 186900, net: 154300, due: addDays(T, -52), status: "filed", filedOn: addDays(T, -55), ackNumber: "KRA-VAT-2026-0198334" },
  { id: "v4", period: "December 2025", outputVat: 358600, inputVat: 201200, net: 157400, due: addDays(T, -83), status: "filed", filedOn: addDays(T, -86), ackNumber: "KRA-VAT-2025-0912847" },
];

export const vatBreakdown = [
  { label: "Standard-rated sales (16%)", net: 2477500, vat: 396400 },
  { label: "Zero-rated sales (exports)", net: 128000, vat: 0 },
  { label: "Exempt sales (rent)", net: 450000, vat: 0 },
  { label: "Input VAT — purchases", net: 1338100, vat: 214100 },
];

/* ── eTIMS (4.6) ──────────────────────────────────────────────────── */

export interface EtimsDoc {
  id: string;
  invoice: string;
  customer: string;
  amount: number;
  vat: number;
  date: string;
  status: "transmitted" | "queued" | "failed" | "not-required";
  cuNumber?: string;
  error?: string;
}

export const etimsSeed: EtimsDoc[] = [
  { id: "e1", invoice: "INV-0143", customer: "Mwangi Auto Garage", amount: 27500, vat: 3793, date: dt(0, 11, 2), status: "queued" },
  { id: "e2", invoice: "INV-0142", customer: "Akili Studio", amount: 18000, vat: 2483, date: dt(0, 10, 1), status: "transmitted", cuNumber: "KRACU0102938471" },
  { id: "e3", invoice: "INV-0141", customer: "Kimani Hardware", amount: 12500, vat: 1724, date: dt(2, 8, 1), status: "transmitted", cuNumber: "KRACU0102938102" },
  { id: "e4", invoice: "INV-0140", customer: "Coastal Wholesale", amount: 15000, vat: 2069, date: dt(15, 14, 1), status: "failed", error: "Customer KRA PIN invalid — F0233445M not found on iTax" },
  { id: "e5", invoice: "INV-0139", customer: "Achieng Events", amount: 44000, vat: 6069, date: dt(33, 12, 2), status: "transmitted", cuNumber: "KRACU0102844192" },
  { id: "e6", invoice: "INV-0138", customer: "Njoroge & Sons", amount: 49500, vat: 6828, date: dt(47, 9, 1), status: "failed", error: "Device offline at time of transmission — retry required" },
  { id: "e7", invoice: "RCT-0088", customer: "Walk-in cash sale", amount: 3400, vat: 469, date: dt(1, 15, 30), status: "transmitted", cuNumber: "KRACU0102938222" },
  { id: "e8", invoice: "INV-0136", customer: "Chebet Farm Supplies", amount: 84500, vat: 11655, date: dt(9, 9, 12), status: "transmitted", cuNumber: "KRACU0102901882" },
];

/* ── Income tax (4.7) ─────────────────────────────────────────────── */

export const incomeTax = {
  yearEnd: "31 Dec 2026",
  accountingProfit: 1284000,
  addBacks: [
    { label: "Depreciation (accounting)", amount: 218000 },
    { label: "Fines & penalties", amount: 24000 },
    { label: "Entertainment (non-deductible portion)", amount: 18400 },
  ],
  deductions: [
    { label: "Wear & tear allowance (capital)", amount: -186000 },
    { label: "Investment deduction", amount: -84000 },
  ],
  rate: 30,
  installmentsPaid: 240000,
};

export const installmentSchedule = [
  { q: "1st installment (20 Apr)", pct: 25, amount: 90000, due: addDays(T, 26), status: "upcoming" },
  { q: "2nd installment (20 Jun)", pct: 25, amount: 90000, due: addDays(T, 87), status: "upcoming" },
  { q: "3rd installment (20 Sep)", pct: 25, amount: 90000, due: addDays(T, 179), status: "upcoming" },
  { q: "4th installment (20 Dec)", pct: 25, amount: 90000, due: addDays(T, 270), status: "upcoming" },
];

/* ── Tax calendar (4.8) ───────────────────────────────────────────── */

export interface TaxEvent {
  id: string;
  label: string;
  agency: "KRA" | "NSSF" | "SHA" | "County";
  amount: number;
  due: string;
  freq: string;
  status: "upcoming" | "due-soon" | "overdue" | "filed";
  autopay: boolean;
}

export const taxEventsSeed: TaxEvent[] = [
  { id: "tx1", label: "PAYE remittance (P10)", agency: "KRA", amount: 98000, due: addDays(T, 5), freq: "Monthly · by 9th", status: "due-soon", autopay: true },
  { id: "tx2", label: "SHIF contributions", agency: "SHA", amount: 27000, due: addDays(T, 5), freq: "Monthly · by 9th", status: "due-soon", autopay: true },
  { id: "tx3", label: "NSSF contributions", agency: "NSSF", amount: 10800, due: addDays(T, 11), freq: "Monthly · by 15th", status: "upcoming", autopay: true },
  { id: "tx4", label: "VAT return & payment (VAT-3)", agency: "KRA", amount: 182300, due: addDays(T, 8), freq: "Monthly · by 20th", status: "due-soon", autopay: false },
  { id: "tx5", label: "Withholding tax remittance", agency: "KRA", amount: 12400, due: addDays(T, 8), freq: "Monthly · by 20th", status: "upcoming", autopay: true },
  { id: "tx6", label: "Housing Levy (1.5%)", agency: "KRA", amount: 9300, due: addDays(T, 5), freq: "Monthly · by 9th", status: "due-soon", autopay: true },
  { id: "tx7", label: "Corporate tax — 1st installment", agency: "KRA", amount: 90000, due: addDays(T, 26), freq: "Quarterly", status: "upcoming", autopay: false },
  { id: "tx8", label: "Single Business Permit renewal", agency: "County", amount: 32000, due: addDays(T, -4), freq: "Annual · Nairobi County", status: "overdue", autopay: false },
  { id: "tx9", label: "February VAT return", agency: "KRA", amount: 174400, due: addDays(T, -22), freq: "Monthly", status: "filed", autopay: false },
];

/* ── Accountant & audit (4.9) ─────────────────────────────────────── */

export interface Collaborator {
  id: string;
  name: string;
  firm: string;
  email: string;
  role: "Accountant" | "Auditor" | "Bookkeeper" | "Viewer";
  access: string[];
  lastActive: string;
  status: "active" | "invited" | "revoked";
}

export const collaboratorsSeed: Collaborator[] = [
  { id: "col1", name: "Grace Mwende, CPA(K)", firm: "Mwende & Associates", email: "grace@mwendecpa.co.ke", role: "Accountant", access: ["Reports", "Journals", "VAT", "eTIMS"], lastActive: "2 hours ago", status: "active" },
  { id: "col2", name: "Daniel Kiprop", firm: "Internal", email: "daniel@techsol.co.ke", role: "Bookkeeper", access: ["Categorize", "Reports"], lastActive: "yesterday", status: "active" },
  { id: "col3", name: "PKF Kenya (audit team)", firm: "PKF Kenya", email: "audit@pkf.co.ke", role: "Auditor", access: ["Reports", "Audit trail"], lastActive: "invited 3 days ago", status: "invited" },
];

export const auditTrailSeed = [
  { id: "at1", t: dt(0, 9, 14), who: "Wanjiru K.", action: "Posted journal JE-0104 (depreciation KES 18,500)", kind: "journal" },
  { id: "at2", t: dt(0, 8, 42), who: "System", action: "Auto-categorized 14 transactions (avg 93% confidence)", kind: "auto" },
  { id: "at3", t: dt(1, 16, 2), who: "Grace Mwende", action: "Viewed Profit & Loss — March 2026", kind: "view" },
  { id: "at4", t: dt(1, 11, 30), who: "Peter N.", action: "Created draft journal JE-0105 (prepaid insurance)", kind: "journal" },
  { id: "at5", t: dt(2, 14, 8), who: "Wanjiru K.", action: "Filed February VAT return — ack KRA-VAT-2026-0284412", kind: "filing" },
  { id: "at6", t: dt(3, 10, 0), who: "System", action: "eTIMS transmission failed for INV-0140 (invalid PIN)", kind: "error" },
  { id: "at7", t: dt(4, 9, 45), who: "Daniel Kiprop", action: "Recategorized 6 transactions from 6020 → 5000", kind: "edit" },
  { id: "at8", t: dt(6, 17, 20), who: "Wanjiru K.", action: "Locked period February 2026 — no further edits", kind: "lock" },
];

export const closeChecklist = [
  { id: "cc1", label: "All bank accounts reconciled", done: true, detail: "KCB & Equity matched to statement" },
  { id: "cc2", label: "All transactions categorized", done: false, detail: "8 transactions still uncategorized" },
  { id: "cc3", label: "Depreciation posted", done: true, detail: "JE-0104 posted" },
  { id: "cc4", label: "Accruals & prepayments posted", done: false, detail: "JE-0105 still in draft" },
  { id: "cc5", label: "Inventory count adjusted", done: true, detail: "Stock take 28 Feb" },
  { id: "cc6", label: "VAT return filed", done: false, detail: "March VAT due in 8 days" },
  { id: "cc7", label: "Receivables reviewed for bad debts", done: true, detail: "JE-0102 write-off posted" },
  { id: "cc8", label: "Trial balance balances", done: true, detail: "Debits = credits ✓" },
];

/* ── Notifications ────────────────────────────────────────────────── */

export interface BookNotification {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const bookNotificationsSeed: BookNotification[] = [
  { id: "bn1", tone: "danger", title: "Single Business Permit overdue", body: "Nairobi County permit expired 4 days ago — KES 32,000 plus penalties accruing daily.", time: "16 min ago", read: false },
  { id: "bn2", tone: "warning", title: "2 eTIMS transmissions failed", body: "INV-0140 and INV-0138 could not be transmitted to KRA. Fix and retry before filing VAT.", time: "48 min ago", read: false },
  { id: "bn3", tone: "warning", title: "March VAT due in 8 days", body: "Net VAT payable KES 182,300. The return is ready to review and file.", time: "2 h ago", read: false },
  { id: "bn4", tone: "info", title: "14 transactions auto-categorized", body: "The engine matched 14 items at 93% average confidence. Review and approve in one click.", time: "4 h ago", read: true },
  { id: "bn5", tone: "success", title: "Grace Mwende accessed your books", body: "Your accountant reviewed the P&L for March 2026.", time: "yesterday", read: true },
];
