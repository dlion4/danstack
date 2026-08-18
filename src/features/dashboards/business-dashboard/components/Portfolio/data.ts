/* ==================================================================
   PayMo Business — PAGE 14: MULTI-BUSINESS / PORTFOLIO — data layer
================================================================== */

/* ================= Types ================= */
export type EntityType = "Ltd" | "Sole Prop" | "SACCO / NGO" | "Rental";
export type EntityStatus = "Healthy" | "Watch" | "Critical";
export type TransferType = "Capital Injection" | "Loan" | "Management Fee" | "Expense Reimbursement";
export type TransferStatus = "Pending approval" | "Approved" | "Executed";
export type TenantStatus = "Active" | "Overdue" | "Vacant" | "Notice";
export type MaintPriority = "Low" | "High" | "Emergency";
export type MaintStatus = "Open" | "Assigned" | "Resolved";
export type AccessLevel = "No Access" | "Viewer" | "Standard" | "Admin";

export interface Entity {
  id: string; name: string; type: EntityType; folder: string; emoji: string; color: string;
  cash: number; revenueMTD: number; expensesMTD: number; taxExposure: number;
  status: EntityStatus; units?: number; krapin?: string;
}
export interface Folder { id: string; name: string; emoji: string }
export interface Transfer {
  id: string; from: string; to: string; amount: number; reason: string;
  type: TransferType; date: string; status: TransferStatus; note?: string;
}
export interface LoanScheduleRow { n: number; date: string; amount: number; status: "Paid" | "Due" | "Upcoming" }
export interface InterLoan {
  id: string; from: string; to: string; principal: number; outstanding: number;
  rate: number | null; termMonths: number; paidCount: number; note: string; schedule: LoanScheduleRow[];
}
export interface Tenant {
  id: string; name: string; phone: string; email: string; unit: string; entityId: string;
  rent: number; deposit: number; leaseStart: string; leaseEnd: string; status: TenantStatus; since: string;
}
export interface DepositEntry { id: string; date: string; tenant: string; type: "Move-in" | "Deduction" | "Refund"; amount: number; note: string }
export interface Maintenance {
  id: string; unit: string; entityId: string; issue: string; priority: MaintPriority;
  status: MaintStatus; vendor: string; cost: number; date: string; photos: number;
}
export interface TeamMember {
  id: string; name: string; role: string; managerOf: string;
  matrix: Record<string, AccessLevel>;
}
export interface TaxItem {
  id: string; entity: string; type: string; amount: number; due: string; status: "Paid" | "Due" | "Upcoming";
}
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
export const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 15);

/* ================= Folders & entities ================= */
export const FOLDERS: Folder[] = [
  { id: "f1", name: "Operating Companies", emoji: "📁" },
  { id: "f2", name: "Rental Properties", emoji: "🏘️" },
  { id: "f3", name: "Side Projects", emoji: "🚀" },
];

export const ENTITIES: Entity[] = [
  { id: "e1", name: "TS Retail Ltd", type: "Ltd", folder: "f1", emoji: "🛍️", color: "#12b76a", cash: 1240000, revenueMTD: 486250, expensesMTD: 301400, taxExposure: 96400, status: "Healthy", krapin: "P051234567X" },
  { id: "e2", name: "TechSolutions Ltd", type: "Ltd", folder: "f1", emoji: "💻", color: "#2e90fa", cash: 890000, revenueMTD: 720000, expensesMTD: 480000, taxExposure: 290000, status: "Healthy", krapin: "P051239991Y" },
  { id: "e3", name: "Kilimani House 1", type: "Rental", folder: "f2", emoji: "🏠", color: "#f79009", cash: 1420000, revenueMTD: 150000, expensesMTD: 42000, taxExposure: 0, status: "Healthy", units: 6 },
  { id: "e4", name: "Kilimani House 2", type: "Rental", folder: "f2", emoji: "🏡", color: "#7a5af8", cash: 520000, revenueMTD: 90000, expensesMTD: 68000, taxExposure: 0, status: "Watch", units: 4 },
  { id: "e5", name: "Sanaa Side Hustle", type: "Sole Prop", folder: "f3", emoji: "🎨", color: "#e11d48", cash: 142000, revenueMTD: 80000, expensesMTD: 33000, taxExposure: 0, status: "Watch", krapin: "P051234001A" },
];

/* ================= Inter-company transfers ================= */
export const TRANSFERS: Transfer[] = [
  { id: "TRF-2212", from: "Kilimani House 1", to: "TS Retail Ltd", amount: 1200000, reason: "Loan repayment — LN-IC-02", type: "Loan", date: "Today 09:40", status: "Pending approval", note: "Above KES 1,000,000 — needs Portfolio Owner approval" },
  { id: "TRF-2211", from: "TS Retail Ltd", to: "Sanaa Side Hustle", amount: 30000, reason: "Workshop materials", type: "Capital Injection", date: "2d ago", status: "Executed" },
  { id: "TRF-2210", from: "TechSolutions Ltd", to: "Kilimani House 1", amount: 50000, reason: "Monthly maintenance fund", type: "Management Fee", date: "4d ago", status: "Executed" },
  { id: "TRF-2209", from: "TS Retail Ltd", to: "TechSolutions Ltd", amount: 100000, reason: "Website & inventory system", type: "Management Fee", date: "1w ago", status: "Executed" },
  { id: "TRF-2208", from: "TechSolutions Ltd", to: "TS Retail Ltd", amount: 250000, reason: "Equipment loan drawdown", type: "Loan", date: "2w ago", status: "Executed" },
];

/* ================= Inter-company loans ================= */
export const INTER_LOANS: InterLoan[] = [
  {
    id: "LN-IC-01", from: "TS Retail Ltd", to: "Sanaa Side Hustle", principal: 150000, outstanding: 90000,
    rate: 0, termMonths: 6, paidCount: 2, note: "Interest-free seed for the workshop",
    schedule: [
      { n: 1, date: "15 Nov 25", amount: 25000, status: "Paid" },
      { n: 2, date: "15 Dec 25", amount: 25000, status: "Paid" },
      { n: 3, date: "15 Jan 26", amount: 25000, status: "Due" },
      { n: 4, date: "15 Feb 26", amount: 25000, status: "Upcoming" },
      { n: 5, date: "15 Mar 26", amount: 25000, status: "Upcoming" },
      { n: 6, date: "15 Apr 26", amount: 25000, status: "Upcoming" },
    ],
  },
  {
    id: "LN-IC-02", from: "Kilimani House 1", to: "TS Retail Ltd", principal: 1200000, outstanding: 1200000,
    rate: 12, termMonths: 12, paidCount: 0, note: "Shop expansion loan — repayment KES 106,420/mo",
    schedule: Array.from({ length: 12 }, (_, i) => ({ n: i + 1, date: fmtDate(addMonths(new Date(2026, 0, 15), i)), amount: 106420, status: (i === 0 ? "Due" : "Upcoming") as "Due" | "Upcoming" })),
  },
];

/* ================= Tenants (rental sub-system) ================= */
export const TENANTS: Tenant[] = [
  { id: "t1", name: "Peter Kimutai", phone: "0722 118 445", email: "pkim@gmail.com", unit: "1A", entityId: "e3", rent: 30000, deposit: 30000, leaseStart: "1 Mar 25", leaseEnd: "28 Feb 26", status: "Active", since: "Mar 24" },
  { id: "t2", name: "Sarah Achieng", phone: "0733 442 990", email: "sarah.a@yahoo.com", unit: "1B", entityId: "e3", rent: 30000, deposit: 30000, leaseStart: "1 Apr 25", leaseEnd: "31 Mar 26", status: "Active", since: "Apr 24" },
  { id: "t3", name: "Joseph Mwenda", phone: "0710 556 302", email: "jmwenda@gmail.com", unit: "2A", entityId: "e3", rent: 30000, deposit: 30000, leaseStart: "1 Jun 25", leaseEnd: "31 May 26", status: "Active", since: "Jun 24" },
  { id: "t4", name: "Dennis Otieno", phone: "0728 663 441", email: "dotieno@gmail.com", unit: "2B", entityId: "e3", rent: 30000, deposit: 30000, leaseStart: "1 Aug 25", leaseEnd: "31 Jul 26", status: "Overdue", since: "Aug 24" },
  { id: "t5", name: "Mary Wambui", phone: "0798 441 226", email: "mwambui@outlook.com", unit: "3B", entityId: "e3", rent: 30000, deposit: 30000, leaseStart: "1 Sep 25", leaseEnd: "28 Feb 26", status: "Notice", since: "Sep 24" },
  { id: "t6", name: "Grace Njeri", phone: "0721 220 774", email: "gnjeri@gmail.com", unit: "A1", entityId: "e4", rent: 22500, deposit: 22500, leaseStart: "1 May 25", leaseEnd: "30 Apr 26", status: "Active", since: "May 24" },
  { id: "t7", name: "Brian Otieno", phone: "0733 812 990", email: "brian.o@gmail.com", unit: "A2", entityId: "e4", rent: 22500, deposit: 22500, leaseStart: "1 Jul 25", leaseEnd: "30 Jun 26", status: "Active", since: "Jul 24" },
  { id: "t8", name: "Naomi Chemtai", phone: "0712 990 213", email: "nchemtai@gmail.com", unit: "B1", entityId: "e4", rent: 22500, deposit: 22500, leaseStart: "1 Oct 25", leaseEnd: "30 Sep 26", status: "Overdue", since: "Oct 24" },
];

/* ================= Deposits ================= */
export const DEPOSITS: DepositEntry[] = [
  { id: "d1", date: "1 Mar 25", tenant: "Peter Kimutai", type: "Move-in", amount: 30000, note: "KES 30,000 received via M-Pesa" },
  { id: "d2", date: "1 Apr 25", tenant: "Sarah Achieng", type: "Move-in", amount: 30000, note: "KES 30,000 received via bank" },
  { id: "d3", date: "1 Jun 25", tenant: "Joseph Mwenda", type: "Move-in", amount: 30000, note: "KES 30,000 received via M-Pesa" },
  { id: "d4", date: "1 Aug 25", tenant: "Dennis Otieno", type: "Move-in", amount: 30000, note: "KES 30,000 received via M-Pesa" },
  { id: "d5", date: "15 Dec 25", tenant: "Former tenant — Unit 3A", type: "Deduction", amount: -4500, note: "Repainting bedroom (photo evidence)" },
  { id: "d6", date: "15 Dec 25", tenant: "Former tenant — Unit 3A", type: "Refund", amount: -25500, note: "Balance refunded via M-Pesa" },
];

/* ================= Maintenance ================= */
export const MAINTENANCE: Maintenance[] = [
  { id: "MR-104", unit: "2B", entityId: "e3", issue: "Leaking kitchen tap — flooding sink cabinet", priority: "Emergency", status: "Open", vendor: "", cost: 0, date: "Today 08:15", photos: 2 },
  { id: "MR-103", unit: "1A", entityId: "e3", issue: "Main door lock replacement", priority: "High", status: "Assigned", vendor: "Fundi John Mwangi", cost: 3500, date: "2d ago", photos: 1 },
  { id: "MR-102", unit: "3B", entityId: "e3", issue: "Repaint bedroom wall (water stain)", priority: "Low", status: "Resolved", vendor: "Fundi John Mwangi", cost: 12000, date: "1w ago", photos: 0 },
  { id: "MR-101", unit: "Common", entityId: "e3", issue: "Gate motor service & battery", priority: "High", status: "Resolved", vendor: "SecureGate Ltd", cost: 4800, date: "2w ago", photos: 1 },
  { id: "MR-100", unit: "B1", entityId: "e4", issue: "Shower head replacement", priority: "Low", status: "Assigned", vendor: "Fundi John Mwangi", cost: 1500, date: "3d ago", photos: 0 },
];

/* ================= Team & access matrix ================= */
export const TEAM: TeamMember[] = [
  { id: "u1", name: "Wanjiku Maina", role: "Portfolio Owner", managerOf: "", matrix: { e1: "Admin", e2: "Admin", e3: "Admin", e4: "Admin", e5: "Admin" } },
  { id: "u2", name: "Mwangi Kamau", role: "Store Manager", managerOf: "", matrix: { e1: "Admin", e2: "No Access", e3: "No Access", e4: "No Access", e5: "Viewer" } },
  { id: "u3", name: "Achieng Otieno", role: "Accountant", managerOf: "", matrix: { e1: "Viewer", e2: "Viewer", e3: "Viewer", e4: "Viewer", e5: "Viewer" } },
  { id: "u4", name: "Brian Kim", role: "Sales Associate", managerOf: "", matrix: { e1: "Standard", e2: "No Access", e3: "No Access", e4: "No Access", e5: "No Access" } },
  { id: "u5", name: "James Odhiambo", role: "Caretaker", managerOf: "Rental Properties", matrix: { e1: "No Access", e2: "No Access", e3: "Standard", e4: "No Access", e5: "No Access" } },
];

/* ================= Group tax ================= */
export const TAX_ITEMS: TaxItem[] = [
  { id: "tx1", entity: "TS Retail Ltd", type: "VAT (output)", amount: 96400, due: "20 Jan 26", status: "Due" },
  { id: "tx2", entity: "TechSolutions Ltd", type: "PAYE", amount: 88000, due: "9 Jan 26", status: "Upcoming" },
  { id: "tx3", entity: "TechSolutions Ltd", type: "VAT (output)", amount: 72000, due: "20 Jan 26", status: "Upcoming" },
  { id: "tx4", entity: "TechSolutions Ltd", type: "Corporate tax instalment", amount: 100000, due: "20 Jan 26", status: "Upcoming" },
  { id: "tx5", entity: "TechSolutions Ltd", type: "NSSF / SHIF", amount: 30000, due: "9 Jan 26", status: "Upcoming" },
  { id: "tx6", entity: "TS Retail Ltd", type: "VAT (previous month)", amount: 84200, due: "20 Dec 25", status: "Paid" },
];

/* ================= Consolidation ================= */
export const PL_REVENUE = [
  { line: "Sales revenue", TS: 486250, Tech: 720000, Rental: 240000, Sanaa: 80000 },
  { line: "Rent collected", TS: 0, Tech: 0, Rental: 240000, Sanaa: 0 },
  { line: "Management fees", TS: 100000, Tech: 0, Rental: 0, Sanaa: 0 },
];
export const PL_EXPENSES = [
  { line: "Cost of goods", TS: 218400, Tech: 210000, Rental: 0, Sanaa: 21000 },
  { line: "Salaries & wages", TS: 60000, Tech: 240000, Rental: 12000, Sanaa: 8000 },
  { line: "Maintenance & utilities", TS: 8000, Tech: 12000, Rental: 30000, Sanaa: 4000 },
  { line: "Marketing", TS: 15000, Tech: 18000, Rental: 0, Sanaa: 0 },
];
export const BS_ASSETS = [
  { line: "Cash & M-Pesa", value: 4212000 },
  { line: "Receivables", value: 860000 },
  { line: "Inventory (at cost)", value: 640000 },
  { line: "Fixed assets (net)", value: 3200000 },
];
export const BS_LIABILITIES = [
  { line: "Supplier payables", value: 540000 },
  { line: "Security deposits held", value: 480000 },
  { line: "Loans (bank & inter-company)", value: 2890000 },
  { line: "Taxes payable", value: 386400 },
];

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-hourglass-split", text: "TRF-2212 (KES 1.2M, House 1 → TS Retail) needs your approval", time: "12 min ago", unread: true, action: "Approve" },
  { id: 2, icon: "bi-exclamation-triangle", text: "Unit 2B rent overdue — Dennis Otieno owes KES 30,000", time: "1 hr ago", unread: true, action: "Remind" },
  { id: 3, icon: "bi-droplet", text: "Emergency maintenance MR-104: leaking tap in Unit 2B", time: "2 hrs ago", unread: true, action: "Assign" },
  { id: 4, icon: "bi-house", text: "Unit 3A vacant — KES 30,000/mo vacancy loss accumulating", time: "Yesterday", unread: true, action: "View" },
  { id: 5, icon: "bi-calendar3", text: "VAT due 20 Jan across 2 entities — KES 168,400 total", time: "Yesterday", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 09:40", icon: "bi-arrow-left-right", text: "TRF-2212 submitted — KES 1.2M loan repayment (awaiting approval)", by: "You" },
  { time: "Today 08:15", icon: "bi-droplet", text: "MR-104 logged — emergency leak, Unit 2B", by: "Dennis Otieno (tenant)" },
  { time: "Yesterday", icon: "bi-person-x", text: "Unit 3A move-out completed — deposit 25,500 refunded, 4,500 deducted", by: "You" },
  { time: "2d ago", icon: "bi-arrow-left-right", text: "TRF-2211 executed — KES 30,000 capital injection to Sanaa", by: "System" },
  { time: "2d ago", icon: "bi-people", text: "Access matrix updated — caretaker James: House 1 Standard only", by: "You" },
  { time: "4d ago", icon: "bi-arrow-left-right", text: "TRF-2210 executed — KES 50,000 maintenance fund to House 1", by: "System" },
  { time: "1w ago", icon: "bi-journal-check", text: "Group P&L generated — eliminations KES 150,000 inter-company", by: "You" },
  { time: "1w ago", icon: "bi-house", text: "Mary Wambui gave notice — Unit 3B vacant from 1 Mar 26", by: "System" },
];

export const MONTHLY_RENT = 30000;
export const VACANCY = { unit: "3A", monthlyRent: 30000, daysVacant: 46, loss: 45000, reason: "Move-out 15 Dec — repainting needed" };
