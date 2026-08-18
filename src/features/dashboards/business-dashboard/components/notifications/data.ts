/* ==================================================================
   PayMo Business — PAGE 8: NOTIFICATIONS CENTER — data layer
================================================================== */

/* ================= Types ================= */
export type NotifCategory = "Payments" | "Sales" | "Inventory" | "Compliance" | "Team" | "System" | "Marketing";
export type NotifPriority = "Routine" | "Important" | "Urgent";
export type DeliveryStatus = "Delivered" | "Opened" | "Bounced" | "Pending";
export type Channel = "whatsapp" | "sms" | "email" | "inapp" | "push";

export interface NotifItem {
  id: string;
  category: NotifCategory;
  priority: NotifPriority;
  icon: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  archived: boolean;
  delivery: DeliveryStatus;
  channels: Channel[];
  action?: string;
  mutedSource?: boolean;
  moduleLink?: string;
}

export interface CategoryPref {
  id: NotifCategory;
  name: string;
  icon: string;
  color: string;
  channels: Record<Channel, boolean>;
  digests: boolean;
  priorityMin: NotifPriority;
  muted: boolean;
  count: number;
}

export interface AlertRule {
  id: string;
  name: string;
  trigger: string;
  threshold: number;
  currency: string;
  category: NotifCategory;
  channels: Channel[];
  recipients: string[];
  status: "Active" | "Paused";
  fired: number;
}

export interface DeliveryLog {
  id: string;
  notifId: string;
  title: string;
  channel: Channel;
  recipient: string;
  sent: string;
  status: DeliveryStatus;
  attempts: number;
  note?: string;
}

export interface QuietHour {
  id: string;
  label: string;
  days: string;
  start: string;
  end: string;
  allowUrgent: boolean;
  active: boolean;
}

export interface Template {
  id: string;
  name: string;
  channel: Channel;
  category: NotifCategory;
  subject: string;
  body: string;
  variables: string[];
}

export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Notifications feed ================= */
export const NOTIFS: NotifItem[] = [
  { id: "n1", category: "Payments", priority: "Urgent", icon: "bi-cash-coin", title: "M-Pesa reversal claim DSP-2026-089", body: "Customer Dennis Otieno lodged a reversal claim on QK88123049 (KES 14,500). Evidence due within 48 hours to protect funds.", time: "15 min ago", unread: true, archived: false, delivery: "Opened", channels: ["inapp", "whatsapp", "sms"], action: "Defend claim", moduleLink: "Dispute Management" },
  { id: "n2", category: "Payments", priority: "Important", icon: "bi-bag-check", title: "New order ORD-1103 — KES 5,050", body: "Grace Wanjiru paid via M-Pesa Express from the online store. Ready to pack and dispatch.", time: "42 min ago", unread: true, archived: false, delivery: "Delivered", channels: ["inapp", "whatsapp"], action: "View order", moduleLink: "Products & Store" },
  { id: "n3", category: "Inventory", priority: "Important", icon: "bi-exclamation-triangle", title: "Low stock: Ankole Cow-Horn Mug", body: "6 units left — below reorder point (10). Auto-PO draft prepared for Ankole Crafts Co-op.", time: "1 hr ago", unread: true, archived: false, delivery: "Delivered", channels: ["inapp", "sms", "email"], action: "Approve reorder", moduleLink: "Inventory & Stock" },
  { id: "n4", category: "Compliance", priority: "Urgent", icon: "bi-shield-exclamation", title: "CR12 expires in 34 days", body: "Your business registration summary expires 22 Feb 2026. Renew to keep Level 2 KYB and KES 5M/day limits.", time: "3 hrs ago", unread: true, archived: false, delivery: "Opened", channels: ["inapp", "email", "sms"], action: "Upload renewal", moduleLink: "Business Profile & KYB" },
  { id: "n5", category: "Sales", priority: "Routine", icon: "bi-receipt", title: "Invoice INV-0091 paid in full", body: "Jenga Developers paid KES 410,000 via PesaLink. Receipt sent and ledger updated.", time: "5 hrs ago", unread: true, archived: false, delivery: "Delivered", channels: ["inapp"], action: "View invoice", moduleLink: "Get Paid" },
  { id: "n6", category: "Team", priority: "Important", icon: "bi-person-plus", title: "Invite accepted: Naomi Chemtai", body: "Naomi joined as Sales Staff. First login from Nairobi — welcome her to the team.", time: "Yesterday", unread: false, archived: false, delivery: "Opened", channels: ["inapp", "email"], action: "View member", moduleLink: "Team & Roles" },
  { id: "n7", category: "Marketing", priority: "Routine", icon: "bi-lightning-charge", title: "Flash sale converted 186 orders", body: "Mashujaa Weekend Flash Sale hit KES 214,500 revenue — ROI 25.5× on spend.", time: "Yesterday", unread: false, archived: false, delivery: "Delivered", channels: ["inapp", "whatsapp"], action: "View campaign", moduleLink: "Marketing & Growth" },
  { id: "n8", category: "System", priority: "Important", icon: "bi-puzzle", title: "Meta connection expired", body: "Instagram orders paused for 2 days. Re-authenticate to resume sync.", time: "2 days ago", unread: false, archived: false, delivery: "Opened", channels: ["inapp", "email"], action: "Reconnect", moduleLink: "Apps & Integrations" },
  { id: "n9", category: "Compliance", priority: "Routine", icon: "bi-receipt-cutoff", title: "VAT filing due 20 Jan", body: "KES 96,400 VAT (output) for TS Retail is due. Figures prepared in Bookkeeping.", time: "2 days ago", unread: false, archived: false, delivery: "Delivered", channels: ["inapp", "sms", "email"], action: "Review filing", moduleLink: "Bookkeeping & Taxes" },
  { id: "n10", category: "Payments", priority: "Routine", icon: "bi-arrow-repeat", title: "Weekly payout settled", body: "KES 486,250 swept to NCBA A/C 5834229001. Reconciliation complete.", time: "3 days ago", unread: false, archived: false, delivery: "Delivered", channels: ["email"], action: "View statement", moduleLink: "Cash & Accounts" },
  { id: "n11", category: "Inventory", priority: "Routine", icon: "bi-box-arrow-in-down", title: "PO-1041 partially received", body: "Kitui Weavers delivered 10 of 25 kiondo baskets. Balance due tomorrow.", time: "4 days ago", unread: false, archived: true, delivery: "Delivered", channels: ["inapp"], action: "View PO", moduleLink: "Inventory & Stock" },
  { id: "n12", category: "Marketing", priority: "Routine", icon: "bi-envelope-open", title: "Newsletter: 41% open rate", body: "January newsletter opened by 410 of 1,240 subscribers — above your 33% average.", time: "5 days ago", unread: false, archived: true, delivery: "Delivered", channels: ["inapp"], action: "View report", moduleLink: "Marketing & Growth" },
];

/* ================= Category preferences ================= */
export const CATEGORY_PREFS: CategoryPref[] = [
  { id: "Payments", name: "Payments & money movement", icon: "bi-cash-coin", color: "#12b76a", channels: { whatsapp: true, sms: true, email: true, inapp: true, push: true }, digests: false, priorityMin: "Important", muted: false, count: 3 },
  { id: "Sales", name: "Sales & orders", icon: "bi-bag-check", color: "#2e90fa", channels: { whatsapp: true, sms: false, email: true, inapp: true, push: true }, digests: false, priorityMin: "Routine", muted: false, count: 1 },
  { id: "Inventory", name: "Inventory & stock alerts", icon: "bi-box-seam", color: "#f79009", channels: { whatsapp: true, sms: true, email: true, inapp: true, push: true }, digests: true, priorityMin: "Routine", muted: false, count: 2 },
  { id: "Compliance", name: "KRA, KYB & compliance", icon: "bi-shield-check", color: "#e11d48", channels: { whatsapp: true, sms: true, email: true, inapp: true, push: true }, digests: false, priorityMin: "Urgent", muted: false, count: 2 },
  { id: "Team", name: "Team & access", icon: "bi-people", color: "#7a5af8", channels: { whatsapp: false, sms: false, email: true, inapp: true, push: true }, digests: true, priorityMin: "Important", muted: false, count: 1 },
  { id: "System", name: "System & integrations", icon: "bi-puzzle", color: "#475467", channels: { whatsapp: false, sms: true, email: true, inapp: true, push: false }, digests: false, priorityMin: "Important", muted: false, count: 1 },
  { id: "Marketing", name: "Marketing performance", icon: "bi-megaphone", color: "#ff4f00", channels: { whatsapp: false, sms: false, email: true, inapp: true, push: false }, digests: true, priorityMin: "Routine", muted: false, count: 2 },
];

/* ================= Alert rules ================= */
export const ALERT_RULES: AlertRule[] = [
  { id: "r1", name: "M-Pesa reversal or chargeback", trigger: "Dispute / reversal claim", threshold: 0, currency: "KES", category: "Payments", channels: ["whatsapp", "sms", "inapp"], recipients: ["You", "Mwangi Kamau"], status: "Active", fired: 5 },
  { id: "r2", name: "Large inbound payment", trigger: "Payment received", threshold: 100000, currency: "KES", category: "Payments", channels: ["whatsapp", "inapp"], recipients: ["You"], status: "Active", fired: 18 },
  { id: "r3", name: "Stock below reorder point", trigger: "SKU hits reorder level", threshold: 0, currency: "units", category: "Inventory", channels: ["sms", "email", "inapp"], recipients: ["You", "Mwangi Kamau", "Achieng Otieno"], status: "Active", fired: 41 },
  { id: "r4", name: "KYB document expiring", trigger: "Compliance doc expires", threshold: 45, currency: "days", category: "Compliance", channels: ["email", "sms", "inapp"], recipients: ["You"], status: "Active", fired: 7 },
  { id: "r5", name: "Failed integration sync", trigger: "Sync error", threshold: 0, currency: "errors", category: "System", channels: ["whatsapp", "inapp"], recipients: ["You"], status: "Active", fired: 12 },
  { id: "r6", name: "Invoice overdue", trigger: "Invoice past due date", threshold: 1, currency: "day", category: "Sales", channels: ["email", "inapp"], recipients: ["You", "Achieng Otieno"], status: "Paused", fired: 22 },
];

/* ================= Delivery log ================= */
export const DELIVERY_LOG: DeliveryLog[] = [
  { id: "dl1", notifId: "n1", title: "M-Pesa reversal claim DSP-2026-089", channel: "whatsapp", recipient: "0722 445 118", sent: "15 min ago", status: "Opened", attempts: 1 },
  { id: "dl2", notifId: "n1", title: "M-Pesa reversal claim DSP-2026-089", channel: "sms", recipient: "0722 445 118", sent: "15 min ago", status: "Delivered", attempts: 1 },
  { id: "dl3", notifId: "n2", title: "New order ORD-1103", channel: "whatsapp", recipient: "0722 445 118", sent: "42 min ago", status: "Delivered", attempts: 1 },
  { id: "dl4", notifId: "n3", title: "Low stock: Ankole Cow-Horn Mug", channel: "email", recipient: "wanjiku@techsol.co.ke", sent: "1 hr ago", status: "Delivered", attempts: 1 },
  { id: "dl5", notifId: "n4", title: "CR12 expires in 34 days", channel: "email", recipient: "wanjiku@techsol.co.ke", sent: "3 hrs ago", status: "Bounced", attempts: 3, note: "Mailbox full — retry exceeded" },
  { id: "dl6", notifId: "n4", title: "CR12 expires in 34 days", channel: "sms", recipient: "0722 445 118", sent: "3 hrs ago", status: "Delivered", attempts: 1 },
  { id: "dl7", notifId: "n8", title: "Meta connection expired", channel: "email", recipient: "wanjiku@techsol.co.ke", sent: "2 days ago", status: "Opened", attempts: 1 },
  { id: "dl8", notifId: "n10", title: "Weekly payout settled", channel: "email", recipient: "wanjiku@techsol.co.ke", sent: "3 days ago", status: "Delivered", attempts: 1 },
];

/* ================= Quiet hours ================= */
export const QUIET_HOURS: QuietHour[] = [
  { id: "q1", label: "Nightly silence", days: "Mon – Fri", start: "22:00", end: "07:00", allowUrgent: true, active: true },
  { id: "q2", label: "Weekend off", days: "Sat – Sun", start: "20:00", end: "09:00", allowUrgent: true, active: true },
  { id: "q3", label: "Holiday break", days: "25 Dec – 2 Jan", start: "00:00", end: "23:59", allowUrgent: false, active: false },
];

/* ================= Templates ================= */
export const TEMPLATES: Template[] = [
  { id: "t1", name: "Payment received", channel: "whatsapp", category: "Payments", subject: "Payment received", body: "💰 KES {{amount}} received from {{customer}} via {{channel}}. Ref: {{ref}}", variables: ["{{amount}}", "{{customer}}", "{{channel}}", "{{ref}}"] },
  { id: "t2", name: "Low stock alert", channel: "sms", category: "Inventory", subject: "", body: "⚠️ {{sku}} at {{stock}} units (reorder at {{reorder}}). Auto-PO drafted for {{supplier}}.", variables: ["{{sku}}", "{{stock}}", "{{reorder}}", "{{supplier}}"] },
  { id: "t3", name: "KYB expiry warning", channel: "email", category: "Compliance", subject: "{{doc}} expires in {{days}} days", body: "Dear {{name}}, your {{doc}} expires {{date}}. Renew to keep Level 2 limits.", variables: ["{{doc}}", "{{days}}", "{{date}}", "{{name}}"] },
  { id: "t4", name: "Sync failure", channel: "whatsapp", category: "System", subject: "", body: "🔌 {{integration}} sync failed ({{error}}). Retry: {{action}}", variables: ["{{integration}}", "{{error}}", "{{action}}"] },
];

/* ================= Digest schedule ================= */
export const DIGEST_SCHEDULE = {
  enabled: true,
  frequency: "Daily",
  time: "08:00",
  timezone: "EAT (UTC+3)",
  includeArchive: false,
  categories: ["Inventory", "Team", "Marketing"],
};

/* ================= Channel stats ================= */
export const CHANNEL_STATS = [
  { channel: "whatsapp" as Channel, label: "WhatsApp", icon: "bi-whatsapp", tone: "green", sent30: 1284, opened: 1094, rate: "85.2%" },
  { channel: "sms" as Channel, label: "SMS", icon: "bi-chat-left-text", tone: "blue", sent30: 890, opened: 712, rate: "80.0%" },
  { channel: "email" as Channel, label: "Email", icon: "bi-envelope", tone: "slate", sent30: 640, opened: 262, rate: "40.9%" },
  { channel: "inapp" as Channel, label: "In-app", icon: "bi-bell", tone: "violet", sent30: 2140, opened: 1908, rate: "89.2%" },
  { channel: "push" as Channel, label: "Push", icon: "bi-phone", tone: "amber", sent30: 980, opened: 833, rate: "85.0%" },
];

/* ================= Notifications & activity ================= */
export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-exclamation-triangle", text: "Dispute DSP-2026-089 needs evidence within 48 hours", time: "15 min ago", unread: true, action: "View" },
  { id: 2, icon: "bi-bag-check", text: "New order ORD-1103 — KES 5,050 via M-Pesa", time: "42 min ago", unread: true, action: "View" },
  { id: 3, icon: "bi-box-seam", text: "Ankole Cow-Horn Mug below reorder point", time: "1 hr ago", unread: true, action: "Reorder" },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 08:00", icon: "bi-envelope-check", text: "Daily digest sent — 12 notifications across 3 categories", by: "System" },
  { time: "Yesterday 22:00", icon: "bi-moon", text: "Quiet hours started — routine alerts paused until 07:00", by: "System" },
  { time: "Yesterday 15:32", icon: "bi-pencil", text: "Template 'Payment received' updated with new wording", by: "You" },
  { time: "2 days ago", icon: "bi-plus-circle", text: "Alert rule 'Large inbound payment' created (KES 100K+)", by: "You" },
  { time: "3 days ago", icon: "bi-bell-slash", text: "Muted Marketing category for 7 days (flash sale noise)", by: "You" },
  { time: "1 week ago", icon: "bi-check2-all", text: "Preferences wizard applied — Team alerts to email-only", by: "You" },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: true },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];
