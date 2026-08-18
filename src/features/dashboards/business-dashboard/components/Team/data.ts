/* ==================================================================
   PayMo Business — PAGE 6: TEAM MANAGEMENT & ROLES
================================================================== */

/* ================= Types ================= */
export type MemberStatus = "Active" | "Pending invite" | "Suspended" | "Revoked";
export type PermLevel = "None" | "View" | "Create" | "Edit" | "Approve" | "Full";
export type RoleId = "owner" | "admin" | "manager" | "accountant" | "staff" | "viewer" | string;
export type AccessLevel = "No Access" | "Viewer" | "Standard" | "Admin";

export interface Member {
  id: string; name: string; email: string; phone: string; roleId: RoleId;
  status: MemberStatus; avatarColor: string; joined: string; lastActive: string;
  twoFA: boolean; businesses: Record<string, AccessLevel>; sessions: number;
  invitedBy?: string; inviteExpires?: string; department: string;
}
export interface Role {
  id: RoleId; name: string; desc: string; icon: string; color: string;
  system: boolean; memberCount: number; perms: Record<string, PermLevel>;
  approvalLimit: number | null; canApprove: boolean;
}
export interface Module { id: string; name: string; icon: string; zone: string; sensitive: boolean }
export interface ApprovalRule {
  id: string; name: string; trigger: string; threshold: number; currency: string;
  approvers: string[]; requireAll: boolean; status: "Active" | "Paused";
  appliesTo: string; escalation: string; triggered: number;
}
export interface Session {
  id: string; memberId: string; device: string; browser: string; location: string;
  ip: string; lastSeen: string; current: boolean; risk: "Low" | "Medium" | "High";
}
export interface LoginEvent {
  id: string; memberId: string; time: string; result: "Success" | "Failed" | "Blocked";
  method: string; location: string; device: string; note?: string;
}
export interface AuditEvent {
  id: string; time: string; actor: string; action: string; target: string;
  module: string; severity: "Info" | "Warning" | "Critical"; ip: string;
}
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Modules (permission surface) ================= */
export const MODULES: Module[] = [
  { id: "getpaid", name: "Get Paid", icon: "bi-cash-coin", zone: "Money In", sensitive: false },
  { id: "crm", name: "Customers & CRM", icon: "bi-people", zone: "Money In", sensitive: false },
  { id: "suppliers", name: "Pay Suppliers", icon: "bi-truck", zone: "Money Out", sensitive: true },
  { id: "cash", name: "Cash & Accounts", icon: "bi-bank", zone: "Your Money", sensitive: true },
  { id: "books", name: "Bookkeeping & Taxes", icon: "bi-journal-bookmark", zone: "Your Money", sensitive: true },
  { id: "products", name: "Products & Store", icon: "bi-box-seam", zone: "Your Business", sensitive: false },
  { id: "inventory", name: "Inventory & Stock", icon: "bi-boxes", zone: "Your Business", sensitive: false },
  { id: "funding", name: "Funding & Credit", icon: "bi-rocket-takeoff", zone: "Grow", sensitive: true },
  { id: "marketing", name: "Marketing & Growth", icon: "bi-megaphone", zone: "Grow", sensitive: false },
  { id: "settings", name: "Settings & Security", icon: "bi-sliders", zone: "Run", sensitive: true },
];

export const PERM_LEVELS: PermLevel[] = ["None", "View", "Create", "Edit", "Approve", "Full"];

/* ================= Roles ================= */
const fullPerms = (): Record<string, PermLevel> => Object.fromEntries(MODULES.map((m) => [m.id, "Full" as PermLevel]));
const lvl = (map: Record<string, PermLevel>, fallback: PermLevel = "None"): Record<string, PermLevel> =>
  Object.fromEntries(MODULES.map((m) => [m.id, map[m.id] ?? fallback]));

export const ROLES: Role[] = [
  {
    id: "owner", name: "Owner", desc: "Full control including billing, team and business deletion. Cannot be removed.",
    icon: "bi-star-fill", color: "#e11d48", system: true, memberCount: 1,
    perms: fullPerms(), approvalLimit: null, canApprove: true,
  },
  {
    id: "admin", name: "Admin", desc: "Everything except transferring ownership and deleting the business.",
    icon: "bi-shield-fill-check", color: "#7a5af8", system: true, memberCount: 1,
    perms: lvl({ settings: "Edit" }, "Full"), approvalLimit: 500000, canApprove: true,
  },
  {
    id: "manager", name: "Store Manager", desc: "Runs day-to-day operations: sales, stock, customers. No bank or tax access.",
    icon: "bi-person-badge", color: "#2e90fa", system: true, memberCount: 2,
    perms: lvl({ getpaid: "Full", crm: "Full", products: "Full", inventory: "Full", suppliers: "Create", marketing: "Edit", cash: "View", books: "None", funding: "None", settings: "None" }),
    approvalLimit: 50000, canApprove: true,
  },
  {
    id: "accountant", name: "Accountant", desc: "Read-everything, edit books. Perfect for your external accountant.",
    icon: "bi-calculator", color: "#12b76a", system: true, memberCount: 1,
    perms: lvl({ books: "Full", cash: "View", getpaid: "View", suppliers: "View", crm: "View", products: "View", inventory: "View", funding: "View", marketing: "None", settings: "None" }),
    approvalLimit: null, canApprove: false,
  },
  {
    id: "staff", name: "Sales Staff", desc: "Front-line: create invoices and serve customers. Cannot see margins or bank.",
    icon: "bi-person", color: "#667085", system: true, memberCount: 2,
    perms: lvl({ getpaid: "Create", crm: "Edit", products: "View", inventory: "View", marketing: "None", cash: "None", books: "None", suppliers: "None", funding: "None", settings: "None" }),
    approvalLimit: 0, canApprove: false,
  },
  {
    id: "viewer", name: "Viewer", desc: "Read-only across selected modules. Great for investors or advisors.",
    icon: "bi-eye", color: "#98a2b3", system: true, memberCount: 1,
    perms: lvl({ getpaid: "View", crm: "View", products: "View", inventory: "View", cash: "View", books: "View", suppliers: "View", funding: "None", marketing: "View", settings: "None" }),
    approvalLimit: 0, canApprove: false,
  },
  {
    id: "caretaker", name: "Property Caretaker", desc: "Custom role — rent collection & maintenance on one property only.",
    icon: "bi-house", color: "#f79009", system: false, memberCount: 1,
    perms: lvl({ getpaid: "Create", crm: "View", suppliers: "Create", inventory: "None", products: "None", cash: "None", books: "None", funding: "None", marketing: "None", settings: "None" }),
    approvalLimit: 15000, canApprove: false,
  },
];

/* ================= Businesses (for scoping) ================= */
export const BUSINESSES = [
  { id: "b1", name: "TechSolutions Ltd", emoji: "💻" },
  { id: "b2", name: "TS Retail Ltd", emoji: "🛍️" },
  { id: "b3", name: "Kilimani House 1", emoji: "🏠" },
  { id: "b4", name: "Sanaa Side Hustle", emoji: "🎨" },
];

/* ================= Members ================= */
export const MEMBERS: Member[] = [
  {
    id: "u1", name: "Wanjiku Maina", email: "wanjiku@techsol.co.ke", phone: "0722 445 118", roleId: "owner",
    status: "Active", avatarColor: "#e11d48", joined: "12 Mar 2022", lastActive: "Active now", twoFA: true,
    businesses: { b1: "Admin", b2: "Admin", b3: "Admin", b4: "Admin" }, sessions: 2, department: "Leadership",
  },
  {
    id: "u2", name: "Mwangi Kamau", email: "mwangi@techsol.co.ke", phone: "0733 812 990", roleId: "admin",
    status: "Active", avatarColor: "#7a5af8", joined: "2 Jun 2022", lastActive: "12 min ago", twoFA: true,
    businesses: { b1: "Admin", b2: "Admin", b3: "No Access", b4: "Viewer" }, sessions: 1, department: "Operations",
  },
  {
    id: "u3", name: "Achieng Otieno", email: "achieng@accountants.co.ke", phone: "0710 556 302", roleId: "accountant",
    status: "Active", avatarColor: "#12b76a", joined: "8 Jan 2023", lastActive: "2 hours ago", twoFA: true,
    businesses: { b1: "Viewer", b2: "Viewer", b3: "Viewer", b4: "Viewer" }, sessions: 1, department: "Finance (external)",
  },
  {
    id: "u4", name: "Brian Kim", email: "brian@techsol.co.ke", phone: "0728 663 441", roleId: "manager",
    status: "Active", avatarColor: "#2e90fa", joined: "14 Apr 2024", lastActive: "Yesterday", twoFA: false,
    businesses: { b1: "No Access", b2: "Standard", b3: "No Access", b4: "No Access" }, sessions: 3, department: "Retail",
  },
  {
    id: "u5", name: "Grace Njeri", email: "grace@techsol.co.ke", phone: "0798 441 226", roleId: "staff",
    status: "Active", avatarColor: "#f79009", joined: "1 Aug 2024", lastActive: "3 days ago", twoFA: false,
    businesses: { b1: "No Access", b2: "Standard", b3: "No Access", b4: "No Access" }, sessions: 1, department: "Retail",
  },
  {
    id: "u6", name: "James Odhiambo", email: "james.caretaker@gmail.com", phone: "0712 990 213", roleId: "caretaker",
    status: "Active", avatarColor: "#f79009", joined: "3 Sep 2024", lastActive: "5 hours ago", twoFA: false,
    businesses: { b1: "No Access", b2: "No Access", b3: "Standard", b4: "No Access" }, sessions: 1, department: "Property",
  },
  {
    id: "u7", name: "Naomi Chemtai", email: "naomi@techsol.co.ke", phone: "0721 220 774", roleId: "staff",
    status: "Pending invite", avatarColor: "#7a5af8", joined: "—", lastActive: "Never", twoFA: false,
    businesses: { b1: "No Access", b2: "Standard", b3: "No Access", b4: "No Access" }, sessions: 0,
    invitedBy: "Wanjiku Maina", inviteExpires: "in 5 days", department: "Retail",
  },
  {
    id: "u8", name: "Peter Njoroge", email: "peter.investor@gmail.com", phone: "0790 118 447", roleId: "viewer",
    status: "Pending invite", avatarColor: "#98a2b3", joined: "—", lastActive: "Never", twoFA: false,
    businesses: { b1: "Viewer", b2: "Viewer", b3: "No Access", b4: "No Access" }, sessions: 0,
    invitedBy: "Wanjiku Maina", inviteExpires: "in 2 days", department: "Advisory",
  },
  {
    id: "u9", name: "Kevin Barasa", email: "kevin.old@techsol.co.ke", phone: "0742 335 771", roleId: "staff",
    status: "Suspended", avatarColor: "#f04438", joined: "5 Feb 2023", lastActive: "28 days ago", twoFA: false,
    businesses: { b1: "No Access", b2: "No Access", b3: "No Access", b4: "No Access" }, sessions: 0, department: "Retail",
  },
];

/* ================= Approval rules ================= */
export const APPROVAL_RULES: ApprovalRule[] = [
  {
    id: "ar1", name: "Supplier payments over KES 100,000", trigger: "Supplier payment", threshold: 100000, currency: "KES",
    approvers: ["u1", "u2"], requireAll: false, status: "Active", appliesTo: "All businesses",
    escalation: "Escalates to Owner after 24 hours", triggered: 14,
  },
  {
    id: "ar2", name: "Any bank transfer over KES 500,000", trigger: "Bank transfer", threshold: 500000, currency: "KES",
    approvers: ["u1"], requireAll: true, status: "Active", appliesTo: "All businesses",
    escalation: "No escalation — Owner only", triggered: 3,
  },
  {
    id: "ar3", name: "Stock write-offs over KES 20,000", trigger: "Inventory write-off", threshold: 20000, currency: "KES",
    approvers: ["u2", "u3"], requireAll: true, status: "Active", appliesTo: "TS Retail Ltd",
    escalation: "Escalates to Owner after 48 hours", triggered: 6,
  },
  {
    id: "ar4", name: "New supplier onboarding", trigger: "Supplier created", threshold: 0, currency: "KES",
    approvers: ["u2"], requireAll: false, status: "Paused", appliesTo: "All businesses",
    escalation: "None", triggered: 0,
  },
  {
    id: "ar5", name: "Refunds over KES 10,000", trigger: "Customer refund", threshold: 10000, currency: "KES",
    approvers: ["u2", "u4"], requireAll: false, status: "Active", appliesTo: "TS Retail Ltd",
    escalation: "Escalates to Admin after 4 hours", triggered: 9,
  },
];

/* ================= Sessions ================= */
export const SESSIONS: Session[] = [
  { id: "s1", memberId: "u1", device: "MacBook Pro 14”", browser: "Chrome 131", location: "Nairobi, KE", ip: "41.80.112.9", lastSeen: "Active now", current: true, risk: "Low" },
  { id: "s2", memberId: "u1", device: "iPhone 15", browser: "PayMo App 3.2", location: "Nairobi, KE", ip: "41.80.112.9", lastSeen: "1 hour ago", current: false, risk: "Low" },
  { id: "s3", memberId: "u2", device: "Windows Desktop", browser: "Edge 130", location: "Nairobi, KE", ip: "197.232.44.18", lastSeen: "12 min ago", current: false, risk: "Low" },
  { id: "s4", memberId: "u4", device: "Samsung A54", browser: "Chrome Mobile", location: "Mombasa, KE", ip: "105.163.2.77", lastSeen: "Yesterday", current: false, risk: "Medium" },
  { id: "s5", memberId: "u4", device: "Unknown Android", browser: "Chrome Mobile", location: "Lagos, NG", ip: "102.89.44.201", lastSeen: "2 days ago", current: false, risk: "High" },
  { id: "s6", memberId: "u4", device: "Windows Desktop", browser: "Firefox 133", location: "Nairobi, KE", ip: "197.232.44.20", lastSeen: "4 days ago", current: false, risk: "Low" },
  { id: "s7", memberId: "u3", device: "MacBook Air", browser: "Safari 18", location: "Nairobi, KE", ip: "41.90.66.12", lastSeen: "2 hours ago", current: false, risk: "Low" },
  { id: "s8", memberId: "u6", device: "Tecno Spark", browser: "Chrome Mobile", location: "Nairobi, KE", ip: "41.80.99.14", lastSeen: "5 hours ago", current: false, risk: "Low" },
];

/* ================= Login history ================= */
export const LOGIN_EVENTS: LoginEvent[] = [
  { id: "l1", memberId: "u1", time: "Today 08:02", result: "Success", method: "Password + TOTP", location: "Nairobi, KE", device: "MacBook Pro" },
  { id: "l2", memberId: "u2", time: "Today 07:48", result: "Success", method: "Password + TOTP", location: "Nairobi, KE", device: "Windows Desktop" },
  { id: "l3", memberId: "u4", time: "Yesterday 22:14", result: "Blocked", method: "Password", location: "Lagos, NG", device: "Unknown Android", note: "Impossible travel — blocked & member notified" },
  { id: "l4", memberId: "u4", time: "Yesterday 18:30", result: "Failed", method: "Password", location: "Mombasa, KE", device: "Samsung A54", note: "Wrong password (attempt 2 of 5)" },
  { id: "l5", memberId: "u3", time: "Yesterday 14:02", result: "Success", method: "Password + TOTP", location: "Nairobi, KE", device: "MacBook Air" },
  { id: "l6", memberId: "u5", time: "3 days ago", result: "Success", method: "Password", location: "Nairobi, KE", device: "Redmi Note 12", note: "2FA not enabled on this account" },
  { id: "l7", memberId: "u9", time: "28 days ago", result: "Success", method: "Password", location: "Nairobi, KE", device: "Windows Desktop" },
];

/* ================= Audit log ================= */
export const AUDIT: AuditEvent[] = [
  { id: "a1", time: "Today 09:12", actor: "Mwangi Kamau", action: "Approved supplier payment", target: "PO-1041 · KES 148,000", module: "Pay Suppliers", severity: "Info", ip: "197.232.44.18" },
  { id: "a2", time: "Today 08:56", actor: "Wanjiku Maina", action: "Changed role", target: "Brian Kim: Sales Staff → Store Manager", module: "Team", severity: "Warning", ip: "41.80.112.9" },
  { id: "a3", time: "Today 08:12", actor: "System", action: "Blocked login attempt", target: "Brian Kim · Lagos, NG", module: "Security", severity: "Critical", ip: "102.89.44.201" },
  { id: "a4", time: "Yesterday", actor: "Wanjiku Maina", action: "Invited team member", target: "naomi@techsol.co.ke as Sales Staff", module: "Team", severity: "Info", ip: "41.80.112.9" },
  { id: "a5", time: "Yesterday", actor: "Achieng Otieno", action: "Exported financial report", target: "Q4 2025 P&L · all entities", module: "Bookkeeping", severity: "Warning", ip: "41.90.66.12" },
  { id: "a6", time: "2 days ago", actor: "Wanjiku Maina", action: "Suspended member", target: "Kevin Barasa — inactive 28 days", module: "Team", severity: "Warning", ip: "41.80.112.9" },
  { id: "a7", time: "3 days ago", actor: "Mwangi Kamau", action: "Created approval rule", target: "Refunds over KES 10,000", module: "Team", severity: "Info", ip: "197.232.44.18" },
  { id: "a8", time: "1 week ago", actor: "Wanjiku Maina", action: "Created custom role", target: "Property Caretaker", module: "Team", severity: "Info", ip: "41.80.112.9" },
];

/* ================= Security policy ================= */
export const SECURITY_POLICY = {
  enforce2FA: false,
  gracePeriodDays: 7,
  sessionTimeoutMins: 60,
  passwordMinLength: 10,
  requireStrongPassword: true,
  blockNewCountries: true,
  maxFailedAttempts: 5,
  ipAllowlist: false,
  allowlistCidrs: "41.80.0.0/16",
};

export const DEPARTMENTS = ["Leadership", "Operations", "Finance (external)", "Retail", "Property", "Advisory", "Marketing", "Support"];

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-shield-exclamation", text: "Blocked login for Brian Kim from Lagos, NG — impossible travel", time: "8 min ago", unread: true, action: "Review" },
  { id: 2, icon: "bi-person-lock", text: "3 members still don't have 2FA enabled — enforce a policy?", time: "1 hr ago", unread: true, action: "Enforce" },
  { id: 3, icon: "bi-envelope-paper", text: "Peter Njoroge's invite expires in 2 days", time: "3 hrs ago", unread: true, action: "Resend" },
  { id: 4, icon: "bi-hourglass-split", text: "2 payments waiting for your approval (KES 268,000 total)", time: "Yesterday", unread: true, action: "Approve" },
  { id: 5, icon: "bi-person-x", text: "Kevin Barasa suspended — 28 days inactive. Offboard fully?", time: "2 days ago", unread: false, action: "Offboard" },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 08:56", icon: "bi-person-badge", text: "Brian Kim promoted from Sales Staff to Store Manager", by: "You" },
  { time: "Today 08:12", icon: "bi-shield-exclamation", text: "Login blocked: Brian Kim from Lagos, NG (impossible travel)", by: "System" },
  { time: "Yesterday", icon: "bi-envelope-paper", text: "Invite sent to naomi@techsol.co.ke as Sales Staff", by: "You" },
  { time: "Yesterday", icon: "bi-check2-square", text: "Approval rule 'Refunds over KES 10,000' triggered 9 times this month", by: "System" },
  { time: "2 days ago", icon: "bi-person-x", text: "Kevin Barasa suspended after 28 days of inactivity", by: "You" },
  { time: "3 days ago", icon: "bi-sliders", text: "Approval rule created: Refunds over KES 10,000", by: "Mwangi Kamau" },
  { time: "1 week ago", icon: "bi-shield-lock", text: "Custom role 'Property Caretaker' created with 1 property scope", by: "You" },
  { time: "2 weeks ago", icon: "bi-box-arrow-right", text: "All sessions revoked for Kevin Barasa", by: "You" },
];
