import { addDays, todayISO } from "./lib";

const T = todayISO();
const dt = (h: number, m: number) => `${T}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

/* ── Types ─────────────────────────────────────────────────────────── */

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  pin: string;
  contact: string;
  terms: string;
  bank: string;
  account: string;
  wtType: string;
  rating: number;
  owed: number;
  ytd: number;
  status: "active" | "onhold";
  note: string;
}

export interface BillLine {
  desc: string;
  qty: number;
  unit: string;
  price: number;
  tax: number;
  wht: number;
  disc: number;
}

export interface BillActivity {
  t: string;
  text: string;
  kind: "created" | "submitted" | "approved" | "paid" | "scheduled" | "note" | "system";
}

export interface BillPayment {
  id: string;
  amount: number;
  method: string;
  ref: string;
  t: string;
  status: "settled" | "pending";
}

export type BillStatus = "draft" | "pending" | "approved" | "scheduled" | "paid" | "overdue";

export interface BillApproval {
  requester: string;
  submitted: string;
  chain: string[];
  step: number;
  urgency: "low" | "medium" | "high";
}

export interface Bill {
  id: string;
  number: string;
  supplierId: string;
  issue: string;
  due: string;
  amount: number;
  paid: number;
  status: BillStatus;
  lines: BillLine[];
  po?: string;
  notes: string;
  attachments: string[];
  activity: BillActivity[];
  payments: BillPayment[];
  etims: "verified" | "ready" | "missing";
  approval?: BillApproval;
}

export interface Employee {
  id: string;
  name: string;
  dept: string;
  gross: number;
  net: number;
  method: "Bank" | "M-Pesa";
}

export interface Expense {
  id: string;
  emp: string;
  category: string;
  desc: string;
  amount: number;
  vat: number;
  status: "pending" | "approved" | "reimbursed" | "rejected";
  receipt: string;
  submitted: string;
}

export interface ScheduledPayment {
  id: string;
  label: string;
  to: string;
  amount: number;
  date: string;
  status: "scheduled" | "processing" | "completed" | "failed";
  channel: string;
}

/* ── Suppliers ─────────────────────────────────────────────────────── */

export const suppliersSeed: Supplier[] = [
  { id: "s1", name: "Soko Agri Supplies Ltd", category: "Goods · Inventory", phone: "0711 456 780", email: "ap@sokoagri.co.ke", pin: "P0312345A", contact: "Mary Njeri", terms: "Net 30", bank: "KCB", account: "•••• 2441", wtType: "Goods · WHT 2%", rating: 4.8, owed: 84500, ytd: 1240000, status: "active", note: "Preferred supplier — volume discount 4% above KES 100K." },
  { id: "s2", name: "Rift Valley Logistics", category: "Services · Transport", phone: "0722 118 900", email: "billing@rvlogistics.co.ke", pin: "P0218876C", contact: "Daniel Ruto", terms: "Net 15", bank: "Equity", account: "•••• 8812", wtType: "Services · WHT 5%", rating: 4.5, owed: 31000, ytd: 890000, status: "active", note: "Fuel & delivery fleet for retail runs." },
  { id: "s3", name: "Nairobi Print & Pack", category: "Goods · Packaging", phone: "0703 771 224", email: "orders@printpack.co.ke", pin: "P0441120D", contact: "Atieno B.", terms: "Net 30", bank: "NCBA", account: "•••• 5507", wtType: "Goods · WHT 2%", rating: 4.6, owed: 0, ytd: 412000, status: "active", note: "Boxes, labels and branded packaging." },
  { id: "s4", name: "Jenga Builders Ltd", category: "Contractor · Fit-out", phone: "0733 604 118", email: "contracts@jengabuilders.co.ke", pin: "P0119876E", contact: "Peter Kamau", terms: "Net 30", bank: "Co-op", account: "•••• 0922", wtType: "Contractor · WHT 3%", rating: 3.9, owed: 148000, ytd: 1560000, status: "active", note: "Warehouse fit-out phase 2 — retention KES 60K held." },
  { id: "s5", name: "TechServe Kenya", category: "Professional services", phone: "0790 334 556", email: "finance@techserve.co.ke", pin: "P0992234F", contact: "Winnie A.", terms: "Net 15", bank: "I&M", account: "•••• 7730", wtType: "Professional · WHT 5%", rating: 4.7, owed: 18500, ytd: 340000, status: "active", note: "Server maintenance & support SLA." },
  { id: "s6", name: "Mombasa Fresh Produce", category: "Goods · Perishables", phone: "0701 889 210", email: "sales@mfresh.co.ke", pin: "P0776654G", contact: "Fatuma R.", terms: "On delivery", bank: "M-Pesa", account: "0721 889 210", wtType: "Goods · WHT 2%", rating: 4.4, owed: 0, ytd: 298000, status: "active", note: "Weekly produce for staff kitchen & events." },
  { id: "s7", name: "Quick Copy Supplies", category: "Goods · Office", phone: "0724 110 663", email: "orders@quickcopy.co.ke", pin: "P0554412H", contact: "Esther L.", terms: "Net 15", bank: "KCB", account: "•••• 3109", wtType: "Goods · WHT 2%", rating: 4.2, owed: 6400, ytd: 156000, status: "active", note: "Stationery & toner on a monthly standing order." },
  { id: "s8", name: "SolarGen Ltd", category: "Equipment · Solar", phone: "0741 552 907", email: "sales@solargen.co.ke", pin: "P0880021K", contact: "Brian O.", terms: "50% deposit", bank: "Stanbic", account: "•••• 6604", wtType: "Equipment · WHT 2%", rating: 4.0, owed: 0, ytd: 0, status: "onhold", note: "On hold — awaiting updated KRA PIN before first order." },
];

/* ── Bills ─────────────────────────────────────────────────────────── */

const act = (t: string, text: string, kind: BillActivity["kind"]): BillActivity => ({ t, text, kind });

export const billsSeed: Bill[] = [
  {
    id: "b-0044", number: "BILL-0044", supplierId: "s5", issue: T, due: addDays(T, 14), amount: 96400, paid: 0, status: "draft",
    lines: [{ desc: "Server maintenance SLA — March", qty: 1, unit: "mo", price: 70000, tax: 16, wht: 5, disc: 0 }, { desc: "Emergency support hours (4 h)", qty: 4, unit: "hours", price: 2500, tax: 16, wht: 5, disc: 0 }],
    notes: "SLA month of March + 4 out-of-scope support hours.", attachments: ["sla-annex.pdf"],
    activity: [act(dt(9, 14), "Bill created (draft)", "created")],
    payments: [], etims: "ready",
  },
  {
    id: "b-0043", number: "BILL-0043", supplierId: "s7", issue: addDays(T, -1), due: addDays(T, 14), amount: 12300, paid: 0, status: "draft",
    lines: [{ desc: "Toner cartridges (2×)", qty: 2, unit: "pcs", price: 5200, tax: 16, wht: 2, disc: 0 }, { desc: "A4 paper (5 reams)", qty: 5, unit: "pcs", price: 380, tax: 16, wht: 2, disc: 0 }],
    notes: "", attachments: [],
    activity: [act(dt(8, 40), "Bill created (draft)", "created")],
    payments: [], etims: "ready",
  },
  {
    id: "b-0042", number: "BILL-0042", supplierId: "s1", issue: T, due: addDays(T, 30), amount: 84500, paid: 0, status: "pending",
    lines: [{ desc: "Packaged fertilizer — 40 bags", qty: 40, unit: "pcs", price: 1850, tax: 16, wht: 2, disc: 0 }],
    po: "PO-0201", notes: "Delivery to Kilimani warehouse, dock 3.", attachments: ["po-0201.pdf", "delivery-slip.jpg"],
    activity: [
      act(dt(8, 12), "Bill captured from PO-0201", "created"),
      act(dt(8, 13), "Submitted for approval (M. Kamau → W. Kariuki)", "submitted"),
    ],
    payments: [], etims: "verified",
    approval: { requester: "Mary Kamau", submitted: dt(8, 13), chain: ["Mary Kamau", "Wanjiru Kariuki"], step: 0, urgency: "medium" },
  },
  {
    id: "b-0041", number: "BILL-0041", supplierId: "s2", issue: addDays(T, -2), due: addDays(T, 13), amount: 31000, paid: 0, status: "pending",
    lines: [{ desc: "Fleet fuel — March (2,400 L)", qty: 2400, unit: "L", price: 12, tax: 16, wht: 5, disc: 0 }],
    po: "PO-0198", notes: "Monthly fuel bulk invoice.", attachments: ["fuel-log.xlsx"],
    activity: [
      act(addDays(T, -2) + "T10:05:00", "Bill captured", "created"),
      act(addDays(T, -2) + "T10:06:00", "Submitted for approval (D. Otieno → W. Kariuki)", "submitted"),
    ],
    payments: [], etims: "verified",
    approval: { requester: "Daniel Otieno", submitted: addDays(T, -2) + "T10:06:00", chain: ["Daniel Otieno", "Wanjiru Kariuki"], step: 0, urgency: "high" },
  },
  {
    id: "b-0040", number: "BILL-0040", supplierId: "s5", issue: addDays(T, -4), due: addDays(T, 11), amount: 18500, paid: 0, status: "pending",
    lines: [{ desc: "Network switch replacement", qty: 1, unit: "pcs", price: 18500, tax: 16, wht: 5, disc: 0 }],
    notes: "Replacement for failed core switch.", attachments: ["invoice-8821.pdf"],
    activity: [
      act(addDays(T, -4) + "T14:20:00", "Bill captured", "created"),
      act(addDays(T, -4) + "T14:22:00", "Submitted for approval (M. Kamau → W. Kariuki)", "submitted"),
    ],
    payments: [], etims: "ready",
    approval: { requester: "Mary Kamau", submitted: addDays(T, -4) + "T14:22:00", chain: ["Mary Kamau", "Wanjiru Kariuki"], step: 0, urgency: "low" },
  },
  {
    id: "b-0039", number: "BILL-0039", supplierId: "s6", issue: addDays(T, -1), due: addDays(T, 0), amount: 22400, paid: 0, status: "approved",
    lines: [{ desc: "Weekly produce delivery", qty: 1, unit: "pcs", price: 22400, tax: 0, wht: 2, disc: 0 }],
    notes: "Pay on delivery.", attachments: ["delivery-note.pdf"],
    activity: [
      act(addDays(T, -1) + "T07:50:00", "Bill captured", "created"),
      act(addDays(T, -1) + "T09:10:00", "Approved by Wanjiru Kariuki", "approved"),
    ],
    payments: [], etims: "verified",
  },
  {
    id: "b-0038", number: "BILL-0038", supplierId: "s3", issue: addDays(T, -3), due: addDays(T, 27), amount: 45600, paid: 0, status: "approved",
    lines: [{ desc: "Custom branded boxes (6,000)", qty: 6000, unit: "pcs", price: 7.6, tax: 16, wht: 2, disc: 0 }],
    po: "PO-0202", notes: "Batch 2 of rebrand packaging.", attachments: ["artwork-proof.pdf"],
    activity: [
      act(addDays(T, -3) + "T11:00:00", "Bill captured from PO-0202", "created"),
      act(addDays(T, -2) + "T08:30:00", "Approved by Wanjiru Kariuki", "approved"),
    ],
    payments: [], etims: "verified",
  },
  {
    id: "b-0037", number: "BILL-0037", supplierId: "s1", issue: addDays(T, -6), due: addDays(T, 2), amount: 65000, paid: 0, status: "scheduled",
    lines: [{ desc: "Seed stock — season prep", qty: 500, unit: "kg", price: 130, tax: 0, wht: 2, disc: 0 }],
    notes: "Payment scheduled via PesaLink.", attachments: [],
    activity: [
      act(addDays(T, -6) + "T09:00:00", "Bill captured", "created"),
      act(addDays(T, -5) + "T16:00:00", "Approved by Wanjiru Kariuki", "approved"),
      act(addDays(T, -4) + "T10:00:00", "Scheduled for payment on " + addDays(T, 2) + " via PesaLink", "scheduled"),
    ],
    payments: [{ id: "bp-1", amount: 65000, method: "PesaLink", ref: "PSL-PEND-2201", t: addDays(T, -4) + "T10:00:00", status: "pending" }],
    etims: "verified",
  },
  {
    id: "b-0036", number: "BILL-0036", supplierId: "s3", issue: addDays(T, -12), due: addDays(T, -3), amount: 38900, paid: 38900, status: "paid",
    lines: [{ desc: "Retail counter displays", qty: 8, unit: "pcs", price: 4862, tax: 16, wht: 2, disc: 0 }],
    notes: "", attachments: ["receipt-etims.pdf"],
    activity: [
      act(addDays(T, -12) + "T10:00:00", "Bill captured", "created"),
      act(addDays(T, -12) + "T13:00:00", "Approved by Wanjiru Kariuki", "approved"),
      act(addDays(T, -5) + "T09:15:00", "Paid KES 38,900 via M-Pesa B2B", "paid"),
    ],
    payments: [{ id: "bp-2", amount: 38900, method: "M-Pesa B2B", ref: "B2B4481XK", t: addDays(T, -5) + "T09:15:00", status: "settled" }],
    etims: "verified",
  },
  {
    id: "b-0035", number: "BILL-0035", supplierId: "s7", issue: addDays(T, -18), due: addDays(T, -6), amount: 8700, paid: 8700, status: "paid",
    lines: [{ desc: "Office supplies restock", qty: 1, unit: "pcs", price: 8700, tax: 16, wht: 2, disc: 0 }],
    notes: "", attachments: [],
    activity: [
      act(addDays(T, -18) + "T09:00:00", "Bill captured", "created"),
      act(addDays(T, -9) + "T12:00:00", "Paid KES 8,700 via card", "paid"),
    ],
    payments: [{ id: "bp-3", amount: 8700, method: "Card (Visa)", ref: "CHRG-90213", t: addDays(T, -9) + "T12:00:00", status: "settled" }],
    etims: "verified",
  },
  {
    id: "b-0034", number: "BILL-0034", supplierId: "s2", issue: addDays(T, -21), due: addDays(T, -6), amount: 52000, paid: 52000, status: "paid",
    lines: [{ desc: "February transport runs", qty: 26, unit: "pcs", price: 2000, tax: 16, wht: 5, disc: 0 }],
    notes: "", attachments: ["invoice-feb.pdf"],
    activity: [
      act(addDays(T, -21) + "T08:00:00", "Bill captured", "created"),
      act(addDays(T, -7) + "T14:30:00", "Paid KES 52,000 via PesaLink", "paid"),
    ],
    payments: [{ id: "bp-4", amount: 52000, method: "PesaLink", ref: "PSL009845", t: addDays(T, -7) + "T14:30:00", status: "settled" }],
    etims: "verified",
  },
  {
    id: "b-0033", number: "BILL-0033", supplierId: "s1", issue: addDays(T, -35), due: addDays(T, -5), amount: 110500, paid: 110500, status: "paid",
    lines: [{ desc: "Fertilizer & soil treatments", qty: 1, unit: "pcs", price: 110500, tax: 16, wht: 2, disc: 0 }],
    notes: "", attachments: [],
    activity: [
      act(addDays(T, -35) + "T09:00:00", "Bill captured", "created"),
      act(addDays(T, -5) + "T10:45:00", "Paid KES 110,500 via RTGS", "paid"),
    ],
    payments: [{ id: "bp-5", amount: 110500, method: "RTGS", ref: "RTGS-7731", t: addDays(T, -5) + "T10:45:00", status: "settled" }],
    etims: "verified",
  },
  {
    id: "b-0032", number: "BILL-0032", supplierId: "s4", issue: addDays(T, -92), due: addDays(T, -61), amount: 148000, paid: 0, status: "overdue",
    lines: [{ desc: "Fit-out works — final certificate", qty: 1, unit: "pcs", price: 148000, tax: 16, wht: 3, disc: 0 }],
    notes: "Retention KES 60K held. Balance overdue 61 days — disputed on snag list item 4.", attachments: ["snag-list.pdf"],
    activity: [
      act(addDays(T, -92) + "T09:00:00", "Bill captured", "created"),
      act(addDays(T, -88) + "T11:00:00", "Approved by Wanjiru Kariuki", "approved"),
      act(addDays(T, -61) + "T09:00:00", "Due date passed — overdue", "system"),
      act(addDays(T, -30) + "T10:00:00", "Supplier sent reminder (snag list dispute)", "note"),
    ],
    payments: [], etims: "missing",
  },
  {
    id: "b-0031", number: "BILL-0031", supplierId: "s5", issue: addDays(T, -26), due: addDays(T, -11), amount: 27800, paid: 0, status: "overdue",
    lines: [{ desc: "Firewall licence renewal (annual)", qty: 1, unit: "pcs", price: 27800, tax: 16, wht: 5, disc: 0 }],
    notes: "Renewal before subscription lapses.", attachments: ["licence-quote.pdf"],
    activity: [
      act(addDays(T, -26) + "T10:00:00", "Bill captured", "created"),
      act(addDays(T, -11) + "T09:00:00", "Due date passed — overdue", "system"),
    ],
    payments: [], etims: "ready",
  },
];

/* ── Payroll ───────────────────────────────────────────────────────── */

export const employeesSeed: Employee[] = [
  { id: "e1", name: "James K.", dept: "Engineering", gross: 120000, net: 86400, method: "Bank" },
  { id: "e2", name: "Grace M.", dept: "Engineering", gross: 95000, net: 71200, method: "Bank" },
  { id: "e3", name: "David O.", dept: "Sales", gross: 60000, net: 48500, method: "M-Pesa" },
  { id: "e4", name: "Faith W.", dept: "Operations", gross: 55000, net: 44100, method: "Bank" },
  { id: "e5", name: "Peter N.", dept: "Finance", gross: 90000, net: 68900, method: "Bank" },
  { id: "e6", name: "Sarah A.", dept: "HR", gross: 45000, net: 37200, method: "M-Pesa" },
  { id: "e7", name: "Kevin O.", dept: "IT", gross: 75000, net: 57800, method: "Bank" },
  { id: "e8", name: "Mercy J.", dept: "Support", gross: 80000, net: 61000, method: "M-Pesa" },
];

export const payrollStats = {
  headcount: 24,
  gross: 620000,
  paye: 98000,
  nssf: 2160,
  shif: 5400,
  other: 63940,
  net: 450500,
  wallet: 1990000,
};

/* ── Expenses ──────────────────────────────────────────────────────── */

export const expensesSeed: Expense[] = [
  { id: "x1", emp: "Mary Kamau", category: "Travel", desc: "Site visit — Nakuru (fuel + per diem)", amount: 8400, vat: 0, status: "pending", receipt: "receipt-nakuru.jpg", submitted: addDays(T, -1) },
  { id: "x2", emp: "Daniel Otieno", category: "Tools & Equipment", desc: "Cordless drill for fit-out crew", amount: 12500, vat: 1724, status: "pending", receipt: "drill-invoice.pdf", submitted: addDays(T, -2) },
  { id: "x3", emp: "Faith W.", category: "Internet & Airtime", desc: "Mobile data bundle — March", amount: 2500, vat: 345, status: "approved", receipt: "bundle-receipt.png", submitted: addDays(T, -5) },
  { id: "x4", emp: "Kevin O.", category: "Software", desc: "Monitoring tool subscription (annual)", amount: 18900, vat: 2607, status: "reimbursed", receipt: "invoice-saas.pdf", submitted: addDays(T, -12) },
  { id: "x5", emp: "Mercy J.", category: "Meals", desc: "Client workshop catering", amount: 6400, vat: 883, status: "reimbursed", receipt: "catering-receipt.pdf", submitted: addDays(T, -15) },
  { id: "x6", emp: "Sarah A.", category: "Office", desc: "Emergency printer repair", amount: 3100, vat: 0, status: "rejected", receipt: "repair-slip.jpg", submitted: addDays(T, -9) },
  { id: "x7", emp: "Peter N.", category: "Travel", desc: "Taxi — supplier pickup at JKIA", amount: 3800, vat: 0, status: "pending", receipt: "taxi-receipt.jpg", submitted: T },
];

/* ── Scheduled payments / cashflow ─────────────────────────────────── */

export const scheduledSeed: ScheduledPayment[] = [
  { id: "sp1", label: "BILL-0037 — seed stock", to: "Soko Agri Supplies Ltd", amount: 65000, date: addDays(T, 2), status: "scheduled", channel: "PesaLink" },
  { id: "sp2", label: "BILL-0038 — packaging", to: "Nairobi Print & Pack", amount: 45600, date: addDays(T, 4), status: "scheduled", channel: "M-Pesa B2B" },
  { id: "sp3", label: "Office rent — Westlands", to: "Cedar Properties Ltd", amount: 145000, date: addDays(T, 6), status: "scheduled", channel: "Bank transfer" },
  { id: "sp4", label: "Payroll — net disbursement", to: "24 employees", amount: 450500, date: addDays(T, 6), status: "scheduled", channel: "Bank + M-Pesa bulk" },
  { id: "sp5", label: "KRA VAT remittance", to: "Kenya Revenue Authority", amount: 96400, date: addDays(T, 8), status: "scheduled", channel: "RTGS" },
  { id: "sp6", label: "NSSF contributions", to: "NSSF", amount: 10800, date: addDays(T, 9), status: "scheduled", channel: "Bank transfer" },
  { id: "sp7", label: "SHIF contributions", to: "SHA", amount: 27000, date: addDays(T, 9), status: "scheduled", channel: "Bank transfer" },
  { id: "sp8", label: "Fuel float top-up", to: "Rift Valley Logistics", amount: 15000, date: addDays(T, 1), status: "processing", channel: "M-Pesa B2B" },
];

export const balanceForecast = [2410300, 2398800, 2384200, 2335100, 2312400, 2299100, 2186300, 1773500, 1740200, 1732400, 1724500, 1715800, 1708200, 1700100];

export const forecastLabels = Array.from({ length: 14 }, (_, i) => `${new Date(new Date(T).getTime() + i * 86400000).getDate()}/${new Date(new Date(T).getTime() + i * 86400000).getMonth() + 1}`);

/* ── WHT rates (2.9) ───────────────────────────────────────────────── */

export const whtRatesSeed = [
  { type: "Professional & management fees", rate: 5, desc: "Consultants, accountants, lawyers" },
  { type: "Contractual / building works", rate: 3, desc: "Contractors & fit-out services" },
  { type: "Supply of goods", rate: 2, desc: "Trading goods & materials" },
  { type: "Royalties", rate: 10, desc: "IP, licences, franchise" },
  { type: "Rent (non-residential)", rate: 10, desc: "Commercial premises" },
];

export const statutoryDues = [
  { id: "st1", label: "PAYE remittance", agency: "KRA", amount: 98000, due: addDays(T, 5), freq: "Monthly · 9th" },
  { id: "st2", label: "NSSF contributions", agency: "NSSF", amount: 10800, due: addDays(T, 9), freq: "Monthly · 15th" },
  { id: "st3", label: "SHIF contributions", agency: "SHA", amount: 27000, due: addDays(T, 9), freq: "Monthly · 9th" },
  { id: "st4", label: "VAT (16%) remittance", agency: "KRA", amount: 96400, due: addDays(T, 8), freq: "Monthly · 20th" },
  { id: "st5", label: "Withholding tax (WHT)", agency: "KRA", amount: 12400, due: addDays(T, 8), freq: "Monthly · 20th" },
];

/* ── Payment runs history ──────────────────────────────────────────── */

export const runsSeed = [
  { id: "run-1", title: "March batch 1 — supplier payments", bills: 4, total: 158300, date: addDays(T, -5), status: "completed", channel: "Mixed" },
  { id: "run-2", title: "February batch 2 — contractors", bills: 2, total: 296000, date: addDays(T, -19), status: "completed", channel: "RTGS" },
  { id: "run-3", title: "February batch 1 — goods", bills: 3, total: 121200, date: addDays(T, -33), status: "completed", channel: "PesaLink" },
];

/* ── FX exposure ───────────────────────────────────────────────────── */

export const fxSeed = [
  { id: "fx1", bill: "BILL-0038", supplier: "Nairobi Print & Pack", usd: 352, rate: 129.4, locked: true, kes: 45549 },
  { id: "fx2", bill: "BILL-0039", supplier: "Mombasa Fresh Produce", usd: 173, rate: 129.4, locked: false, kes: 22386 },
];

/* ── Notifications (money out) ─────────────────────────────────────── */

export interface PayNotification {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const payNotificationsSeed: PayNotification[] = [
  { id: "pn1", tone: "danger", title: "BILL-0032 overdue 61 days", body: "Jenga Builders Ltd — KES 148,000. Disputed on snag list item 4. Payment is blocked pending resolution.", time: "12 min ago", read: false },
  { id: "pn2", tone: "warning", title: "3 bills awaiting your approval", body: "Total KES 134,000 sitting in the approval queue since this morning.", time: "1 h ago", read: false },
  { id: "pn3", tone: "info", title: "Payroll run in 6 days", body: "Net disbursement KES 450,500 for 24 employees. Wallet balance sufficient.", time: "2 h ago", read: true },
  { id: "pn4", tone: "success", title: "Payment run completed", body: "March batch 1 settled — KES 158,300 across 4 suppliers.", time: "5 days ago", read: true },
  { id: "pn5", tone: "warning", title: "FX rate lock expires in 48 h", body: "Rate 129.4 on BILL-0038 expires soon. Re-lock or pay to avoid drift.", time: "Yesterday", read: false },
];

/* ── Bill catalog for picker ───────────────────────────────────────── */

export const billCatalog = [
  { id: "g1", name: "Packaged fertilizer (per bag)", price: 1850, unit: "pcs", tax: 16, wht: 2 },
  { id: "g2", name: "Seed stock (per kg)", price: 130, unit: "kg", tax: 0, wht: 2 },
  { id: "g3", name: "Diesel (per litre)", price: 12, unit: "L", tax: 16, wht: 5 },
  { id: "g4", name: "Branded packaging box", price: 7.6, unit: "pcs", tax: 16, wht: 2 },
  { id: "g5", name: "Server maintenance (month)", price: 70000, unit: "mo", tax: 16, wht: 5 },
  { id: "g6", name: "Support hours", price: 2500, unit: "hours", tax: 16, wht: 5 },
  { id: "g7", name: "Office toner cartridge", price: 5200, unit: "pcs", tax: 16, wht: 2 },
  { id: "g8", name: "A4 paper (ream)", price: 380, unit: "pcs", tax: 16, wht: 2 },
];
