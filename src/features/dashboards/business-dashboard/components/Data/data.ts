/* ==================================================================
   PayMo Business — PAGE 9: DATA, PRIVACY & ACCOUNT MANAGEMENT
================================================================== */

/* ================= Types ================= */
export type DataRequestType = "Export" | "Delete" | "Rectify" | "Access";
export type RequestStatus = "Processing" | "Available" | "Expired" | "Failed";
export type ConsentScope = "Marketing" | "Analytics" | "Third-party sharing" | "Credit scoring" | "Data brokers";
export type ConsentStatus = "Granted" | "Withdrawn" | "Required";

export interface DataRequest {
  id: string;
  type: DataRequestType;
  scope: string;
  status: RequestStatus;
  requested: string;
  completed?: string;
  size?: string;
  downloadUrl?: string;
  note: string;
}

export interface ConsentItem {
  id: string;
  scope: ConsentScope;
  description: string;
  status: ConsentStatus;
  granted: string;
  lawful: string;
  withdrawable: boolean;
}

export interface DataCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: string;
  size: string;
  retention: string;
  sensitive: boolean;
}

export interface AuditEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  category: string;
  ip: string;
  severity: "Info" | "Warning" | "Critical";
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  color: string;
  dataAccess: string;
  lastSync: string;
  status: "Connected" | "Disconnected";
  scopes: string[];
}

export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Data requests (Kenya DPA 2019) ================= */
export const DATA_REQUESTS: DataRequest[] = [
  { id: "DR-0034", type: "Export", scope: "All customer data (CRM + transaction history)", status: "Available", requested: "12 Jan 2026", completed: "14 Jan 2026", size: "42.8 MB", downloadUrl: "#", note: "ZIP file with CSV, JSON and PDF invoice copies" },
  { id: "DR-0033", type: "Access", scope: "Personal data held on Wanjiku Maina", status: "Available", requested: "8 Jan 2026", completed: "8 Jan 2026", size: "1.2 MB", downloadUrl: "#", note: "Profile, KYB docs, transaction log, consent record" },
  { id: "DR-0032", type: "Export", scope: "eTIMS fiscalised receipts (Q4 2025)", status: "Expired", requested: "2 Jan 2026", completed: "3 Jan 2026", size: "18.4 MB", note: "Download link expired after 7 days — request again" },
  { id: "DR-0031", type: "Delete", scope: "Former customer — Kevin Barasa (offboarded)", status: "Processing", requested: "Yesterday", note: "Anonymising transaction data (KRA retention 5 years) · removing PII · 24h remaining" },
];

/* ================= Consents ================= */
export const CONSENTS: ConsentItem[] = [
  { id: "c1", scope: "Marketing", description: "WhatsApp/SMS/email campaigns and product updates", status: "Granted", granted: "12 Mar 2022", lawful: "Explicit opt-in (checkbox)", withdrawable: true },
  { id: "c2", scope: "Analytics", description: "Anonymous usage data to improve PayMo features", status: "Granted", granted: "12 Mar 2022", lawful: "Legitimate interest", withdrawable: true },
  { id: "c3", scope: "Credit scoring", description: "M-Pesa volume shared with NCBA for lending offers", status: "Granted", granted: "1 Jun 2024", lawful: "Contractual necessity", withdrawable: false },
  { id: "c4", scope: "Third-party sharing", description: "Data shared with PayMo's payment processor (DPO Group)", status: "Granted", granted: "12 Mar 2022", lawful: "Contractual necessity", withdrawable: false },
  { id: "c5", scope: "Data brokers", description: "Credit reference bureau data sharing", status: "Granted", granted: "15 Aug 2024", lawful: "Legal obligation (CBK)", withdrawable: false },
];

/* ================= Data categories ================= */
export const DATA_CATEGORIES: DataCategory[] = [
  { id: "dc1", name: "Customer PII", icon: "bi-people", color: "#12b76a", count: "4,820 records", size: "12.4 MB", retention: "7 years (KRA)", sensitive: false },
  { id: "dc2", name: "Transaction history", icon: "bi-receipt", color: "#2e90fa", count: "48,250 records", size: "186 MB", retention: "7 years (KRA)", sensitive: false },
  { id: "dc3", name: "KYB documents", icon: "bi-shield-lock", color: "#e11d48", count: "9 documents", size: "24.6 MB", retention: "5 years post-closure", sensitive: true },
  { id: "dc4", name: "Bank & M-Pesa logs", icon: "bi-bank", color: "#f79009", count: "12,840 entries", size: "42.1 MB", retention: "7 years (CBK)", sensitive: true },
  { id: "dc5", name: "Team & access data", icon: "bi-person-gear", color: "#7a5af8", count: "9 members", size: "1.8 MB", retention: "2 years post-departure", sensitive: false },
  { id: "dc6", name: "Inventory & stock", icon: "bi-box-seam", color: "#475467", count: "14 SKUs", size: "0.9 MB", retention: "Indefinite", sensitive: false },
  { id: "dc7", name: "Marketing & campaigns", icon: "bi-megaphone", color: "#ff4f00", count: "7 campaigns", size: "3.2 MB", retention: "2 years", sensitive: false },
  { id: "dc8", name: "eTIMS fiscal receipts", icon: "bi-receipt-cutoff", color: "#dc6803", count: "12,408 receipts", size: "88.4 MB", retention: "7 years (KRA)", sensitive: false },
];

/* ================= Audit trail ================= */
export const AUDIT_TRAIL: AuditEntry[] = [
  { id: "a1", time: "Today 09:12", actor: "Wanjiku Maina", action: "Data export downloaded", target: "DR-0034 · Customer data (42.8 MB)", category: "Data Export", severity: "Info", ip: "41.80.112.9" },
  { id: "a2", time: "Yesterday 16:40", actor: "Wanjiku Maina", action: "Consent withdrawn", target: "Marketing (WhatsApp campaigns)", category: "Consent", severity: "Warning", ip: "41.80.112.9" },
  { id: "a3", time: "Yesterday 14:02", actor: "System", action: "PII auto-redacted", target: "Kevin Barasa records (offboarded member)", category: "Data Deletion", severity: "Info", ip: "—" },
  { id: "a4", time: "3 days ago", actor: "Wanjiku Maina", action: "Password changed", target: "Account: wanjiku@techsol.co.ke", category: "Security", severity: "Critical", ip: "41.80.112.9" },
  { id: "a5", time: "1 week ago", actor: "Wanjiku Maina", action: "Data deletion request filed", target: "Kevin Barasa — all personal data", category: "Data Deletion", severity: "Warning", ip: "41.80.112.9" },
  { id: "a6", time: "2 weeks ago", actor: "Achieng Otieno", action: "Exported financial report", target: "Q4 2025 P&L · all entities", category: "Data Export", severity: "Info", ip: "41.90.66.12" },
];

/* ================= Third-party integrations (data sharing) ================= */
export const INTEGRATIONS: Integration[] = [
  { id: "i1", name: "Safaricom Daraja (M-Pesa)", icon: "bi-phone", color: "#00a550", dataAccess: "Full Access", lastSync: "Real-time", status: "Connected", scopes: ["Transactions", "Till balance", "Customer phone numbers"] },
  { id: "i2", name: "KRA eTIMS", icon: "bi-shield-check", color: "#e11d48", dataAccess: "Full Access", lastSync: "12 min ago", status: "Connected", scopes: ["Receipt data", "Business PIN", "HSC codes"] },
  { id: "i3", name: "DPO Pay (Cards)", icon: "bi-credit-card", color: "#f79009", dataAccess: "Limited", lastSync: "1 hr ago", status: "Connected", scopes: ["Card tokens (PCI-DSS)", "Payment amounts"] },
  { id: "i4", name: "NCBA Bank", icon: "bi-bank", color: "#00754a", dataAccess: "Read Only", lastSync: "Yesterday", status: "Connected", scopes: ["Account balance", "Transaction feed"] },
  { id: "i5", name: "QuickBooks Online", icon: "bi-calculator", color: "#2ca01c", dataAccess: "Full Access", lastSync: "4 min ago", status: "Connected", scopes: ["Invoices", "Ledger entries", "Customer data"] },
  { id: "i6", name: "Meta for Business", icon: "bi-instagram", color: "#0866ff", dataAccess: "Limited", lastSync: "Disconnected", status: "Disconnected", scopes: ["Instagram orders", "Customer messages"] },
];

/* ================= Privacy policy & retention ================= */
export const PRIVACY_POLICY = {
  version: "v3.2 — Updated 15 Dec 2025",
  compliance: "Kenya Data Protection Act 2019 · GDPR-compatible · CBK guidelines",
  retentionSchedule: "7 years (KRA/CBK) / 5 years (KYB docs) / 2 years (marketing) / Indefinite (inventory)",
  dataController: "TechSolutions Limited",
  dpoContact: "privacy@paymo.co.ke",
  lastReview: "15 Dec 2025",
};

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-clock-history", text: "Data export DR-0034 is ready (42.8 MB) — link expires in 5 days", time: "2 hrs ago", unread: true, action: "Download" },
  { id: 2, icon: "bi-shield-exclamation", text: "DR-0031 deletion request processing — 24h remaining for Kevin Barasa data", time: "Yesterday", unread: true, action: "View" },
  { id: 3, icon: "bi-file-earmark-check", text: "Privacy policy v3.2 published — review acknowledged", time: "1 week ago", unread: false, action: "Review" },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 09:12", icon: "bi-download", text: "Data export DR-0034 downloaded (42.8 MB)", by: "You" },
  { time: "Yesterday 16:40", icon: "bi-shield-x", text: "Marketing consent withdrawn — WhatsApp campaigns stopped", by: "You" },
  { time: "Yesterday 14:02", icon: "bi-eraser", text: "PII auto-redacted for offboarded member Kevin Barasa", by: "System" },
  { time: "3 days ago", icon: "bi-key", text: "Password changed and all sessions revoked", by: "You" },
  { time: "1 week ago", icon: "bi-file-earmark-text", text: "Privacy policy v3.2 published and acknowledged", by: "You" },
];

export const BUSINESSES = [
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: true },
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: false },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];
