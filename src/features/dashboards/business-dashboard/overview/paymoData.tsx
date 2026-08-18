/* ============================================================================
   PayMo Business — Command Center (legacy page 3.1)
   Shared typed data engine: every company carries its own dataset, so
   switching accounts re-renders the whole dashboard and modals.
   ========================================================================== */

export type BizType = "online" | "physical" | "hybrid";
export type Tone = "success" | "warning" | "danger" | "info" | "purple" | "dark";

export interface Kpi {
	cash: number;
	revenue: number;
	expenses: number;
	margin: number;
	cashTransit: number;
}
export interface MixItem { l: string; v: number; c: string; }
export interface AgingItem { l: string; v: number; c: string; bg: string; t: string; }
export interface Oblig { t: string; i: string; c: string; tc: string; v: string; d: string; }
export interface Tx {
	d: string; cat: string; st: string; stc: Tone; date: string; amt: number; dir: "in" | "out";
	ic: string; cc: string;
}
export interface Forecast { weeks: { v: number }[]; start: number; low: number; end: number; }
export interface TeamRow { initials: string; name: string; color: string; role: string; limit: string; stc: Tone; mfa: string; }
export interface Team { users: number; approvers: number; mfa: number; pending: number; rows: TeamRow[]; }
export interface ClientRow { name: string; country: string; outstanding: number; status: string; }
export interface Clients { total: number; repeat: number; top: ClientRow[]; rows: ClientRow[]; }
export interface Office { n: string; tag: string; city: string; p: string; st: string; }
export interface Analytics { visits: number; sessions: number; conversion: number; aov: number; channels: [string, number, string][]; }
export interface Region { flag: string; country: string; code: string; tz: string; clients: number; revenue: number; hq: boolean; }
export interface Currency { code: string; name: string; icon: string; bal: number; primary: boolean; }
export interface Bank { short: string; name: string; acct: string; color: string; status: string; tone: Tone; }
export interface VirtualAcct { id: string; desc: string; icon: string; }
export interface Tool { name: string; icon: string; color: string; status: "Connected" | "Not connected"; }
export interface Health { score: number; rows: [string, string, Tone][]; }

export interface Business {
	key: string;
	name: string;
	initials: string;
	color: string;
	meta: string;
	type: BizType;
	sector: string;
	kpi: Kpi;
	revenueMix: MixItem[];
	aging: AgingItem[];
	oblig: Oblig[];
	tx: Tx[];
	forecast: Forecast;
	team: Team;
	clients: Clients;
	offices: Office[];
	analytics: Analytics;
	regions: Region[];
	currencies: Currency[];
	banks: Bank[];
	virtual: VirtualAcct[];
	tools: Tool[];
	health: Health;
	groupCash: string;
	currenciesCount: number;
	bankCash: number;
}

/* ---------- helpers ---------- */
export const fmt = (n: number) => Number(n).toLocaleString("en-US");
export const shortM = (n: number) =>
	n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(0) + "K" : "" + n;

/* deterministic per-range series from a monthly baseline */
export type Range = "7d" | "30d" | "90d" | "1y";
export function TREND(rev: number, exp: number, range: Range) {
	if (range === "7d") {
		const l = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		return {
			labels: l,
			revenue: [rev * 0.7, rev * 0.9, rev * 0.8, rev * 1.1, rev * 1.3, rev * 1.15, rev * 1.0].map(x => Math.round(x / 30)),
			expenses: [exp * 0.6, exp * 0.8, exp * 0.9, exp * 0.75, exp * 1.0, exp * 0.9, exp * 0.7].map(x => Math.round(x / 30)),
		};
	}
	if (range === "30d") {
		const l = ["Wk1", "Wk2", "Wk3", "Wk4"];
		return {
			labels: l,
			revenue: [rev * 0.8, rev * 0.95, rev * 1.05, rev * 1.2].map(x => Math.round(x / 4)),
			expenses: [exp * 0.85, exp * 0.95, exp * 0.9, exp * 1.1].map(x => Math.round(x / 4)),
		};
	}
	if (range === "90d") {
		const l = ["Aug", "Sep", "Oct"];
		return {
			labels: l,
			revenue: [rev * 0.85, rev * 0.95, rev].map(x => Math.round(x)),
			expenses: [exp * 0.9, exp * 1.0, exp].map(x => Math.round(x)),
		};
	}
	const l = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
	const r = [0.7, 0.75, 0.8, 0.78, 0.85, 0.88, 0.82, 0.9, 0.95, 0.92, 1.0, 1.12];
	const e = [0.8, 0.85, 0.9, 0.82, 0.88, 0.92, 0.85, 0.9, 0.95, 0.9, 1.0, 1.05];
	return {
		labels: l,
		revenue: r.map(x => Math.round((rev * x) / 1.12)),
		expenses: e.map(x => Math.round((exp * x) / 1.05)),
	};
}

/* ---------- four companies ---------- */
export const BUSINESSES: Record<string, Business> = {
	techsol: {
		key: "techsol", name: "TechSolutions Ltd", initials: "TS", color: "#1E293B",
		meta: "KRA PIN: P051234567M · Reg: PVT-2022/10492", type: "online", sector: "IT Services",
		kpi: { cash: 2450000, revenue: 1820000, expenses: 940000, margin: 48.3, cashTransit: 850000 },
		revenueMix: [
			{ l: "Invoices Paid", v: 1200000, c: "var(--pm-primary)" },
			{ l: "M-Pesa Till", v: 420000, c: "var(--pm-accent)" },
			{ l: "Payment Links", v: 200000, c: "var(--pm-warning)" },
		],
		aging: [
			{ l: "0-30 Days", v: 420000, c: "var(--pm-accent)", bg: "var(--pm-accent-soft)", t: "#047857" },
			{ l: "31-60 Days", v: 185000, c: "var(--pm-warning)", bg: "var(--pm-warning-soft)", t: "#92400E" },
			{ l: "61-90+ Days", v: 145000, c: "var(--pm-danger)", bg: "var(--pm-danger-soft)", t: "#991B1B" },
		],
		oblig: [
			{ t: "Payroll Run — October", i: "bi-people", c: "var(--pm-danger-soft)", tc: "var(--pm-danger)", v: "450.5K", d: "due in 3 days" },
			{ t: "KRA VAT + PAYE Filing", i: "bi-bank", c: "var(--pm-warning-soft)", tc: "var(--pm-warning)", v: "169.5K", d: "due in 7 days" },
			{ t: "Supplier: OfficeMart", i: "bi-box", c: "var(--pm-info-soft)", tc: "var(--pm-info)", v: "120K", d: "due in 10 days" },
		],
		tx: [
			{ d: "Acme Corp — INV-2025-142", cat: "Invoice", st: "Paid", stc: "success", date: "Today", amt: 150000, dir: "in", ic: "bi-arrow-down-left", cc: "var(--pm-accent)" },
			{ d: "M-Pesa Till (Buy Goods)", cat: "Collections", st: "Settling", stc: "info", date: "Today", amt: 450000, dir: "in", ic: "bi-mobile", cc: "var(--pm-warning)" },
			{ d: "Supplier: AWS Hosting", cat: "Expense", st: "Pending Approval", stc: "warning", date: "Yesterday", amt: 85000, dir: "out", ic: "bi-arrow-up-right", cc: "var(--pm-danger)" },
			{ d: "Money Market Fund Deposit", cat: "Investment", st: "Sweep", stc: "purple", date: "Yesterday", amt: 500000, dir: "out", ic: "bi-bank", cc: "var(--pm-purple)" },
			{ d: "Global Industries — INV-2025-084", cat: "Invoice", st: "Overdue", stc: "danger", date: "12 Oct", amt: 60000, dir: "in", ic: "bi-receipt", cc: "var(--pm-info)" },
		],
		forecast: { weeks: [{ v: 280000 }, { v: -310000 }, { v: 340000 }, { v: -450000 }, { v: 310000 }, { v: -260000 }, { v: 420000 }, { v: -180000 }], start: 2450000, low: 1980000, end: 2800000 },
		team: {
			users: 4, approvers: 2, mfa: 3, pending: 1,
			rows: [
				{ initials: "AD", name: "Amina D.", color: "var(--pm-primary)", role: "Owner", limit: "Unlimited", stc: "success", mfa: "On" },
				{ initials: "PK", name: "Peter K.", color: "var(--pm-info)", role: "Fin Admin", limit: "KES 1M", stc: "success", mfa: "On" },
				{ initials: "SW", name: "Sarah W.", color: "var(--pm-warning)", role: "HR Mgr", limit: "KES 5M", stc: "success", mfa: "On" },
				{ initials: "JM", name: "John M.", color: "var(--pm-muted)", role: "Sales", limit: "Maker only", stc: "danger", mfa: "Pending" },
			],
		},
		clients: {
			total: 28, repeat: 64,
			top: [
				{ name: "Acme Corp", country: "KE", outstanding: 420000, status: "Risky" },
				{ name: "Global Industries", country: "UG", outstanding: 185000, status: "Active" },
				{ name: "StartUp Inc", country: "KE", outstanding: 145000, status: "Active" },
				{ name: "Retail Chain A", country: "TZ", outstanding: 60000, status: "New" },
				{ name: "Safari Lodges Ltd", country: "KE", outstanding: 0, status: "VIP" },
			],
			rows: [
				{ name: "Acme Corp", country: "KE", outstanding: 420000, status: "Risky" },
				{ name: "Global Industries", country: "UG", outstanding: 185000, status: "Active" },
				{ name: "StartUp Inc", country: "KE", outstanding: 145000, status: "Active" },
				{ name: "Retail Chain A", country: "TZ", outstanding: 60000, status: "New" },
			],
		},
		offices: [
			{ n: "Nairobi HQ", tag: "Head Office", city: "Nairobi", p: "Full team", st: "Active" },
			{ n: "Innovation Lab", tag: "Engineering", city: "Nairobi", p: "12 engineers", st: "Active" },
			{ n: "Sales Hub", tag: "Sales", city: "Kampala", p: "4 sales", st: "Active" },
		],
		analytics: {
			visits: 48200, sessions: 31700, conversion: 3.4, aov: 26500,
			channels: [["Organic", 34, "var(--pm-primary)"], ["Paid Ads", 22, "var(--pm-accent)"], ["Referral", 18, "var(--pm-warning)"], ["Direct", 26, "var(--pm-info)"]],
		},
		regions: [
			{ flag: "🇰🇪", country: "Kenya", code: "KE", tz: "Africa/Nairobi", clients: 12, revenue: 420000, hq: true },
			{ flag: "🇺🇬", country: "Uganda", code: "UG", tz: "Africa/Kampala", clients: 8, revenue: 185000, hq: false },
			{ flag: "🇹🇿", country: "Tanzania", code: "TZ", tz: "Africa/Dar_es_Salaam", clients: 5, revenue: 145000, hq: false },
			{ flag: "🇳🇬", country: "Nigeria", code: "NG", tz: "Africa/Lagos", clients: 3, revenue: 60000, hq: false },
		],
		currencies: [
			{ code: "KES", name: "Kenyan Shilling", icon: "bank", bal: 2450000, primary: true },
			{ code: "USD", name: "US Dollar", icon: "currency-dollar", bal: 12400, primary: false },
			{ code: "UGX", name: "Ugandan Shilling", icon: "currency-exchange", bal: 28000000, primary: false },
			{ code: "EUR", name: "Euro", icon: "currency-euro", bal: 9200, primary: false },
		],
		banks: [
			{ short: "Eq", name: "Equity Bank Ltd", acct: "***4521", color: "var(--pm-accent)", status: "Active", tone: "success" },
			{ short: "Kc", name: "KCB Bank Kenya", acct: "***2088", color: "var(--pm-warning)", status: "Active", tone: "success" },
			{ short: "St", name: "Stanbic Bank Kenya", acct: "***7731", color: "var(--pm-info)", status: "Active", tone: "success" },
			{ short: "Co", name: "Co-operative Bank", acct: "***9942", color: "var(--pm-primary)", status: "Pending Sync", tone: "warning" },
		],
		virtual: [
			{ id: "VA-88421", desc: "KES · M-Pesa Till", icon: "share" },
			{ id: "VA-77012", desc: "USD · Card Gateway", icon: "share" },
			{ id: "VA-55108", desc: "UGX · Paybill", icon: "share" },
			{ id: "VA-66203", desc: "KES · Paybill", icon: "share" },
			{ id: "VA-44010", desc: "EUR · IBAN", icon: "share" },
		],
		tools: [
			{ name: "WhatsApp", icon: "bi-whatsapp", color: "#25D366", status: "Connected" },
			{ name: "Instagram", icon: "bi-instagram", color: "#E1306C", status: "Connected" },
			{ name: "Facebook", icon: "bi-facebook", color: "#1877F2", status: "Connected" },
			{ name: "QuickBooks", icon: "bi-journal", color: "#2CA01C", status: "Connected" },
			{ name: "Shopify", icon: "bi-bag", color: "#95BF47", status: "Connected" },
			{ name: "Google Analytics", icon: "bi-graph-up", color: "#E37400", status: "Connected" },
			{ name: "Slack", icon: "bi-slack", color: "#4A154B", status: "Not connected" },
			{ name: "Mailchimp", icon: "bi-envelope-paper", color: "#FFE01B", status: "Not connected" },
		],
		health: {
			score: 92,
			rows: [["Liquidity Ratio", "Excellent", "success"], ["Collections Rate", "Needs Focus", "warning"], ["Compliance", "Action Reqd", "danger"], ["Profitability", "Strong", "success"]],
		},
		groupCash: "14.6M", currenciesCount: 3, bankCash: 8120500,
	},
	tslog: {
		key: "tslog", name: "TS Logistics & Delivery", initials: "TL", color: "#DC2626",
		meta: "KRA PIN: P051222456K · Reg: PVT-2021/08910", type: "physical", sector: "Logistics & Transport",
		kpi: { cash: 8100000, revenue: 3600000, expenses: 2450000, margin: 31.9, cashTransit: 1200000 },
		revenueMix: [
			{ l: "Contracts", v: 2100000, c: "var(--pm-primary)" },
			{ l: "Inter-state Haulage", v: 900000, c: "var(--pm-accent)" },
			{ l: "Warehousing", v: 600000, c: "var(--pm-warning)" },
		],
		aging: [
			{ l: "0-30 Days", v: 960000, c: "var(--pm-accent)", bg: "var(--pm-accent-soft)", t: "#047857" },
			{ l: "31-60 Days", v: 410000, c: "var(--pm-warning)", bg: "var(--pm-warning-soft)", t: "#92400E" },
			{ l: "61-90+ Days", v: 230000, c: "var(--pm-danger)", bg: "var(--pm-danger-soft)", t: "#991B1B" },
		],
		oblig: [
			{ t: "Fleet Insurance Renewal", i: "bi-truck", c: "var(--pm-danger-soft)", tc: "var(--pm-danger)", v: "680K", d: "due in 4 days" },
			{ t: "Driver Payroll — 48 staff", i: "bi-people", c: "var(--pm-warning-soft)", tc: "var(--pm-warning)", v: "1.2M", d: "due in 6 days" },
			{ t: "Fuel Supplier: TotalEnergies", i: "bi-fuel-pump", c: "var(--pm-info-soft)", tc: "var(--pm-info)", v: "450K", d: "due in 9 days" },
		],
		tx: [
			{ d: "Client: Retail Chain A — Freight", cat: "Contract", st: "Paid", stc: "success", date: "Today", amt: 1200000, dir: "in", ic: "bi-truck", cc: "var(--pm-accent)" },
			{ d: "Fuel — TotalEnergies", cat: "OpEx", st: "Paid", stc: "success", date: "Today", amt: 450000, dir: "out", ic: "bi-fuel-pump", cc: "var(--pm-danger)" },
			{ d: "Warehouse Rent — Mombasa", cat: "OpEx", st: "Settling", stc: "info", date: "Yesterday", amt: 280000, dir: "out", ic: "bi-box", cc: "var(--pm-warning)" },
			{ d: "Client: Safari Lodges", cat: "Contract", st: "Pending", stc: "warning", date: "Yesterday", amt: 340000, dir: "in", ic: "bi-arrow-down-left", cc: "var(--pm-accent)" },
		],
		forecast: { weeks: [{ v: 900000 }, { v: -1200000 }, { v: 1100000 }, { v: -650000 }, { v: 800000 }, { v: -400000 }, { v: 600000 }, { v: -350000 }], start: 8100000, low: 6900000, end: 9400000 },
		team: {
			users: 6, approvers: 3, mfa: 5, pending: 1,
			rows: [
				{ initials: "MD", name: "Moses O.", color: "var(--pm-primary)", role: "Owner", limit: "Unlimited", stc: "success", mfa: "On" },
				{ initials: "FN", name: "Faith N.", color: "var(--pm-info)", role: "Finance Admin", limit: "KES 3M", stc: "success", mfa: "On" },
				{ initials: "DM", name: "David M.", color: "var(--pm-warning)", role: "Ops Mgr", limit: "KES 2M", stc: "success", mfa: "On" },
				{ initials: "KO", name: "Kevin O.", color: "var(--pm-muted)", role: "Driver Lead", limit: "None", stc: "danger", mfa: "Pending" },
			],
		},
		clients: {
			total: 41, repeat: 71,
			top: [
				{ name: "Retail Chain A", country: "KE", outstanding: 960000, status: "VIP" },
				{ name: "Safari Lodges Ltd", country: "KE", outstanding: 410000, status: "VIP" },
				{ name: "Africa Foods Co", country: "UG", outstanding: 230000, status: "Active" },
				{ name: "Darwin Imports", country: "TZ", outstanding: 120000, status: "Active" },
				{ name: "Coast Cement", country: "KE", outstanding: 0, status: "Risky" },
			],
			rows: [
				{ name: "Retail Chain A", country: "KE", outstanding: 960000, status: "VIP" },
				{ name: "Safari Lodges Ltd", country: "KE", outstanding: 410000, status: "VIP" },
				{ name: "Africa Foods Co", country: "UG", outstanding: 230000, status: "Active" },
				{ name: "Darwin Imports", country: "TZ", outstanding: 120000, status: "Active" },
			],
		},
		offices: [
			{ n: "Mombasa Depot", tag: "Warehouse", city: "Mombasa", p: "28 staff", st: "Active" },
			{ n: "Kisumu Hub", tag: "Regional Office", city: "Kisumu", p: "12 staff", st: "Active" },
			{ n: "Kampala Branch", tag: "International", city: "Kampala", p: "15 staff", st: "Active" },
			{ n: "Dar es Salaam Depot", tag: "International", city: "Dar es Salaam", p: "9 staff", st: "Active" },
		],
		analytics: {
			visits: 12000, sessions: 8400, conversion: 12.1, aov: 120000,
			channels: [["Fleet CRM", 44, "var(--pm-primary)"], ["Direct", 26, "var(--pm-accent)"], ["WhatsApp", 20, "var(--pm-warning)"], ["Referral", 10, "var(--pm-info)"]],
		},
		regions: [
			{ flag: "🇰🇪", country: "Kenya", code: "KE", tz: "Africa/Nairobi", clients: 22, revenue: 1600000, hq: true },
			{ flag: "🇺🇬", country: "Uganda", code: "UG", tz: "Africa/Kampala", clients: 11, revenue: 410000, hq: false },
			{ flag: "🇹🇿", country: "Tanzania", code: "TZ", tz: "Africa/Dar_es_Salaam", clients: 8, revenue: 230000, hq: false },
		],
		currencies: [
			{ code: "KES", name: "Kenyan Shilling", icon: "bank", bal: 8100000, primary: true },
			{ code: "USD", name: "US Dollar", icon: "currency-dollar", bal: 28500, primary: false },
			{ code: "UGX", name: "Ugandan Shilling", icon: "currency-exchange", bal: 39000000, primary: false },
			{ code: "TZS", name: "Tanzanian Shilling", icon: "currency-exchange", bal: 46000000, primary: false },
		],
		banks: [
			{ short: "Eq", name: "Equity Bank Ltd", acct: "***7810", color: "var(--pm-accent)", status: "Active", tone: "success" },
			{ short: "St", name: "Stanbic Bank", acct: "***3384", color: "var(--pm-info)", status: "Active", tone: "success" },
			{ short: "Ab", name: "Absa Bank Kenya", acct: "***1204", color: "var(--pm-warning)", status: "Active", tone: "success" },
			{ short: "Cr", name: "CRDB Bank TZ", acct: "***5567", color: "var(--pm-primary)", status: "Pending Sync", tone: "warning" },
		],
		virtual: [
			{ id: "VA-90213", desc: "KES · Paybill", icon: "share" },
			{ id: "VA-66204", desc: "USD · SWIFT IBAN", icon: "share" },
			{ id: "VA-55190", desc: "UGX · Paybill", icon: "share" },
			{ id: "VA-33018", desc: "KES · M-Pesa Till", icon: "share" },
			{ id: "VA-22109", desc: "TZS · M-Pesa", icon: "share" },
		],
		tools: [
			{ name: "WhatsApp", icon: "bi-whatsapp", color: "#25D366", status: "Connected" },
			{ name: "Fleet Manager", icon: "bi-truck", color: "#2563EB", status: "Connected" },
			{ name: "Google Maps", icon: "bi-geo-alt", color: "#EA4335", status: "Connected" },
			{ name: "QuickBooks", icon: "bi-journal", color: "#2CA01C", status: "Connected" },
			{ name: "Sage", icon: "bi-calculator", color: "#00A650", status: "Not connected" },
		],
		health: {
			score: 84,
			rows: [["Liquidity Ratio", "Excellent", "success"], ["Collections Rate", "Good", "success"], ["Compliance", "Good", "success"], ["Fuel Cost Pressure", "Needs Focus", "warning"]],
		},
		groupCash: "14.6M", currenciesCount: 3, bankCash: 11200000,
	},
	tsretail: {
		key: "tsretail", name: "TS Retail Outlets", initials: "TR", color: "#F59E0B",
		meta: "KRA PIN: P051333456P · Reg: PVT-2020/05420", type: "hybrid", sector: "Retail & E-commerce",
		kpi: { cash: 3120000, revenue: 2700000, expenses: 1980000, margin: 26.7, cashTransit: 420000 },
		revenueMix: [
			{ l: "In-store Sales", v: 1400000, c: "var(--pm-primary)" },
			{ l: "Online Store", v: 900000, c: "var(--pm-accent)" },
			{ l: "M-Pesa Payments", v: 400000, c: "var(--pm-warning)" },
		],
		aging: [
			{ l: "0-30 Days", v: 520000, c: "var(--pm-accent)", bg: "var(--pm-accent-soft)", t: "#047857" },
			{ l: "31-60 Days", v: 180000, c: "var(--pm-warning)", bg: "var(--pm-warning-soft)", t: "#92400E" },
			{ l: "61-90+ Days", v: 90000, c: "var(--pm-danger)", bg: "var(--pm-danger-soft)", t: "#991B1B" },
		],
		oblig: [
			{ t: "Stock Replenishment", i: "bi-box-seam", c: "var(--pm-danger-soft)", tc: "var(--pm-danger)", v: "520K", d: "due in 5 days" },
			{ t: "Shop Rent — 3 branches", i: "bi-shop", c: "var(--pm-warning-soft)", tc: "var(--pm-warning)", v: "360K", d: "due in 8 days" },
			{ t: "Delivery Partner Settlement", i: "bi-bicycle", c: "var(--pm-info-soft)", tc: "var(--pm-info)", v: "140K", d: "due in 2 days" },
		],
		tx: [
			{ d: "Online Order #4481", cat: "E-commerce", st: "Paid", stc: "success", date: "Today", amt: 88000, dir: "in", ic: "bi-cart", cc: "var(--pm-accent)" },
			{ d: "Store POS — Westlands", cat: "In-store", st: "Settling", stc: "info", date: "Today", amt: 240000, dir: "in", ic: "bi-shop", cc: "var(--pm-warning)" },
			{ d: "Stock — Wholesale Mart", cat: "Inventory", st: "Paid", stc: "success", date: "Yesterday", amt: 320000, dir: "out", ic: "bi-box-seam", cc: "var(--pm-danger)" },
			{ d: "Delivery — Bolt Business", cat: "Logistics", st: "Pending", stc: "warning", date: "Yesterday", amt: 42000, dir: "out", ic: "bi-bicycle", cc: "var(--pm-info)" },
		],
		forecast: { weeks: [{ v: 650000 }, { v: -520000 }, { v: 700000 }, { v: -380000 }, { v: 620000 }, { v: -300000 }, { v: 580000 }, { v: -260000 }], start: 3120000, low: 2800000, end: 3300000 },
		team: {
			users: 3, approvers: 2, mfa: 3, pending: 0,
			rows: [
				{ initials: "AN", name: "Amina N.", color: "var(--pm-primary)", role: "Owner", limit: "Unlimited", stc: "success", mfa: "On" },
				{ initials: "BO", name: "Brian O.", color: "var(--pm-info)", role: "Store Mgr", limit: "KES 500K", stc: "success", mfa: "On" },
				{ initials: "CK", name: "Cynthia K.", color: "var(--pm-warning)", role: "E-com Admin", limit: "KES 1M", stc: "success", mfa: "On" },
			],
		},
		clients: {
			total: 1200, repeat: 55,
			top: [
				{ name: "Wholesale Mart", country: "KE", outstanding: 180000, status: "VIP" },
				{ name: "Online Shoppers", country: "KE", outstanding: 520000, status: "Active" },
				{ name: "Retail Chain A", country: "KE", outstanding: 90000, status: "Active" },
				{ name: "Darwin Imports", country: "TZ", outstanding: 0, status: "New" },
			],
			rows: [
				{ name: "Wholesale Mart", country: "KE", outstanding: 180000, status: "VIP" },
				{ name: "Online Shoppers", country: "KE", outstanding: 520000, status: "Active" },
				{ name: "Retail Chain A", country: "KE", outstanding: 90000, status: "Active" },
				{ name: "Darwin Imports", country: "TZ", outstanding: 0, status: "New" },
			],
		},
		offices: [
			{ n: "Westlands Store", tag: "Flagship", city: "Nairobi", p: "8 staff", st: "Active" },
			{ n: "Thika Road Mall", tag: "Branch", city: "Thika", p: "6 staff", st: "Active" },
			{ n: "Kampala City Store", tag: "Branch", city: "Kampala", p: "5 staff", st: "Active" },
		],
		analytics: {
			visits: 128000, sessions: 86000, conversion: 2.9, aov: 8200,
			channels: [["Direct", 30, "var(--pm-primary)"], ["Social", 27, "var(--pm-accent)"], ["Paid Ads", 24, "var(--pm-warning)"], ["Referral", 19, "var(--pm-info)"]],
		},
		regions: [
			{ flag: "🇰🇪", country: "Kenya", code: "KE", tz: "Africa/Nairobi", clients: 900, revenue: 790000, hq: true },
			{ flag: "🇺🇬", country: "Uganda", code: "UG", tz: "Africa/Kampala", clients: 180, revenue: 180000, hq: false },
			{ flag: "🇹🇿", country: "Tanzania", code: "TZ", tz: "Africa/Dar_es_Salaam", clients: 60, revenue: 52000, hq: false },
		],
		currencies: [
			{ code: "KES", name: "Kenyan Shilling", icon: "bank", bal: 3120000, primary: true },
			{ code: "USD", name: "US Dollar", icon: "currency-dollar", bal: 6800, primary: false },
			{ code: "UGX", name: "Ugandan Shilling", icon: "currency-exchange", bal: 9500000, primary: false },
			{ code: "EUR", name: "Euro", icon: "currency-euro", bal: 4100, primary: false },
		],
		banks: [
			{ short: "Eq", name: "Equity Bank Ltd", acct: "***9056", color: "var(--pm-accent)", status: "Active", tone: "success" },
			{ short: "Ab", name: "Absa Bank", acct: "***1177", color: "var(--pm-warning)", status: "Active", tone: "success" },
			{ short: "Co", name: "Co-operative Bank", acct: "***2308", color: "var(--pm-info)", status: "Active", tone: "success" },
			{ short: "Nc", name: "NCBA Bank", acct: "***6641", color: "var(--pm-primary)", status: "Pending Sync", tone: "warning" },
		],
		virtual: [
			{ id: "VA-33019", desc: "KES · M-Pesa Till", icon: "share" },
			{ id: "VA-22104", desc: "USD · Card Gateway", icon: "share" },
			{ id: "VA-11803", desc: "KES · Paybill", icon: "share" },
			{ id: "VA-99015", desc: "KES · STK Push", icon: "share" },
			{ id: "VA-77006", desc: "EUR · Card", icon: "share" },
		],
		tools: [
			{ name: "WhatsApp", icon: "bi-whatsapp", color: "#25D366", status: "Connected" },
			{ name: "Instagram", icon: "bi-instagram", color: "#E1306C", status: "Connected" },
			{ name: "Shopify", icon: "bi-bag", color: "#95BF47", status: "Connected" },
			{ name: "TikTok", icon: "bi-music-note-beamed", color: "#000000", status: "Connected" },
			{ name: "POS System", icon: "bi-display", color: "#6D28D9", status: "Connected" },
			{ name: "Google Analytics", icon: "bi-graph-up", color: "#E37400", status: "Not connected" },
		],
		health: {
			score: 78,
			rows: [["Liquidity Ratio", "Good", "success"], ["Collections Rate", "Good", "success"], ["Compliance", "Needs Focus", "warning"], ["Online Growth", "Strong", "success"]],
		},
		groupCash: "14.6M", currenciesCount: 3, bankCash: 4210000,
	},
	tsfound: {
		key: "tsfound", name: "TechSolutions Foundation", initials: "TF", color: "#3B82F6",
		meta: "KRA PIN: P051444456R · Reg: NGO/2023/00421", type: "online", sector: "Non-Profit",
		kpi: { cash: 2250000, revenue: 1300000, expenses: 980000, margin: 24.6, cashTransit: 150000 },
		revenueMix: [
			{ l: "Donations", v: 850000, c: "var(--pm-primary)" },
			{ l: "Grants", v: 300000, c: "var(--pm-accent)" },
			{ l: "Sponsorships", v: 150000, c: "var(--pm-warning)" },
		],
		aging: [
			{ l: "0-30 Days", v: 200000, c: "var(--pm-accent)", bg: "var(--pm-accent-soft)", t: "#047857" },
			{ l: "31-60 Days", v: 60000, c: "var(--pm-warning)", bg: "var(--pm-warning-soft)", t: "#92400E" },
			{ l: "61-90+ Days", v: 25000, c: "var(--pm-danger)", bg: "var(--pm-danger-soft)", t: "#991B1B" },
		],
		oblig: [
			{ t: "Project Grant Disbursement", i: "bi-heart", c: "var(--pm-danger-soft)", tc: "var(--pm-danger)", v: "300K", d: "due in 6 days" },
			{ t: "NGO Annual Filing", i: "bi-file-earmark-text", c: "var(--pm-warning-soft)", tc: "var(--pm-warning)", v: "Compliance", d: "due in 12 days" },
			{ t: "Partner Payment", i: "bi-people", c: "var(--pm-info-soft)", tc: "var(--pm-info)", v: "85K", d: "due in 4 days" },
		],
		tx: [
			{ d: "Donation — Anonymous", cat: "Donation", st: "Paid", stc: "success", date: "Today", amt: 250000, dir: "in", ic: "bi-heart", cc: "var(--pm-accent)" },
			{ d: "Grant — Gates Fund", cat: "Grant", st: "Settling", stc: "info", date: "Today", amt: 500000, dir: "in", ic: "bi-award", cc: "var(--pm-warning)" },
			{ d: "Community Program — Nairobi", cat: "Program", st: "Paid", stc: "success", date: "Yesterday", amt: 180000, dir: "out", ic: "bi-people", cc: "var(--pm-danger)" },
			{ d: "Office & Admin", cat: "OpEx", st: "Pending", stc: "warning", date: "Yesterday", amt: 65000, dir: "out", ic: "bi-house", cc: "var(--pm-warning)" },
		],
		forecast: { weeks: [{ v: 250000 }, { v: -180000 }, { v: 200000 }, { v: -120000 }, { v: 180000 }, { v: -90000 }, { v: 160000 }, { v: -110000 }], start: 2250000, low: 2140000, end: 2380000 },
		team: {
			users: 2, approvers: 1, mfa: 2, pending: 0,
			rows: [
				{ initials: "AD", name: "Amina D.", color: "var(--pm-primary)", role: "Admin", limit: "Unlimited", stc: "success", mfa: "On" },
				{ initials: "KO", name: "Khalid O.", color: "var(--pm-info)", role: "Treasurer", limit: "KES 1M", stc: "success", mfa: "On" },
			],
		},
		clients: {
			total: 340, repeat: 48,
			top: [
				{ name: "Gates Foundation", country: "US", outstanding: 0, status: "Grantor" },
				{ name: "UNICEF Kenya", country: "KE", outstanding: 0, status: "Grantor" },
				{ name: "Corporate Donors", country: "KE", outstanding: 250000, status: "Donor" },
				{ name: "Community Partners", country: "KE", outstanding: 0, status: "Partner" },
			],
			rows: [
				{ name: "Gates Foundation", country: "US", outstanding: 0, status: "Grantor" },
				{ name: "UNICEF Kenya", country: "KE", outstanding: 0, status: "Grantor" },
				{ name: "Corporate Donors", country: "KE", outstanding: 250000, status: "Donor" },
				{ name: "Community Partners", country: "KE", outstanding: 0, status: "Partner" },
			],
		},
		offices: [
			{ n: "Community Hub", tag: "Program Office", city: "Nairobi", p: "6 staff", st: "Active" },
			{ n: "Regional Field Office", tag: "Field", city: "Kisumu", p: "4 staff", st: "Active" },
		],
		analytics: {
			visits: 58000, sessions: 40000, conversion: 8.2, aov: 12000,
			channels: [["Organic", 40, "var(--pm-primary)"], ["Referral", 28, "var(--pm-accent)"], ["Social", 22, "var(--pm-warning)"], ["Direct", 10, "var(--pm-info)"]],
		},
		regions: [
			{ flag: "🇰🇪", country: "Kenya", code: "KE", tz: "Africa/Nairobi", clients: 180, revenue: 250000, hq: true },
			{ flag: "🇳🇬", country: "Nigeria", code: "NG", tz: "Africa/Lagos", clients: 60, revenue: 60000, hq: false },
			{ flag: "🇷🇼", country: "Rwanda", code: "RW", tz: "Africa/Kigali", clients: 40, revenue: 45000, hq: false },
		],
		currencies: [
			{ code: "KES", name: "Kenyan Shilling", icon: "bank", bal: 2250000, primary: true },
			{ code: "USD", name: "US Dollar", icon: "currency-dollar", bal: 18000, primary: false },
			{ code: "UGX", name: "Ugandan Shilling", icon: "currency-exchange", bal: 6000000, primary: false },
			{ code: "GBP", name: "British Pound", icon: "currency-pound", bal: 5200, primary: false },
		],
		banks: [
			{ short: "Eq", name: "Equity Bank Ltd", acct: "***5122", color: "var(--pm-accent)", status: "Active", tone: "success" },
			{ short: "St", name: "Stanbic Bank", acct: "***8845", color: "var(--pm-info)", status: "Active", tone: "success" },
			{ short: "Kc", name: "KCB Bank", acct: "***3319", color: "var(--pm-warning)", status: "Active", tone: "success" },
			{ short: "Ab", name: "Absa Bank", acct: "***7760", color: "var(--pm-primary)", status: "Pending Sync", tone: "warning" },
		],
		virtual: [
			{ id: "VA-11901", desc: "KES · Paybill", icon: "share" },
			{ id: "VA-00887", desc: "USD · Card Gateway", icon: "share" },
			{ id: "VA-55402", desc: "KES · M-Pesa Till", icon: "share" },
			{ id: "VA-33018", desc: "UGX · Paybill", icon: "share" },
			{ id: "VA-00901", desc: "GBP · IBAN", icon: "share" },
		],
		tools: [
			{ name: "WhatsApp", icon: "bi-whatsapp", color: "#25D366", status: "Connected" },
			{ name: "Facebook", icon: "bi-facebook", color: "#1877F2", status: "Connected" },
			{ name: "X (Twitter)", icon: "bi-twitter-x", color: "#000000", status: "Connected" },
			{ name: "Mailchimp", icon: "bi-envelope-paper", color: "#FFE01B", status: "Connected" },
			{ name: "DonorBox", icon: "bi-heart", color: "#F25F5C", status: "Not connected" },
		],
		health: {
			score: 88,
			rows: [["Liquidity Ratio", "Excellent", "success"], ["Collections Rate", "Good", "success"], ["Compliance", "Good", "success"], ["Program Spending", "On Track", "success"]],
		},
		groupCash: "14.6M", currenciesCount: 3, bankCash: 3200000,
	},
};

export const ORDER = ["techsol", "tslog", "tsretail", "tsfound"];
export const CUR_RATES: Record<string, number> = { KES: 1, USD: 129.5, UGX: 0.034, TZS: 0.049, EUR: 140.2, GBP: 164.8 };
