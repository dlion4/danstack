import { addDays, todayISO } from "./lib";

const T = todayISO();
const dt = (d: number, h = 9, m = 0) => `${addDays(T, -d)}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

/* ── CRM Customer (6.1) ───────────────────────────────────────────── */

export type Tier = "vip" | "regular" | "new" | "risk";

export interface CrmNote { t: string; text: string; by: string; }
export interface CrmDoc { name: string; kind: string; date: string; }

export interface CrmCustomer {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  pin: string;
  balance: number;
  avgDays: number;
  ltv: number;
  tier: Tier;
  tags: string[];
  lastContact: string;
  lastInvoice: string;
  openInvoices: number;
  totalInvoices: number;
  added: string;
  source: "manual" | "import" | "walkin";
  channel: "WhatsApp" | "Email" | "SMS";
  notes: CrmNote[];
  docs: CrmDoc[];
  birthday?: string;
  portal: boolean;
}

export const crmCustomersSeed: CrmCustomer[] = [
  {
    id: "c1", name: "Amina Wanjiru", business: "Akili Studio", phone: "0712 445 890", email: "amina@akili.studio", pin: "A0023456X",
    balance: 50000, avgDays: 24, ltv: 1305000, tier: "vip", tags: ["Design partner", "Recurring"],
    lastContact: dt(1, 15, 20), lastInvoice: addDays(T, -14), openInvoices: 2, totalInvoices: 31, added: addDays(T, -940), source: "manual", channel: "WhatsApp",
    notes: [
      { t: dt(3, 10, 0), text: "Prefers milestone billing. Always negotiates the retainer each January.", by: "Wanjiru K." },
      { t: dt(12, 9, 30), text: "Referred two clients (Coastal Wholesale, Muthoni Beauty).", by: "Mary Kamau" },
    ],
    docs: [{ name: "contract-2026.pdf", kind: "Contract", date: addDays(T, -80) }, { name: "brand-guidelines.pdf", kind: "Project", date: addDays(T, -30) }],
    birthday: addDays(T, 9), portal: true,
  },
  {
    id: "c2", name: "Brian Otieno", business: "B.O Digital", phone: "0733 221 006", email: "brian@bodigital.co.ke", pin: "B0911223K",
    balance: 18500, avgDays: 41, ltv: 420000, tier: "regular", tags: ["Milestone projects"],
    lastContact: dt(4, 11, 0), lastInvoice: addDays(T, -8), openInvoices: 1, totalInvoices: 14, added: addDays(T, -420), source: "manual", channel: "WhatsApp",
    notes: [{ t: dt(5, 12, 0), text: "Pays partially then needs 2 reminders for the balance.", by: "Daniel Kiprop" }],
    docs: [], portal: true,
  },
  {
    id: "c3", name: "Grace Chebet", business: "Chebet Farm Supplies", phone: "0721 908 334", email: "grace@chebetfarms.co.ke", pin: "C2019874W",
    balance: 0, avgDays: 9, ltv: 512000, tier: "vip", tags: ["Farms", "Fast payer"],
    lastContact: dt(2, 8, 45), lastInvoice: addDays(T, -9), openInvoices: 0, totalInvoices: 22, added: addDays(T, -660), source: "manual", channel: "Email",
    notes: [], docs: [{ name: "farm-quote-2026.pdf", kind: "Quote", date: addDays(T, -12) }], portal: true,
  },
  {
    id: "c4", name: "David Kariuki", business: "Kariuki Logistics", phone: "0700 512 487", email: "david@kariukilogistics.com", pin: "D0399812P",
    balance: 107000, avgDays: 63, ltv: 890000, tier: "risk", tags: ["Fleet", "Slow payer"],
    lastContact: dt(12, 9, 0), lastInvoice: addDays(T, -96), openInvoices: 3, totalInvoices: 18, added: addDays(T, -780), source: "import", channel: "SMS",
    notes: [
      { t: dt(12, 9, 5), text: "Sent final demand via email. Says cash flow improves after county tender pays.", by: "Wanjiru K." },
    ],
    docs: [{ name: "fleet-contract.pdf", kind: "Contract", date: addDays(T, -300) }], portal: false,
  },
  {
    id: "c5", name: "Esther Muthoni", business: "Muthoni Beauty", phone: "0798 110 227", email: "esther@muthonibeauty.co.ke", pin: "E0551233T",
    balance: 0, avgDays: 7, ltv: 187500, tier: "regular", tags: ["Recurring"],
    lastContact: dt(1, 10, 15), lastInvoice: addDays(T, -12), openInvoices: 0, totalInvoices: 26, added: addDays(T, -750), source: "manual", channel: "SMS",
    notes: [], docs: [], birthday: addDays(T, 22), portal: true,
  },
  {
    id: "c6", name: "James Kimani", business: "Kimani Hardware", phone: "0722 664 118", email: "james@kimanihardware.com", pin: "J0441090Q",
    balance: 12500, avgDays: 12, ltv: 412500, tier: "regular", tags: ["Hardware", "Recurring"],
    lastContact: dt(0, 9, 0), lastInvoice: addDays(T, -2), openInvoices: 1, totalInvoices: 34, added: addDays(T, -990), source: "manual", channel: "Email",
    notes: [], docs: [], portal: true,
  },
  {
    id: "c7", name: "Lucy Achieng", business: "Achieng Events", phone: "0735 887 902", email: "lucy@achiengevents.co.ke", pin: "L0877345F",
    balance: 44000, avgDays: 51, ltv: 396000, tier: "risk", tags: ["Events", "Seasonal"],
    lastContact: dt(5, 14, 0), lastInvoice: addDays(T, -33), openInvoices: 2, totalInvoices: 23, added: addDays(T, -680), source: "manual", channel: "WhatsApp",
    notes: [{ t: dt(5, 14, 5), text: "Peak wedding season starts April — expect prompt payment then.", by: "Mary Kamau" }],
    docs: [], portal: false,
  },
  {
    id: "c8", name: "Peter Njoroge", business: "Njoroge & Sons", phone: "0711 330 456", email: "peter@njorogesons.co.ke", pin: "N0128897V",
    balance: 80500, avgDays: 74, ltv: 1210000, tier: "risk", tags: ["Retail chain", "Slow payer"],
    lastContact: dt(21, 9, 0), lastInvoice: addDays(T, -47), openInvoices: 2, totalInvoices: 16, added: addDays(T, -840), source: "import", channel: "Email",
    notes: [{ t: dt(21, 9, 10), text: "Opened 3rd branch in Westlands. Worth a visit to discuss terms.", by: "Wanjiru K." }],
    docs: [{ name: "migration-soa.pdf", kind: "Invoice", date: addDays(T, -82) }], portal: true,
  },
  {
    id: "c9", name: "Fatuma Ali", business: "Coastal Wholesale", phone: "0701 552 209", email: "fatuma@coastalwholesale.co.ke", pin: "F0233445M",
    balance: 15000, avgDays: 18, ltv: 680000, tier: "regular", tags: ["Wholesale", "Referred by Amina"],
    lastContact: dt(2, 12, 30), lastInvoice: addDays(T, -15), openInvoices: 1, totalInvoices: 9, added: addDays(T, -960), source: "manual", channel: "Email",
    notes: [], docs: [], portal: true,
  },
  {
    id: "c10", name: "Samuel Mwangi", business: "Mwangi Auto Garage", phone: "0740 118 923", email: "sam@mwangiagarage.co.ke", pin: "S0667761B",
    balance: 0, avgDays: 5, ltv: 86400, tier: "new", tags: ["Garage", "New lead"],
    lastContact: dt(1, 16, 40), lastInvoice: addDays(T, -1), openInvoices: 0, totalInvoices: 3, added: addDays(T, -18), source: "walkin", channel: "WhatsApp",
    notes: [{ t: dt(1, 16, 45), text: "Walk-in from shop floor. Needs a product demo next week.", by: "Mercy J." }],
    docs: [], portal: false,
  },
];

/* ── Conversations (6.2) ──────────────────────────────────────────── */

export interface Msg {
  id: string;
  customerId: string;
  direction: "in" | "out";
  channel: "WhatsApp" | "SMS" | "Email";
  text: string;
  t: string;
  read: boolean;
}

export const msgsSeed: Msg[] = [
  { id: "m1", customerId: "c4", direction: "in", channel: "WhatsApp", text: "Habari! County tender finally approved — I can clear INV-0130 by Friday. Apologies for the delay.", t: dt(0, 8, 12), read: false },
  { id: "m2", customerId: "c1", direction: "in", channel: "WhatsApp", text: "Can we move the April retainer invoice to the 5th? Our finance team runs payroll then.", t: dt(0, 9, 4), read: false },
  { id: "m3", customerId: "c6", direction: "out", channel: "Email", text: "Hi James, sent INV-0141 for the monthly maintenance — let me know if anything looks off.", t: dt(2, 8, 1), read: true },
  { id: "m4", customerId: "c10", direction: "in", channel: "SMS", text: "Received the scanner yesterday, works perfectly. Asante!", t: dt(1, 15, 30), read: true },
  { id: "m5", customerId: "c7", direction: "out", channel: "WhatsApp", text: "Hi Lucy, quick reminder on INV-0139 — balance of KES 44,000 is now 3 days overdue. Payment link attached.", t: dt(5, 9, 0), read: true },
  { id: "m6", customerId: "c8", direction: "in", channel: "Email", text: "Please resend the migration scope — our accounts team lost the copy.", t: dt(1, 11, 20), read: true },
  { id: "m7", customerId: "c5", direction: "in", channel: "SMS", text: "Booking system is down since this morning??", t: dt(0, 10, 2), read: false },
];

/* ── Message templates (6.2) ──────────────────────────────────────── */

export interface MsgTemplate {
  id: string;
  name: string;
  channel: string;
  body: string;
  folder: string;
}

export const templatesSeed: MsgTemplate[] = [
  { id: "t1", name: "Payment reminder — friendly", channel: "WhatsApp", folder: "Collections", body: "Habari {name}! Friendly reminder that {invoice} for {amount} is due {due}. Pay via M-Pesa Paybill 880321, account {invoice}. Asante sana! 🙏" },
  { id: "t2", name: "New invoice notification", channel: "Email", folder: "Invoicing", body: "Dear {name},\n\nYour invoice {invoice} for {amount} has been issued and is due {due}.\n\nPay via M-Pesa Paybill 880321, account {invoice}.\n\nThank you for your business,\nTechSol Ltd" },
  { id: "t3", name: "Post-payment thank you", channel: "SMS", folder: "Care", body: "Asante {name}! We've received {amount} against {invoice}. Your receipt is on the way. We value you! 💚" },
  { id: "t4", name: "Service update — out of office", channel: "WhatsApp", folder: "Care", body: "Hi {name}, our support team is at an offsite until tomorrow 8am. Urgent issues: call 0700 123 456." },
  { id: "t5", name: "Win-back offer", channel: "Email", folder: "Growth", body: "Hi {name}, it's been a while! We'd love you back — 10% off your next engagement before end of month." },
];

/* ── Segments (6.4) ───────────────────────────────────────────────── */

export interface Segment {
  id: string;
  name: string;
  desc: string;
  color: string;
  icon: string;
}

export const segmentDefs: Segment[] = [
  { id: "champions", name: "Champions (VIP)", desc: "High LTV, pays fast, buys often", color: "#0ea37f", icon: "👑" },
  { id: "loyal", name: "Loyal Regulars", desc: "Consistent on-time payers", color: "#0e7490", icon: "💚" },
  { id: "new", name: "New Customers", desc: "First invoice within 60 days", color: "#7c3aed", icon: "🌱" },
  { id: "risk", name: "At-Risk", desc: "Outstanding balance or slow payers", color: "#f59e0b", icon: "⚠️" },
  { id: "lost", name: "Going Cold", desc: "No invoice in 90+ days", color: "#e11d48", icon: "🧊" },
];

/* ── Smart lists (6.4) ────────────────────────────────────────────── */

export interface SmartList {
  id: string;
  name: string;
  rules: { field: string; op: string; value: string }[];
  color: string;
}

export const smartListsSeed: SmartList[] = [
  { id: "sl1", name: "Overdue VIPs", rules: [{ field: "balance", op: ">", value: "0" }, { field: "tier", op: "is", value: "vip" }], color: "#f59e0b" },
  { id: "sl2", name: "WhatsApp reachable", rules: [{ field: "channel", op: "is", value: "WhatsApp" }], color: "#0ea37f" },
];

export const CRM_FIELDS = [
  { id: "balance", label: "Outstanding balance", type: "number" },
  { id: "avgDays", label: "Avg days to pay", type: "number" },
  { id: "ltv", label: "Lifetime value", type: "number" },
  { id: "tier", label: "Tier", type: "select", options: ["vip", "regular", "new", "risk"] },
  { id: "channel", label: "Preferred channel", type: "select", options: ["WhatsApp", "Email", "SMS"] },
  { id: "openInvoices", label: "Open invoices", type: "number" },
  { id: "portal", label: "Portal enabled", type: "select", options: ["true", "false"] },
  { id: "tags", label: "Has tag", type: "text" },
];

/* ── Portal (6.5) ────────────────────────────────────────────────── */

export const portalSettings = {
  features: { viewInvoices: true, receipts: true, updateContact: false, cancelSub: false, paymentMethods: true },
  accent: "#0ea37f",
  title: "TechSol Ltd — Customer Portal",
  activeCustomers: 6,
};

/* ── Nudges / automations (6.6) ──────────────────────────────────── */

export interface Nudge {
  id: string;
  name: string;
  trigger: string;
  audience: string;
  channel: string;
  message: string;
  status: "active" | "paused";
  sent30d: number;
  lastSent: string;
}

export const nudgesSeed: Nudge[] = [
  { id: "n1", name: "Due-today invoice reminder", trigger: "Invoice due date", audience: "Customer with due invoice", channel: "WhatsApp", message: "Hi {name}, invoice {invoice} is due today. Paybill 880321, account {invoice}.", status: "active", sent30d: 14, lastSent: "today 08:00" },
  { id: "n2", name: "Thank-you after payment", trigger: "Payment received", audience: "Any customer", channel: "SMS", message: "Asante {name}! Payment of {amount} received against {invoice}. Receipt attached.", status: "active", sent30d: 22, lastSent: "today 10:47" },
  { id: "n3", name: "3-day grace follow-up", trigger: "3 days after due date", audience: "Customers with overdue balance", channel: "Email", message: "Hi {name}, {invoice} is 3 days overdue. Kindly settle to avoid reminder escalations.", status: "active", sent30d: 6, lastSent: "yesterday" },
  { id: "n4", name: "Birthday surprise", trigger: "Customer birthday", audience: "All customers", channel: "WhatsApp", message: "Happy birthday {name}! 🎉 As our gift, take 10% off your next invoice this month.", status: "paused", sent30d: 0, lastSent: "never" },
  { id: "n5", name: "Win-back after silence", trigger: "No activity for 60 days", audience: "Customers with LTV > KES 200K", channel: "Email", message: "Hi {name}, it's been a while. Here's 10% off your next project — valid 30 days.", status: "active", sent30d: 2, lastSent: "3 days ago" },
];

/* ── Notifications ────────────────────────────────────────────────── */

export interface CrmNotification {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const crmNotificationsSeed: CrmNotification[] = [
  { id: "cn1", tone: "danger", title: "Kariuki Logistics may pay Friday", body: "Incoming message: 'County tender approved — clearing INV-0130 by Friday'. KES 62,000 expected.", time: "12 min ago", read: false },
  { id: "cn2", tone: "warning", title: "Muthoni Beauty system down", body: "Support ticket via SMS: 'Booking system is down since this morning?' — respond within SLA.", time: "31 min ago", read: false },
  { id: "cn3", tone: "info", title: "Akili Studio wants invoice move", body: "April retainer to be moved to the 5th. Action needed on INV-0142 schedule.", time: "47 min ago", read: false },
  { id: "cn4", tone: "success", title: "2 customers joined the portal", body: "Samuel Mwangi and James Kimani activated portal access this week.", time: "3 h ago", read: true },
  { id: "cn5", tone: "success", title: "Nudge campaign delivered", body: "14 due-today reminders went out this morning — 9 payments already matched.", time: "Yesterday", read: true },
];
