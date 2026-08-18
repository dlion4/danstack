/* ==================================================================
   Funding & Credit — mock data
================================================================== */
export interface CreditFactor { label: string; pct: number; tone: string; note: string }

export interface CreditProfile {
  score: number;
  band: string;
  limit: number;
  utilized: number;
  updated: string;
  history: number[];
  factors: CreditFactor[];
}

export interface FundingOffer {
  id: string;
  lender: string;
  product: string;
  icon: string;
  amount: number;
  rate: string;
  term: string;
  fee: string;
  approval: string;
  status: "Available" | "Pre-qualified";
  recommended?: boolean;
  perks: string[];
}

export type AppStatus = "In review" | "Approved" | "Disbursed" | "Rejected" | "Awaiting acceptance";

export interface LoanApplication {
  id: string;
  lender: string;
  product: string;
  amount: number;
  status: AppStatus;
  submitted: string;
  note?: string;
}

export type RepayStatus = "Paid" | "Due" | "Upcoming" | "Overdue";

export interface Repayment {
  id: string;
  lender: string;
  amount: number;
  due: string;
  status: RepayStatus;
}

export interface FundingTip { icon: string; tone: string; title: string; text: string }

export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean }
export interface Activity { time: string; icon: string; text: string; by: string }

export const fmtKES = (n: number) =>
  "KES " + n.toLocaleString("en-KE", { maximumFractionDigits: 0 });

export const fmtKESK = (n: number) =>
  "KES " + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1_000).toFixed(0) + "K");

export const CREDIT_PROFILE: CreditProfile = {
  score: 742,
  band: "Top 8% of Kenyan SMEs",
  limit: 2_500_000,
  utilized: 980_000,
  updated: "Updated today · NCBA / Metropol data",
  history: [612, 618, 640, 655, 668, 690, 705, 718, 726, 731, 738, 742],
  factors: [
    { label: "Payment history", pct: 92, tone: "#12b76a", note: "0 late payments in 14 months" },
    { label: "Cash-flow strength", pct: 84, tone: "#2e90fa", note: "Avg KES 2.1M monthly collections" },
    { label: "Debt utilisation", pct: 39, tone: "#f79009", note: "KES 980K of KES 2.5M used" },
    { label: "Business longevity", pct: 88, tone: "#7a5af8", note: "5+ years trading · CR12 clean" },
  ],
};

export const FUNDING_OFFERS: FundingOffer[] = [
  {
    id: "of1",
    lender: "NCBA Bank",
    product: "Business Overdraft",
    icon: "bi-bank",
    amount: 1_500_000,
    rate: "13.5% p.a.",
    term: "Revolving · 12 months",
    fee: "1% facility fee",
    approval: "Pre-qualified · approve in 10 min",
    status: "Pre-qualified",
    recommended: true,
    perks: ["No collateral up to KES 1.5M", "Draw only what you need", "Interest on amount used"],
  },
  {
    id: "of2",
    lender: "M-KOPA Biz",
    product: "Asset Finance — Stock & Equipment",
    icon: "bi-phone",
    amount: 850_000,
    rate: "2.1% / month",
    term: "12 months",
    fee: "0.5% processing",
    approval: "Pre-qualified · next-day disbursement",
    status: "Pre-qualified",
    perks: ["Funds tied to verified stock purchases", "Daily M-Pesa repayments", "No bank account required"],
  },
  {
    id: "of3",
    lender: "KCB Bank",
    product: "Working Capital Loan",
    icon: "bi-bank2",
    amount: 2_000_000,
    rate: "12.9% p.a. reducing",
    term: "18 months",
    fee: "1.5% arrangement",
    approval: "Available · decision in 2 hours",
    status: "Available",
    perks: ["Grace period 60 days", "Top-up eligible after 6 payments", "Repay early without penalty"],
  },
  {
    id: "of4",
    lender: "Jumo",
    product: "Invoice Financing",
    icon: "bi-receipt",
    amount: 900_000,
    rate: "1.8% / month",
    term: "Per invoice · 30–90 days",
    fee: "2% advance fee",
    approval: "Available · instant approval",
    status: "Available",
    perks: ["Funds against unpaid invoices", "Payments collected automatically", "Free up to KES 100K first draw"],
  },
  {
    id: "of5",
    lender: "Stanbic",
    product: "SME Growth Loan",
    icon: "bi-graph-up-arrow",
    amount: 3_000_000,
    rate: "11.8% p.a.",
    term: "36 months",
    fee: "0.75% insurance cover",
    approval: "Available · 3-day decision",
    status: "Available",
    perks: ["Longest tenure for expansions", "Free business advisory included", "Interest-only first 3 months"],
  },
  {
    id: "of6",
    lender: "Tala Business",
    product: "Quick Cash Top-up",
    icon: "bi-lightning-charge",
    amount: 250_000,
    rate: "3% flat / month",
    term: "3 months",
    fee: "0% if repaid early",
    approval: "Available · money in 5 minutes",
    status: "Available",
    perks: ["Instant M-Pesa disbursement", "No paperwork", "Builds your PayMo score"],
  },
];

export const LOAN_APPLICATIONS: LoanApplication[] = [
  { id: "app1", lender: "NCBA Bank", product: "Business Overdraft", amount: 1_500_000, status: "Awaiting acceptance", submitted: "12 Aug 2026", note: "Terms unlocked — accept to activate the facility" },
  { id: "app2", lender: "M-KOPA Biz", product: "Asset Finance — Stock & Equipment", amount: 850_000, status: "In review", submitted: "11 Aug 2026", note: "eTIMS sales history verified · underwriting today" },
  { id: "app3", lender: "KCB Bank", product: "Working Capital Loan", amount: 2_000_000, status: "Disbursed", submitted: "28 Jul 2026", note: "Disbursed to NCBA Current · first repayment 28 Aug" },
];

export const REPAYMENTS: Repayment[] = [
  { id: "rp1", lender: "KCB Working Capital", amount: 138_900, due: "28 Aug 2026", status: "Upcoming" },
  { id: "rp2", lender: "KCB Working Capital", amount: 138_900, due: "28 Sep 2026", status: "Upcoming" },
  { id: "rp3", lender: "Jumo Invoice Finance", amount: 96_000, due: "21 Aug 2026", status: "Due" },
  { id: "rp4", lender: "KCB Working Capital", amount: 138_900, due: "28 Jul 2026", status: "Paid" },
  { id: "rp5", lender: "M-KOPA Asset Finance", amount: 22_400, due: "18 Jul 2026", status: "Paid" },
  { id: "rp6", lender: "KCB Working Capital", amount: 138_900, due: "28 Jun 2026", status: "Paid" },
];

export const FUNDING_TIPS: FundingTip[] = [
  { icon: "bi-lightning-charge", tone: "#f79009", title: "Utilisation is 39%", text: "Lenders favour borrowers under 50% — your next facility should get cheaper." },
  { icon: "bi-calendar-check", tone: "#12b76a", title: "Collections are up 12%", text: "Strong inflows this quarter could push your limit above KES 3M on request." },
  { icon: "bi-shield-check", tone: "#7a5af8", title: "No late payments · 14 mo", text: "Clean history is your cheapest form of credit. Keep it up." },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-bank", text: "NCBA raised your pre-qualified limit to KES 1.5M", time: "2h ago", unread: true },
  { id: 2, icon: "bi-receipt", text: "Repayment of KES 96,000 due 21 Aug for Jumo invoice financing", time: "Today 08:12", unread: true },
  { id: 3, icon: "bi-graph-up-arrow", text: "Your credit score moved 738 → 742", time: "Yesterday", unread: false },
  { id: 4, icon: "bi-check2-circle", text: "KCB disbursed KES 2,000,000 to NCBA Current", time: "28 Jul", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Just now", icon: "bi-bank", text: "NCBA offer viewed — overdraft KES 1.5M", by: "Wanjiku M." },
  { time: "12 Aug", icon: "bi-send-check", text: "Overdraft application accepted terms (NCBA)", by: "Wanjiku M." },
  { time: "11 Aug", icon: "bi-phone", text: "Asset finance application submitted to M-KOPA", by: "Wanjiku M." },
  { time: "28 Jul", icon: "bi-cash-stack", text: "KCB working capital KES 2M disbursed", by: "System" },
  { time: "21 Jul", icon: "bi-lightning-charge", text: "Credit score refreshed to 738 (Metropol)", by: "System" },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", emoji: "🛍️", type: "Retail & E-commerce", current: true },
  { name: "Nairobi Java Roasters", emoji: "☕", type: "F&B / Cafe", current: false },
  { name: "Savannah Crafts Ltd", emoji: "🧺", type: "Handicrafts & Export", current: false },
];
