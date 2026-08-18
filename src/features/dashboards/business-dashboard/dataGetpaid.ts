import { addDays, todayISO } from "./lib";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface Customer {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  pin: string;
  balance: number;
  avgDays: number;
}

export interface InvoiceLine {
  desc: string;
  qty: number;
  unit: string;
  price: number;
  tax: number;
  disc: number;
}

export interface Activity {
  t: string;
  text: string;
  kind: "created" | "sent" | "viewed" | "paid" | "reminder" | "note" | "system";
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  ref: string;
  t: string;
  status: "settled" | "pending";
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  issue: string;
  due: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  terms: string;
  po?: string;
  notes: string;
  memo?: string;
  template: string;
  activity: Activity[];
  payments: Payment[];
  viewed: boolean;
  reminders: number;
  creditNote?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  desc: string;
  tier: "active" | "pending" | "available";
  account: string;
  accountLabel: string;
  month: number;
  txCount: number;
  avgTicket: number;
  success: number;
  failure: number;
  failReason?: string;
  spark: number[];
  fee: string;
  warning?: string;
  wallets?: string[];
}

export interface Recurring {
  id: string;
  customerId: string;
  amount: number;
  freq: string;
  next: string;
  lifetime: number;
  count: number;
  status: "active" | "paused" | "ended";
  failures: number;
  channel: string;
  onTime: number;
  start: string;
}

export interface AgingRow {
  customerId: string;
  b30: number;
  b60: number;
  b90: number;
  b90p: number;
}

export interface Tx {
  id: string;
  ref: string;
  phone: string;
  name?: string;
  amount: number;
  t: string;
  channel: string;
  status: "matched" | "unmatched" | "partial" | "suggested";
  invoice?: string;
  confidence?: number;
  bal?: number;
}

export interface PayLink {
  id: string;
  title: string;
  amount: number;
  expires: string;
  views: number;
  pays: number;
  collected: number;
  status: "active" | "expired" | "disabled";
  spark: number[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  tax: number;
}

/* ── Customers ─────────────────────────────────────────────────────── */

export const customers: Customer[] = [
  { id: "c1", name: "Amina Wanjiru", business: "Akili Studio", phone: "0712 445 890", email: "amina@akili.studio", pin: "A0023456X", balance: 50000, avgDays: 24 },
  { id: "c2", name: "Brian Otieno", business: "B.O Digital", phone: "0733 221 006", email: "brian@bodigital.co.ke", pin: "B0911223K", balance: 18500, avgDays: 41 },
  { id: "c3", name: "Grace Chebet", business: "Chebet Farm Supplies", phone: "0721 908 334", email: "grace@chebetfarms.co.ke", pin: "C2019874W", balance: 0, avgDays: 9 },
  { id: "c4", name: "David Kariuki", business: "Kariuki Logistics", phone: "0700 512 487", email: "david@kariukilogistics.com", pin: "D0399812P", balance: 107000, avgDays: 63 },
  { id: "c5", name: "Esther Muthoni", business: "Muthoni Beauty", phone: "0798 110 227", email: "esther@muthonibeauty.co.ke", pin: "E0551233T", balance: 0, avgDays: 7 },
  { id: "c6", name: "James Kimani", business: "Kimani Hardware", phone: "0722 664 118", email: "james@kimanihardware.com", pin: "J0441090Q", balance: 12500, avgDays: 12 },
  { id: "c7", name: "Lucy Achieng", business: "Achieng Events", phone: "0735 887 902", email: "lucy@achiengevents.co.ke", pin: "L0877345F", balance: 44000, avgDays: 51 },
  { id: "c8", name: "Peter Njoroge", business: "Njoroge & Sons", phone: "0711 330 456", email: "peter@njorogesons.co.ke", pin: "N0128897V", balance: 80500, avgDays: 74 },
  { id: "c9", name: "Fatuma Ali", business: "Coastal Wholesale", phone: "0701 552 209", email: "fatuma@coastalwholesale.co.ke", pin: "F0233445M", balance: 15000, avgDays: 18 },
  { id: "c10", name: "Samuel Mwangi", business: "Mwangi Auto Garage", phone: "0740 118 923", email: "sam@mwangiagarage.co.ke", pin: "S0667761B", balance: 0, avgDays: 5 },
];

/* ── Products ──────────────────────────────────────────────────────── */

export const products: Product[] = [
  { id: "p1", name: "Website hosting (annual)", price: 18000, unit: "pcs", tax: 16 },
  { id: "p2", name: "Software maintenance retainer", price: 45000, unit: "mo", tax: 16 },
  { id: "p3", name: "POS hardware bundle", price: 32000, unit: "pcs", tax: 16 },
  { id: "p4", name: "Integration API tokens", price: 9500, unit: "pcs", tax: 16 },
  { id: "p5", name: "Staff training workshop", price: 25000, unit: "day", tax: 0 },
  { id: "p6", name: "Server migration service", price: 55000, unit: "pcs", tax: 16 },
  { id: "p7", name: "Support hours (10 pack)", price: 7500, unit: "pcs", tax: 16 },
  { id: "p8", name: "Data recovery service", price: 40000, unit: "pcs", tax: 16 },
];

/* ── Invoices ──────────────────────────────────────────────────────── */

const T = todayISO();
const act = (t: string, text: string, kind: Activity["kind"]): Activity => ({ t, text, kind });

export const invoicesSeed: Invoice[] = [
  {
    id: "inv-0136", number: "INV-0136", customerId: "c3", issue: addDays(T, -9), due: addDays(T, 21), amount: 84500, paid: 84500, status: "paid",
    lines: [
      { desc: "Farm management software — annual licence", qty: 1, unit: "pcs", price: 62000, tax: 16, disc: 0 },
      { desc: "Staff training workshop (2 days)", qty: 2, unit: "day", price: 11250, tax: 0, disc: 0 },
    ],
    terms: "30 days", notes: "Thank you for your business. Pay via M-Pesa Paybill 880321, account INV-0136.",
    template: "Professional", viewed: true, reminders: 0,
    activity: [
      act(addDays(T, -9) + "T09:12:00", "Invoice created", "created"),
      act(addDays(T, -9) + "T09:14:00", "Sent to grace@chebetfarms.co.ke", "sent"),
      act(addDays(T, -8) + "T16:40:00", "Viewed by customer", "viewed"),
      act(addDays(T, -6) + "T11:02:00", "Payment KES 84,500 received via M-Pesa Paybill", "paid"),
    ],
    payments: [
      { id: "pay-1", amount: 84500, method: "M-Pesa Paybill", ref: "SLK3XQ2RH9", t: addDays(T, -6) + "T11:02:00", status: "settled" },
    ],
  },
  {
    id: "inv-0134", number: "INV-0134", customerId: "c5", issue: addDays(T, -12), due: addDays(T, 2), amount: 22750, paid: 22750, status: "paid",
    lines: [
      { desc: "Beauty salon booking system (monthly)", qty: 1, unit: "mo", price: 12500, tax: 16, disc: 0 },
      { desc: "On-site setup & configuration", qty: 1, unit: "pcs", price: 8000, tax: 16, disc: 0 },
    ],
    terms: "15 days", notes: "Pay via M-Pesa Paybill 880321, account INV-0134.", template: "Simple", viewed: true, reminders: 1,
    activity: [
      act(addDays(T, -12) + "T08:30:00", "Invoice created", "created"),
      act(addDays(T, -12) + "T08:31:00", "Sent via WhatsApp", "sent"),
      act(addDays(T, -10) + "T10:15:00", "Reminder sent via SMS", "reminder"),
      act(addDays(T, -7) + "T15:22:00", "Payment KES 22,750 received via M-Pesa Till", "paid"),
    ],
    payments: [{ id: "pay-2", amount: 22750, method: "M-Pesa Till", ref: "TLL8PW33XK", t: addDays(T, -7) + "T15:22:00", status: "settled" }],
  },
  {
    id: "inv-0133", number: "INV-0133", customerId: "c6", issue: addDays(T, -15), due: addDays(T, -1), amount: 45000, paid: 45000, status: "paid",
    lines: [{ desc: "POS hardware bundle ×3 + installation", qty: 3, unit: "pcs", price: 15000, tax: 16, disc: 0 }],
    terms: "14 days", notes: "Pay via M-Pesa Paybill 880321, account INV-0133.", template: "Retail", viewed: true, reminders: 0,
    activity: [
      act(addDays(T, -15) + "T10:00:00", "Invoice created", "created"),
      act(addDays(T, -15) + "T10:02:00", "Sent to james@kimanihardware.com", "sent"),
      act(addDays(T, -2) + "T09:05:00", "Payment KES 45,000 received via PesaLink", "paid"),
    ],
    payments: [{ id: "pay-3", amount: 45000, method: "PesaLink", ref: "PSL009123", t: addDays(T, -2) + "T09:05:00", status: "settled" }],
  },
  {
    id: "inv-0131", number: "INV-0131", customerId: "c9", issue: addDays(T, -21), due: addDays(T, -7), amount: 61200, paid: 61200, status: "paid",
    lines: [{ desc: "Wholesale inventory sync module", qty: 1, unit: "pcs", price: 45000, tax: 16, disc: 0 }, { desc: "Delivery & courier", qty: 1, unit: "pcs", price: 9000, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Thank you for your business.", template: "Professional", viewed: true, reminders: 0,
    activity: [
      act(addDays(T, -21) + "T09:00:00", "Invoice created", "created"),
      act(addDays(T, -21) + "T09:01:00", "Sent via Email + WhatsApp", "sent"),
      act(addDays(T, -6) + "T12:30:00", "Payment KES 61,200 received via Card", "paid"),
    ],
    payments: [{ id: "pay-4", amount: 61200, method: "Card (Visa)", ref: "CHRG-88412", t: addDays(T, -6) + "T12:30:00", status: "settled" }],
  },
  {
    id: "inv-0129", number: "INV-0129", customerId: "c10", issue: addDays(T, -25), due: addDays(T, -11), amount: 96400, paid: 96400, status: "paid",
    lines: [{ desc: "Garage ERP deployment", qty: 1, unit: "pcs", price: 78000, tax: 16, disc: 0 }, { desc: "Staff training (3 days)", qty: 3, unit: "day", price: 2000, tax: 0, disc: 0 }],
    terms: "14 days", notes: "Pay via M-Pesa Paybill 880321.", template: "Professional", viewed: true, reminders: 2,
    activity: [
      act(addDays(T, -25) + "T11:20:00", "Invoice created", "created"),
      act(addDays(T, -25) + "T11:21:00", "Sent via WhatsApp", "sent"),
      act(addDays(T, -18) + "T09:00:00", "Reminder sent via SMS", "reminder"),
      act(addDays(T, -12) + "T17:45:00", "Payment KES 96,400 received via M-Pesa Paybill", "paid"),
    ],
    payments: [{ id: "pay-5", amount: 96400, method: "M-Pesa Paybill", ref: "SLK7TT91QP", t: addDays(T, -12) + "T17:45:00", status: "settled" }],
  },
  {
    id: "inv-0128", number: "INV-0128", customerId: "c3", issue: addDays(T, -30), due: addDays(T, -16), amount: 38000, paid: 38000, status: "paid",
    lines: [{ desc: "Soil sensor IoT kit", qty: 4, unit: "pcs", price: 9500, tax: 16, disc: 0 }],
    terms: "15 days", notes: "Thank you for your business.", template: "Simple", viewed: false, reminders: 0,
    activity: [
      act(addDays(T, -30) + "T08:00:00", "Invoice created", "created"),
      act(addDays(T, -30) + "T08:01:00", "Sent via Email", "sent"),
      act(addDays(T, -16) + "T14:00:00", "Payment KES 38,000 received via PesaLink", "paid"),
    ],
    payments: [{ id: "pay-6", amount: 38000, method: "PesaLink", ref: "PSL008821", t: addDays(T, -16) + "T14:00:00", status: "settled" }],
  },
  {
    id: "inv-0137", number: "INV-0137", customerId: "c2", issue: addDays(T, -8), due: addDays(T, 22), amount: 42000, paid: 24000, status: "partial",
    lines: [{ desc: "Mobile app development — milestone 2", qty: 1, unit: "pcs", price: 35000, tax: 16, disc: 0 }, { desc: "UI revisions", qty: 1, unit: "pcs", price: 1600, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Milestone payment 2 of 4. Pay via Paybill 880321, account INV-0137.", template: "Professional", viewed: true, reminders: 1,
    activity: [
      act(addDays(T, -8) + "T13:00:00", "Invoice created", "created"),
      act(addDays(T, -8) + "T13:02:00", "Sent to brian@bodigital.co.ke", "sent"),
      act(addDays(T, -7) + "T09:30:00", "Viewed by customer", "viewed"),
      act(addDays(T, -5) + "T12:12:00", "Partial payment KES 24,000 via M-Pesa", "paid"),
      act(addDays(T, -4) + "T10:00:00", "Reminder sent via WhatsApp", "reminder"),
    ],
    payments: [{ id: "pay-7", amount: 24000, method: "M-Pesa Paybill", ref: "SLK2BB8KJ1", t: addDays(T, -5) + "T12:12:00", status: "settled" }],
  },
  {
    id: "inv-0135", number: "INV-0135", customerId: "c1", issue: addDays(T, -14), due: addDays(T, 1), amount: 120000, paid: 70000, status: "partial",
    lines: [{ desc: "Brand platform design (full scope)", qty: 1, unit: "pcs", price: 90000, tax: 16, disc: 0 }, { desc: "Content production (10 pieces)", qty: 10, unit: "pcs", price: 1500, tax: 16, disc: 0 }],
    terms: "On receipt", notes: "Pay via M-Pesa Paybill 880321, account INV-0135.", template: "Professional", viewed: true, reminders: 2,
    activity: [
      act(addDays(T, -14) + "T09:00:00", "Invoice created", "created"),
      act(addDays(T, -14) + "T09:01:00", "Sent via Email + WhatsApp", "sent"),
      act(addDays(T, -12) + "T15:00:00", "Viewed by customer", "viewed"),
      act(addDays(T, -9) + "T10:45:00", "Partial payment KES 70,000 via M-Pesa", "paid"),
      act(addDays(T, -3) + "T09:15:00", "Reminder sent via SMS", "reminder"),
    ],
    payments: [{ id: "pay-8", amount: 70000, method: "M-Pesa Paybill", ref: "SLK9X2QR3H", t: addDays(T, -9) + "T10:45:00", status: "settled" }],
  },
  {
    id: "inv-0130", number: "INV-0130", customerId: "c4", issue: addDays(T, -96), due: addDays(T, -66), amount: 62000, paid: 0, status: "overdue",
    lines: [{ desc: "Fleet tracking — 5 vehicle annual licences", qty: 5, unit: "pcs", price: 12400, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Overdue — please settle via Paybill 880321, account INV-0130.", template: "Professional", viewed: true, reminders: 4,
    activity: [
      act(addDays(T, -96) + "T08:40:00", "Invoice created", "created"),
      act(addDays(T, -96) + "T08:42:00", "Sent to david@kariukilogistics.com", "sent"),
      act(addDays(T, -90) + "T11:00:00", "Viewed by customer", "viewed"),
      act(addDays(T, -70) + "T09:00:00", "Reminder sent via SMS", "reminder"),
      act(addDays(T, -40) + "T09:00:00", "Formal notice sent via Email", "reminder"),
      act(addDays(T, -12) + "T09:00:00", "Final demand sent via Email + SMS", "reminder"),
    ],
    payments: [],
  },
  {
    id: "inv-0132", number: "INV-0132", customerId: "c8", issue: addDays(T, -82), due: addDays(T, -52), amount: 31000, paid: 0, status: "overdue",
    lines: [{ desc: "Accounting system migration", qty: 1, unit: "pcs", price: 31000, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Overdue — please settle at your earliest convenience.", template: "Simple", viewed: true, reminders: 3,
    activity: [
      act(addDays(T, -82) + "T10:00:00", "Invoice created", "created"),
      act(addDays(T, -82) + "T10:01:00", "Sent via Email", "sent"),
      act(addDays(T, -56) + "T09:00:00", "Reminder sent via SMS", "reminder"),
      act(addDays(T, -21) + "T09:00:00", "Formal notice sent via Email", "reminder"),
    ],
    payments: [],
  },
  {
    id: "inv-0138", number: "INV-0138", customerId: "c8", issue: addDays(T, -47), due: addDays(T, -17), amount: 49500, paid: 0, status: "overdue",
    lines: [{ desc: "Multi-branch stock sync upgrade", qty: 1, unit: "pcs", price: 49500, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Pay via M-Pesa Paybill 880321, account INV-0138.", template: "Professional", viewed: false, reminders: 1,
    activity: [
      act(addDays(T, -47) + "T09:00:00", "Invoice created", "created"),
      act(addDays(T, -47) + "T09:01:00", "Sent via Email", "sent"),
      act(addDays(T, -19) + "T09:00:00", "Reminder sent via SMS", "reminder"),
    ],
    payments: [],
  },
  {
    id: "inv-0139", number: "INV-0139", customerId: "c7", issue: addDays(T, -33), due: addDays(T, -3), amount: 44000, paid: 0, status: "overdue",
    lines: [{ desc: "Event management portal — annual", qty: 1, unit: "pcs", price: 44000, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Pay via M-Pesa Paybill 880321, account INV-0139.", template: "Retail", viewed: true, reminders: 1,
    activity: [
      act(addDays(T, -33) + "T12:00:00", "Invoice created", "created"),
      act(addDays(T, -33) + "T12:02:00", "Sent via WhatsApp", "sent"),
      act(addDays(T, -30) + "T17:00:00", "Viewed by customer", "viewed"),
      act(addDays(T, -5) + "T09:00:00", "Reminder sent via SMS", "reminder"),
    ],
    payments: [],
  },
  {
    id: "inv-0140", number: "INV-0140", customerId: "c9", issue: addDays(T, -15), due: addDays(T, -1), amount: 15000, paid: 0, status: "overdue",
    lines: [{ desc: "Stocktake mobile app licence", qty: 10, unit: "pcs", price: 1500, tax: 16, disc: 0 }],
    terms: "14 days", notes: "Pay via Till 4105541, account INV-0140.", template: "Simple", viewed: false, reminders: 0,
    activity: [
      act(addDays(T, -15) + "T14:00:00", "Invoice created", "created"),
      act(addDays(T, -15) + "T14:01:00", "Sent via SMS", "sent"),
    ],
    payments: [],
  },
  {
    id: "inv-0141", number: "INV-0141", customerId: "c6", issue: addDays(T, -2), due: addDays(T, 12), amount: 12500, paid: 0, status: "sent",
    lines: [{ desc: "Hardware store maintenance (monthly)", qty: 1, unit: "mo", price: 12500, tax: 16, disc: 0 }],
    terms: "14 days", notes: "Monthly maintenance contract.", template: "Professional", viewed: false, reminders: 0,
    activity: [
      act(addDays(T, -2) + "T08:00:00", "Invoice created", "created"),
      act(addDays(T, -2) + "T08:01:00", "Sent via Email + WhatsApp", "sent"),
    ],
    payments: [],
  },
  {
    id: "inv-0142", number: "INV-0142", customerId: "c1", issue: addDays(T, -4), due: addDays(T, 26), amount: 18000, paid: 0, status: "sent",
    lines: [{ desc: "Website hosting (annual renewal)", qty: 1, unit: "pcs", price: 18000, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Hosting renewal for akili.studio.", template: "Professional", viewed: true, reminders: 0,
    activity: [
      act(addDays(T, -4) + "T10:00:00", "Invoice created", "created"),
      act(addDays(T, -4) + "T10:01:00", "Sent via Email", "sent"),
      act(addDays(T, -2) + "T16:00:00", "Viewed by customer", "viewed"),
    ],
    payments: [],
  },
  {
    id: "inv-0143", number: "INV-0143", customerId: "c10", issue: addDays(T, -1), due: addDays(T, 29), amount: 27500, paid: 0, status: "sent",
    lines: [{ desc: "Garage diagnostics scanner", qty: 1, unit: "pcs", price: 27500, tax: 16, disc: 0 }],
    terms: "30 days", notes: "Pay via M-Pesa Paybill 880321, account INV-0143.", template: "Retail", viewed: false, reminders: 0,
    activity: [
      act(addDays(T, -1) + "T11:00:00", "Invoice created", "created"),
      act(addDays(T, -1) + "T11:02:00", "Sent via WhatsApp", "sent"),
    ],
    payments: [],
  },
  {
    id: "inv-0144", number: "INV-0144", customerId: "c4", issue: addDays(T, 0), due: addDays(T, 30), amount: 33000, paid: 0, status: "draft",
    lines: [{ desc: "Fleet driver app — phase 3", qty: 1, unit: "pcs", price: 33000, tax: 16, disc: 0 }],
    terms: "30 days", notes: "", template: "Professional", viewed: false, reminders: 0,
    activity: [act(addDays(T, 0) + "T09:20:00", "Draft created (auto-saved)", "created")],
    payments: [],
  },
  {
    id: "inv-0145", number: "INV-0145", customerId: "c7", issue: addDays(T, 0), due: addDays(T, 14), amount: 9800, paid: 0, status: "draft",
    lines: [{ desc: "Extra lighting & AV support — gala night", qty: 1, unit: "pcs", price: 9800, tax: 16, disc: 0 }],
    terms: "14 days", notes: "", template: "Simple", viewed: false, reminders: 0,
    activity: [act(addDays(T, 0) + "T11:45:00", "Draft created (auto-saved)", "created")],
    payments: [],
  },
  {
    id: "inv-0127", number: "INV-0127", customerId: "c2", issue: addDays(T, -40), due: addDays(T, -26), amount: 12000, paid: 0, status: "cancelled",
    lines: [{ desc: "Landing page redesign", qty: 1, unit: "pcs", price: 12000, tax: 16, disc: 0 }],
    terms: "14 days", notes: "Cancelled — credit note CN-0041 issued.", template: "Simple", viewed: true, reminders: 0, creditNote: true,
    activity: [
      act(addDays(T, -40) + "T09:00:00", "Invoice created", "created"),
      act(addDays(T, -40) + "T09:01:00", "Sent via Email", "sent"),
      act(addDays(T, -30) + "T15:00:00", "Credit note CN-0041 issued (customer dispute)", "note"),
      act(addDays(T, -30) + "T15:01:00", "Invoice cancelled", "system"),
    ],
    payments: [],
  },
];

/* ── Channels (Section 1.1) ────────────────────────────────────────── */

export const channelsSeed: Channel[] = [
  {
    id: "mpesa-paybill", name: "M-Pesa Paybill", desc: "Lipa na M-Pesa business number", tier: "active",
    account: "880321", accountLabel: "Paybill number", month: 186400, txCount: 214, avgTicket: 871,
    success: 96.4, failure: 3.6, failReason: "Callback URL not configured",
    spark: [18, 24, 21, 27, 31, 25, 33], fee: "You keep KES 995 of every KES 1,000",
    warning: "Callback URL missing — 3 payments awaiting verification",
  },
  {
    id: "mpesa-till", name: "M-Pesa Till", desc: "Buy Goods — walk-in customers", tier: "active",
    account: "4105541", accountLabel: "Till number", month: 92750, txCount: 128, avgTicket: 724,
    success: 97.1, failure: 2.9,
    spark: [9, 12, 10, 15, 14, 18, 16], fee: "You keep KES 997 of every KES 1,000",
  },
  {
    id: "pesalink", name: "Bank Transfer · PesaLink", desc: "Direct to bank account", tier: "active",
    account: "KCB •••• 4491 · PSL-0091", accountLabel: "Linked account", month: 74300, txCount: 11, avgTicket: 6755,
    success: 100, failure: 0,
    spark: [4, 6, 3, 8, 7, 9, 10], fee: "Free on PesaLink (bank fees may apply)",
  },
  {
    id: "card", name: "Card Payments", desc: "Visa · Mastercard — online & POS", tier: "pending",
    account: "Awaiting acquirer documents", accountLabel: "Card acceptance", month: 0, txCount: 0, avgTicket: 0,
    success: 0, failure: 0,
    spark: [0, 0, 0, 0, 0, 0, 0], fee: "2.9% + KES 10 per transaction",
  },
  {
    id: "qr", name: "QR Code Payments", desc: "Dynamic QR — scan to pay", tier: "active",
    account: "Dynamic QR · v4", accountLabel: "QR mode", month: 48900, txCount: 63, avgTicket: 776,
    success: 96.8, failure: 3.2,
    spark: [5, 7, 6, 9, 8, 11, 12], fee: "You keep KES 995 of every KES 1,000",
    wallets: ["M-Pesa", "Airtel Money", "Equitel", "Bank apps"],
  },
  {
    id: "links", name: "Payment Links", desc: "Shareable checkout links", tier: "active",
    account: "pay.link/p/tsl · 6 active", accountLabel: "Base URL", month: 61850, txCount: 41, avgTicket: 1508,
    success: 98.2, failure: 1.8,
    spark: [6, 8, 7, 10, 12, 11, 14], fee: "You keep KES 995 of every KES 1,000",
  },
  {
    id: "ussd", name: "USSD Collection", desc: "Feature-phone customers", tier: "available",
    account: "*483*21#", accountLabel: "USSD shortcode", month: 0, txCount: 0, avgTicket: 0,
    success: 0, failure: 0,
    spark: [0, 0, 0, 0, 0, 0, 0], fee: "KES 1.50 per session (carrier rate)",
  },
];

/* ── Recurring (Section 1.4) ───────────────────────────────────────── */

export const recurringSeed: Recurring[] = [
  { id: "r1", customerId: "c6", amount: 12500, freq: "Monthly", next: addDays(T, 5), lifetime: 412500, count: 33, status: "active", failures: 0, channel: "Email + WhatsApp", onTime: 96, start: addDays(T, -990) },
  { id: "r2", customerId: "c1", amount: 45000, freq: "Monthly", next: addDays(T, 12), lifetime: 1305000, count: 29, status: "active", failures: 0, channel: "Email", onTime: 93, start: addDays(T, -870) },
  { id: "r3", customerId: "c7", amount: 18000, freq: "Monthly", next: addDays(T, 4), lifetime: 396000, count: 22, status: "paused", failures: 2, channel: "WhatsApp", onTime: 78, start: addDays(T, -660) },
  { id: "r4", customerId: "c9", amount: 85000, freq: "Quarterly", next: addDays(T, 41), lifetime: 680000, count: 8, status: "active", failures: 0, channel: "Email + WhatsApp", onTime: 100, start: addDays(T, -960) },
  { id: "r5", customerId: "c5", amount: 7500, freq: "Monthly", next: addDays(T, 8), lifetime: 187500, count: 25, status: "active", failures: 1, channel: "SMS", onTime: 88, start: addDays(T, -750) },
];

/* ── Aging (Section 1.5) ───────────────────────────────────────────── */

export const agingSeed: AgingRow[] = [
  { customerId: "c4", b30: 45000, b60: 0, b90: 0, b90p: 62000 },
  { customerId: "c8", b30: 0, b60: 49500, b90: 31000, b90p: 0 },
  { customerId: "c7", b30: 0, b60: 44000, b90: 0, b90p: 0 },
  { customerId: "c2", b30: 6500, b60: 12000, b90: 0, b90p: 0 },
  { customerId: "c9", b30: 15000, b60: 0, b90: 0, b90p: 0 },
  { customerId: "c1", b30: 50000, b60: 0, b90: 0, b90p: 0 },
  { customerId: "c6", b30: 12500, b60: 0, b90: 0, b90p: 0 },
];

/* ── M-Pesa transactions (Section 1.6) ─────────────────────────────── */

const hh = (h: number, m: number) => `${T}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

export const txsSeed: Tx[] = [
  { id: "tx1", ref: "SLK9X2QR3H", phone: "0722 664 118", name: "James Kimani", amount: 12500, t: hh(8, 42), channel: "M-Pesa Paybill", status: "suggested", invoice: "inv-0141", confidence: 92 },
  { id: "tx2", ref: "SLK2BB8KJ1", phone: "0733 221 006", name: "Brian Otieno", amount: 24000, t: hh(9, 5), channel: "M-Pesa Paybill", status: "matched", invoice: "inv-0137" },
  { id: "tx3", ref: "TLL8PW33XK", phone: "0798 110 227", name: "Esther Muthoni", amount: 22750, t: hh(9, 31), channel: "M-Pesa Till", status: "matched", invoice: "inv-0134" },
  { id: "tx4", ref: "SLK7TT91QP", phone: "0740 118 923", name: "Samuel Mwangi", amount: 96400, t: hh(10, 12), channel: "M-Pesa Paybill", status: "matched", invoice: "inv-0129" },
  { id: "tx5", ref: "SLK3XQ2RH9", phone: "0721 908 334", name: "Grace Chebet", amount: 84500, t: hh(10, 47), channel: "M-Pesa Paybill", status: "matched", invoice: "inv-0136" },
  { id: "tx6", ref: "QR8NKA22PL", phone: "0712 445 890", name: "Amina Wanjiru", amount: 50000, t: hh(11, 20), channel: "QR Code", status: "suggested", invoice: "inv-0135", confidence: 88, bal: 50000 },
  { id: "tx7", ref: "SLK1KD90QX", phone: "0700 512 487", amount: 7200, t: hh(12, 3), channel: "M-Pesa Paybill", status: "unmatched" },
  { id: "tx8", ref: "PSL009123", phone: "0722 664 118", name: "James Kimani", amount: 45000, t: hh(12, 44), channel: "PesaLink", status: "matched", invoice: "inv-0133" },
  { id: "tx9", ref: "SLK5QQ77ZT", phone: "0701 552 209", name: "Fatuma Ali", amount: 15000, t: hh(13, 15), channel: "M-Pesa Paybill", status: "unmatched" },
  { id: "tx10", ref: "QR9LSD43MN", phone: "0740 118 923", name: "Samuel Mwangi", amount: 27500, t: hh(14, 2), channel: "QR Code", status: "suggested", invoice: "inv-0143", confidence: 74 },
  { id: "tx11", ref: "SLK8VV02AX", phone: "0791 300 482", amount: 4300, t: hh(15, 26), channel: "M-Pesa Till", status: "unmatched" },
  { id: "tx12", ref: "CHRG-88412", phone: "—", name: "Fatuma Ali", amount: 61200, t: hh(16, 9), channel: "Card (Visa)", status: "matched", invoice: "inv-0131" },
  { id: "tx13", ref: "SLK3NN55FQ", phone: "0733 221 006", name: "Brian Otieno", amount: 10000, t: hh(16, 48), channel: "M-Pesa Paybill", status: "partial", invoice: "inv-0137", bal: 18000 },
  { id: "tx14", ref: "QR4PLK08HB", phone: "0701 552 209", amount: 1250, t: hh(17, 22), channel: "QR Code", status: "unmatched" },
];

/* ── Payment links (Section 1.7) ───────────────────────────────────── */

export const linksSeed: PayLink[] = [
  { id: "l1", title: "April retainer — Akili Studio", amount: 45000, expires: addDays(T, 21), views: 34, pays: 3, collected: 135000, status: "active", spark: [3, 5, 4, 7, 6, 8, 9] },
  { id: "l2", title: "Event deposit — Achieng Events", amount: 22000, expires: addDays(T, 9), views: 18, pays: 1, collected: 22000, status: "active", spark: [1, 2, 2, 4, 3, 5, 4] },
  { id: "l3", title: "Website milestone 2 — B.O Digital", amount: 75000, expires: addDays(T, 30), views: 52, pays: 2, collected: 150000, status: "active", spark: [4, 6, 5, 8, 7, 9, 11] },
  { id: "l4", title: "Promo kit — January", amount: 8500, expires: addDays(T, -14), views: 27, pays: 4, collected: 34000, status: "expired", spark: [2, 3, 3, 5, 4, 3, 2] },
];

/* ── Disputes & refunds (Section 1.8) ──────────────────────────────── */

export interface Dispute {
  id: string;
  customerId: string;
  amount: number;
  channel: string;
  reason: string;
  opened: string;
  status: "open" | "review" | "resolved" | "refunded";
}

export const disputesSeed: Dispute[] = [
  { id: "D-201", customerId: "c9", amount: 15000, channel: "Card (Visa)", reason: "Duplicate charge on card", opened: addDays(T, -2), status: "open" },
  { id: "D-198", customerId: "c4", amount: 62000, channel: "M-Pesa Paybill", reason: "Services not delivered as described", opened: addDays(T, -11), status: "review" },
  { id: "D-195", customerId: "c2", amount: 8000, channel: "Card (Mastercard)", reason: "Fraudulent charge — card stolen", opened: addDays(T, -24), status: "resolved" },
];

/* ── Notifications ─────────────────────────────────────────────────── */

export interface Notification {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const notificationsSeed: Notification[] = [
  { id: "n1", tone: "warning", title: "M-Pesa callback failed twice", body: "Paybill 880321 received 3 payments but verification is stuck. Fix the callback URL.", time: "9 min ago", read: false },
  { id: "n2", tone: "danger", title: "INV-0139 overdue 3 days", body: "Lucy Achieng owes KES 44,000. A reminder was sent this morning.", time: "31 min ago", read: false },
  { id: "n3", tone: "success", title: "3 payments auto-matched", body: "KES 182,700 matched to invoices overnight with 94% confidence.", time: "2 h ago", read: true },
  { id: "n4", tone: "warning", title: "Price change affects 23 subscriptions", body: "Updating the monthly maintenance rate will notify 23 active subscribers on their next invoice.", time: "5 h ago", read: false },
  { id: "n5", tone: "success", title: "STK push settled — KES 8,400", body: "Payment from Akili Studio settled via M-Pesa STK push.", time: "7 h ago", read: true },
  { id: "n6", tone: "info", title: "eTIMS queue: 14 invoices", body: "Invoices ready for KRA eTIMS submission. Auto-submission is ON.", time: "Yesterday", read: true },
];

/* ── Portfolio entities (business switcher) ────────────────────────── */

export const entities = [
  { id: "tsl", name: "TechSol Ltd", type: "Limited Company", cash: "KES 2,410,300", health: "green" as const, desc: "Software & IT services" },
  { id: "tsr", name: "TS Retail", type: "Limited Company", cash: "KES 486,900", health: "amber" as const, desc: "Electronics store" },
  { id: "kh1", name: "Kilimani House 1", type: "Rental Property", cash: "KES 312,400", health: "green" as const, desc: "4 units · rental income" },
  { id: "kh2", name: "Kilimani House 2", type: "Rental Property", cash: "KES 98,150", health: "amber" as const, desc: "6 units · rental income" },
  { id: "pch", name: "Personal Car Hire", type: "Sole Proprietorship", cash: "KES 64,800", health: "red" as const, desc: "2 vehicles" },
];

/* ── Sidebar modules (no dead ends — every item does something) ────── */

export const modules = [
  { id: "customers", zone: "💰 Money In", name: "Customers & CRM", desc: "Customer directory, communication log and receivables profiles.", features: ["Full CRM directory with KRA PINs", "WhatsApp / SMS / Email from one log", "Receivables profiles per customer"] },
  { id: "products", zone: "📦 Your Business", name: "Products & Store", desc: "Product catalog that feeds invoices and the online storefront.", features: ["Catalog with prices & tax rates", "Online storefront checkout", "Stock-linked product cards"] },
  { id: "suppliers", zone: "💸 Money Out", name: "Pay Suppliers", desc: "Bills, purchase orders, supplier payments and approvals.", features: ["Purchase orders with approvals", "Supplier bill payments via M-Pesa/PesaLink", "W-8 / KRA withholding preview"] },
  { id: "payroll", zone: "💸 Money Out", name: "Payroll", desc: "Monthly payroll runs with PAYE, NSSF and SHIF auto-filing.", features: ["One-click payroll runs", "KRA P10, NSSF & SHIF auto-file", "Dual approval above KES 500K"] },
  { id: "cash", zone: "🏦 Your Money", name: "Cash & Accounts", desc: "Virtual accounts, bank balances and inter-account transfers.", features: ["Virtual accounts per revenue stream", "Bank feed reconciliation", "Inter-company transfers"] },
  { id: "funding", zone: "🏦 Your Money", name: "Funding & Credit", desc: "Working capital, overdrafts and lender readiness.", features: ["Pre-approved overdraft limits", "Invoice factoring offers", "Lender-ready statements"] },
  { id: "taxes", zone: "📦 Your Business", name: "Bookkeeping & Taxes", desc: "eTIMS, iTax, VAT and statutory compliance in one place.", features: ["eTIMS invoice submission", "VAT 16% auto-calc & filing", "KRA compliance calendar"] },
  { id: "inventory", zone: "📦 Your Business", name: "Inventory & Stock", desc: "Stock levels, reorder points and valuations.", features: ["Live stock counts", "Low-stock reorder alerts", "FIFO valuation reports"] },
  { id: "insurance", zone: "🚀 Grow", name: "Insurance & Protection", desc: "Cover for your business, staff and rent income.", features: ["WIBA staff cover", "Rent default insurance", "Equipment & stock cover"] },
  { id: "marketing", zone: "🚀 Grow", name: "Marketing & Growth", desc: "Campaigns, referral links and social inbox.", features: ["Campaign manager", "Referral link tracking", "Social inbox (IG/FB orders)"] },
  { id: "integrations", zone: "🚀 Grow", name: "Apps & Integrations", desc: "Connect QuickBooks, Xero, Zapier, Instagram and more.", features: ["QuickBooks / Xero sync", "Webhooks & API docs", "Integration health monitor"] },
  { id: "settings", zone: "⚙️ Run", name: "Settings & Security", desc: "Business profile, team roles, two-factor auth.", features: ["Team roles & permissions", "2FA & device sessions", "Business profile & KRA details"] },
];

/* ── Reminder templates ────────────────────────────────────────────── */

export const reminderTemplates = [
  { id: "friendly", label: "Friendly reminder", tone: "info", body: "Hi {name}, friendly reminder that invoice {inv} for {amount} is due {due}. Pay via M-Pesa Paybill 880321, account {inv}. Asante sana!" },
  { id: "formal", label: "Formal notice", tone: "warning", body: "Dear {name}, invoice {inv} ({amount}) is now overdue. Kindly settle the outstanding balance within 7 days. Paybill 880321, account {inv}." },
  { id: "final", label: "Final demand before action", tone: "danger", body: "FINAL NOTICE: Invoice {inv} ({amount}) remains unpaid {days} days past due. Unless settled in 5 days, this account will be referred to collections. Pay now via Paybill 880321, account {inv}." },
];

export const dunningSeed = [
  { day: 1, channel: "SMS", message: "Gentle reminder: invoice {inv} is due today.", on: true },
  { day: 3, channel: "WhatsApp", message: "Hi {name}, invoice {inv} is 3 days overdue.", on: true },
  { day: 7, channel: "Email", message: "Overdue notice + late fee KES 500 applies from day 7.", on: true },
  { day: 14, channel: "SMS", message: "Final reminder before account pause flag.", on: true },
];

/* ── AI suggestions (Section 1.5) ──────────────────────────────────── */

export const aiSuggestionsSeed = [
  { id: "s1", customerId: "c9", invoice: "INV-0140", amount: 15000, due: addDays(T, -1), reason: "Pays within 3 days of first reminder", channel: "SMS", odds: 87 },
  { id: "s2", customerId: "c8", invoice: "INV-0138", amount: 49500, due: addDays(T, -17), reason: "Responds to WhatsApp within hours", channel: "WhatsApp", odds: 74 },
  { id: "s3", customerId: "c2", invoice: "INV-0137", amount: 18000, due: addDays(T, 22), reason: "Has paid 60% of this invoice already", channel: "Email", odds: 69 },
  { id: "s4", customerId: "c1", invoice: "INV-0135", amount: 50000, due: addDays(T, 1), reason: "On-time history 24 days avg — gentle nudge works", channel: "WhatsApp", odds: 81 },
];
