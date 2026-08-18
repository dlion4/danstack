/* ==================================================================
   PayMo Business — PAGE 0: DASHBOARD OVERVIEW — data layer
================================================================== */

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Financial Pulse KPIs ================= */
export const KPI_CARDS = [
  { id: "cash", label: "Cash on Hand", value: 1245000, trend: "+12%", trendUp: true, sub: "M-Pesa: KES 800K · Bank: KES 445K", spark: [800, 820, 790, 850, 920, 980, 1050, 1020, 1100, 1140, 1190, 1245], page: "Cash & Accounts", alert: null },
  { id: "collected", label: "Collected (This Month)", value: 3450000, trend: "+18%", trendUp: true, sub: "From 287 transactions · 12% above target", spark: [112, 118, 125, 108, 130, 145, 152, 138, 148, 162, 170, 168], page: "Get Paid", alert: null },
  { id: "paidOut", label: "Paid Out (This Month)", value: 2180000, trend: "-5%", trendUp: false, sub: "Suppliers: KES 1.5M · Payroll: KES 450K", spark: [88, 92, 85, 95, 82, 78, 80, 76, 72, 70, 68, 65], page: "Pay Suppliers", alert: null },
  { id: "receivables", label: "Receivables (Owed to You)", value: 890000, trend: "+KES 120K", trendUp: false, sub: "12 overdue invoices · KES 320K is 30+ days late", spark: [70, 68, 72, 78, 82, 85, 80, 84, 88, 92, 95, 89], page: "Get Paid", alert: { color: "red", text: "KES 150K overdue 60+ days" } },
  { id: "payables", label: "Bills Due", value: 560000, trend: "3 due this week", trendUp: false, sub: "KES 180K due tomorrow", spark: [65, 70, 55, 48, 52, 60, 58, 62, 56, 50, 52, 56], page: "Pay Suppliers", alert: { color: "amber", text: "KES 45K overdue" } },
  { id: "net", label: "Net Cash Position", value: 685000, trend: "+8.2%", trendUp: true, sub: "Cash + Receivables − Payables", spark: [580, 610, 590, 620, 650, 640, 660, 670, 680, 690, 685, 685], page: "Cash & Accounts" },
];

/* ================= Attention Hub Items ================= */
export type AlertTier = "urgent" | "important" | "informational";
export interface AttentionItem {
  id: string; tier: AlertTier; icon: string; title: string; desc: string;
  deadline: string; stake: string; action: string; actionModal: string; actionPayload?: Record<string, unknown>;
}
export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: "att1", tier: "urgent", icon: "bi-exclamation-triangle", title: "XYZ Ltd owes you KES 150,000", desc: "45 days late — the oldest receivable in your book. Auto-reminder already sent 3 times.", deadline: "45 days overdue", stake: "KES 150,000", action: "Final Reminder", actionModal: "sendReminder", actionPayload: { customer: "XYZ Ltd" } },
  { id: "att2", tier: "urgent", icon: "bi-cash-coin", title: "Payroll gap tomorrow", desc: "KES 45,000 payroll due but the buffer is too thin — top up before 6pm today.", deadline: "Due tomorrow", stake: "KES 45,000", action: "Top Up", actionModal: "topUpAccount" },
  { id: "att3", tier: "urgent", icon: "bi-receipt-cutoff", title: "VAT return due in 2 days", desc: "File via iTax or risk a KES 20,000 late-filing penalty from KRA.", deadline: "20 Jan", stake: "KES 96,400", action: "File Now", actionModal: "fileVat" },
  { id: "att4", tier: "important", icon: "bi-clock-history", title: "5 invoices overdue 15–30 days", desc: "One-click bulk reminder available — WhatsApp + SMS.", deadline: "This week", stake: "KES 210,000", action: "Remind All", actionModal: "bulkReminder" },
  { id: "att5", tier: "important", icon: "bi-truck", title: "3 supplier bills due this week", desc: "Kirinyaga Farmers · Kitui Weavers · Embu Nuts — schedule before due date.", deadline: "7 days", stake: "KES 157,000", action: "Schedule", actionModal: "paySupplier" },
  { id: "att6", tier: "important", icon: "bi-box-seam", title: "Ankole Horn Mug below reorder point", desc: "6 units left (reorder at 10) — sells 1.7/day. Auto-PO drafted for you.", deadline: "Low stock", stake: "20 units", action: "Approve PO", actionModal: "approvePO" },
  { id: "att7", tier: "informational", icon: "bi-graph-up-arrow", title: "M-Pesa collections up 15% this week", desc: "KES 385K vs. KES 335K last week — Friday 17:00 is your golden hour.", deadline: "Trend", stake: "+15%", action: "Details", actionModal: "viewDetails" },
  { id: "att8", tier: "informational", icon: "bi-person-check", title: "Credit score climbed to 742", desc: "Top 8% of SMEs — new lending limits unlocked at NCBA & KCB.", deadline: "Score", stake: "742", action: "View Score", actionModal: "viewScore" },
];

/* ================= Revenue chart data (KES '000 — consistent with monthly KPIs) ================= */
export const REVENUE_30D = [96, 102, 98, 105, 108, 104, 110, 114, 109, 116, 118, 122, 117, 124, 126, 121, 128, 130, 125, 132, 134, 129, 136, 138, 133, 140, 142, 138, 144, 147];
export const EXPENSES_30D = [62, 66, 64, 68, 70, 67, 72, 74, 70, 76, 78, 75, 79, 81, 77, 82, 84, 80, 85, 87, 83, 88, 90, 86, 91, 93, 89, 94, 95, 92];
export const REVENUE_90D = Array.from({ length: 90 }, (_, i) => Math.round(88 + i * 0.62 + Math.sin(i / 5) * 5 + (i % 7 === 5 ? 4 : 0)));
export const EXPENSES_90D = Array.from({ length: 90 }, (_, i) => Math.round(58 + i * 0.38 + Math.cos(i / 6) * 3.5 + (i % 14 === 13 ? 5 : 0)));

/* ================= Cash allocation (donut) ================= */
export const CASH_SPLIT = [
  { label: "M-Pesa", value: 800, color: "#12b76a", icon: "bi-phone" },
  { label: "NCBA Current", value: 345, color: "#2e90fa", icon: "bi-bank" },
  { label: "NCBA Savings", value: 100, color: "#7a5af8", icon: "bi-piggy-bank" },
];

/* ================= Activity Feed ================= */
export interface ActivityItem { time: string; icon: string; title: string; by: string; module: string }
export const ACTIVITY_FEED: ActivityItem[] = [
  { time: "2 min ago", icon: "bi-cash-coin", title: "M-Pesa payment KES 2,450 received from Grace Wanjiru", by: "System", module: "Get Paid" },
  { time: "15 min ago", icon: "bi-box-seam", title: "Stock adjustment: 2× Ankole Horn Mug written off (damaged)", by: "Mwangi Kamau", module: "Inventory" },
  { time: "32 min ago", icon: "bi-receipt", title: "Invoice INV-0091 paid by Jenga Developers (KES 410,000)", by: "System", module: "Get Paid" },
  { time: "1 hr ago", icon: "bi-truck", title: "Sendy dispatch SK-88412 delivered to Dennis Otieno", by: "System", module: "Inventory" },
  { time: "2 hrs ago", icon: "bi-person-plus", title: "Naomi Chemtai joined as Sales Staff", by: "Wanjiku Maina", module: "Team" },
  { time: "3 hrs ago", icon: "bi-shield-exclamation", title: "M-Pesa reversal claim DSP-2026-089 lodged by customer", by: "System", module: "Disputes" },
  { time: "5 hrs ago", icon: "bi-invoice", title: "Recurring invoice generated for Kilimani House 1 Tenant 2A", by: "System", module: "Get Paid" },
  { time: "Yesterday", icon: "bi-rocket-takeoff", title: "NCBA working capital loan approved — KES 850K at 3.2%/mo", by: "System", module: "Funding" },
];

/* ================= Business Health Score ================= */
export const HEALTH_SCORE = {
  overall: 82,
  cash: 88,
  receivables: 71,
  inventory: 76,
  compliance: 92,
  growth: 85,
  factors: [
    { label: "Cash position", score: 88, color: "#12b76a", tip: "KES 1.24M above minimum threshold" },
    { label: "Accounts receivable", score: 71, color: "#f79009", tip: "12 overdue invoices — KES 150K 60+ days late" },
    { label: "Inventory health", score: 76, color: "#f79009", tip: "3 SKUs below reorder point" },
    { label: "Compliance & KYB", score: 92, color: "#12b76a", tip: "Level 2 complete — CR12 expiring soon" },
    { label: "Growth metrics", score: 85, color: "#12b76a", tip: "+18% collections YoY, credit score 742" },
  ],
};

/* ================= Cross-module quick status ================= */
export const MODULES = [
  { id: "getpaid", name: "Get Paid", icon: "bi-cash-coin", status: "Healthy", summary: "KES 3.45M collected · 287 txns", badge: "12 due", color: "green" },
  { id: "suppliers", name: "Pay Suppliers", icon: "bi-truck", status: "Healthy", summary: "2 POs pending · KES 115K to pay", badge: "3 due", color: "green" },
  { id: "cash", name: "Cash & Accounts", icon: "bi-bank", status: "Healthy", summary: "KES 1.24M across 3 accounts", badge: null, color: "green" },
  { id: "books", name: "Bookkeeping & Taxes", icon: "bi-journal-bookmark", status: "Attention", summary: "VAT return due 20 Jan", badge: "VAT due", color: "amber" },
  { id: "products", name: "Products & Store", icon: "bi-box-seam", status: "Healthy", summary: "14 SKUs · KES 486K revenue", badge: null, color: "green" },
  { id: "inventory", name: "Inventory & Stock", icon: "bi-boxes", status: "Attention", summary: "3 SKUs below reorder point", badge: "3 alerts", color: "amber" },
  { id: "crm", name: "Customers & CRM", icon: "bi-people", status: "Healthy", summary: "4,820 customers · 68 new this month", badge: null, color: "green" },
  { id: "funding", name: "Funding & Credit", icon: "bi-rocket-takeoff", status: "Healthy", summary: "Score 742 · KES 850K pre-qualified", badge: null, color: "green" },
  { id: "marketing", name: "Marketing & Growth", icon: "bi-megaphone", status: "Healthy", summary: "ROI 21.4× · 6 campaigns active", badge: null, color: "green" },
  { id: "insurance", name: "Insurance & Protection", icon: "bi-shield-check", status: "Attention", summary: "WIBA renewal due Feb", badge: "Renew", color: "amber" },
  { id: "portfolio", name: "Portfolio", icon: "bi-buildings", status: "Healthy", summary: "5 entities · 1 approval pending", badge: "1", color: "green" },
  { id: "settings", name: "Settings & Security", icon: "bi-sliders", status: "Healthy", summary: "KYB Level 2 · CR12 expiring", badge: null, color: "green" },
];

/* ================= Notification & Activity ================= */
export interface NotifItem { id: string; icon: string; title: string; body: string; time: string; unread: boolean; action?: string; actionModal?: string }
export const NOTIFS: NotifItem[] = [
  { id: "n1", icon: "bi-cash-coin", title: "Payment received", body: "KES 2,450 from Grace Wanjiru via M-Pesa", time: "2 min ago", unread: true, action: "View", actionModal: "quickAction" },
  { id: "n2", icon: "bi-exclamation-triangle", title: "Low stock: Ankole Mug", body: "6 units left — below reorder point", time: "1 hr ago", unread: true, action: "Approve PO", actionModal: "approvePO" },
  { id: "n3", icon: "bi-receipt-cutoff", title: "VAT return due in 2 days", body: "KES 96,400 output VAT for TS Retail", time: "3 hrs ago", unread: true, action: "File", actionModal: "fileVat" },
  { id: "n4", icon: "bi-shield-exclamation", title: "M-Pesa reversal claim", body: "KES 14,500 held — evidence needed within 48h", time: "5 hrs ago", unread: false, action: "Defend", actionModal: "quickAction" },
  { id: "n5", icon: "bi-graph-up-arrow", title: "Collections up 15% this week", body: "KES 385K vs. KES 335K last week", time: "Yesterday", unread: false, action: "View", actionModal: "quickAction" },
];

/* ================= Business switching ================= */
export const BUSINESSES = [
  { name: "TS Retail Ltd", emoji: "🛍️", type: "Operating · Retail", cash: 1245000, revenueMTD: 486250 },
  { name: "Kilimani House 1", emoji: "🏠", type: "Rental Property", cash: 1420000, revenueMTD: 150000 },
  { name: "TechSolutions Ltd", emoji: "💻", type: "Operating · IT", cash: 890000, revenueMTD: 720000 },
  { name: "Sanaa Side Hustle", emoji: "🎨", type: "Sole Prop", cash: 142000, revenueMTD: 80000 },
];

export const NOTIFICATIONS = [
  { id: 1, icon: "bi-cash-coin", text: "Payment received KES 2,450", time: "2 min ago", unread: true },
  { id: 2, icon: "bi-exclamation-triangle", text: "Ankole Mug below reorder", time: "1 hr ago", unread: true },
  { id: 3, icon: "bi-receipt-cutoff", text: "VAT return due 20 Jan", time: "3 hrs ago", unread: true },
];
