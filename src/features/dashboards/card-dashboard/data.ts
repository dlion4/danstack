/* ============================================================
   PayMo BAAS — Card Command Center (5.1) · data & types
   ============================================================ */

export type CardStatus = "active" | "frozen" | "blocked" | "delivering";
export type CardKind = "physical" | "virtual";
export type CardTier = "standard" | "premium" | "credit" | "single-use" | "prepaid" | "corporate";

export interface CardChannels {
  online: boolean;
  contactless: boolean;
  atm: boolean;
  intl: boolean;
}

export interface PmCard {
  id: string;
  nickname: string;
  holder: string;
  tier: CardTier;
  kind: CardKind;
  network: "VISA" | "Mastercard";
  last4: string;
  panMask: string;
  expiry: string;
  status: CardStatus;
  issuedOn: string;
  spentMonth: number;
  limitMonth: number;
  limitPerTxn: number;
  channels: CardChannels;
  gradient: string;
  tag?: string;
  purpose?: string;
  merchantLock?: string;
  singleUse?: boolean;
  requires3ds?: boolean;
}

export type TxnStatus = "Cleared" | "Pending" | "Declined" | "Disputed";
export type TxnChannel = "POS" | "Online" | "ATM" | "Wallet";

export interface Txn {
  id: string;
  cardId: string;
  date: string;
  time: string;
  merchant: string;
  category: string;
  amount: number;
  status: TxnStatus;
  channel: TxnChannel;
  intl: boolean;
  flagged?: boolean;
}

export interface AlertPrefs {
  scope: "all" | string; // "all" or cardId
  allTxns: boolean;
  largeEnabled: boolean;
  threshold: number;
  international: boolean;
  declined: boolean;
  cnp: boolean;
  push: boolean;
  sms: boolean;
  email: boolean;
}

export interface Notif {
  id: string;
  channel: "push" | "sms" | "email" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

/* ---------------- formatters ---------------- */

export const kes = (n: number) => "KES " + n.toLocaleString("en-KE");
export const kesShort = (n: number) =>
  n >= 1_000_000 ? `KES ${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `KES ${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : kes(n);

/* ---------------- module map (BAAS Cards 5.1 – 5.10) ---------------- */

export interface Module {
  id: string;
  name: string;
  anchor: string;
  hint: string;
  filter?: string;
  icon?: string;
}

export const MODULES: Module[] = [
  { id: "5.1", name: "Card Command Center", anchor: "overview", hint: "Portfolio pulse, alerts & controls", icon: "sliders" },
  { id: "5.2", name: "Physical Debit Cards", anchor: "overview", hint: "Issuance, tiers & delivery", icon: "card" },
  { id: "5.3", name: "Virtual Debit Center", anchor: "overview", hint: "Single & multi-use virtual debit", icon: "zap" },
  { id: "5.4", name: "Virtual Credit Center", anchor: "overview", hint: "Credit lines & merchant locks", icon: "wallet" },
  { id: "5.5", name: "Prepaid Cards", anchor: "overview", hint: "Top-ups, funding & MCC locks", icon: "key" },
  { id: "5.6", name: "Corporate Programs", anchor: "overview", hint: "Liability, billing & settlement", icon: "building" },
  { id: "5.7", name: "Security & Fraud", anchor: "overview", hint: "Blocks, disputes & recovery", icon: "shield" },
  { id: "5.8", name: "Analytics & Reporting", anchor: "overview", hint: "Spend mix, corridors & insights", icon: "chart" },
  { id: "5.9", name: "Program Administration", anchor: "overview", hint: "Gateway & ledger health", icon: "gauge" },
  { id: "5.10", name: "Settings & Support", anchor: "overview", hint: "Defaults, currency & help", icon: "headset" },
];

/* ---------------- seed: cards ---------------- */

export const SEED_CARDS: PmCard[] = [
  {
    id: "c1",
    nickname: "Founder Card",
    holder: "DAVID OCHIENG",
    tier: "premium",
    kind: "physical",
    network: "Mastercard",
    last4: "8821",
    panMask: "5399 82•• •••• 8821",
    expiry: "09/28",
    status: "active",
    issuedOn: "12 Mar 2025",
    spentMonth: 46500,
    limitMonth: 200000,
    limitPerTxn: 80000,
    channels: { online: true, contactless: true, atm: true, intl: true },
    gradient: "linear-gradient(118deg,#0b1322 0%,#123a2c 55%,#0d5c38 100%)",
  },
  {
    id: "c2",
    nickname: "Everyday Debit",
    holder: "GRACE KAMAU",
    tier: "standard",
    kind: "physical",
    network: "VISA",
    last4: "4102",
    panMask: "4539 11•• •••• 4102",
    expiry: "04/27",
    status: "active",
    issuedOn: "02 Jan 2025",
    spentMonth: 12850,
    limitMonth: 50000,
    limitPerTxn: 20000,
    channels: { online: true, contactless: true, atm: true, intl: false },
    gradient: "linear-gradient(118deg,#1d2939 0%,#344054 60%,#475467 100%)",
  },
  {
    id: "c3",
    nickname: "Marketing Ads",
    holder: "JAMES KAMAU",
    tier: "credit",
    kind: "virtual",
    network: "VISA",
    last4: "3094",
    panMask: "4123 55•• •••• 3094",
    expiry: "06/28",
    status: "active",
    issuedOn: "18 May 2025",
    spentMonth: 23400,
    limitMonth: 40000,
    limitPerTxn: 15000,
    channels: { online: true, contactless: false, atm: false, intl: true },
    gradient: "linear-gradient(118deg,#3b2aa8 0%,#5925dc 55%,#7a5af8 100%)",
  },
  {
    id: "c4",
    nickname: "AWS / Subscriptions",
    holder: "MARY WANJIKU",
    tier: "single-use",
    kind: "virtual",
    network: "Mastercard",
    last4: "7710",
    panMask: "5210 44•• •••• 7710",
    expiry: "11/27",
    status: "active",
    issuedOn: "30 Jun 2025",
    spentMonth: 4600,
    limitMonth: 10000,
    limitPerTxn: 5000,
    channels: { online: true, contactless: false, atm: false, intl: true },
    gradient: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)",
    purpose: "Cloud subscriptions",
    merchantLock: "AWS EMEA",
    requires3ds: true,
  },
  {
    id: "c5",
    nickname: "Petty Cash Prepaid",
    holder: "OPS TEAM",
    tier: "prepaid",
    kind: "virtual",
    network: "VISA",
    last4: "5566",
    panMask: "4800 20•• •••• 5566",
    expiry: "02/27",
    status: "frozen",
    issuedOn: "14 Apr 2025",
    spentMonth: 1250,
    limitMonth: 15000,
    limitPerTxn: 5000,
    channels: { online: true, contactless: false, atm: true, intl: false },
    gradient: "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)",
  },
  {
    id: "c6",
    nickname: "Fleet Fuel Card",
    holder: "FLEET DEPT",
    tier: "corporate",
    kind: "physical",
    network: "Mastercard",
    last4: "9921",
    panMask: "5401 33•• •••• 9921",
    expiry: "08/27",
    status: "active",
    issuedOn: "21 Feb 2025",
    spentMonth: 182000,
    limitMonth: 250000,
    limitPerTxn: 60000,
    channels: { online: false, contactless: true, atm: false, intl: false },
    gradient: "linear-gradient(118deg,#101828 0%,#1d2939 55%,#0b8f52 130%)",
  },
  {
    id: "c7",
    nickname: "Sales Team Card",
    holder: "PETER MUTUA",
    tier: "standard",
    kind: "physical",
    network: "VISA",
    last4: "2214",
    panMask: "4539 90•• •••• 2214",
    expiry: "07/28",
    status: "delivering",
    issuedOn: "24 Jun 2025",
    spentMonth: 0,
    limitMonth: 60000,
    limitPerTxn: 20000,
    channels: { online: true, contactless: true, atm: true, intl: false },
    gradient: "linear-gradient(118deg,#1d2939 0%,#344054 60%,#475467 100%)",
    tag: "In delivery",
  },
  {
    id: "c8",
    nickname: "Supplier Purchases",
    holder: "ACME TRADERS LTD",
    tier: "standard",
    kind: "virtual",
    network: "VISA",
    last4: "6630",
    panMask: "4539 71•• •••• 6630",
    expiry: "10/28",
    status: "active",
    issuedOn: "04 Jun 2025",
    spentMonth: 18750,
    limitMonth: 75000,
    limitPerTxn: 30000,
    channels: { online: true, contactless: false, atm: false, intl: false },
    gradient: "linear-gradient(118deg,#0b1322 0%,#1d2939 54%,#344054 100%)",
    purpose: "Supplier payments",
    merchantLock: "Open merchants",
    requires3ds: true,
  },
  {
    id: "c9",
    nickname: "Campaign Flight",
    holder: "ACME TRADERS LTD",
    tier: "single-use",
    kind: "virtual",
    network: "Mastercard",
    last4: "1846",
    panMask: "5210 77•• •••• 1846",
    expiry: "07/26",
    status: "active",
    issuedOn: "27 Jun 2025",
    spentMonth: 0,
    limitMonth: 25000,
    limitPerTxn: 25000,
    channels: { online: true, contactless: false, atm: false, intl: true },
    gradient: "linear-gradient(118deg,#5b21b6 0%,#7a5af8 58%,#9b8afb 100%)",
    purpose: "One-time campaign purchase",
    merchantLock: "Meta Platforms",
    singleUse: true,
    requires3ds: true,
    tag: "Single-use",
  },
  {
    id: "c10",
    nickname: "Streaming & SaaS",
    holder: "GRACE KAMAU",
    tier: "credit",
    kind: "virtual",
    network: "Mastercard",
    last4: "5512",
    panMask: "5210 19•• •••• 5512",
    expiry: "03/28",
    status: "active",
    issuedOn: "09 Feb 2026",
    spentMonth: 4200,
    limitMonth: 15000,
    limitPerTxn: 5000,
    channels: { online: true, contactless: false, atm: false, intl: true },
    gradient: "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)",
    purpose: "Subscription Card",
    merchantLock: "Netflix",
    requires3ds: true,
    tag: "Merchant-locked",
  },
  {
    id: "c11",
    nickname: "Cloud Infra Reserve",
    holder: "ACME TRADERS LTD",
    tier: "credit",
    kind: "virtual",
    network: "VISA",
    last4: "7740",
    panMask: "4123 66•• •••• 7740",
    expiry: "12/28",
    status: "frozen",
    issuedOn: "17 Apr 2026",
    spentMonth: 0,
    limitMonth: 120000,
    limitPerTxn: 60000,
    channels: { online: true, contactless: false, atm: false, intl: true },
    gradient: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)",
    purpose: "Multi-Use Card",
    merchantLock: "Open merchants",
    requires3ds: true,
  },
];

/* ---------------- seed: transactions ---------------- */

export const SEED_TXNS: Txn[] = [
  { id: "t1", cardId: "c3", date: "27 Jun 2026", time: "14:22", merchant: "Facebook Ads", category: "Marketing", amount: 12400, status: "Cleared", channel: "Online", intl: true },
  { id: "t2", cardId: "c1", date: "27 Jun 2026", time: "11:05", merchant: "Naivas Supermarket", category: "Groceries", amount: 8420, status: "Cleared", channel: "POS", intl: false },
  { id: "t3", cardId: "c6", date: "26 Jun 2026", time: "17:48", merchant: "Shell / Vivo Energy", category: "Fuel", amount: 14500, status: "Cleared", channel: "POS", intl: false },
  { id: "t4", cardId: "c4", date: "26 Jun 2026", time: "09:31", merchant: "AWS EMEA", category: "Software Subs", amount: 2400, status: "Cleared", channel: "Online", intl: true },
  { id: "t5", cardId: "c2", date: "25 Jun 2026", time: "19:12", merchant: "Uber *Trip", category: "Transport", amount: 850, status: "Pending", channel: "Wallet", intl: false },
  { id: "t6", cardId: "c1", date: "25 Jun 2026", time: "13:40", merchant: "AliExpress (CN)", category: "E-commerce", amount: 12500, status: "Cleared", channel: "Online", intl: true, flagged: true },
  { id: "t7", cardId: "c3", date: "25 Jun 2026", time: "08:15", merchant: "Google Workspace", category: "Software Subs", amount: 2100, status: "Cleared", channel: "Online", intl: true },
  { id: "t8", cardId: "c2", date: "24 Jun 2026", time: "16:02", merchant: "Quickmart", category: "Groceries", amount: 3260, status: "Cleared", channel: "POS", intl: false },
  { id: "t9", cardId: "c4", date: "24 Jun 2026", time: "12:47", merchant: "LinkedIn Ads", category: "Marketing", amount: 3000, status: "Declined", channel: "Online", intl: true },
  { id: "t10", cardId: "c1", date: "23 Jun 2026", time: "20:33", merchant: "Kenya Airways", category: "Travel", amount: 38900, status: "Cleared", channel: "Online", intl: false },
  { id: "t11", cardId: "c6", date: "23 Jun 2026", time: "10:20", merchant: "Total Energies", category: "Fuel", amount: 11200, status: "Cleared", channel: "POS", intl: false },
  { id: "t12", cardId: "c3", date: "22 Jun 2026", time: "15:55", merchant: "Netflix", category: "Software Subs", amount: 1200, status: "Cleared", channel: "Online", intl: true },
  { id: "t13", cardId: "c2", date: "22 Jun 2026", time: "09:08", merchant: "Safaricom PLC", category: "Telco / Utility", amount: 5500, status: "Cleared", channel: "Online", intl: false },
  { id: "t14", cardId: "c1", date: "21 Jun 2026", time: "18:26", merchant: "Jumia Kenya", category: "E-commerce", amount: 8200, status: "Cleared", channel: "Online", intl: false, flagged: true },
  { id: "t15", cardId: "c5", date: "20 Jun 2026", time: "11:44", merchant: "Carrefour", category: "Groceries", amount: 1250, status: "Cleared", channel: "POS", intl: false },
  { id: "t16", cardId: "c1", date: "20 Jun 2026", time: "08:03", merchant: "KCB ATM — Westlands", category: "Cash Access", amount: 10000, status: "Cleared", channel: "ATM", intl: false },
  { id: "t17", cardId: "c8", date: "26 Jun 2026", time: "16:44", merchant: "Alibaba.com", category: "Supplier Purchase", amount: 18750, status: "Cleared", channel: "Online", intl: false },
  { id: "t18", cardId: "c4", date: "24 Jun 2026", time: "06:20", merchant: "AWS EMEA", category: "Cloud Infrastructure", amount: 4600, status: "Cleared", channel: "Online", intl: true },
  { id: "t19", cardId: "c9", date: "27 Jun 2026", time: "09:18", merchant: "Meta Platforms", category: "Marketing", amount: 25000, status: "Pending", channel: "Online", intl: true },
];

/* ---------------- seed: alerts & notifications ---------------- */

export const SEED_ALERTS: AlertPrefs = {
  scope: "all",
  allTxns: false,
  largeEnabled: true,
  threshold: 25000,
  international: true,
  declined: true,
  cnp: true,
  push: true,
  sms: true,
  email: false,
};

export const SEED_NOTIFS: Notif[] = [
  { id: "n1", channel: "push", title: "Large transaction cleared", body: "Kenya Airways — KES 38,900 on Founder Card •• 8821. Above your KES 25,000 threshold.", time: "23 Jun, 20:33", read: false },
  { id: "n2", channel: "sms", title: "International purchase", body: "AliExpress (CN) — KES 12,500 on Founder Card •• 8821. Reply F to freeze this card.", time: "25 Jun, 13:40", read: false },
  { id: "n3", channel: "push", title: "Transaction declined", body: "LinkedIn Ads — KES 3,000 declined on AWS / Subscriptions •• 7710 (per-transaction limit).", time: "24 Jun, 12:47", read: false },
  { id: "n4", channel: "system", title: "Fraud watch elevated", body: "CNP attempts in Eastern Europe elevated 400% across the portfolio in the last 6 hours.", time: "Today, 06:12", read: false },
  { id: "n5", channel: "email", title: "Weekly card digest", body: "Your card programme summary for the week of 16–22 Jun is ready.", time: "Mon, 07:00", read: true },
];

/* ---------------- analytics ---------------- */

export const SPEND_CATEGORIES = [
  { name: "Supermarkets & Grocery", amount: 98400, pct: 22, color: "#12b76a" },
  { name: "Dining & Restaurants", amount: 71500, pct: 18, color: "#0e9f6e" },
  { name: "Fuel & Auto", amount: 56200, pct: 14, color: "#f79009" },
  { name: "Travel & Airlines", amount: 42000, pct: 10, color: "#2e90fa" },
  { name: "Digital Subscriptions", amount: 31400, pct: 7, color: "#7a5af8" },
  { name: "Healthcare", amount: 22800, pct: 5, color: "#f04438" },
  { name: "Everything else", amount: 101700, pct: 24, color: "#98a2b3" },
];

export const CHANNEL_MIX = [
  { name: "POS terminals", pct: 45, color: "#12b76a", note: "Physical retail" },
  { name: "Online / e-commerce", pct: 35, color: "#7a5af8", note: "Card-not-present" },
  { name: "ATM withdrawals", pct: 15, color: "#f79009", note: "Cash access" },
  { name: "Mobile wallets", pct: 5, color: "#2e90fa", note: "Apple / Google Pay" },
];

export const INTL_CORRIDORS = [
  { country: "United States (USD)", pct: 50, vol: "KES 72M" },
  { country: "United Kingdom (GBP)", pct: 20, vol: "KES 28M" },
  { country: "European Union (EUR)", pct: 15, vol: "KES 21M" },
  { country: "UAE (AED)", pct: 7, vol: "KES 10M" },
  { country: "Others", pct: 8, vol: "KES 13M" },
];

export const HEALTH_SYSTEMS = [
  { name: "Visa Gateway", status: "Operational", detail: "100% uptime · 30d", dot: "green" as const },
  { name: "Mastercard Gateway", status: "Operational", detail: "100% uptime · 30d", dot: "green" as const },
  { name: "Core Ledger Sync", status: "Syncing", detail: "4ms lag · realtime", dot: "green" as const },
  { name: "KYC / AML Oracle", status: "Degraded", detail: "1.2s delay on checks", dot: "amber" as const },
  { name: "Settlement Accounts", status: "Funded", detail: "Next sweep 17:00 EAT", dot: "green" as const },
];

export const TIER_META: Record<CardTier, { label: string; fee: number; blurb: string }> = {
  standard: { label: "Standard Debit", fee: 0, blurb: "Free issuance · linked to Biz Wallet" },
  premium: { label: "Premium Travel", fee: 1000, blurb: "Lounge access · best FX rates" },
  credit: { label: "Virtual Credit", fee: 0, blurb: "Revolving line · merchant-locked" },
  "single-use": { label: "Virtual Debit", fee: 0, blurb: "Multi-use online · instant issue" },
  prepaid: { label: "Prepaid Load", fee: 150, blurb: "Top-up based · MCC lockable" },
  corporate: { label: "Corporate Expense", fee: 500, blurb: "Department budgets · policy controls" },
};

export const DISPUTE_REASONS = [
  "Fraudulent / unauthorised charge",
  "Duplicate charge",
  "Amount differs from receipt",
  "Goods / services not received",
  "Cancelled subscription still billed",
  "Other",
];

/* ============================================================
   PayMo BAAS — Physical Debit Card Management (5.2) · data
   ============================================================ */

export type PhysTier = "standard" | "premium" | "biz";
export type DeliveryMethod = "courier-metro" | "courier-regional" | "branch-pickup" | "express";
export type OrderStatus = "processing" | "dispatched" | "in-transit" | "delivered" | "activated" | "failed";

export interface PhysTierInfo {
  id: PhysTier;
  name: string;
  subtitle: string;
  issuanceFee: number;
  monthlyFee: number;
  deliveryFee: number;
  gradient: string;
  network: "VISA" | "Mastercard";
  features: string[];
  limits: { monthly: number; perTxn: number; dailyAtm: number };
  fxRate: string;
  loungeAccess: boolean;
  insurance: string;
}

export const PHYS_TIERS: PhysTierInfo[] = [
  {
    id: "standard",
    name: "PayMo Standard Debit",
    subtitle: "Free issuance · linked to Biz Wallet",
    issuanceFee: 0,
    monthlyFee: 0,
    deliveryFee: 300,
    gradient: "linear-gradient(118deg,#1d2939 0%,#344054 60%,#475467 100%)",
    network: "VISA",
    features: [
      "Contactless (NFC) payments",
      "Online / e-commerce enabled",
      "ATM withdrawals (local)",
      "M-Pesa to card top-up",
      "Real-time spend alerts",
      "Freeze / unfreeze from app",
    ],
    limits: { monthly: 200000, perTxn: 80000, dailyAtm: 40000 },
    fxRate: "Network rate + 3.5%",
    loungeAccess: false,
    insurance: "None",
  },
  {
    id: "premium",
    name: "PayMo Premium Travel",
    subtitle: "Lounge access · best FX rates · travel insurance",
    issuanceFee: 1000,
    monthlyFee: 0,
    deliveryFee: 300,
    gradient: "linear-gradient(118deg,#0b1322 0%,#123a2c 55%,#0d5c38 100%)",
    network: "Mastercard",
    features: [
      "All Standard features, plus:",
      "Airport lounge access (2×/quarter)",
      "FX at network rate + 0.5%",
      "Travel insurance (KES 5M cover)",
      "Concierge service 24/7",
      "Priority pass replacement",
      "Auto upgrade to Business Class offers",
    ],
    limits: { monthly: 500000, perTxn: 200000, dailyAtm: 100000 },
    fxRate: "Network rate + 0.5%",
    loungeAccess: true,
    insurance: "Travel · KES 5M cover",
  },
  {
    id: "biz",
    name: "PayMo BizSME Business",
    subtitle: "Linked to Biz Wallet · expense controls",
    issuanceFee: 500,
    monthlyFee: 150,
    deliveryFee: 0,
    gradient: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)",
    network: "VISA",
    features: [
      "All Standard features, plus:",
      "Multi-card issuance (team)",
      "Per-card spending limits",
      "MCC category blocking",
      "Receipt capture & coding",
      "Auto-export to accounting",
      "Approval workflows",
    ],
    limits: { monthly: 1000000, perTxn: 300000, dailyAtm: 200000 },
    fxRate: "Network rate + 1.5%",
    loungeAccess: false,
    insurance: "Purchase protection · 90 days",
  },
];

export interface DeliveryAddress {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  county: string;
  phone: string;
  isDefault: boolean;
}

export const SEED_ADDRESSES: DeliveryAddress[] = [
  { id: "a1", label: "Office — Westlands", line1: "Senteu Plaza, 5th Floor", line2: "Muthangari Drive, Westlands", city: "Nairobi", county: "Nairobi City", phone: "+254 709 900 213", isDefault: true },
  { id: "a2", label: "Warehouse — Industrial Area", line1: "Godown No. 14", line2: "Enterprise Road, Industrial Area", city: "Nairobi", county: "Nairobi City", phone: "+254 709 900 214", isDefault: false },
  { id: "a3", label: "Branch — Mombasa Road", line1: "PayMo Branch, Msa Rd", line2: "Next to Caltex Petrol Station", city: "Nairobi", county: "Nairobi City", phone: "+254 709 900 215", isDefault: false },
];

export const DELIVERY_OPTIONS: { id: DeliveryMethod; label: string; cost: number; eta: string; blurb: string }[] = [
  { id: "courier-metro", label: "Courier — Nairobi Metro", cost: 300, eta: "2 working days", blurb: "Fargo Courier · OTP on delivery" },
  { id: "courier-regional", label: "Courier — Other Regions", cost: 500, eta: "3–5 working days", blurb: "Fargo Courier · OTP on delivery" },
  { id: "branch-pickup", label: "Branch Pickup", cost: 0, eta: "Ready in 1 day", blurb: "Collect from Westlands branch with ID" },
  { id: "express", label: "Express Same-Day", cost: 800, eta: "Same day (order by 10am)", blurb: "Priority dispatch · metro only" },
];

export interface CardOrder {
  id: string;
  tier: PhysTier;
  holderName: string;
  status: OrderStatus;
  orderedOn: string;
  trackingNo: string;
  courier: string;
  deliveryMethod: DeliveryMethod;
  addressLabel: string;
  estimatedDelivery: string;
  activationOtpSent: boolean;
}

export const SEED_ORDERS: CardOrder[] = [
  {
    id: "o1",
    tier: "premium",
    holderName: "DAVID OCHIENG",
    status: "activated",
    orderedOn: "10 Mar 2025",
    trackingNo: "FGO-25-8821",
    courier: "Fargo Courier",
    deliveryMethod: "courier-metro",
    addressLabel: "Office — Westlands",
    estimatedDelivery: "12 Mar 2025",
    activationOtpSent: true,
  },
  {
    id: "o2",
    tier: "standard",
    holderName: "GRACE KAMAU",
    status: "activated",
    orderedOn: "30 Dec 2024",
    trackingNo: "FGO-24-4102",
    courier: "Fargo Courier",
    deliveryMethod: "courier-metro",
    addressLabel: "Office — Westlands",
    estimatedDelivery: "02 Jan 2025",
    activationOtpSent: true,
  },
  {
    id: "o3",
    tier: "standard",
    holderName: "PETER MUTUA",
    status: "in-transit",
    orderedOn: "24 Jun 2025",
    trackingNo: "FGO-25-2214",
    courier: "Fargo Courier",
    deliveryMethod: "courier-metro",
    addressLabel: "Office — Westlands",
    estimatedDelivery: "27 Jun 2025",
    activationOtpSent: false,
  },
  {
    id: "o4",
    tier: "biz",
    holderName: "FLEET DEPT",
    status: "dispatched",
    orderedOn: "19 Feb 2025",
    trackingNo: "FGO-25-9921",
    courier: "Branch Pickup",
    deliveryMethod: "branch-pickup",
    addressLabel: "Branch — Mombasa Road",
    estimatedDelivery: "21 Feb 2025",
    activationOtpSent: false,
  },
];

export const FEE_SCHEDULE = [
  { item: "Standard Debit — issuance", amount: "Free", note: "First card per business" },
  { item: "Premium Travel — issuance", amount: "KES 1,000", note: "One-time" },
  { item: "BizSME Business — issuance", amount: "KES 500", note: "Per card" },
  { item: "BizSME Business — monthly", amount: "KES 150/mo", note: "Per card" },
  { item: "Courier delivery — metro", amount: "KES 300", note: "Nairobi & environs" },
  { item: "Courier delivery — regional", amount: "KES 500", note: "Outside Nairobi" },
  { item: "Express same-day", amount: "KES 800", note: "Metro only · order by 10am" },
  { item: "Branch pickup", amount: "Free", note: "With valid ID" },
  { item: "Replacement — lost/damaged", amount: "KES 500", note: "Standard & Biz" },
  { item: "Replacement — lost/damaged", amount: "KES 1,000", note: "Premium" },
  { item: "FX markup — Standard", amount: "+3.5%", note: "On network rate" },
  { item: "FX markup — Premium", amount: "+0.5%", note: "Best available rate" },
  { item: "FX markup — BizSME", amount: "+1.5%", note: "On network rate" },
  { item: "ATM withdrawal — local", amount: "KES 30", note: "Per withdrawal" },
  { item: "ATM withdrawal — international", amount: "KES 250", note: "Plus FX markup" },
  { item: "PIN re-issue", amount: "Free", note: "Via app OTP" },
];

/* ============================================================
   PayMo BAAS — Virtual Credit Card Center (5.4) · data
   ============================================================ */

export type CreditPurpose = "single-use" | "subscription" | "multi-use";
export type ColorTheme = "emerald" | "midnight" | "violet" | "ocean" | "sunset";

export interface CreditPurposeInfo {
  id: CreditPurpose;
  title: string;
  sub: string;
  icon: "zap" | "refresh" | "card";
  badge: string;
  defaultLimit: number;
  locksToMerchant: boolean;
  selfDestructs: boolean;
}

export const CREDIT_PURPOSES: CreditPurposeInfo[] = [
  {
    id: "single-use",
    title: "Single-Use Card",
    sub: "Destroys itself after one successful transaction. High security.",
    icon: "zap",
    badge: "Highest security",
    defaultLimit: 5000,
    locksToMerchant: false,
    selfDestructs: true,
  },
  {
    id: "subscription",
    title: "Subscription Card",
    sub: "Locks to the first merchant it transacts with. Great for Netflix, AWS.",
    icon: "refresh",
    badge: "Merchant-locked",
    defaultLimit: 20000,
    locksToMerchant: true,
    selfDestructs: false,
  },
  {
    id: "multi-use",
    title: "Multi-Use Card",
    sub: "Standard virtual credit card for general online spending.",
    icon: "card",
    badge: "Most flexible",
    defaultLimit: 40000,
    locksToMerchant: false,
    selfDestructs: false,
  },
];

export const COLOR_THEMES: { id: ColorTheme; label: string; gradient: string; swatch: string }[] = [
  { id: "midnight", label: "Midnight", gradient: "linear-gradient(118deg,#0b1322 0%,#1d2939 54%,#344054 100%)", swatch: "#344054" },
  { id: "emerald", label: "Emerald", gradient: "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)", swatch: "#12b76a" },
  { id: "violet", label: "Violet", gradient: "linear-gradient(118deg,#3b2aa8 0%,#5925dc 55%,#7a5af8 100%)", swatch: "#7a5af8" },
  { id: "ocean", label: "Ocean", gradient: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)", swatch: "#2e90fa" },
  { id: "sunset", label: "Sunset", gradient: "linear-gradient(118deg,#7a2e0e 0%,#d92d20 55%,#f79009 100%)", swatch: "#f79009" },
];

export const CREDIT_FUNDING_SOURCES = [
  "Biz Credit Line · KES 500,000 approved",
  "Biz Wallet · KES 1,284,000",
  "KCB Bank •• 4471 · KES 512,300",
];

export interface CreditLine {
  approved: number;
  outstanding: number;
  pendingAuth: number;
  cycleStart: string;
  cycleEnd: string;
  dueDate: string;
  minimumDue: number;
  apr: number;
  autoDebit: boolean;
}

export const SEED_CREDIT_LINE: CreditLine = {
  approved: 500000,
  outstanding: 84200,
  pendingAuth: 850,
  cycleStart: "29 May 2026",
  cycleEnd: "28 Jun 2026",
  dueDate: "21 Jul 2026",
  minimumDue: 8420,
  apr: 2.5,
  autoDebit: true,
};

export interface CreditTxn {
  id: string;
  cardId: string;
  date: string;
  merchant: string;
  memo: string;
  amount: number;
  status: "Cleared" | "Pending" | "Declined";
}

export const SEED_CREDIT_TXNS: CreditTxn[] = [
  { id: "ct1", cardId: "c3", date: "27 Jun", merchant: "Facebook Ads", memo: "Marketing Ads", amount: 12400, status: "Cleared" },
  { id: "ct2", cardId: "c3", date: "25 Jun", merchant: "Google Workspace", memo: "Software Subs", amount: 2100, status: "Cleared" },
  { id: "ct3", cardId: "c4", date: "22 Jun", merchant: "AWS EMEA", memo: "AWS Hosting", amount: 2400, status: "Cleared" },
  { id: "ct4", cardId: "c3", date: "18 Jun", merchant: "Uber *Trip", memo: "Travel Exp", amount: 850, status: "Pending" },
  { id: "ct5", cardId: "c4", date: "15 Jun", merchant: "Netflix", memo: "Software Subs", amount: 1200, status: "Cleared" },
  { id: "ct6", cardId: "c3", date: "10 Jun", merchant: "LinkedIn Ads", memo: "Marketing", amount: 3000, status: "Declined" },
  { id: "ct7", cardId: "c3", date: "08 Jun", merchant: "Canva Pro", memo: "Design Tools", amount: 1650, status: "Cleared" },
  { id: "ct8", cardId: "c4", date: "04 Jun", merchant: "Cloudflare", memo: "Infra", amount: 900, status: "Cleared" },
];

export interface Repayment {
  id: string;
  date: string;
  amount: number;
  method: string;
  ref: string;
  type: "Auto-debit" | "Manual" | "Wallet";
}

export const SEED_REPAYMENTS: Repayment[] = [
  { id: "r1", date: "21 Jun 2026", amount: 62400, method: "KCB Bank •• 4471", ref: "RBP-92411", type: "Auto-debit" },
  { id: "r2", date: "21 May 2026", amount: 48900, method: "Biz Wallet", ref: "RBP-90188", type: "Wallet" },
  { id: "r3", date: "21 Apr 2026", amount: 39150, method: "KCB Bank •• 4471", ref: "RBP-88730", type: "Auto-debit" },
];

export interface Statement {
  id: string;
  period: string;
  spend: number;
  paid: number;
  interest: number;
  status: "Paid" | "Open";
}

export const SEED_STATEMENTS: Statement[] = [
  { id: "s1", period: "29 May – 28 Jun 2026", spend: 84200, paid: 0, interest: 0, status: "Open" },
  { id: "s2", period: "29 Apr – 28 May 2026", spend: 62400, paid: 62400, interest: 0, status: "Paid" },
  { id: "s3", period: "29 Mar – 28 Apr 2026", spend: 48900, paid: 48900, interest: 610, status: "Paid" },
  { id: "s4", period: "29 Feb – 28 Mar 2026", spend: 39150, paid: 39150, interest: 0, status: "Paid" },
];

export const CREDIT_FEES = [
  { item: "Monthly service fee", amount: "KES 0", note: "Waived while line is active" },
  { item: "Interest on carried balance", amount: "2.5% p.m.", note: "Only if statement is not settled in full" },
  { item: "Cash advance", amount: "3% · min KES 500", note: "Not available on virtual credit" },
  { item: "Late payment", amount: "5% of minimum due", note: "Applies after the due date" },
  { item: "Card replacement", amount: "Free", note: "Virtual re-issue is instant" },
  { item: "FX markup", amount: "+1.5%", note: "On network rate for intl. spend" },
  { item: "Over-limit", amount: "KES 1,000", note: "Charged once per cycle" },
];

export const UTILISATION_TREND = [
  { m: "Jan", pct: 22 },
  { m: "Feb", pct: 31 },
  { m: "Mar", pct: 44 },
  { m: "Apr", pct: 38 },
  { m: "May", pct: 47 },
  { m: "Jun", pct: 17 },
];

/* ============================================================
   PayMo BAAS — Prepaid Card Management (5.5) · data
   ============================================================ */

export type PrepaidForm = "virtual" | "physical";
export type PrepaidUse = "gpr" | "gift" | "department" | "travel";

export interface MccCategory {
  id: string;
  label: string;
  icon: "wallet" | "card" | "globe" | "spark" | "building" | "users" | "clock" | "refresh";
  sample: string;
}

export const MCC_CATEGORIES: MccCategory[] = [
  { id: "any", label: "All categories (open)", icon: "globe", sample: "No merchant restriction" },
  { id: "5411", label: "Groceries & Supermarkets", icon: "wallet", sample: "Naivas, Carrefour, Quickmart" },
  { id: "5541", label: "Fuel & Auto", icon: "refresh", sample: "Shell, Total, Rubis" },
  { id: "5812", label: "Dining & Restaurants", icon: "spark", sample: "Java, Artcaffe, KFC" },
  { id: "5734", label: "Software & Digital", icon: "card", sample: "AWS, Google, Adobe" },
  { id: "4111", label: "Transport & Travel", icon: "clock", sample: "Uber, Bolt, SGR, airlines" },
  { id: "5999", label: "General Retail", icon: "building", sample: "Jumia, electronics, apparel" },
];

export interface PrepaidUseInfo {
  id: PrepaidUse;
  title: string;
  sub: string;
  icon: "wallet" | "spark" | "users" | "globe";
  defaultLoad: number;
  reloadable: boolean;
}

export const PREPAID_USES: PrepaidUseInfo[] = [
  { id: "gpr", title: "General Purpose Reloadable", sub: "Reload anytime. Everyday controlled spend.", icon: "wallet", defaultLoad: 5000, reloadable: true },
  { id: "department", title: "Department Budget", sub: "Fund a team or project; top up as needed.", icon: "users", defaultLoad: 20000, reloadable: true },
  { id: "gift", title: "Gift / One-Off Load", sub: "Load once, spend down, then retire.", icon: "spark", defaultLoad: 3000, reloadable: false },
  { id: "travel", title: "Travel Cash", sub: "Ring-fenced funds for a trip abroad.", icon: "globe", defaultLoad: 30000, reloadable: true },
];

export const PREPAID_FUNDING_SOURCES = [
  "Biz Wallet · KES 1,284,000",
  "M-Pesa Paybill 522 123 · KES 96,400",
  "KCB Bank •• 4471 · KES 512,300",
];

export const PREPAID_ISSUANCE_FEE = { virtual: 150, physical: 450 };

export interface PrepaidCard {
  id: string;
  name: string;
  holder: string;
  form: PrepaidForm;
  use: PrepaidUse;
  network: "VISA" | "Mastercard";
  last4: string;
  panMask: string;
  expiry: string;
  status: "active" | "frozen" | "depleted" | "retired";
  balance: number;
  loaded: number;
  spent: number;
  monthlyLimit: number;
  mcc: string;
  gradient: string;
  reloadable: boolean;
  createdOn: string;
}

export const SEED_PREPAID: PrepaidCard[] = [
  {
    id: "pp1",
    name: "Marketing Dept",
    holder: "MARKETING TEAM",
    form: "virtual",
    use: "department",
    network: "VISA",
    last4: "4820",
    panMask: "4877 20•• •••• 4820",
    expiry: "08/28",
    status: "active",
    balance: 14200,
    loaded: 25000,
    spent: 10800,
    monthlyLimit: 25000,
    mcc: "5734",
    gradient: "linear-gradient(118deg,#3b2aa8 0%,#5925dc 55%,#7a5af8 100%)",
    reloadable: true,
    createdOn: "12 Mar 2026",
  },
  {
    id: "pp2",
    name: "Fuel Allowance",
    holder: "FLEET DEPT",
    form: "physical",
    use: "department",
    network: "Mastercard",
    last4: "6115",
    panMask: "5210 44•• •••• 6115",
    expiry: "05/28",
    status: "active",
    balance: 3200,
    loaded: 20000,
    spent: 16800,
    monthlyLimit: 20000,
    mcc: "5541",
    gradient: "linear-gradient(118deg,#7a2e0e 0%,#d92d20 55%,#f79009 100%)",
    reloadable: true,
    createdOn: "02 Feb 2026",
  },
  {
    id: "pp3",
    name: "Intern Gift Card",
    holder: "A. NJOROGE",
    form: "virtual",
    use: "gift",
    network: "VISA",
    last4: "9033",
    panMask: "4877 71•• •••• 9033",
    expiry: "06/27",
    status: "depleted",
    balance: 0,
    loaded: 3000,
    spent: 3000,
    monthlyLimit: 3000,
    mcc: "any",
    gradient: "linear-gradient(118deg,#1d2939 0%,#344054 60%,#475467 100%)",
    reloadable: false,
    createdOn: "18 Jan 2026",
  },
  {
    id: "pp4",
    name: "Ops Petty Cash",
    holder: "OPS TEAM",
    form: "virtual",
    use: "gpr",
    network: "Mastercard",
    last4: "5566",
    panMask: "4800 20•• •••• 5566",
    expiry: "02/27",
    status: "frozen",
    balance: 8750,
    loaded: 15000,
    spent: 6250,
    monthlyLimit: 15000,
    mcc: "5411",
    gradient: "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)",
    reloadable: true,
    createdOn: "14 Apr 2026",
  },
  {
    id: "pp5",
    name: "Dubai Trip Cash",
    holder: "DAVID OCHIENG",
    form: "physical",
    use: "travel",
    network: "VISA",
    last4: "7241",
    panMask: "4539 88•• •••• 7241",
    expiry: "11/28",
    status: "active",
    balance: 26400,
    loaded: 30000,
    spent: 3600,
    monthlyLimit: 30000,
    mcc: "any",
    gradient: "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)",
    reloadable: true,
    createdOn: "20 Jun 2026",
  },
];

export interface LoadEvent {
  id: string;
  cardId: string;
  date: string;
  kind: "Top-up" | "Purchase" | "Refund" | "Auto-reload";
  merchant: string;
  amount: number; // positive = load, negative = spend
  source?: string;
}

export const SEED_LOADS: LoadEvent[] = [
  { id: "l1", cardId: "pp1", date: "27 Jun", kind: "Purchase", merchant: "Meta Ads", amount: -4200 },
  { id: "l2", cardId: "pp1", date: "20 Jun", kind: "Top-up", merchant: "Wallet top-up", amount: 25000, source: "Biz Wallet" },
  { id: "l3", cardId: "pp2", date: "26 Jun", kind: "Purchase", merchant: "Shell Westlands", amount: -3800 },
  { id: "l4", cardId: "pp5", date: "24 Jun", kind: "Purchase", merchant: "Emirates", amount: -3600 },
  { id: "l5", cardId: "pp5", date: "20 Jun", kind: "Top-up", merchant: "Initial load", amount: 30000, source: "KCB Bank •• 4471" },
  { id: "l6", cardId: "pp4", date: "18 Jun", kind: "Purchase", merchant: "Naivas Supermarket", amount: -2450 },
  { id: "l7", cardId: "pp2", date: "15 Jun", kind: "Auto-reload", merchant: "Low-balance reload", amount: 10000, source: "Biz Wallet" },
  { id: "l8", cardId: "pp3", date: "12 Jun", kind: "Purchase", merchant: "Jumia Kenya", amount: -3000 },
];

export const PREPAID_FEES = [
  { item: "Virtual prepaid — issuance", amount: "KES 150", note: "One-time" },
  { item: "Physical prepaid — issuance", amount: "KES 450", note: "Incl. courier" },
  { item: "Top-up / reload", amount: "Free", note: "From Biz Wallet or bank" },
  { item: "M-Pesa reload", amount: "1% · min KES 20", note: "Paybill top-ups" },
  { item: "Inactivity fee", amount: "KES 50/mo", note: "After 90 days idle" },
  { item: "ATM withdrawal", amount: "KES 35", note: "Where enabled" },
  { item: "FX markup", amount: "+2.0%", note: "Travel & intl. spend" },
  { item: "Balance refund to wallet", amount: "Free", note: "On card retire" },
];

/* ============================================================
   PayMo BAAS — Corporate & Business Card Programs (5.6) · data
   ============================================================ */

export type LiabilityModel = "company" | "joint" | "individual";

export interface LiabilityInfo {
  id: LiabilityModel;
  title: string;
  blurb: string;
  detail: string;
  risk: string;
}

export const LIABILITY_MODELS: LiabilityInfo[] = [
  { id: "company", title: "Company Liable", blurb: "Business settles every charge", detail: "All employee card balances are settled by the company account on the cycle end date.", risk: "No personal exposure for staff" },
  { id: "joint", title: "Joint & Several", blurb: "Shared responsibility", detail: "Company is primary, but the cardholder guarantees personal spend above KES 50,000.", risk: "Shared recovery for misuse" },
  { id: "individual", title: "Cardholder Liable", blurb: "Employee settles, then claims", detail: "Employees settle their own statement and submit an expense claim for reimbursement.", risk: "Simplest for the business" },
];

export interface BillingConfig {
  liability: LiabilityModel;
  cycleEndDay: number;
  autoDebit: boolean;
  graceDays: number;
  settlementAccount: string;
  minPaymentPct: number;
}

export const SEED_BILLING: BillingConfig = {
  liability: "company",
  cycleEndDay: 28,
  autoDebit: true,
  graceDays: 3,
  settlementAccount: "KCB Bank •• 4471",
  minPaymentPct: 100,
};

export interface Department {
  id: string;
  name: string;
  lead: string;
  cards: number;
  budgetMonth: number;
  spentMonth: number;
  tone: string;
  icon: "users" | "chart" | "wallet" | "building" | "card" | "globe";
}

export const SEED_DEPARTMENTS: Department[] = [
  { id: "d1", name: "Fleet Management", lead: "Michael Kariuki", cards: 12, budgetMonth: 2500000, spentMonth: 2100000, tone: "#12b76a", icon: "card" },
  { id: "d2", name: "Sales & Marketing", lead: "Grace Kamau", cards: 9, budgetMonth: 1000000, spentMonth: 950000, tone: "#7a5af8", icon: "chart" },
  { id: "d3", name: "Executive Travel", lead: "David Ochieng", cards: 4, budgetMonth: 800000, spentMonth: 350000, tone: "#2e90fa", icon: "globe" },
  { id: "d4", name: "Operations", lead: "Peter Mutua", cards: 7, budgetMonth: 600000, spentMonth: 412000, tone: "#f79009", icon: "building" },
];

export interface EmployeeCard {
  id: string;
  holder: string;
  last4: string;
  deptId: string;
  amount: number;
  merchant: string;
  violation: string;
  severity: "high" | "medium";
  date: string;
}

export const SEED_VIOLATIONS: EmployeeCard[] = [
  { id: "v1", holder: "J. Doe", last4: "4412", deptId: "d1", amount: 45000, merchant: "Nairobi Serena", violation: "Over per-transaction limit", severity: "high", date: "26 Jun" },
  { id: "v2", holder: "S. Smith", last4: "8810", deptId: "d2", amount: 12000, merchant: "Brew Bistro", violation: "Weekend / restricted MCC", severity: "medium", date: "24 Jun" },
  { id: "v3", holder: "M. Kariuki", last4: "9921", deptId: "d1", amount: 8500, merchant: "Total Petrol", violation: "Missing receipt > 7 days", severity: "medium", date: "22 Jun" },
];

export interface SpendPolicy {
  id: string;
  title: string;
  desc: string;
  enabled: boolean;
  icon: "shield" | "clock" | "gauge" | "globe" | "wallet" | "users";
}

export const SEED_POLICIES: SpendPolicy[] = [
  { id: "p1", title: "Per-transaction cap", desc: "Decline any single charge above KES 60,000 without pre-approval.", enabled: true, icon: "gauge" },
  { id: "p2", title: "Receipt mandatory above", desc: "Require a photo receipt for any charge above KES 5,000.", enabled: true, icon: "wallet" },
  { id: "p3", title: "Restricted MCC groups", desc: "Block bars, betting and luxury retail across all employee cards.", enabled: true, icon: "shield" },
  { id: "p4", title: "Weekend spend review", desc: "Flag Saturday and Sunday charges for manager review on Monday.", enabled: false, icon: "clock" },
  { id: "p5", title: "International pre-approval", desc: "Any cross-border charge needs approval before it is authorised.", enabled: true, icon: "globe" },
  { id: "p6", title: "Cardholder liability notice", desc: "Notify employees in writing when they become jointly liable.", enabled: false, icon: "users" },
];

export interface Approval {
  id: string;
  requester: string;
  deptId: string;
  merchant: string;
  amount: number;
  reason: string;
  requestedAgo: string;
}

export const SEED_APPROVALS: Approval[] = [
  { id: "a1", requester: "Grace Kamau", deptId: "d2", merchant: "Meta Ads — Q3 campaign", amount: 180000, reason: "Above department per-transaction cap", requestedAgo: "2h ago" },
  { id: "a2", requester: "David Ochieng", deptId: "d3", merchant: "Emirates — DXB return", amount: 142000, reason: "International pre-approval required", requestedAgo: "5h ago" },
  { id: "a3", requester: "Michael Kariuki", deptId: "d1", merchant: "Toyota Service — Fleet", amount: 96000, reason: "Above per-transaction cap", requestedAgo: "1d ago" },
];

export const SETTLEMENT_ACCOUNTS = [
  "KCB Bank •• 4471 · KES 512,300",
  "Biz Wallet · KES 1,284,000",
  "Absa Bank •• 9082 · KES 288,150",
];

export const CYCLE_DAY_OPTIONS = [15, 20, 25, 28, 30];

export const GRACE_OPTIONS = [0, 3, 5, 7, 14];

export const PROGRAM_STATS = {
  companies: 124,
  employeeCards: 8450,
  b2bSpendMtd: 412000000,
  activeDepartments: 4,
};

/* ============================================================
   PayMo BAAS — Card Security & Fraud Prevention (5.7) · data
   ============================================================ */

export interface FraudEvent {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
  time: string;
  affected: number;
  resolved: boolean;
}

export const SEED_FRAUD_EVENTS: FraudEvent[] = [
  { id: "f1", severity: "critical", title: "CNP spike — Eastern Europe", detail: "Card-not-present attempts elevated 400% in the last 6 hours.", time: "6h ago", affected: 14, resolved: false },
  { id: "f2", severity: "high", title: "Unusual ATM pattern — Westlands", detail: "Multiple max-limit withdrawals in quick succession on one card.", time: "Yesterday", affected: 1, resolved: false },
  { id: "f3", severity: "medium", title: "3DS challenge anomalies", detail: "Failed OTP attempts above the expected baseline on 3 cards.", time: "2d ago", affected: 3, resolved: true },
  { id: "f4", severity: "low", title: "Velocity rule tripped", detail: "6 authorisations in 10 minutes on Marketing Ads card.", time: "3d ago", affected: 1, resolved: true },
];

export interface SecurityRule {
  id: string;
  title: string;
  desc: string;
  enabled: boolean;
  icon: "shieldCheck" | "gauge" | "globe" | "wallet" | "clock" | "key" | "flag" | "zap";
  tone: string;
}

export const SEED_SECURITY_RULES: SecurityRule[] = [
  { id: "r1", title: "3-D Secure enforcement", desc: "OTP on every online authorisation above KES 5,000.", enabled: true, icon: "shieldCheck", tone: "bg-pmgreen-soft text-[#067647]" },
  { id: "r2", title: "Velocity rules", desc: "Max 6 authorisations per 10 minutes per card, then soft-decline.", enabled: true, icon: "gauge", tone: "bg-pmblue-soft text-[#175cd3]" },
  { id: "r3", title: "ATM geo-blocking", desc: "Decline ATM withdrawals outside Kenya.", enabled: false, icon: "wallet", tone: "bg-warn-soft text-[#93370d]" },
  { id: "r4", title: "Night lock (POS)", desc: "Block physical POS taps between 23:00 and 05:00 EAT.", enabled: false, icon: "clock", tone: "bg-pmviolet-soft text-[#5925dc]" },
  { id: "r5", title: "High-risk corridor screening", desc: "Extra verification for CNP traffic from elevated-risk countries.", enabled: true, icon: "globe", tone: "bg-pmblue-soft text-[#175cd3]" },
  { id: "r6", title: "PIN fallback block", desc: "Decline contactless transactions falling back to signature.", enabled: true, icon: "key", tone: "bg-pmgreen-soft text-[#067647]" },
];

export interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  outcome: "success" | "warning" | "blocked";
}

export const SEED_AUDIT: AuditLog[] = [
  { id: "au1", time: "09:42", actor: "Fraud ML model", action: "Elevated risk score", target: "Founder Card •• 8821", outcome: "warning" },
  { id: "au2", time: "09:18", actor: "David A.", action: "Froze card", target: "Ops Petty Cash •• 5566", outcome: "success" },
  { id: "au3", time: "08:55", actor: "Fraud ML model", action: "Blocked CNP attempt", target: "Founder Card •• 8821 — AliExpress", outcome: "blocked" },
  { id: "au4", time: "08:31", actor: "Auto-policy", action: "Velocity soft-decline", target: "Marketing Ads •• 3094", outcome: "blocked" },
  { id: "au5", time: "07:50", actor: "Grace Kamau", action: "Opened a dispute", target: "Everyday Debit •• 4102 — Uber", outcome: "success" },
  { id: "au6", time: "07:12", actor: "Auto-policy", action: "Merchant-lock decline", target: "AWS Card •• 7710 — Netflix", outcome: "blocked" },
];

export const RISK_METRICS = {
  score: 24,
  label: "Low risk",
  attemptsBlocked: 46,
  disputesOpen: 2,
  valueProtected: 412000,
  alerts30d: 148,
};

export interface SuspiciousTxn {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  time: string;
  reason: string;
  flagged: boolean;
}

export const SEED_SUSPICIOUS: SuspiciousTxn[] = [
  { id: "s1", cardId: "c1", merchant: "AliExpress (CN)", amount: 12500, time: "25 Jun · 13:40", reason: "High-risk corridor", flagged: true },
  { id: "s2", cardId: "c1", merchant: "Jumia Kenya", amount: 8200, time: "21 Jun · 18:26", reason: "Unusual category", flagged: true },
  { id: "s3", cardId: "c2", merchant: "Uber *Trip", amount: 850, time: "25 Jun · 19:12", reason: "Velocity threshold", flagged: false },
  { id: "s4", cardId: "c3", merchant: "LinkedIn Ads", amount: 3000, time: "24 Jun · 12:47", reason: "Repeat declined", flagged: false },
];

export const COMPROMISE_REASONS = [
  "Lost my physical card",
  "Card details stolen / phishing",
  "Unrecognised transactions appeared",
  "Data breach at a merchant",
  "Device malware suspected",
];

/* ============================================================
   PayMo BAAS — Card Analytics & Reporting (5.8) · data
   ============================================================ */

export interface AnalyticsDataset {
  id: string;
  title: string;
  desc: string;
  icon: "card" | "chart" | "pie" | "building";
  sample: string;
}

export const ANALYTICS_DATASETS: AnalyticsDataset[] = [
  { id: "issuance", title: "Card Issuance & Activation", desc: "Issued, delivered, activated and drop-off rates by type.", icon: "card", sample: "4,500 issued MTD · 68% virtual" },
  { id: "usage", title: "Usage & Revenue Trends", desc: "Spend, ticket size, active rate and revenue streams.", icon: "chart", sample: "KES 18.5M gross revenue MTD" },
  { id: "merchant", title: "Merchant Concentration", desc: "Category mix, top merchants and international corridors.", icon: "pie", sample: "Top 10 merchants = 45% of volume" },
  { id: "corporate", title: "Corporate Spend & Violations", desc: "Department budgets, B2B spend and policy breaches.", icon: "building", sample: "B2B spend KES 412M · 3 violations" },
];

export interface CardTypeStat {
  type: string;
  issued: number;
  growth: number;
  pending: number;
  tone: string;
}

export const CARD_TYPE_STATS: CardTypeStat[] = [
  { type: "Virtual Debit (Single/Multi)", issued: 2450, growth: 14, pending: 0, tone: "#12b76a" },
  { type: "Physical Debit (Premium/Std)", issued: 610, growth: -2, pending: 142, tone: "#2e90fa" },
  { type: "Virtual Credit", issued: 980, growth: 22, pending: 310, tone: "#7a5af8" },
  { type: "Physical Credit", issued: 230, growth: 5, pending: 85, tone: "#f79009" },
  { type: "Prepaid (GPR/Gift)", issued: 230, growth: 0, pending: 12, tone: "#f04438" },
];

export const DELIVERY_FUNNEL = [
  { label: "Virtual auto-activation", rate: 100, time: "0 mins", tone: "#12b76a" },
  { label: "Physical delivery — Metro", rate: 78, time: "2.4 days", tone: "#2e90fa" },
  { label: "Physical delivery — Regional", rate: 54, time: "5.1 days", tone: "#f79009" },
];

export const REVENUE_STREAMS = [
  { name: "Interchange revenue", desc: "Merchant discount sharing", amount: 12200000, color: "#12b76a" },
  { name: "FX spread / cross-border", desc: "Markup on international spend", amount: 4100000, color: "#7a5af8" },
  { name: "Card replacement fees", desc: "Lost / damaged re-issuance", amount: 850000, color: "#2e90fa" },
  { name: "Late & cash advance fees", desc: "Credit portfolio penalties", amount: 1350000, color: "#f79009" },
];

export const PORTFOLIO_METRICS = [
  { label: "Average active rate", value: "74%", icon: "gauge" as const, tone: "bg-pmgreen-soft text-[#067647]" },
  { label: "Avg ticket size YTD", value: "KES 520", icon: "wallet" as const, tone: "bg-pmblue-soft text-[#175cd3]" },
  { label: "Txns per active card", value: "18.4 / mo", icon: "card" as const, tone: "bg-pmviolet-soft text-[#5925dc]" },
];

export const MERCHANT_MIX = [
  { name: "Supermarkets & Grocery", vol: 264, pct: 22, color: "#12b76a" },
  { name: "Dining & Restaurants", vol: 216, pct: 18, color: "#0e9f6e" },
  { name: "Fuel & Auto", vol: 168, pct: 14, color: "#f79009" },
  { name: "Travel & Airlines", vol: 120, pct: 10, color: "#2e90fa" },
  { name: "Digital Subscriptions", vol: 85, pct: 7, color: "#7a5af8" },
  { name: "Healthcare & Pharmacies", vol: 60, pct: 5, color: "#f04438" },
];

export const TOP_MERCHANTS = [
  { name: "Naivas Supermarket", category: "Groceries", vol: 98420, pct: 8.2 },
  { name: "Safaricom PLC", category: "Telco / Utility", vol: 85110, pct: 7.1 },
  { name: "Quickmart", category: "Groceries", vol: 62300, pct: 5.2 },
  { name: "Shell / Vivo Energy", category: "Fuel", vol: 54800, pct: 4.5 },
  { name: "Jumia Kenya", category: "E-commerce", vol: 41200, pct: 3.4 },
  { name: "Uber", category: "Transport", vol: 38900, pct: 3.2 },
];

export const AI_OPPORTUNITIES = [
  { title: "Co-brand: Fuel", desc: "14% of users spend > KES 10k/mo at Shell", icon: "zap" as const, tone: "bg-warn-soft text-[#93370d]" },
  { title: "Cashback: Groceries", desc: "Naivas/Quickmart frequent shoppers (2×/week)", icon: "wallet" as const, tone: "bg-pmgreen-soft text-[#067647]" },
  { title: "Upsell: Travel Card", desc: "Users with > 2 intl. flight bookings YTD", icon: "globe" as const, tone: "bg-pmblue-soft text-[#175cd3]" },
];

export const AT_RISK_FACTORS = [
  { factor: "Zero activity > 45 days", cards: 840, drop: 100, tone: "text-[#b42318]" },
  { factor: "Salary deposit stopped", cards: 310, drop: 85, tone: "text-[#93370d]" },
  { factor: "Multiple 3DS failures", cards: 150, drop: 60, tone: "text-[#93370d]" },
  { factor: "Prepaid balance KES 0", cards: 120, drop: 100, tone: "text-[#b42318]" },
];

export const UPSEL_SEGMENTS = [
  { segment: "High Net Worth Debit", eligible: 142, limit: "KES 500k+", conv: 45, tone: "bg-pmgreen-soft text-[#067647]" },
  { segment: "Consistent Salary Deposits", eligible: 180, limit: "KES 100k–300k", conv: 60, tone: "bg-pmblue-soft text-[#175cd3]" },
  { segment: "Heavy E-commerce Shoppers", eligible: 90, limit: "KES 50k", conv: 35, tone: "bg-pmviolet-soft text-[#5925dc]" },
];

export const LTV_SEGMENTS = [
  { segment: "Premium Credit", ltv: 45000, cac: 2500, roi: "18x" },
  { segment: "Corporate Expense", ltv: 32100, cac: 1200, roi: "26x" },
  { segment: "Standard Debit", ltv: 8500, cac: 800, roi: "10.6x" },
  { segment: "Virtual Only", ltv: 4200, cac: 150, roi: "28x" },
];

export const FORECAST = {
  volume: "KES 1.35B",
  growth: "+12.5%",
  activeCards: "48,000",
  confidence: "94.2%",
};

export const REPORT_FIELDS = [
  "Transaction Date",
  "Cardholder Name",
  "Card PAN (Masked)",
  "Settlement Amount",
  "Transaction Amount",
  "Merchant Category (MCC)",
  "Authorization Status",
];

export const REPORT_FREQUENCIES = ["Once", "Daily", "Weekly", "Monthly"];

export const REPORT_FORMATS = ["CSV", "Excel (XLSX)", "PDF", "JSON"];

/* ============================================================
   PayMo BAAS — Card Program Administration (5.9) · data
   ============================================================ */

export type SystemStatus = "operational" | "degraded" | "syncing" | "down" | "funded";

export interface SystemHealth {
  id: string;
  name: string;
  status: SystemStatus;
  detail: string;
  latency?: string;
  lastEvent: string;
}

export const SEED_SYSTEMS: SystemHealth[] = [
  { id: "mc", name: "Mastercard Gateway", status: "operational", detail: "100% uptime · 30 days", latency: "38ms", lastEvent: "2 min ago" },
  { id: "visa", name: "Visa Gateway", status: "operational", detail: "100% uptime · 30 days", latency: "41ms", lastEvent: "2 min ago" },
  { id: "ledger", name: "Core Ledger Sync", status: "syncing", detail: "Realtime · 4ms lag", latency: "4ms", lastEvent: "Just now" },
  { id: "kyc", name: "KYC / AML Oracle", status: "degraded", detail: "1.2s delay on checks", latency: "1.2s", lastEvent: "12 min ago" },
  { id: "settlement", name: "Settlement Accounts", status: "funded", detail: "Funded · next sweep 17:00 EAT", lastEvent: "1h ago" },
  { id: "fraud", name: "Fraud Scoring Engine", status: "operational", detail: "ML model v2.4 · 94.2% confidence", latency: "12ms", lastEvent: "Just now" },
];

export interface GatewayEvent {
  id: string;
  time: string;
  gateway: string;
  type: string;
  code: string;
  status: "success" | "error" | "retry";
}

export const SEED_GATEWAY_EVENTS: GatewayEvent[] = [
  { id: "g1", time: "10:04:22", gateway: "Visa", type: "Authorisation", code: "200 OK", status: "success" },
  { id: "g2", time: "10:04:19", gateway: "Mastercard", type: "Authorisation", code: "200 OK", status: "success" },
  { id: "g3", time: "10:04:11", gateway: "KYC/AML Oracle", type: "AML check", code: "429 Slow", status: "retry" },
  { id: "g4", time: "10:03:58", gateway: "Visa", type: "Capture", code: "200 OK", status: "success" },
  { id: "g5", time: "10:03:44", gateway: "Core Ledger", type: "Posting", code: "200 OK", status: "success" },
  { id: "g6", time: "10:03:31", gateway: "Mastercard", type: "Refund", code: "200 OK", status: "success" },
  { id: "g7", time: "10:03:02", gateway: "KYC/AML Oracle", type: "PEP screen", code: "503 Timeout", status: "error" },
];

export interface AdminAccount {
  id: string;
  initials: string;
  name: string;
  role: string;
  access: string;
  lastLogin: string;
  status: "active" | "invited";
}

export const SEED_ADMINS: AdminAccount[] = [
  { id: "ad1", initials: "DA", name: "David A.", role: "BAAS Admin · Card Center Data Owner", access: "Full analytics + admin", lastLogin: "Today, 08:42 AM", status: "active" },
  { id: "ad2", initials: "GK", name: "Grace Kamau", role: "Programme Manager", access: "Issuance + reporting", lastLogin: "Yesterday, 05:10 PM", status: "active" },
  { id: "ad3", initials: "MK", name: "Michael Kariuki", role: "Fleet Admin", access: "Department scope only", lastLogin: "Today, 07:55 AM", status: "active" },
  { id: "ad4", initials: "PW", name: "Peter W.", role: "Finance Reviewer", access: "Read-only · statements", lastLogin: "—", status: "invited" },
];

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  env: "live" | "test";
  created: string;
  lastUsed: string;
}

export const SEED_API_KEYS: ApiKey[] = [
  { id: "ak1", name: "Production Core", prefix: "pk_live_8f2a••••", env: "live", created: "12 Jan 2026", lastUsed: "2 min ago" },
  { id: "ak2", name: "Sandbox CI", prefix: "pk_test_7c11••••", env: "test", created: "03 Mar 2026", lastUsed: "Yesterday" },
];

export const WEBHOOK_ENDPOINTS = [
  { id: "wh1", name: "Card issued", url: "https://api.acmetraders.co.ke/webhooks/cards", status: "healthy", successRate: 100, last: "2 min ago" },
  { id: "wh2", name: "Transaction authorised", url: "https://api.acmetraders.co.ke/webhooks/txns", status: "healthy", successRate: 99.8, last: "1 min ago" },
  { id: "wh3", name: "Dispute opened", url: "https://api.acmetraders.co.ke/webhooks/disputes", status: "failing", successRate: 82.4, last: "4h ago" },
];

export const ENV_INFO = {
  region: "Africa / Nairobi (NBO-1)",
  environment: "Production",
  apiVersion: "v2.4.0",
  issuerPartner: "CBK-licensed issuer",
  pci: "PCI-DSS Level 1",
  networks: "Visa & Mastercard principal member",
};

export const MAINTENANCE_WINDOWS = [
  { window: "Monthly patch window", when: "2nd Sunday 02:00–04:00 EAT", status: "upcoming" },
  { window: "Visa network maintenance", when: "Advisory · no impact expected", status: "scheduled" },
  { window: "KYC oracle upgrade", when: "Tonight 23:00–23:30 EAT", status: "planned" },
];

/* ============================================================
   PayMo BAAS — Card Settings & Support (5.10) · data
   ============================================================ */

export interface CardDefaults {
  online: boolean;
  contactless: boolean;
  atm: boolean;
  fundingSource: string;
  currency: string;
  autoFreezeUnused: boolean;
  spendingAlerts: boolean;
}

export const SEED_DEFAULTS: CardDefaults = {
  online: true,
  contactless: true,
  atm: false,
  fundingSource: "Biz Wallet (primary)",
  currency: "KES — Kenya Shilling",
  autoFreezeUnused: false,
  spendingAlerts: true,
};

export const DEFAULT_FUNDING_SOURCES = [
  "Biz Wallet (primary)",
  "M-Pesa Paybill 522 123",
  "KCB Bank •• 4471",
];

export const CURRENCIES = [
  "KES — Kenya Shilling",
  "USD — US Dollar",
  "GBP — British Pound",
  "EUR — Euro",
  "AED — UAE Dirham",
];

export const SUPPORT_CHANNELS = [
  { id: "chat", name: "Live chat", sub: "Fastest · card specialists online", icon: "sms" as const, response: "~3 min" },
  { id: "phone", name: "Call desk", sub: "+254 709 900 112 · 24/7", icon: "phone" as const, response: "Immediate" },
  { id: "email", name: "Email", sub: "cards@paymo.app", icon: "mail" as const, response: "< 1 hour" },
  { id: "whatsapp", name: "WhatsApp", sub: "Chat on +254 709 900 112", icon: "send" as const, response: "~5 min" },
];

export const SUPPORT_FAQS = [
  { q: "How do I change my card PIN?", a: "Open the card drawer, tap 'View PIN', then verify with your PayMo PIN to reveal or reset it. A fresh PIN link is sent by SMS." },
  { q: "What do I do if my card is lost?", a: "Freeze it instantly from My Cards, then use the Security page to report it lost and order a replacement. Theft reports carry no fee." },
  { q: "How do international payments work?", a: "Enable 'International Use' in the card's limits, then charges settle at the network rate plus your card tier's FX markup (0.5%–3.5%)." },
  { q: "When does my statement close?", a: "Card statements close monthly on your billing cycle end date (set in Corporate Programs → Billing). You'll get a push and email notification." },
  { q: "Can I issue cards for my team?", a: "Yes — use Corporate Programs to invite employees, or issue prepaid / virtual cards with limits and category locks for delegated spend." },
  { q: "How do I raise a limit?", a: "Open Limits & Controls on any card and drag the monthly / per-transaction sliders. For credit-line increases, see the review offer on the Credit page." },
];

export const RESOURCES = [
  { id: "r1", title: "Card issuer documentation", desc: "APIs, webhooks and guides for your engineering team.", icon: "globe" as const, tag: "Docs" },
  { id: "r2", title: "Security & fraud playbook", desc: "Best practices for containing a compromise.", icon: "shield" as const, tag: "Guide" },
  { id: "r3", title: "Fee schedule (PDF)", desc: "Every card product and service, priced transparently.", icon: "download" as const, tag: "PDF" },
  { id: "r4", title: "Programme terms & conditions", desc: "Liability, settlement and cardholder agreements.", icon: "building" as const, tag: "Legal" },
];

export const TRUST_BADGES = [
  { icon: "shieldCheck" as const, label: "PCI-DSS Level 1" },
  { icon: "building" as const, label: "CBK-licensed issuer" },
  { icon: "globe" as const, label: "Visa & Mastercard member" },
  { icon: "lock" as const, label: "256-bit encryption" },
];

export type ReplaceReason = "lost" | "stolen" | "damaged" | "expired" | "name-change";

export const REPLACE_REASONS: { id: ReplaceReason; label: string; fee: number; blurb: string }[] = [
  { id: "lost", label: "Lost card", fee: 500, blurb: "Old card permanently blocked. New card dispatched." },
  { id: "stolen", label: "Stolen card", fee: 0, blurb: "No fee for theft reports. Immediate block + dispute sweep." },
  { id: "damaged", label: "Damaged / worn out", fee: 500, blurb: "Chip or strip no longer reading at POS." },
  { id: "expired", label: "Expired card", fee: 0, blurb: "Auto-renewal is default. Only use if renewal didn't arrive." },
  { id: "name-change", label: "Name change", fee: 500, blurb: "Re-issue with updated embossed name. KYC update required." },
];
