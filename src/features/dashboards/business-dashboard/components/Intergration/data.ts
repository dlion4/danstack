/* ==================================================================
   PayMo Business — PAGE 13: APPS & INTEGRATIONS — data layer
================================================================== */

/* ================= Types ================= */
export type ConnStatus = "Healthy" | "Error" | "Syncing" | "Reconnect needed";
export type AppCat = "Accounting" | "Payments" | "Commerce" | "Logistics" | "Marketing" | "Automation" | "Productivity" | "Kenya Rails" | "Developer";
export type LogStatus = "Success" | "Failed" | "Partial";

export interface MarketplaceApp {
  id: string; name: string; initials: string; color: string; category: AppCat; icon: string;
  desc: string; installed: boolean; popular: boolean; rating: number; users: string;
  free: boolean; features: string[];
}
export interface Connection {
  id: string; appId: string; name: string; initials: string; color: string; icon: string;
  status: ConnStatus; lastSync: string; uptime: string; records: number; direction: string;
  frequency: string; errors: number; scopes: string[]; tokenExpiry?: string; realtime: boolean;
}
export interface SyncError {
  id: string; time: string; app: string; initials: string; color: string;
  errorType: string; message: string; status: "Resolved" | "Unresolved"; attempts: number;
}
export interface Webhook {
  id: string; name: string; url: string; events: string[]; status: "Active" | "Paused";
  secret: boolean; deliveries: { time: string; code: number; status: string; payload: string }[];
}
export interface SyncLog { id: string; time: string; app: string; initials: string; color: string; direction: string; records: number; duration: string; status: LogStatus }
export interface ApiKey { id: string; name: string; prefix: string; scopes: string[]; created: string; lastUsed: string; requests: number }
export interface Automation { id: string; name: string; trigger: string; action: string; runs: number; status: "Active" | "Paused" }
export interface FieldMap { id: string; source: string; target: string; mode: string }
export interface Notification { id: number; icon: string; text: string; time: string; unread: boolean; action?: string }
export interface Activity { time: string; icon: string; text: string; by: string }

/* ================= Helpers ================= */
export const fmtKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n));

/* ================= Marketplace ================= */
export const APPS: MarketplaceApp[] = [
  { id: "quickbooks", name: "QuickBooks Online", initials: "QB", color: "#2ca01c", category: "Accounting", icon: "bi-calculator", desc: "Two-way accounting sync — invoices, bills & ledger entries.", installed: true, popular: true, rating: 4.7, users: "12K+", free: false, features: ["Syncs invoices from Get Paid", "Supplier bills from Pay Suppliers", "Daily ledger export"] },
  { id: "xero", name: "Xero", initials: "XE", color: "#13b5ea", category: "Accounting", icon: "bi-calculator", desc: "Popular cloud accounting for Kenyan SMEs.", installed: false, popular: true, rating: 4.6, users: "9K+", free: false, features: ["Invoices & bills", "VAT/GST mapping", "Bank feeds"] },
  { id: "zoho", name: "Zoho Books", initials: "ZO", color: "#f0483e", category: "Accounting", icon: "bi-journal-bookmark", desc: "Affordable books with KRA-ready reports.", installed: false, popular: false, rating: 4.3, users: "4K+", free: false, features: ["Invoices & expenses", "KRA VAT summary", "Purchase orders"] },
  { id: "safaricom", name: "Safaricom Daraja (M-Pesa)", initials: "SF", color: "#00a550", category: "Kenya Rails", icon: "bi-phone", desc: "M-Pesa Express, till & paybill payments — the core rail.", installed: true, popular: true, rating: 4.9, users: "34K+", free: true, features: ["STK push collections", "Till settlement feed", "Callback webhooks"] },
  { id: "etims", name: "eTIMS / KRA Connector", initials: "KR", color: "#e11d48", category: "Kenya Rails", icon: "bi-shield-check", desc: "Fiscalised receipts filed to KRA in real time.", installed: true, popular: true, rating: 4.8, users: "22K+", free: true, features: ["Auto invoice submission", "HSC code validation", "Filing status reports"] },
  { id: "pesalink", name: "PesaLink", initials: "PL", color: "#7a5af8", category: "Kenya Rails", icon: "bi-bank", desc: "Bank-to-bank instant payments across 40+ banks.", installed: true, popular: false, rating: 4.5, users: "6K+", free: true, features: ["Instant bank collections", "Bulk disbursements", "Reconciliation feed"] },
  { id: "dpo", name: "DPO Pay", initials: "DP", color: "#f79009", category: "Payments", icon: "bi-credit-card", desc: "Card payments gateway — Visa & Mastercard online.", installed: true, popular: false, rating: 4.4, users: "5K+", free: false, features: ["Checkout integration", "Auto-reconciliation", "Multi-currency"] },
  { id: "intasend", name: "Intasend", initials: "IN", color: "#2e90fa", category: "Payments", icon: "bi-cash-stack", desc: "Modern payment rails for cards, M-Pesa & links.", installed: false, popular: true, rating: 4.6, users: "8K+", free: false, features: ["Payment links", "Subscriptions", "Developer API"] },
  { id: "flutterwave", name: "Flutterwave", initials: "FL", color: "#fbb040", category: "Payments", icon: "bi-globe2", desc: "Pan-African payments & payouts.", installed: false, popular: false, rating: 4.2, users: "15K+", free: false, features: ["Cards & mobile money", "Cross-border payouts", "Store checkout"] },
  { id: "meta", name: "Meta for Business", initials: "ME", color: "#0866ff", category: "Marketing", icon: "bi-instagram", desc: "Instagram & Facebook shops, WhatsApp Business.", installed: true, popular: true, rating: 4.5, users: "18K+", free: true, features: ["Instagram orders → PayMo", "WhatsApp catalogue", "Messenger replies"] },
  { id: "sendy", name: "Sendy", initials: "SD", color: "#12b76a", category: "Logistics", icon: "bi-truck", desc: "Kenyan delivery network — dispatch from orders.", installed: true, popular: true, rating: 4.3, users: "7K+", free: false, features: ["One-click dispatch", "Tracking back to orders", "Cost per zone"] },
  { id: "shopify", name: "Shopify", initials: "SH", color: "#96bf48", category: "Commerce", icon: "bi-shop", desc: "Run a second storefront, one inventory.", installed: false, popular: true, rating: 4.6, users: "11K+", free: false, features: ["Order & product sync", "Stock sync both ways", "Customer sync"] },
  { id: "jumia", name: "Jumia Seller", initials: "JU", color: "#f68b1e", category: "Commerce", icon: "bi-bag", desc: "Sell on Jumia — orders & fulfilment in one view.", installed: false, popular: false, rating: 4.0, users: "3K+", free: false, features: ["Order import", "Stock sync", "Returns handling"] },
  { id: "gmail", name: "Google Workspace", initials: "G", color: "#4285f4", category: "Productivity", icon: "bi-google", desc: "Email, calendar & Drive — attach files to records.", installed: false, popular: true, rating: 4.8, users: "20K+", free: true, features: ["Attach Drive files", "Calendar reminders", "Gmail labels"] },
  { id: "sheets", name: "Google Sheets", initials: "GS", color: "#0f9d58", category: "Productivity", icon: "bi-file-earmark-spreadsheet", desc: "Live reports & data push to your spreadsheets.", installed: true, popular: true, rating: 4.5, users: "14K+", free: true, features: ["Daily exports", "Live lookups", "Template library"] },
  { id: "mailchimp", name: "Mailchimp", initials: "MC", color: "#ffe01b", category: "Marketing", icon: "bi-envelope", desc: "Email campaigns synced with your customers.", installed: true, popular: false, rating: 4.1, users: "6K+", free: false, features: ["Customer list sync", "Campaign attribution", "Automations"] },
  { id: "zapier", name: "Zapier", initials: "ZA", color: "#ff4f00", category: "Automation", icon: "bi-puzzle", desc: "6,000+ app automations without code.", installed: true, popular: true, rating: 4.6, users: "9K+", free: false, features: ["PayMo triggers", "Zaps to 6,000 apps", "Custom actions"] },
  { id: "slack", name: "Slack", initials: "SL", color: "#4a154b", category: "Productivity", icon: "bi-slack", desc: "Team notifications — sales, syncs, alerts.", installed: false, popular: false, rating: 4.5, users: "5K+", free: true, features: ["Channel alerts", "Daily digests", "Slash commands"] },
  { id: "github", name: "GitHub", initials: "GH", color: "#24292f", category: "Developer", icon: "bi-github", desc: "Ship storefront code with CI/CD hooks.", installed: false, popular: false, rating: 4.7, users: "2K+", free: true, features: ["Deploy webhooks", "Commit checks", "Pages hosting"] },
  { id: "postman", name: "Postman", initials: "PM", color: "#ff6c37", category: "Developer", icon: "bi-rocket-takeoff", desc: "Test the PayMo API from your workspace.", installed: false, popular: false, rating: 4.6, users: "3K+", free: true, features: ["Collection import", "Environment presets", "Mock servers"] },
];

/* ================= Connections ================= */
export const CONNECTIONS: Connection[] = [
  { id: "c1", appId: "safaricom", name: "Safaricom Daraja (M-Pesa)", initials: "SF", color: "#00a550", icon: "bi-phone", status: "Healthy", lastSync: "Just now · real-time", uptime: "99.9%", records: 48250, direction: "Two-way", frequency: "Real-time", errors: 0, scopes: ["Transactions", "Till balance", "Callbacks"], realtime: true },
  { id: "c2", appId: "etims", name: "eTIMS / KRA Connector", initials: "KR", color: "#e11d48", icon: "bi-shield-check", status: "Healthy", lastSync: "12 min ago", uptime: "99.7%", records: 14380, direction: "Two-way", frequency: "Hourly", errors: 0, scopes: ["Receipts", "SKU codes", "Filing status"], realtime: false },
  { id: "c3", appId: "meta", name: "Meta for Business", initials: "ME", color: "#0866ff", icon: "bi-instagram", status: "Error", lastSync: "2 days ago", uptime: "97.2%", records: 1240, direction: "Inbound", frequency: "Every 15 min", errors: 12, scopes: ["Instagram orders", "Messages", "WhatsApp catalogue"], tokenExpiry: "Expired — re-auth needed (60-day Meta policy)", realtime: false },
  { id: "c4", appId: "quickbooks", name: "QuickBooks Online", initials: "QB", color: "#2ca01c", icon: "bi-calculator", status: "Healthy", lastSync: "4 min ago", uptime: "99.8%", records: 21440, direction: "Two-way", frequency: "Every 15 min", errors: 1, scopes: ["Invoices", "Bills", "Ledger"], realtime: false },
  { id: "c5", appId: "sendy", name: "Sendy", initials: "SD", color: "#12b76a", icon: "bi-truck", status: "Healthy", lastSync: "26 min ago", uptime: "99.4%", records: 862, direction: "Two-way", frequency: "Every 30 min", errors: 1, scopes: ["Dispatches", "Tracking", "Zones"], realtime: false },
  { id: "c6", appId: "dpo", name: "DPO Pay", initials: "DP", color: "#f79009", icon: "bi-credit-card", status: "Healthy", lastSync: "1 hr ago", uptime: "99.6%", records: 3910, direction: "Two-way", frequency: "Hourly", errors: 0, scopes: ["Card payments", "Refunds"], realtime: false },
  { id: "c7", appId: "sheets", name: "Google Sheets", initials: "GS", color: "#0f9d58", icon: "bi-file-earmark-spreadsheet", status: "Healthy", lastSync: "3 hrs ago", uptime: "99.9%", records: 6200, direction: "Outbound", frequency: "Daily 06:00", errors: 0, scopes: ["Spreadsheets"], realtime: false },
  { id: "c8", appId: "mailchimp", name: "Mailchimp", initials: "MC", color: "#ffe01b", icon: "bi-envelope", status: "Healthy", lastSync: "1 day ago", uptime: "98.9%", records: 1284, direction: "Two-way", frequency: "Daily 08:00", errors: 2, scopes: ["Lists", "Campaigns"], realtime: false },
  { id: "c9", appId: "zapier", name: "Zapier", initials: "ZA", color: "#ff4f00", icon: "bi-puzzle", status: "Healthy", lastSync: "9 min ago", uptime: "99.5%", records: 340, direction: "Two-way", frequency: "Event-driven", errors: 0, scopes: ["Triggers", "Actions"], realtime: true },
];

/* ================= Sync errors ================= */
export const SYNC_ERRORS: SyncError[] = [
  { id: "e1", time: "Today 08:12", app: "Meta for Business", initials: "ME", color: "#0866ff", errorType: "Authentication failed", message: "OAuth token expired (60-day Meta policy). Re-authenticate to resume Instagram order sync.", status: "Unresolved", attempts: 3 },
  { id: "e2", time: "Yesterday 22:40", app: "eTIMS / KRA Connector", initials: "KR", color: "#e11d48", errorType: "Gateway timeout", message: "iTax gateway did not respond in 30s. 4 receipts queued for retry.", status: "Unresolved", attempts: 1 },
  { id: "e3", time: "Yesterday 14:05", app: "QuickBooks Online", initials: "QB", color: "#2ca01c", errorType: "Rate limit exceeded", message: "QuickBooks throttled sync — reduced to 1 request/sec, resuming.", status: "Resolved", attempts: 2 },
  { id: "e4", time: "2 days ago", app: "Sendy", initials: "SD", color: "#12b76a", errorType: "Data validation error", message: "Dispatch SK-88412 missing destination zone — fixed, order resynced.", status: "Resolved", attempts: 1 },
  { id: "e5", time: "3 days ago", app: "Google Sheets", initials: "GS", color: "#0f9d58", errorType: "Quota exceeded", message: "Daily write quota hit at 04:59 — export retried at 06:00 successfully.", status: "Resolved", attempts: 2 },
  { id: "e6", time: "4 days ago", app: "Mailchimp", initials: "MC", color: "#ffe01b", errorType: "Authentication failed", message: "Subscriber list API key rotated by owner — reconnected.", status: "Resolved", attempts: 1 },
];

/* ================= Webhooks ================= */
export const WEBHOOKS: Webhook[] = [
  { id: "w1", name: "Store orders → ERP", url: "https://api.mycompany.co.ke/webhooks/paymo-orders", events: ["order.created", "order.paid", "order.updated"], status: "Active", secret: true, deliveries: [
    { time: "Today 09:14", code: 200, status: "Delivered", payload: "{\"event\":\"order.paid\",\"id\":\"ORD-1102\"}" },
    { time: "Today 08:02", code: 200, status: "Delivered", payload: "{\"event\":\"order.created\",\"id\":\"ORD-1101\"}" },
    { time: "Yesterday", code: 500, status: "Failed (retried)", payload: "{\"event\":\"order.updated\",\"id\":\"ORD-1100\"}" },
  ]},
  { id: "w2", name: "Inventory alerts → Slack", url: "https://hooks.slack.com/services/T01/B02/xyz", events: ["inventory.low", "inventory.stockout"], status: "Active", secret: false, deliveries: [
    { time: "Yesterday 07:00", code: 200, status: "Delivered", payload: "{\"event\":\"inventory.low\",\"sku\":\"PRD-010\"}" },
  ]},
  { id: "w3", name: "Zapier passthrough", url: "https://hooks.zapier.com/hooks/catch/8841/paymo", events: ["*"], status: "Paused", secret: true, deliveries: [
    { time: "1w ago", code: 200, status: "Delivered", payload: "{\"event\":\"customer.created\"}" },
  ]},
];

/* ================= Sync log ================= */
export const SYNC_LOG: SyncLog[] = [
  { id: "sl1", time: "Today 09:10", app: "Safaricom Daraja", initials: "SF", color: "#00a550", direction: "Inbound · 128 txns", records: 128, duration: "0.8s", status: "Success" },
  { id: "sl2", time: "Today 09:00", app: "QuickBooks", initials: "QB", color: "#2ca01c", direction: "Two-way · 84 records", records: 84, duration: "3.2s", status: "Success" },
  { id: "sl3", time: "Today 08:12", app: "Meta for Business", initials: "ME", color: "#0866ff", direction: "Inbound · 0 records", records: 0, duration: "0.4s", status: "Failed" },
  { id: "sl4", time: "Today 08:00", app: "Mailchimp", initials: "MC", color: "#ffe01b", direction: "Outbound · 41 records", records: 41, duration: "2.1s", status: "Success" },
  { id: "sl5", time: "Yesterday 22:40", app: "eTIMS / KRA", initials: "KR", color: "#e11d48", direction: "Outbound · 4 queued", records: 4, duration: "31s", status: "Partial" },
  { id: "sl6", time: "Yesterday 18:00", app: "Sendy", initials: "SD", color: "#12b76a", direction: "Two-way · 6 dispatches", records: 6, duration: "1.4s", status: "Success" },
  { id: "sl7", time: "Yesterday 06:00", app: "Google Sheets", initials: "GS", color: "#0f9d58", direction: "Outbound · 214 rows", records: 214, duration: "4.8s", status: "Success" },
];

/* ================= API keys ================= */
export const API_KEYS: ApiKey[] = [
  { id: "k1", name: "Production — live store", prefix: "pk_live_9f2a…7c31", scopes: ["read", "write"], created: "12 Mar 25", lastUsed: "2 min ago", requests: 48120 },
  { id: "k2", name: "Zapier automation", prefix: "pk_live_3d81…aa44", scopes: ["read", "webhooks"], created: "8 Jun 25", lastUsed: "9 min ago", requests: 8410 },
  { id: "k3", name: "Sandbox — testing", prefix: "pk_test_77e2…11b0", scopes: ["read", "write"], created: "2 Jan 25", lastUsed: "Yesterday", requests: 3120 },
];

/* ================= Automations ================= */
export const AUTOMATIONS: Automation[] = [
  { id: "a1", name: "Invoice paid → QuickBooks journal", trigger: "Invoice marked paid", action: "Post journal entry to QuickBooks", runs: 214, status: "Active" },
  { id: "a2", name: "Order shipped → Sendy dispatch", trigger: "Order status → Shipped", action: "Create Sendy delivery request", runs: 86, status: "Active" },
  { id: "a3", name: "Low stock → team WhatsApp", trigger: "SKU below reorder point", action: "Send WhatsApp alert to store team", runs: 41, status: "Active" },
  { id: "a4", name: "New review → Slack #reviews", trigger: "Review received", action: "Post to Slack channel", runs: 0, status: "Paused" },
  { id: "a5", name: "Instagram order → confirm via WhatsApp", trigger: "Instagram order placed", action: "Send WhatsApp confirmation", runs: 118, status: "Active" },
];

/* ================= Usage / rate limits ================= */
export const API_USAGE = {
  requests30d: 128400,
  limit: 200000,
  rateLimit: "100 req/min",
  burst: "500 req/min burstable",
  webhookDeliveries: 13820,
  syncCount: 914,
};

export const DATA_FLOW = [
  { app: "Safaricom Daraja", dir: "in", detail: "payments", icon: "bi-phone", color: "#00a550" },
  { app: "eTIMS KRA", dir: "out", detail: "receipts", icon: "bi-shield-check", color: "#e11d48" },
  { app: "QuickBooks", dir: "both", detail: "accounting", icon: "bi-calculator", color: "#2ca01c" },
  { app: "Meta", dir: "in", detail: "orders", icon: "bi-instagram", color: "#0866ff" },
  { app: "Sendy", dir: "both", detail: "deliveries", icon: "bi-truck", color: "#12b76a" },
  { app: "DPO Pay", dir: "in", detail: "cards", icon: "bi-credit-card", color: "#f79009" },
  { app: "Google Sheets", dir: "out", detail: "reports", icon: "bi-file-earmark-spreadsheet", color: "#0f9d58" },
  { app: "Zapier", dir: "both", detail: "automations", icon: "bi-puzzle", color: "#ff4f00" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "bi-exclamation-triangle", text: "Meta connection expired — Instagram orders paused for 2 days", time: "12 min ago", unread: true, action: "Reconnect" },
  { id: 2, icon: "bi-clock-history", text: "eTIMS: 4 receipts queued — iTax gateway slow", time: "1 hr ago", unread: true, action: "Retry" },
  { id: 3, icon: "bi-shield-check", text: "All other integrations healthy · 7/9 at 99%+ uptime", time: "3 hrs ago", unread: true, action: "View health" },
  { id: 4, icon: "bi-puzzle", text: "Zapier ran 9 zaps today — 3 new customer automations", time: "Yesterday", unread: false },
  { id: 5, icon: "bi-graph-up-arrow", text: "API usage: 128.4K requests this month (64% of limit)", time: "Yesterday", unread: false },
];

export const ACTIVITY: Activity[] = [
  { time: "Today 09:10", icon: "bi-arrow-repeat", text: "Safaricom Daraja sync — 128 transactions inbound (0.8s)", by: "System" },
  { time: "Today 09:00", icon: "bi-calculator", text: "QuickBooks sync — 84 records two-way (3.2s)", by: "System" },
  { time: "Today 08:12", icon: "bi-exclamation-triangle", text: "Meta sync FAILED — OAuth token expired (attempt #3)", by: "System" },
  { time: "Yesterday", icon: "bi-cloud-check", text: "Webhook w1 delivered 3/3 events (2× 200, 1× retried)", by: "System" },
  { time: "Yesterday", icon: "bi-key", text: "API key " + "pk_live_9f2a…" + " used by live store checkout", by: "System" },
  { time: "2d ago", icon: "bi-truck", text: "Sendy integration: 6 dispatches created from shipped orders", by: "System" },
  { time: "2d ago", icon: "bi-people", text: "Mailchimp sync — 41 subscriber updates pushed", by: "System" },
  { time: "3d ago", icon: "bi-puzzle", text: "Zapier zap 'Invoice paid → Google Sheet' ran 12 times", by: "System" },
];

export const BUSINESSES = [
  { name: "TS Retail Ltd", type: "Operating · Retail", emoji: "🛍️", current: true },
  { name: "Kilimani House 1", type: "Rental Property", emoji: "🏠", current: false },
  { name: "TechSolutions Ltd", type: "Operating · IT", emoji: "💻", current: false },
  { name: "Sanaa Side Hustle", type: "Sole Prop", emoji: "🎨", current: false },
];

export const SOCIAL_INBOX_SAMPLE = [
  { channel: "WhatsApp", from: "Wanjiru K.", text: "Is the kiondo available in brown?" },
  { channel: "Instagram", from: "@kevin.shares", text: "Delivery to Kakamega — how long?" },
  { channel: "Facebook", from: "Samuel Okello", text: "Refund status for ORD-1093?" },
];
