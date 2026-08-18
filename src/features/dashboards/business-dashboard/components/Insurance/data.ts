/* ==================================================================
   Insurance & Protection — mock data
================================================================== */
export type PolicyStatus = "Active" | "Expiring soon" | "Lapsed" | "Pending" | "Claim paid";

export interface Policy {
  id: string;
  name: string;
  provider: string;
  icon: string;
  premium: number;
  frequency: "Monthly" | "Annual";
  cover: number;
  status: PolicyStatus;
  started: string;
  expires: string;
  perils: string[];
  notes?: string;
}

export type ClaimStatus = "Open" | "Under review" | "Approved" | "Rejected" | "Paid";

export interface Claim {
  id: string;
  policyId: string;
  policyName: string;
  date: string;
  amount: number;
  status: ClaimStatus;
  note: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  share: number;
  relationship: string;
  policyId: string;
}

export interface CoverGap { icon: string; tone: string; title: string; text: string }

export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean }
export interface Activity { time: string; icon: string; text: string; by: string }

export const fmtKES = (n: number) =>
  "KES " + n.toLocaleString("en-KE", { maximumFractionDigits: 0 });

export const fmtKESK = (n: number) =>
  "KES " + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1_000).toFixed(0) + "K");

export const POLICIES: Policy[] = [
  {
    id: "pol1",
    name: "Stock & Premises",
    provider: "Britam",
    icon: "bi-house-gear",
    premium: 18_500,
    frequency: "Monthly",
    cover: 8_000_000,
    status: "Active",
    started: "01 Mar 2025",
    expires: "28 Feb 2027",
    perils: ["Fire & allied perils", "Theft & burglary", "Flood", "Public liability KES 2M"],
    notes: "Automatic valuation each July — premium adjusts to stock levels.",
  },
  {
    id: "pol2",
    name: "WIBA — Workplace Injury",
    provider: "APA Insurance",
    icon: "bi-shield-plus",
    premium: 9_800,
    frequency: "Annual",
    cover: 5_000_000,
    status: "Expiring soon",
    started: "01 Sep 2025",
    expires: "31 Aug 2026",
    perils: ["Employee injury on duty", "Death benefit", "Medical cover on duty"],
    notes: "Renews in 17 days — required by law for all 12 staff.",
  },
  {
    id: "pol3",
    name: "Motor Fleet (2 vans)",
    provider: "Jubilee",
    icon: "bi-truck",
    premium: 24_000,
    frequency: "Monthly",
    cover: 6_500_000,
    status: "Active",
    started: "15 Apr 2025",
    expires: "14 Apr 2027",
    perils: ["Comprehensive", "Third-party liability", "Goods in transit KES 1M"],
  },
  {
    id: "pol4",
    name: "Cyber & Data Breach",
    provider: "Sanlam",
    icon: "bi-shield-lock",
    premium: 6_200,
    frequency: "Monthly",
    cover: 4_000_000,
    status: "Pending",
    started: "—",
    expires: "Awaiting activation",
    perils: ["Data breach response", "Ransomware reimbursement", "Business interruption"],
    notes: "Policy document signed — activated once the security audit passes.",
  },
  {
    id: "pol5",
    name: "Directors & Officers",
    provider: "Madison",
    icon: "bi-person-badge",
    premium: 12_400,
    frequency: "Annual",
    cover: 10_000_000,
    status: "Active",
    started: "01 Jun 2025",
    expires: "31 May 2027",
    perils: ["Management liability", "Defence costs", "Investigation defence"],
  },
  {
    id: "pol6",
    name: "Business Interruption",
    provider: "Britam",
    icon: "bi-hourglass-split",
    premium: 8_900,
    frequency: "Monthly",
    cover: 6_000_000,
    status: "Lapsed",
    started: "01 Mar 2024",
    expires: "Lapsed 28 Feb 2026",
    perils: ["Loss of income after fire/theft", "Extra expense cover"],
    notes: "Lapsed — 60% of lenders ask for this cover. Reinstating is instant.",
  },
];

export const CLAIMS: Claim[] = [
  { id: "cl1", policyId: "pol1", policyName: "Stock & Premises", date: "02 Aug 2026", amount: 96_000, status: "Under review", note: "Burglary at Lavington store — CCTV footage submitted, assessor site visit tomorrow." },
  { id: "cl2", policyId: "pol3", policyName: "Motor Fleet (2 vans)", date: "19 Jul 2026", amount: 148_000, status: "Approved", note: "Van KDA-882K rear-ended at Thika Rd — repair approved at authorized garage." },
  { id: "cl3", policyId: "pol1", policyName: "Stock & Premises", date: "11 Jun 2026", amount: 32_000, status: "Paid", note: "Water damage from burst pipe — settled via M-Pesa on 15 Jun." },
  { id: "cl4", policyId: "pol2", policyName: "WIBA — Workplace Injury", date: "03 May 2026", amount: 24_500, status: "Paid", note: "Warehouse staff hand injury — medical + 2 weeks off-duty paid." },
];

export const BENEFICIARIES: Beneficiary[] = [
  { id: "ben1", name: "Wanjiku Maina", share: 60, relationship: "Owner / Director", policyId: "pol5" },
  { id: "ben2", name: "John Maina", share: 25, relationship: "Co-director", policyId: "pol5" },
  { id: "ben3", name: "TS Retail Ltd Staff Trust", share: 15, relationship: "Employees", policyId: "pol5" },
];

export const COVER_GAPS: CoverGap[] = [
  { icon: "bi-arrow-counterclockwise", tone: "#f79009", title: "Business Interruption lapsed", text: "Reinstate to unlock 60% of lender offers — 2-minute process." },
  { icon: "bi-calendar-event", tone: "#e11d48", title: "WIBA renews in 17 days", text: "Required by law. Renewal auto-quotes at KES 9,800." },
  { icon: "bi-shield-lock", tone: "#7a5af8", title: "Cyber cover waiting on audit", text: "Book the security audit to activate your KES 4M cyber policy." },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-calendar-event", text: "WIBA policy renews in 17 days — auto-renewal enabled", time: "Today 07:40", unread: true },
  { id: 2, icon: "bi-shield-check", text: "Burglary claim KES 96,000 moved to under review", time: "02 Aug", unread: true },
  { id: 3, icon: "bi-truck", text: "Fleet claim KES 148,000 approved — repair at authorized garage", time: "19 Jul", unread: false },
  { id: 4, icon: "bi-cash-coin", text: "Water damage claim KES 32,000 settled via M-Pesa", time: "15 Jun", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Just now", icon: "bi-shield-lock", text: "Cyber policy document signed — awaiting security audit", by: "Wanjiku M." },
  { time: "02 Aug", icon: "bi-shield-exclamation", text: "Burglary claim KES 96,000 lodged with Britam", by: "Wanjiku M." },
  { time: "19 Jul", icon: "bi-truck", text: "Fleet claim KES 148,000 approved (Jubilee)", by: "System" },
  { time: "15 Jun", icon: "bi-cash-coin", text: "Water damage claim KES 32,000 paid out", by: "System" },
  { time: "01 Jun", icon: "bi-person-badge", text: "Directors & Officers policy renewed (Madison)", by: "System" },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", emoji: "🛍️", type: "Retail & E-commerce", current: true },
  { name: "Nairobi Java Roasters", emoji: "☕", type: "F&B / Cafe", current: false },
  { name: "Savannah Crafts Ltd", emoji: "🧺", type: "Handicrafts & Export", current: false },
];
