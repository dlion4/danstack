/* ============================================================================
   PayMo Business — Get Paid (Money In) Data
   TypeScript data structures for payment channels, invoices, recurring,
   receivables, QR/payment links, refunds, fees and analytics.
   Ported from consolidated/get-paid.html.
   ========================================================================== */

export type ChannelTier = "active" | "pending" | "available";
export type Tone = "success" | "warning" | "danger" | "info" | "purple" | "dark";
export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "overdue";

/* ---------- Payment methods hub ---------- */
export interface Channel {
	id: string;
	name: string;
	sub: string;
	icon: string;
	iconBg: string;
	iconColor: string;
	tier: ChannelTier;
	badge: string;
	badgeTone: Tone;
	spark: string;
	sparkColor: string;
	collected: string;
	successRate: string;
	successTone: Tone;
	action: string;
	modal: string;
	primaryAction?: boolean;
	note?: string;
}

export const CHANNELS: Channel[] = [
	{
		id: "paybill",
		name: "M-Pesa Paybill",
		sub: "Paybill 247247 · INV-{ref}",
		icon: "bi-phone",
		iconBg: "var(--pm-accent-soft)",
		iconColor: "var(--pm-accent)",
		tier: "active",
		badge: "Active",
		badgeTone: "success",
		spark: "0,20 28,18 56,19 84,14 112,12 140,8 168,10 200,5",
		sparkColor: "#10B981",
		collected: "KES 3.2M",
		successRate: "98.5% success",
		successTone: "success",
		action: "Configure",
		modal: "paybillConfigModal",
	},
	{
		id: "till",
		name: "M-Pesa Till",
		sub: "Till 455890 · Buy Goods",
		icon: "bi-shop",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		tier: "active",
		badge: "Active",
		badgeTone: "success",
		spark: "0,18 28,20 56,16 84,18 112,12 140,14 168,9 200,11",
		sparkColor: "#3B82F6",
		collected: "KES 1.4M",
		successRate: "97.2% success",
		successTone: "success",
		action: "Configure",
		modal: "tillConfigModal",
	},
	{
		id: "pesalink",
		name: "Bank / PesaLink",
		sub: "Equity ***4521 · PesaLink",
		icon: "bi-bank",
		iconBg: "var(--pm-purple-soft)",
		iconColor: "var(--pm-purple)",
		tier: "active",
		badge: "Active",
		badgeTone: "success",
		spark: "0,22 28,18 56,20 84,14 112,12 140,16 168,10 200,7",
		sparkColor: "#8B5CF6",
		collected: "KES 6.5M",
		successRate: "99.9% success",
		successTone: "success",
		action: "Configure",
		modal: "pesalinkConfigModal",
	},
	{
		id: "card",
		name: "Card Payments",
		sub: "Visa / Mastercard · Online",
		icon: "bi-credit-card",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		tier: "pending",
		badge: "Pending KYB",
		badgeTone: "warning",
		spark: "0,20 28,19 56,20 84,18 112,19 140,17 168,18 200,17",
		sparkColor: "#F59E0B",
		collected: "KES 980K",
		successRate: "91% success",
		successTone: "warning",
		action: "Complete Setup",
		modal: "cardConfigModal",
		primaryAction: true,
	},
	{
		id: "qr",
		name: "QR Code (KEQR)",
		sub: "Dynamic + static · all wallets",
		icon: "bi-qr-code",
		iconBg: "var(--pm-pink-soft)",
		iconColor: "var(--pm-pink)",
		tier: "active",
		badge: "Active",
		badgeTone: "success",
		spark: "0,18 28,22 56,15 84,18 112,13 140,15 168,10 200,8",
		sparkColor: "#EC4899",
		collected: "KES 640K",
		successRate: "96% success",
		successTone: "success",
		action: "Manage",
		modal: "generateQRModal",
	},
	{
		id: "links",
		name: "Payment Links",
		sub: "12 active links · paymo.biz/ts",
		icon: "bi-link-45deg",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		tier: "active",
		badge: "Active",
		badgeTone: "success",
		spark: "0,21 28,17 56,19 84,13 112,11 140,9 168,12 200,6",
		sparkColor: "#3B82F6",
		collected: "KES 1.1M",
		successRate: "94% success",
		successTone: "success",
		action: "New Link",
		modal: "createLinkModal",
	},
	{
		id: "ussd",
		name: "USSD",
		sub: "*123# · Feature-phone customers",
		icon: "bi-grid",
		iconBg: "var(--pm-surface-2)",
		iconColor: "var(--pm-muted)",
		tier: "available",
		badge: "Available",
		badgeTone: "info",
		spark: "",
		sparkColor: "",
		collected: "",
		successRate: "",
		successTone: "success",
		action: "Activate",
		modal: "ussdModal",
		primaryAction: true,
		note: "Not yet enabled. Reach customers without smartphones.",
	},
];

/* ---------- Invoice center ---------- */
export interface Invoice {
	id: string;
	customer: string;
	amount: string;
	status: InvoiceStatus;
	statusLabel: string;
	statusTone: Tone;
	issue: string;
	due: string;
	balance: string;
	viewed?: boolean;
}

export const INVOICES: Invoice[] = [
	{
		id: "INV-2025-142",
		customer: "Acme Corp",
		amount: "KES 150,000",
		status: "paid",
		statusLabel: "Paid",
		statusTone: "success",
		issue: "01 Oct",
		due: "15 Oct",
		balance: "KES 0",
		viewed: true,
	},
	{
		id: "INV-2025-148",
		customer: "Global Industries",
		amount: "KES 300,000",
		status: "partial",
		statusLabel: "Partially Paid",
		statusTone: "info",
		issue: "05 Oct",
		due: "20 Oct",
		balance: "KES 120,000",
	},
	{
		id: "INV-2025-131",
		customer: "StartUp Inc",
		amount: "KES 185,000",
		status: "overdue",
		statusLabel: "Overdue",
		statusTone: "danger",
		issue: "20 Sep",
		due: "05 Oct",
		balance: "KES 185,000",
	},
	{
		id: "INV-2025-125",
		customer: "Retail Chain A",
		amount: "KES 60,000",
		status: "overdue",
		statusLabel: "Overdue",
		statusTone: "danger",
		issue: "12 Sep",
		due: "27 Sep",
		balance: "KES 60,000",
	},
	{
		id: "INV-2025-150",
		customer: "Safari Lodges",
		amount: "KES 420,000",
		status: "sent",
		statusLabel: "Sent",
		statusTone: "warning",
		issue: "08 Oct",
		due: "22 Oct",
		balance: "KES 420,000",
	},
	{
		id: "INV-2025-151",
		customer: "—",
		amount: "KES 95,000",
		status: "draft",
		statusLabel: "Draft",
		statusTone: "dark",
		issue: "—",
		due: "—",
		balance: "KES 95,000",
	},
];

export const INVOICE_TABS: { key: InvoiceStatus | "all"; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "draft", label: "Draft" },
	{ key: "sent", label: "Sent" },
	{ key: "paid", label: "Paid" },
	{ key: "partial", label: "Partially Paid" },
	{ key: "overdue", label: "Overdue" },
];

export const CHANNEL_TABS: { key: ChannelTier | "all"; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "active", label: "Active" },
	{ key: "pending", label: "Pending Setup" },
	{ key: "available", label: "Available" },
];

/* ---------- Recurring & subscriptions ---------- */
export interface Subscription {
	customer: string;
	amount: string;
	frequency: string;
	next: string;
	lifetime: string;
	status: "Active" | "Paused";
	action: string;
}

export const SUBSCRIPTIONS: Subscription[] = [
	{
		customer: "Apex Retail Ltd",
		amount: "KES 5,000",
		frequency: "Monthly",
		next: "05 Nov",
		lifetime: "KES 45,000",
		status: "Active",
		action: "Manage",
	},
	{
		customer: "SaaS Suite — Gold",
		amount: "KES 45,000",
		frequency: "Annual",
		next: "15 Nov",
		lifetime: "KES 180,000",
		status: "Active",
		action: "Manage",
	},
	{
		customer: "Kilimani Properties",
		amount: "KES 120,000",
		frequency: "Monthly",
		next: "01 Nov",
		lifetime: "KES 1.2M",
		status: "Active",
		action: "Manage",
	},
	{
		customer: "Donor Monthly (12)",
		amount: "KES 96,000",
		frequency: "Monthly",
		next: "03 Nov",
		lifetime: "KES 480,000",
		status: "Paused",
		action: "Resume",
	},
];

/* ---------- Receivables & aging ---------- */
export interface AgingRow {
	customer: string;
	b030: string;
	b3160: string;
	b6190: string;
	b90: string;
	total: string;
	hi?: number;
	cr?: number;
}

export const AGING_ROWS: AgingRow[] = [
	{ customer: "Retail Chain A", b030: "KES 60K", b3160: "KES 0", b6190: "KES 40K", b90: "KES 20K", total: "KES 120K", hi: 2, cr: 3 },
	{ customer: "StartUp Inc", b030: "KES 90K", b3160: "KES 55K", b6190: "KES 40K", b90: "KES 0", total: "KES 185K", hi: 1 },
	{ customer: "Acme Corp", b030: "KES 120K", b3160: "KES 200K", b6190: "KES 100K", b90: "KES 0", total: "KES 420K", hi: 2 },
	{ customer: "Safari Lodges", b030: "KES 420K", b3160: "KES 0", b6190: "KES 0", b90: "KES 0", total: "KES 420K" },
];

export const AGING_TOTALS = { b030: "KES 690K", b3160: "KES 255K", b6190: "KES 180K", b90: "KES 20K", total: "KES 1.145M" };

/* ---------- QR & payment links ---------- */
export interface RowItem {
	a: string;
	b: string;
	c: string;
	d: string;
	status: string;
	statusTone: Tone;
}

export const QRS: RowItem[] = [
	{ a: "Dynamic · Counter", b: "KES 50K", c: "1,240", d: "KES 1.1M", status: "Active", statusTone: "success" },
	{ a: "Static · Shop", b: "Any", c: "3,500", d: "KES 640K", status: "Active", statusTone: "success" },
	{ a: "Product · Laptop X", b: "KES 85K", c: "120", d: "KES 340K", status: "Expiring", statusTone: "info" },
];

export const PAYMENT_LINKS: RowItem[] = [
	{ a: "paymo.biz/abc123", b: "KES 50K", c: "340", d: "KES 180K", status: "Active", statusTone: "success" },
	{ a: "paymo.biz/xyz789", b: "Any", c: "890", d: "KES 420K", status: "Active", statusTone: "success" },
	{ a: "paymo.biz/expired1", b: "KES 25K", c: "120", d: "KES 0", status: "Expired", statusTone: "danger" },
];

/* ---------- Refunds & disputes ---------- */
export interface Refund {
	id: string;
	txn: string;
	customer: string;
	amount: string;
	reason: string;
	status: string;
	statusTone: Tone;
	action: string;
}

export const REFUNDS: Refund[] = [
	{ id: "RFD-8821", txn: "MP-882910", customer: "Acme Corp", amount: "KES 25,000", reason: "Duplicate", status: "Approved", statusTone: "info", action: "Process" },
	{ id: "RFD-8822", txn: "CRD-44112", customer: "Safari Lodges", amount: "KES 48,000", reason: "Returned goods", status: "Awaiting Approval", statusTone: "warning", action: "Review" },
	{ id: "RFD-8823", txn: "MP-881001", customer: "StartUp Inc", amount: "KES 12,000", reason: "Overpayment", status: "Completed", statusTone: "success", action: "View" },
];

export interface Dispute {
	id: string;
	txn: string;
	amount: string;
	reason: string;
	deadline: string;
	deadlineTone: Tone | null;
	status: string;
	evidence: boolean;
}

export const DISPUTES: Dispute[] = [
	{ id: "DSP-301", txn: "CRD-44112", amount: "KES 48,000", reason: "Not received", deadline: "3 days", deadlineTone: "danger", status: "Under Review", evidence: true },
	{ id: "DSP-302", txn: "MP-881001", amount: "KES 12,000", reason: "Duplicate", deadline: "—", deadlineTone: null, status: "Won", evidence: false },
];

/* ---------- Fee calculator ---------- */
export interface FeeMethod {
	value: string;
	label: string;
	settlement: string;
}

export const FEE_METHODS: FeeMethod[] = [
	{ value: "0.5", label: "M-Pesa Paybill (0.5%)", settlement: "T+1" },
	{ value: "1", label: "M-Pesa Till (1%)", settlement: "T+1" },
	{ value: "2.5", label: "Card Online (2.5%)", settlement: "T+2" },
	{ value: "0", label: "PesaLink (0%)", settlement: "Instant" },
	{ value: "1.5", label: "QR (1.5%)", settlement: "T+1" },
	{ value: "2", label: "Payment Link (2%)", settlement: "T+1" },
];

export interface FeeScheduleRow {
	method: string;
	fee: string;
	minmax: string;
	settlement: string;
	why: string;
}

export const FEE_SCHEDULE: FeeScheduleRow[] = [
	{ method: "M-Pesa Paybill", fee: "0.5%", minmax: "KES 10 / 200", settlement: "T+1", why: "Safaricom 0.4% + PayMo 0.1%" },
	{ method: "M-Pesa Till", fee: "1%", minmax: "KES 10 / 500", settlement: "T+1", why: "Buy-goods rate" },
	{ method: "Card Online", fee: "2.5%", minmax: "KES 50 / 10,000", settlement: "T+2", why: "Visa/MC interchange + gateway" },
	{ method: "PesaLink", fee: "0%", minmax: "—", settlement: "Instant", why: "Bank to bank, free" },
	{ method: "QR (KEQR)", fee: "1.5%", minmax: "KES 10 / 500", settlement: "T+1", why: "All-wallet standard" },
	{ method: "Payment Link", fee: "2%", minmax: "KES 20 / 1,000", settlement: "T+1", why: "Includes link hosting" },
];

export interface FeeCompareRow {
	method: string;
	fee: string;
	receive: string;
	settlement: string;
	best?: boolean;
}

export const FEE_COMPARE: FeeCompareRow[] = [
	{ method: "M-Pesa Paybill", fee: "KES 250", receive: "KES 49,750", settlement: "T+1" },
	{ method: "M-Pesa Till", fee: "KES 500", receive: "KES 49,500", settlement: "T+1" },
	{ method: "PesaLink", fee: "KES 0", receive: "KES 50,000", settlement: "Instant", best: true },
	{ method: "Card Online", fee: "KES 1,250", receive: "KES 48,750", settlement: "T+2" },
	{ method: "QR", fee: "KES 750", receive: "KES 49,250", settlement: "T+1" },
	{ method: "Payment Link", fee: "KES 1,000", receive: "KES 49,000", settlement: "T+1" },
];

/* ---------- Notifications / reminders / history ---------- */
export interface Alert {
	tone: "warning" | "info" | "danger";
	title: string;
	desc: string;
}

export const NOTIFICATIONS: Alert[] = [
	{ tone: "warning", title: "Invoice overdue", desc: "StartUp Inc KES 185K" },
	{ tone: "info", title: "Payment received", desc: "KES 150K from Acme" },
	{ tone: "danger", title: "Refund needs approval", desc: "KES 48K" },
	{ tone: "info", title: "Card channel KYB ready", desc: "" },
];

export interface ReminderRecipient {
	label: string;
	checked: boolean;
}

export const REMINDER_RECIPIENTS: ReminderRecipient[] = [
	{ label: "StartUp Inc · KES 185K overdue", checked: true },
	{ label: "Retail Chain A · KES 120K overdue", checked: true },
	{ label: "Acme Corp · KES 300K partial", checked: false },
];

export const SUBSCRIPTION_HISTORY = [
	{ date: "05 Oct", invoice: "INV-2025-140", amount: "KES 5,000", status: "Paid", tone: "success" as Tone },
	{ date: "05 Sep", invoice: "INV-2025-132", amount: "KES 5,000", status: "Paid", tone: "success" as Tone },
];

/* ---------- Invoice wizard ---------- */
export interface Customer {
	name: string;
	initials: string;
	color: string;
	memo: string;
}

export const CUSTOMERS: Customer[] = [
	{ name: "Acme Corp", initials: "AC", color: "var(--pm-primary)", memo: "Last invoice 15 Sep · Outstanding KES 420K" },
	{ name: "Global Industries", initials: "GI", color: "var(--pm-info)", memo: "Last invoice 02 Oct" },
	{ name: "StartUp Inc", initials: "SI", color: "var(--pm-accent)", memo: "Outstanding KES 185K" },
];

export interface CatalogItem {
	name: string;
	price: string;
	vat: string;
}

export const CATALOG_ITEMS: CatalogItem[] = [
	{ name: "Laptop Pro X", price: "85,000", vat: "16% VAT" },
	{ name: "Consulting (hourly)", price: "15,000", vat: "16% VAT" },
];

export interface LineItem {
	desc: string;
	qty: number;
	unit: string;
	price: number;
	vat: "16% VAT" | "Exempt" | "0%";
}

export const INITIAL_LINE_ITEMS: LineItem[] = [
	{ desc: "IT Consulting Services", qty: 10, unit: "hrs", price: 15000, vat: "16% VAT" },
	{ desc: "Deployment", qty: 1, unit: "pcs", price: 30000, vat: "16% VAT" },
];
