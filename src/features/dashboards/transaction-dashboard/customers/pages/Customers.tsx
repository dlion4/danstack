import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import CustomersModals from "../components/CustomersModals";
import styles from "../styles/customers.module.css";

/* ============================================================================
   PayMo Facilitator — Customers, Billing & Reminders
   Every customer across your linked businesses: KYC, payment methods,
   recurring bills, reminders and refunds. React + TypeScript + TanStack Query.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
type BizId = "all" | "land" | "co2";

const BIZ_NAMES = { land: "Land Buyers LTD", co2: "Company 2" } as const;

interface Customer {
	id: string;
	name: string;
	initials: string;
	avatar: string;
	type: "individual" | "business" | "psp";
	business: string;
	bizId: "land" | "co2";
	phone: string;
	email: string;
	whatsapp: string;
	county: string;
	town: string;
	address: string;
	kyc: { status: "Verified" | "Pending" | "Expiring"; level: 1 | 2 | 3; docs: string[]; expiry: string };
	payment: { mpesa?: string; card?: string; bank?: string; wallet?: string; primary: string };
	billing: {
		model: "One-off" | "Recurring" | "Auto-bill";
		plan: string;
		amount: string;
		frequency: string;
		nextDue: string;
		ends: string;
		failed: number;
		status: "Active" | "Paused";
	};
	reminder: { last: string; channel: "SMS" | "Email" | "WhatsApp"; count: number };
	lastPay: string;
	refs: string[];
}

interface Plan {
	customer: string;
	business: string;
	amount: string;
	frequency: string;
	duration: string;
	nextDue: string;
	status: "Active" | "Paused";
	failed: number;
}

interface RemTrigger {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	count: string;
	modal: string;
}

interface RefundRow {
	ref: string;
	customer: string;
	business: string;
	payment: string;
	amount: string;
	reason: string;
	status: string;
	tone: BadgeTone;
}

interface PermRow {
	title: string;
	sub: string;
	granted: boolean;
	pending?: boolean;
}

interface TicketRow {
	t: string;
	c: string;
	s: string;
	p: "High" | "Medium" | "Low";
	st: string;
	u: string;
}

interface CustomersConfig {
	pageTitle: string;
	pageSub: string;
	heroLive: string;
	heroValue: string;
	heroDetail: string;
	statCards: {
		key: string;
		colClass: string;
		label: string;
		labelColor: string;
		value: string;
		badge: { icon: string; text: string; tone: BadgeTone };
		lines: string[];
		attention?: boolean;
	}[];
	attention: RemTrigger[];
	suggestions: RemTrigger[];
	quickActions: { icon: string; label: string; color: string; modal: string }[];
	customers: Customer[];
	plans: Plan[];
	schedule: { day: string; expected: string; actual: string; pct: number; tone: string }[];
	paymentMethods: { customer: string; mpesa?: string; card?: string; bank?: string; wallet?: string; primary: string; verified: boolean }[];
	kycQueue: { customer: string; business: string; submitted: string; docs: string; risk: string; tone: BadgeTone }[];
	remTriggers: RemTrigger[];
	commLog: { to: string; channel: "SMS" | "Email" | "WhatsApp"; subject: string; when: string; status: string }[];
	refunds: RefundRow[];
	perms: PermRow[];
	tickets: TicketRow[];
	walletLinks: { name: string; sub: string; status: string; tone: BadgeTone }[];
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: CustomersConfig = {
	pageTitle: "Customers, Billing & Reminders",
	pageSub:
		"Every customer across your businesses — KYC records, payment methods, recurring bills, reminders and refunds.",
	heroLive: "Customer workspace live",
	heroValue: "239 customers across 2 businesses",
	heroDetail:
		"Land Buyers LTD 30 buyers • Company 2 209 retail • KYC 100% verified • 44 recurring plans",
	statCards: [
		{
			key: "total",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "TOTAL CUSTOMERS",
			labelColor: "var(--pm-accent)",
			value: "239",
			badge: { icon: "bi-people", text: "2 businesses", tone: "badgeS" },
			lines: ["30 Land Buyers LTD", "209 Company 2"],
		},
		{
			key: "plans",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "RECURRING PLANS",
			labelColor: "var(--pm-info)",
			value: "44",
			badge: { icon: "bi-calendar-check", text: "weekly 30 · monthly 14", tone: "badgeI" },
			lines: ["KES 2.84M billed / week", "3 paused this month"],
		},
		{
			key: "kyc",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "KYC VERIFIED",
			labelColor: "var(--pm-info)",
			value: "100%",
			badge: { icon: "bi-shield-check", text: "4 pending review", tone: "badgeW" },
			lines: ["Level 2 — 201 customers", "Level 3 — 38 customers"],
		},
		{
			key: "billings",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "NEXT 7-DAY BILLINGS",
			labelColor: "var(--pm-warning)",
			value: "KES 2.84M",
			badge: { icon: "bi-cash-stack", text: "38 due this week", tone: "badgeW" },
			lines: ["28 Land Buyers installments", "10 Company 2 orders"],
		},
		{
			key: "failed",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "FAILED PAYMENTS (30D)",
			labelColor: "var(--pm-danger)",
			value: "12",
			badge: { icon: "bi-exclamation-triangle", text: "KES 96K · 4 reminders", tone: "badgeD" },
			lines: ["8 insufficient funds", "4 declined / expired"],
			attention: true,
		},
		{
			key: "refunds",
			colClass: "col-lg-2 col-md-4 col-6",
			label: "REFUNDS THIS MONTH",
			labelColor: "var(--pm-purple)",
			value: "KES 41K",
			badge: { icon: "bi-arrow-counterclockwise", text: "8 issued", tone: "badgeP" },
			lines: ["5 full · 3 partial", "avg KES 5,125"],
		},
	],
	attention: [
		{
			icon: "bi-exclamation-circle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "PLT-088 payment failed — insufficient funds",
			sub: "Buyer • UK — 2nd attempt failed, reminder due now",
			count: "KES 45,000",
			modal: "sendReminderModal",
		},
		{
			icon: "bi-id-card",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "KYC expiry in 30 days — 4 buyers",
			sub: "ID documents expiring Aug — request re-upload",
			count: "4 customers",
			modal: "kycRecordModal",
		},
		{
			icon: "bi-arrow-counterclockwise",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Order #ORD-8899 refund pending",
			sub: "Company 2 — KES 48,200, awaiting your approval",
			count: "KES 48,200",
			modal: "issueRefundModal",
		},
	],
	suggestions: [
		{
			icon: "bi-calendar-plus",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Convert 12 one-off Land Buyers to weekly plans",
			sub: "Smoother cash flow ≈ KES 1.4M/mo extra collections",
			count: "12 buyers",
			modal: "openAccountModal",
		},
		{
			icon: "bi-bell",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Auto-remind failed payments at 9 AM",
			sub: "Recover ≈ KES 64K/mo from declined M-Pesa attempts",
			count: "64K/mo",
			modal: "commModal",
		},
		{
			icon: "bi-whatsapp",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Offer WhatsApp statements to 209 Company 2 customers",
			sub: "Cuts support tickets and call-ins for receipts",
			count: "209 cust",
			modal: "customerReportModal",
		},
	],
	quickActions: [
		{ icon: "bi-person-plus", label: "Onboard", color: "var(--pm-accent)", modal: "onboardCustomerModal" },
		{ icon: "bi-calendar-check", label: "New Billing Plan", color: "var(--pm-info)", modal: "openAccountModal" },
		{ icon: "bi-bell", label: "Send Reminder", color: "var(--pm-warning)", modal: "sendReminderModal" },
		{ icon: "bi-arrow-counterclockwise", label: "Issue Refund", color: "var(--pm-purple)", modal: "issueRefundModal" },
		{ icon: "bi-upload", label: "Bulk Import", color: "var(--pm-muted)", modal: "bulkUploadModal" },
		{ icon: "bi-shield-check", label: "KYC Queue", color: "var(--pm-info)", modal: "kycHealthModal" },
		{ icon: "bi-file-earmark-text", label: "Statements", color: "var(--pm-accent)", modal: "statementModal" },
		{ icon: "bi-headset", label: "Support", color: "var(--pm-warning)", modal: "supportTicketsModal" },
	],
	customers: [
		{
			id: "CUS-0001",
			name: "John Ochieng",
			initials: "JO",
			avatar: "#0f766e",
			type: "individual",
			business: "Land Buyers LTD",
			bizId: "land",
			phone: "+254 712 345 678",
			email: "john.o@gmail.com",
			whatsapp: "+254 712 345 678",
			county: "Kiambu",
			town: "Ruiru",
			address: "Plot 14, Kamiti Rd",
			kyc: { status: "Verified", level: 2, docs: ["ID Front", "ID Back"], expiry: "2027-03-01" },
			payment: { mpesa: "M-Pesa •••678", primary: "M-Pesa •••678" },
			billing: {
				model: "Recurring",
				plan: "Weekly installment",
				amount: "KES 1,250",
				frequency: "Weekly · 12 weeks",
				nextDue: "Fri 01 Aug",
				ends: "Oct 2025",
				failed: 0,
				status: "Active",
			},
			reminder: { last: "27 Jun 09:00", channel: "SMS", count: 3 },
			lastPay: "26 Jun",
			refs: ["PLT-082", "PLT-077"],
		},
		{
			id: "CUS-0002",
			name: "Amina Hassan",
			initials: "AH",
			avatar: "#7c3aed",
			type: "individual",
			business: "Land Buyers LTD",
			bizId: "land",
			phone: "+254 723 908 114",
			email: "amina.h@outlook.com",
			whatsapp: "+254 723 908 114",
			county: "Mombasa",
			town: "Nyali",
			address: "Apartment 3B, Links Rd",
			kyc: { status: "Verified", level: 3, docs: ["ID Front", "Passport", "Utility"], expiry: "2028-11-12" },
			payment: { card: "Visa ••4412", mpesa: "M-Pesa •••114", primary: "Visa ••4412" },
			billing: {
				model: "Auto-bill",
				plan: "Monthly installment",
				amount: "KES 18,500",
				frequency: "Monthly · 24 months",
				nextDue: "01 Aug",
				ends: "Mar 2026",
				failed: 1,
				status: "Active",
			},
			reminder: { last: "01 Jul 08:30", channel: "WhatsApp", count: 1 },
			lastPay: "01 Jul",
			refs: ["PLT-088", "PLT-081"],
		},
		{
			id: "CUS-0003",
			name: "Peter Njoroge",
			initials: "PN",
			avatar: "#0891b2",
			type: "individual",
			business: "Land Buyers LTD",
			bizId: "land",
			phone: "+254 734 221 980",
			email: "p.njoroge@yahoo.com",
			whatsapp: "+254 734 221 980",
			county: "Nairobi",
			town: "Kasarani",
			address: "Mwiki, Gate 5",
			kyc: { status: "Verified", level: 2, docs: ["ID Front", "ID Back"], expiry: "2026-05-20" },
			payment: { mpesa: "M-Pesa •••980", primary: "M-Pesa •••980" },
			billing: {
				model: "Recurring",
				plan: "Weekly installment",
				amount: "KES 2,400",
				frequency: "Weekly · 8 weeks",
				nextDue: "Thu 31 Jul",
				ends: "Sep 2025",
				failed: 2,
				status: "Active",
			},
			reminder: { last: "24 Jun 16:40", channel: "SMS", count: 4 },
			lastPay: "24 Jun",
			refs: ["PLT-073"],
		},
		{
			id: "CUS-0004",
			name: "Ruth Wambui",
			initials: "RW",
			avatar: "#d97706",
			type: "individual",
			business: "Land Buyers LTD",
			bizId: "land",
			phone: "+254 701 552 316",
			email: "ruth.wambui@gmail.com",
			whatsapp: "+254 701 552 316",
			county: "Nakuru",
			town: "Milimani",
			address: "Plot 8, Ngata Rd",
			kyc: { status: "Pending", level: 1, docs: ["ID Front"], expiry: "2026-09-02" },
			payment: { mpesa: "M-Pesa •••316", primary: "M-Pesa •••316" },
			billing: {
				model: "Recurring",
				plan: "Weekly installment",
				amount: "KES 1,750",
				frequency: "Weekly · 16 weeks",
				nextDue: "Fri 01 Aug",
				ends: "Nov 2025",
				failed: 0,
				status: "Active",
			},
			reminder: { last: "—", channel: "SMS", count: 0 },
			lastPay: "—",
			refs: [],
		},
		{
			id: "CUS-0101",
			name: "Nia Textiles",
			initials: "NT",
			avatar: "#16a34a",
			type: "business",
			business: "Company 2",
			bizId: "co2",
			phone: "+254 722 401 208",
			email: "orders@niatextiles.co.ke",
			whatsapp: "+254 722 401 208",
			county: "Nairobi",
			town: "Industrial Area",
			address: "Warehouse 12, Likoni Rd",
			kyc: { status: "Verified", level: 3, docs: ["CR12", "Directors", "Tax PIN"], expiry: "2027-01-15" },
			payment: { bank: "Equity ••4521", mpesa: "M-Pesa •••208", primary: "Bank ••4521" },
			billing: {
				model: "Auto-bill",
				plan: "Daily orders",
				amount: "KES 214,300",
				frequency: "Daily · open",
				nextDue: "Daily",
				ends: "—",
				failed: 1,
				status: "Active",
			},
			reminder: { last: "30 Jun 19:20", channel: "Email", count: 2 },
			lastPay: "30 Jun",
			refs: ["ORD-8891", "ORD-8884", "ORD-8879"],
		},
		{
			id: "CUS-0102",
			name: "Kibaki Hardware",
			initials: "KH",
			avatar: "#4f46e5",
			type: "business",
			business: "Company 2",
			bizId: "co2",
			phone: "+254 733 118 903",
			email: "sales@kibakihardware.co.ke",
			whatsapp: "+254 733 118 903",
			county: "Kisumu",
			town: "CBD",
			address: "Oginga Odinga St, Shop 3",
			kyc: { status: "Verified", level: 2, docs: ["ID", "Business Permit"], expiry: "2026-12-08" },
			payment: { mpesa: "M-Pesa •••903", primary: "M-Pesa •••903" },
			billing: {
				model: "One-off",
				plan: "Per order",
				amount: "KES 96,400",
				frequency: "On demand",
				nextDue: "—",
				ends: "—",
				failed: 0,
				status: "Active",
			},
			reminder: { last: "28 Jun 11:05", channel: "SMS", count: 1 },
			lastPay: "28 Jun",
			refs: ["ORD-8871"],
		},
		{
			id: "CUS-0103",
			name: "Zawadi Beauty Supply",
			initials: "ZB",
			avatar: "#db2777",
			type: "business",
			business: "Company 2",
			bizId: "co2",
			phone: "+254 745 662 441",
			email: "hello@zawadibeauty.com",
			whatsapp: "+254 745 662 441",
			county: "Nairobi",
			town: "Westlands",
			address: "Delta Towers, 2nd Flr",
			kyc: { status: "Verified", level: 2, docs: ["ID", "Tax PIN"], expiry: "2027-07-21" },
			payment: { card: "Visa ••8830", wallet: "Virtual Wallet", primary: "Visa ••8830" },
			billing: {
				model: "Auto-bill",
				plan: "Monthly retainer",
				amount: "KES 48,000",
				frequency: "Monthly",
				nextDue: "05 Aug",
				ends: "Dec 2025",
				failed: 0,
				status: "Active",
			},
			reminder: { last: "05 Jul 08:00", channel: "Email", count: 1 },
			lastPay: "05 Jul",
			refs: ["ORD-8896", "ORD-8890"],
		},
		{
			id: "CUS-0104",
			name: "Malik Foodstuff",
			initials: "MF",
			avatar: "#ca8a04",
			type: "business",
			business: "Company 2",
			bizId: "co2",
			phone: "+254 718 009 334",
			email: "malikfoods@gmail.com",
			whatsapp: "+254 718 009 334",
			county: "Mombasa",
			town: "Kongowea",
			address: "Market St, Stall 21",
			kyc: { status: "Expiring", level: 2, docs: ["ID", "Permit"], expiry: "2025-08-14" },
			payment: { mpesa: "M-Pesa •••334", primary: "M-Pesa •••334" },
			billing: {
				model: "One-off",
				plan: "Per order",
				amount: "KES 22,800",
				frequency: "On demand",
				nextDue: "—",
				ends: "—",
				failed: 0,
				status: "Active",
			},
			reminder: { last: "—", channel: "SMS", count: 0 },
			lastPay: "25 Jun",
			refs: ["ORD-8863"],
		},
		{
			id: "CUS-0005",
			name: "Grace Wanjiku Ltd",
			initials: "GW",
			avatar: "#059669",
			type: "psp",
			business: "Land Buyers LTD",
			bizId: "land",
			phone: "+254 711 830 275",
			email: "finance@gwanjiku.co.ke",
			whatsapp: "+254 711 830 275",
			county: "Nairobi",
			town: "Upper Hill",
			address: "Riverside Sq, 4th Flr",
			kyc: { status: "Verified", level: 3, docs: ["CR12", "Directors", "Compliance Q", "Bank Ref"], expiry: "2028-02-09" },
			payment: { bank: "Co-op ••7740", wallet: "Business Wallet", primary: "Bank ••7740" },
			billing: {
				model: "Recurring",
				plan: "Monthly PSP settlement",
				amount: "KES 340,000",
				frequency: "Monthly",
				nextDue: "01 Aug",
				ends: "—",
				failed: 0,
				status: "Active",
			},
			reminder: { last: "01 Jul 09:12", channel: "Email", count: 2 },
			lastPay: "01 Jul",
			refs: ["PLT-090", "PLT-085"],
		},
		{
			id: "CUS-0105",
			name: "Sunrise Restaurant",
			initials: "SR",
			avatar: "#e11d48",
			type: "business",
			business: "Company 2",
			bizId: "co2",
			phone: "+254 705 342 619",
			email: "sunrise.eats@gmail.com",
			whatsapp: "+254 705 342 619",
			county: "Nakuru",
			town: "CBD",
			address: "Kenyatta Ave, Ground Flr",
			kyc: { status: "Verified", level: 2, docs: ["ID", "Permit"], expiry: "2026-04-30" },
			payment: { mpesa: "M-Pesa •••619", primary: "M-Pesa •••619" },
			billing: {
				model: "Auto-bill",
				plan: "Daily supply",
				amount: "KES 12,400",
				frequency: "Daily",
				nextDue: "Daily",
				ends: "—",
				failed: 3,
				status: "Active",
			},
			reminder: { last: "29 Jun 07:55", channel: "SMS", count: 5 },
			lastPay: "29 Jun",
			refs: ["ORD-8869", "ORD-8862"],
		},
	],
	plans: [
		{ customer: "John Ochieng", business: "Land Buyers LTD", amount: "KES 1,250", frequency: "Weekly · 12 wks", duration: "Jul 30 — Oct 22", nextDue: "Fri 01 Aug", status: "Active", failed: 0 },
		{ customer: "Amina Hassan", business: "Land Buyers LTD", amount: "KES 18,500", frequency: "Monthly · 24 mo", duration: "Apr 24 — Mar 26", nextDue: "01 Aug", status: "Active", failed: 1 },
		{ customer: "Peter Njoroge", business: "Land Buyers LTD", amount: "KES 2,400", frequency: "Weekly · 8 wks", duration: "Jul 12 — Sep 06", nextDue: "Thu 31 Jul", status: "Active", failed: 2 },
		{ customer: "Nia Textiles", business: "Company 2", amount: "KES 214,300", frequency: "Daily · open", duration: "Continuous", nextDue: "Daily", status: "Active", failed: 1 },
		{ customer: "Zawadi Beauty", business: "Company 2", amount: "KES 48,000", frequency: "Monthly", duration: "Jan — Dec 2025", nextDue: "05 Aug", status: "Active", failed: 0 },
		{ customer: "Sunrise Restaurant", business: "Company 2", amount: "KES 12,400", frequency: "Daily", duration: "Continuous", nextDue: "Daily", status: "Paused", failed: 3 },
		{ customer: "Grace Wanjiku Ltd", business: "Land Buyers LTD", amount: "KES 340,000", frequency: "Monthly", duration: "Ongoing", nextDue: "01 Aug", status: "Active", failed: 0 },
	],
	schedule: [
		{ day: "Mon 28", expected: "KES 402K", actual: "KES 396K", pct: 98, tone: "var(--pm-accent)" },
		{ day: "Tue 29", expected: "KES 388K", actual: "KES 402K", pct: 104, tone: "var(--pm-accent)" },
		{ day: "Wed 30", expected: "KES 415K", actual: "KES 381K", pct: 92, tone: "var(--pm-warning)" },
		{ day: "Thu 31", expected: "KES 396K", actual: "KES 364K", pct: 92, tone: "var(--pm-warning)" },
		{ day: "Fri 01", expected: "KES 428K", actual: "—", pct: 0, tone: "var(--pm-info)" },
		{ day: "Sat 02", expected: "KES 190K", actual: "—", pct: 0, tone: "var(--pm-info)" },
		{ day: "Sun 03", expected: "KES 132K", actual: "—", pct: 0, tone: "var(--pm-info)" },
	],
	paymentMethods: [
		{ customer: "John Ochieng", mpesa: "•••678", primary: "M-Pesa", verified: true },
		{ customer: "Amina Hassan", mpesa: "•••114", card: "Visa ••4412", primary: "Card", verified: true },
		{ customer: "Peter Njoroge", mpesa: "•••980", primary: "M-Pesa", verified: true },
		{ customer: "Nia Textiles", mpesa: "•••208", bank: "Equity ••4521", primary: "Bank", verified: true },
		{ customer: "Zawadi Beauty", card: "Visa ••8830", wallet: "Virtual Wallet", primary: "Card", verified: true },
		{ customer: "Sunrise Restaurant", mpesa: "•••619", primary: "M-Pesa", verified: false },
		{ customer: "Grace Wanjiku Ltd", bank: "Co-op ••7740", wallet: "Business Wallet", primary: "Bank", verified: true },
	],
	kycQueue: [
		{ customer: "Ruth Wambui", business: "Land Buyers LTD", submitted: "29 Jul", docs: "ID Front", risk: "Low", tone: "badgeS" },
		{ customer: "Malik Foodstuff", business: "Company 2", submitted: "14 Jul", docs: "ID, Permit — expiring", risk: "Medium", tone: "badgeW" },
		{ customer: "Samuel Kipchoge", business: "Land Buyers LTD", submitted: "21 Jul", docs: "ID Front, Selfie", risk: "High", tone: "badgeD" },
	],
	remTriggers: [
		{ icon: "bi-arrow-repeat", iconBg: "var(--pm-accent-soft)", iconColor: "var(--pm-accent)", title: "Subscription / installment renewal", sub: "Auto-remind 3 days before next due date", count: "31 plans", modal: "sendReminderModal" },
		{ icon: "bi-exclamation-triangle", iconBg: "var(--pm-danger-soft)", iconColor: "var(--pm-danger)", title: "Failed payment — insufficient funds", sub: "Retry notice + top-up instruction on 2nd failure", count: "12 this month", modal: "sendReminderModal" },
		{ icon: "bi-pencil-square", iconBg: "var(--pm-info-soft)", iconColor: "var(--pm-info)", title: "Manual message", sub: "Compose SMS / Email / WhatsApp to any customer", count: "—", modal: "sendReminderModal" },
	],
	commLog: [
		{ to: "John Ochieng", channel: "SMS", subject: "Installment due Fri — KES 1,250", when: "27 Jun 09:00", status: "Delivered" },
		{ to: "Amina Hassan", channel: "WhatsApp", subject: "Top-up failed — retry M-Pesa payment", when: "01 Jul 08:30", status: "Delivered" },
		{ to: "Nia Textiles", channel: "Email", subject: "Invoice ORD-8891 & statement attached", when: "30 Jun 19:20", status: "Delivered" },
		{ to: "Sunrise Restaurant", channel: "SMS", subject: "3rd failed attempt — update payment method", when: "29 Jun 07:55", status: "Failed" },
		{ to: "Peter Njoroge", channel: "SMS", subject: "2nd attempt failed — KES 2,400 due", when: "24 Jun 16:40", status: "Delivered" },
	],
	refunds: [
		{ ref: "RF-2210", customer: "Zawadi Beauty", business: "Company 2", payment: "ORD-8890 · KES 48,200", amount: "KES 48,200", reason: "Duplicate charge", status: "Pending approval", tone: "badgeW" },
		{ ref: "RF-2209", customer: "John Ochieng", business: "Land Buyers LTD", payment: "PLT-077 · KES 1,250", amount: "KES 1,250", reason: "Overpaid installment", status: "Refunded", tone: "badgeS" },
		{ ref: "RF-2208", customer: "Nia Textiles", business: "Company 2", payment: "ORD-8884 · KES 214,300", amount: "KES 31,200", reason: "Partial order return", status: "Refunded", tone: "badgeS" },
		{ ref: "RF-2207", customer: "Peter Njoroge", business: "Land Buyers LTD", payment: "PLT-073 · KES 2,400", amount: "KES 2,400", reason: "Cancellation", status: "Refunded", tone: "badgeS" },
		{ ref: "RF-2206", customer: "Malik Foodstuff", business: "Company 2", payment: "ORD-8863 · KES 22,800", amount: "KES 5,000", reason: "Hardship waiver", status: "Pending approval", tone: "badgeW" },
	],
	perms: [
		{ title: "Generate statements & receipts", sub: "Per-customer statements, invoices, transaction receipts", granted: true },
		{ title: "Send reminders & messages", sub: "SMS / Email / WhatsApp on your behalf", granted: true },
		{ title: "Self-service payment portal", sub: "Customer manages own payment methods & plans", granted: true },
		{ title: "Edit billing & schedules", sub: "Adjust plans, amounts, next-due dates", granted: true },
		{ title: "Issue fee waivers & discounts", sub: "Waive fees on hardship or promotional cases", granted: false, pending: true },
		{ title: "Export customer KYC records", sub: "KYC document export for audits", granted: false, pending: true },
	],
	tickets: [
		{ t: "TKT-8821", c: "Peter Njoroge", s: "Payment failed twice — what happens next?", p: "Medium", st: "In Progress", u: "27 Jun" },
		{ t: "TKT-8834", c: "Zawadi Beauty", s: "Duplicate charge on ORD-8890", p: "High", st: "Open", u: "30 Jun" },
		{ t: "TKT-8847", c: "Ruth Wambui", s: "How do I upload my ID for verification?", p: "Low", st: "Awaiting Customer", u: "29 Jun" },
		{ t: "TKT-8851", c: "Sunrise Restaurant", s: "Request statement for June", p: "Low", st: "Closed", u: "25 Jun" },
	],
	walletLinks: [
		{ name: "M-Pesa (Business Till)", sub: "Refunds & payouts — last sync 2h ago", status: "Active", tone: "badgeS" },
		{ name: "Equity Bank (Payouts)", sub: "Bank transfers for PSP settlements", status: "Active", tone: "badgeS" },
		{ name: "Business Wallet", sub: "Internal paymo wallet for collections", status: "Linked", tone: "badgeI" },
	],
};

/* ---------- data fetch (falls back to mock on error) ---------- */
async function fetchCustomers(): Promise<CustomersConfig> {
	const res = await fetch("/api/customers", {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
	return (await res.json()) as CustomersConfig;
}

const AVATAR_FALLBACK = "#10b981";

function kycChip(status: Customer["kyc"]["status"]): { cls: string; label: string } {
	if (status === "Verified") return { cls: "chipAccent", label: "KYC Verified" };
	if (status === "Pending") return { cls: "chipWarn", label: "KYC Pending" };
	return { cls: "chipWarn", label: "KYC Expiring" };
}

function planChip(model: Customer["billing"]["model"]): { cls: string; icon: string } {
	if (model === "Recurring") return { cls: "chipAccent", icon: "bi-calendar-week" };
	if (model === "Auto-bill") return { cls: "chipInfo", icon: "bi-lightning-charge" };
	return { cls: "chipPurple", icon: "bi-receipt" };
}

function priorityTone(p: TicketRow["p"]): BadgeTone {
	if (p === "High") return "badgeD";
	if (p === "Medium") return "badgeW";
	return "badgeS";
}

export default function Customers() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["paymo-customers"],
		queryFn: fetchCustomers,
		retry: 1,
		staleTime: 60_000,
	});
	const config = data ?? initialMockData;

	const [errorDismissed, setErrorDismissed] = useState(false);
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [biz, setBiz] = useState<BizId>("all");
	const [world, setWorld] = useState<"directory" | "billing">("directory");
	const [kycTab, setKycTab] = useState<"pending" | "all">("pending");

	const openM = (id: string) => setActiveModal(id);
	const closeM = () => setActiveModal(null);

	const inScope = (bizId: "land" | "co2") => biz === "all" || biz === bizId;
	const scopedCustomers = config.customers.filter((c) => inScope(c.bizId));
	const scopedPlans = config.plans.filter((p) => inScope(p.business === "Land Buyers LTD" ? "land" : "co2"));
	const scopedRefunds = config.refunds.filter((r) => inScope(r.business === "Land Buyers LTD" ? "land" : "co2"));
	const scopedKyc = config.kycQueue.filter((k) => inScope(k.business === "Land Buyers LTD" ? "land" : "co2"));
	const bizLabel = biz === "all" ? "all businesses" : BIZ_NAMES[biz];

	return (
		<div className={styles.customersPage}>
			{/* ---------- query error banner ---------- */}
			{error && !errorDismissed && (
				<div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
					<strong>Could not load customer data.</strong> Showing the built-in defaults.{" "}
					<span className="text-decoration-underline">
						{String((error as Error).message ?? "")}
					</span>
					<button
						type="button"
						className="btn-close"
						aria-label="Close"
						onClick={() => setErrorDismissed(true)}
					/>
				</div>
			)}

			{/* ---------- loading overlay ---------- */}
			{isLoading && (
				<div className={styles.loadingOverlay}>
					<div className={styles.loadingBox}>
						<div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
						Loading customer workspace…
					</div>
				</div>
			)}

			<div className={styles.main}>
				{/* ======================= PAGE BAR ======================= */}
				<div className={styles.pageBar}>
					<div>
						<div className={styles.breadcrumb}>
							<span>
								<Link to="/">Home</Link> /{" "}
							</span>
							<span>
								<Link to="/pm/app">PayMo Hub</Link> /{" "}
							</span>
							<strong>{config.pageTitle}</strong>
						</div>
						<h2 className={styles.pageH2}>{config.pageTitle}</h2>
						<p className={styles.pageSub}>{config.pageSub}</p>
					</div>
					<div className="d-flex flex-wrap" style={{ gap: 8 }}>
						<button className={styles.btnPm} onClick={() => openM("sendReminderModal")}>
							<i className="bi bi-bell" /> Reminders
						</button>
						<button className={styles.btnPm} onClick={() => openM("bulkUploadModal")}>
							<i className="bi bi-upload" /> Bulk Import
						</button>
						<button className={styles.btnPm} onClick={() => openM("profileModal")}>
							JK
						</button>
						<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => openM("onboardCustomerModal")}>
							<i className="bi bi-person-plus" /> Onboard Customer
						</button>
					</div>
				</div>

				<div className={styles.content}>
					{/* ======================= CONNECTION BANNER ======================= */}
					<div className={styles.connBanner}>
						<div className="d-flex align-items-center" style={{ gap: 10 }}>
							<i className="bi bi-link-45deg" style={{ fontSize: 18 }} />
							<div>
								<strong>Customer directory linked</strong>{" "}
								<small>• M-Pesa &amp; card rails collecting for both businesses</small>
							</div>
						</div>
						<button className={styles.connBannerBtn} onClick={() => openM("linkExternalModal")}>
							<i className="bi bi-wallet2" /> Link Wallet
						</button>
					</div>

					{/* ======================= BUSINESS SELECTOR ======================= */}
					<div className={styles.bizBar}>
						<button
							type="button"
							className={`${styles.bizPill} ${biz === "all" ? styles.bizPillActive : ""}`}
							onClick={() => setBiz("all")}
						>
							All Businesses <span className={styles.bizCount}>239</span>
						</button>
						<button
							type="button"
							className={`${styles.bizPill} ${biz === "land" ? styles.bizPillActive : ""}`}
							onClick={() => setBiz("land")}
						>
							Land Buyers LTD <span className={styles.bizCount}>30</span>
						</button>
						<button
							type="button"
							className={`${styles.bizPill} ${biz === "co2" ? styles.bizPillActive : ""}`}
							onClick={() => setBiz("co2")}
						>
							Company 2 <span className={styles.bizCount}>209</span>
						</button>
					</div>

					{/* ======================= HERO + STATS ======================= */}
					<div className="row g-3">
						<div className="col-lg-4">
							<div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
								<p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.78)" }}>
									{config.heroLive} <span style={{ color: "#86efac" }}>●</span>
								</p>
								<div className={styles.sv} style={{ margin: "8px 0", color: "#fff", fontSize: 24 }}>
									{config.heroValue}
								</div>
								<p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.78)" }}>
									{config.heroDetail}
								</p>
								<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
									<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => openM("onboardCustomerModal")}>
										<i className="bi bi-person-plus" /> Onboard
									</button>
									<button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => openM("kycHealthModal")}>
										<i className="bi bi-shield-check" /> KYC Queue
									</button>
								</div>
							</div>
						</div>
						{config.statCards.map((card) => (
							<div className={card.colClass} key={card.key}>
								<div className={`${styles.card} ${card.attention ? styles.attentionCard : ""}`} style={{ minHeight: 170 }}>
									<p className={styles.sl} style={{ color: card.labelColor }}>
										{card.label}
									</p>
									<div className={styles.sv} style={{ margin: "6px 0" }}>
										{card.value}
									</div>
									<span className={`${styles.badge} ${styles[card.badge.tone]}`}>
										<i className={`bi ${card.badge.icon}`} /> {card.badge.text}
									</span>
									<div className="mt-2" style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}>
										{card.lines.map((l) => (
											<div key={l}>{l}</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* ======================= ATTENTION / SUGGESTIONS / QUICK ACTIONS ======================= */}
					<div className="row g-3 mt-1">
						<div className="col-lg-8">
							<div className={styles.card} style={{ height: "100%" }}>
								<div className="d-flex align-items-center justify-content-between" style={{ gap: 10 }}>
									<h3 className={styles.fwBold13} style={{ fontSize: 14, margin: 0 }}>
										<i className="bi bi-exclamation-octagon" style={{ color: "var(--pm-warning)" }} /> Needs your attention
									</h3>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("attentionModal")}>
										View all
									</button>
								</div>
								<div className="mt-2">
									{config.attention.map((a) => (
										<div className="d-flex align-items-center py-2" key={a.title} style={{ borderBottom: "1px dashed var(--pm-border)" }}>
											<div className={styles.iconCircle} style={{ background: a.iconBg, color: a.iconColor, width: 34, height: 34, marginRight: 10 }}>
												<i className={`bi ${a.icon}`} />
											</div>
											<div className="flex-grow-1" style={{ minWidth: 0 }}>
												<div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
												<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>{a.sub}</div>
											</div>
											<div style={{ fontSize: 12, fontWeight: 700, color: "var(--pm-ink-soft)", whiteSpace: "nowrap", marginRight: 10 }}>
												{a.count}
											</div>
											<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(a.modal)}>
												Act
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={styles.card} style={{ height: "100%" }}>
								<h3 className={styles.fwBold13} style={{ fontSize: 14 }}>
									<i className="bi bi-lightbulb" style={{ color: "var(--pm-accent)" }} /> Suggestions
								</h3>
								<div className="mt-2">
									{config.suggestions.map((s) => (
										<div className="d-flex align-items-start py-2" key={s.title} style={{ borderBottom: "1px dashed var(--pm-border)" }}>
											<div className={styles.iconCircle} style={{ background: s.iconBg, color: s.iconColor, width: 30, height: 30, marginRight: 10 }}>
												<i className={`bi ${s.icon}`} style={{ fontSize: 13 }} />
											</div>
											<div className="flex-grow-1" style={{ minWidth: 0 }}>
												<div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.title}</div>
												<div style={{ fontSize: 11.5, color: "var(--pm-muted)" }}>{s.sub}</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ======================= QUICK ACTIONS ======================= */}
					<div className={styles.card} style={{ marginTop: 16 }}>
						<div className={styles.quickGrid}>
							{config.quickActions.map((q) => (
								<button key={q.label} type="button" className={styles.quickBtn} onClick={() => openM(q.modal)}>
									<i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: 17 }} />
									{q.label}
								</button>
							))}
						</div>
					</div>

					{/* ======================= WORLD SWITCH ======================= */}
					<div className="mt-4 d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 12 }}>
						<div>
							<h3 className={styles.fwBold13} style={{ fontSize: 16, margin: 0 }}>
								<i className="bi bi-people" style={{ color: "var(--pm-accent)" }} /> Customer Directory — {bizLabel}
							</h3>
							<small style={{ color: "var(--pm-muted)" }}>
								Every customer across your businesses with their KYC, billing and payment health.
							</small>
						</div>
						<div className={styles.worldSwitch}>
							<button
								type="button"
								className={`${styles.worldBtn} ${world === "directory" ? styles.worldBtnActive : ""}`}
								onClick={() => setWorld("directory")}
							>
								<i className="bi bi-person-lines-fill" /> Customers
							</button>
							<button
								type="button"
								className={`${styles.worldBtn} ${world === "billing" ? styles.worldBtnActive : ""}`}
								onClick={() => setWorld("billing")}
							>
								<i className="bi bi-calendar-check" /> Billing &amp; Payments
							</button>
						</div>
					</div>

					{/* ======================= WORLD 1: CUSTOMER DIRECTORY ======================= */}
					{world === "directory" && (
						<div className="row g-3 mt-1">
							{scopedCustomers.map((c) => (
								<div className="col-lg-4 col-md-6" key={c.id}>
									<div className={styles.custCard}>
										<div className={styles.custTop}>
											<div className={styles.avatar} style={{ background: c.avatar || AVATAR_FALLBACK }}>
												{c.initials}
											</div>
											<div className="flex-grow-1" style={{ minWidth: 0 }}>
												<p className={styles.custName}>{c.name}</p>
												<div className={styles.custMeta}>
													{c.business} · {c.id} · {c.town}, {c.county}
												</div>
											</div>
											<span className={`${styles.chip} ${styles.chipAccent}`}>
												<i className="bi bi-tag" /> {c.bizId === "land" ? "PLT" : "ORD"}
											</span>
										</div>
										<div className={styles.custChips}>
											<span className={`${styles.chip} ${kycChip(c.kyc.status).cls}`}>
												<i className="bi bi-shield-check" /> {kycChip(c.kyc.status).label}
											</span>
											<span className={`${styles.chip} ${planChip(c.billing.model).cls}`}>
												<i className={`bi ${planChip(c.billing.model).icon}`} /> {c.billing.model}
											</span>
											<span className={styles.chip}>
												<i className="bi bi-phone" /> {c.payment.primary}
											</span>
											{c.billing.failed > 0 && (
												<span className={`${styles.chip} ${styles.chipDanger}`}>
													<i className="bi bi-exclamation-triangle" /> {c.billing.failed} failed
												</span>
											)}
										</div>
										{c.billing.model !== "One-off" ? (
											<div className={styles.planStrip}>
												<div className={styles.stripRow}>
													<i className="bi bi-calendar-event" style={{ color: "var(--pm-info)" }} />
													<strong style={{ fontSize: 12.5 }}>
														{c.billing.amount}
													</strong>
													<span style={{ color: "var(--pm-muted)" }}>{c.billing.frequency}</span>
													<span className={styles.dueToday}>Next {c.billing.nextDue}</span>
												</div>
												<div className={styles.stripRow}>
													<i className="bi bi-hourglass-split" style={{ color: "var(--pm-warning)" }} />
													<span style={{ color: "var(--pm-muted)" }}>Ends {c.billing.ends}</span>
													<span className={`${styles.badge} ${c.billing.status === "Active" ? styles.badgeS : styles.badgeW}`}>
														{c.billing.status}
													</span>
												</div>
											</div>
										) : (
											<div className={styles.stripRow}>
												<i className="bi bi-receipt" style={{ color: "var(--pm-purple)" }} />
												<span style={{ color: "var(--pm-muted)" }}>Last paid {c.lastPay}</span>
												<span className={styles.refId} style={{ marginLeft: "auto" }}>
													{c.refs.join(" · ") || c.id}
												</span>
											</div>
										)}
										<div className={styles.custActions}>
											<button type="button" className={styles.custAction} onClick={() => openM("customerDetailModal")}>
												<i className="bi bi-eye" /> View
											</button>
											<button type="button" className={styles.custAction} onClick={() => openM("sendReminderModal")}>
												<i className="bi bi-bell" /> Remind
											</button>
											<button type="button" className={styles.custAction} onClick={() => openM("issueRefundModal")}>
												<i className="bi bi-arrow-counterclockwise" /> Refund
											</button>
											<button type="button" className={styles.custAction} onClick={() => openM("kycRecordModal")}>
												<i className="bi bi-shield-check" /> KYC
											</button>
										</div>
									</div>
								</div>
							))}
							{scopedCustomers.length === 0 && (
								<div className="col-12">
									<div className={styles.card} style={{ textAlign: "center", padding: 28 }}>
										<i className="bi bi-people" style={{ fontSize: 26, color: "var(--pm-muted)" }} />
										<p className="mb-1" style={{ fontWeight: 600 }}>No customers for {bizLabel}</p>
										<small style={{ color: "var(--pm-muted)" }}>Switch business or onboard a new customer.</small>
									</div>
								</div>
							)}
						</div>
					)}

					{/* ======================= WORLD 2: BILLING & PAYMENTS ======================= */}
					{world === "billing" && (
						<>
							{/* Recurring plans board */}
							<div className="mt-2 d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 10 }}>
								<h3 className={styles.fwBold13} style={{ fontSize: 15, margin: 0 }}>
									<i className="bi bi-calendar-check" style={{ color: "var(--pm-info)" }} /> Recurring Plans
								</h3>
								<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("openAccountModal")}>
									<i className="bi bi-plus" /> New Billing Plan
								</button>
							</div>
							<div className="row g-3 mt-1">
								{scopedPlans.map((p) => (
									<div className="col-lg-4 col-md-6" key={`${p.customer}-${p.amount}`}>
										<div className={styles.planCard}>
											<div className={styles.planHead}>
												<p className={styles.planName}>{p.customer}</p>
												<span className={`${styles.badge} ${p.status === "Active" ? styles.badgeS : styles.badgeW}`}>
													{p.status}
												</span>
											</div>
											<div className={styles.planAmt}>{p.amount}</div>
											<div className={styles.planMeta}>
												<i className="bi bi-arrow-repeat" /> {p.frequency} · {p.duration}
											</div>
											<div className={styles.planMeta}>
												<i className="bi bi-calendar-event" /> Next due <strong style={{ color: "var(--pm-ink)" }}>{p.nextDue}</strong>
												{p.failed > 0 && (
													<span style={{ color: "var(--pm-danger)", fontWeight: 700 }}> · {p.failed} failed</span>
												)}
											</div>
											<div className={styles.planActions}>
												<button type="button" className={styles.planAction} onClick={() => openM("billingPlanDetailModal")}>
													<i className="bi bi-eye" /> Detail
												</button>
												<button type="button" className={styles.planAction} onClick={() => openM("closeAccountModal")}>
													<i className="bi bi-pause" /> Pause
												</button>
												<button type="button" className={styles.planAction} onClick={() => openM("sendReminderModal")}>
													<i className="bi bi-bell" /> Remind
												</button>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Payment schedule strip */}
							<div className={`${styles.card} mt-4`}>
								<h3 className={styles.fwBold13} style={{ fontSize: 15 }}>
									<i className="bi bi-graph-up-arrow" style={{ color: "var(--pm-accent)" }} /> Next 7-Day Collections — expected vs actual
								</h3>
								<div className="row g-3 mt-1">
									{config.schedule.map((s) => (
										<div className="col-lg-3 col-md-4 col-6" key={s.day}>
											<div style={{ fontSize: 12, fontWeight: 700 }}>{s.day}</div>
											<div className="d-flex justify-content-between mt-1" style={{ fontSize: 11.5 }}>
												<span style={{ color: "var(--pm-muted)" }}>Exp {s.expected}</span>
												<span style={{ color: "var(--pm-info)", fontWeight: 600 }}>{s.actual}</span>
											</div>
											<div className={styles.stripBar} style={{ marginTop: 6 }}>
												<div className={styles.stripFill} style={{ width: `${s.pct}%`, background: s.tone }} />
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Payment methods */}
							<div className={`${styles.card} mt-4`}>
								<div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 10 }}>
									<h3 className={styles.fwBold13} style={{ fontSize: 15, margin: 0 }}>
										<i className="bi bi-credit-card-2-front" style={{ color: "var(--pm-info)" }} /> Payment Methods on File
									</h3>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("newPaymentMethodModal")}>
										<i className="bi bi-plus-circle" /> Add Method
									</button>
								</div>
								<div className="table-responsive mt-2">
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Customer</th>
												<th>M-Pesa</th>
												<th>Card</th>
												<th>Bank</th>
												<th>Wallet</th>
												<th>Primary</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											{config.paymentMethods.map((m) => (
												<tr key={m.customer}>
													<td style={{ fontWeight: 600 }}>{m.customer}</td>
													<td>{m.mpesa ?? <span style={{ color: "var(--pm-muted)" }}>—</span>}</td>
													<td>{m.card ?? <span style={{ color: "var(--pm-muted)" }}>—</span>}</td>
													<td>{m.bank ?? <span style={{ color: "var(--pm-muted)" }}>—</span>}</td>
													<td>{m.wallet ?? <span style={{ color: "var(--pm-muted)" }}>—</span>}</td>
													<td>
														<span className={`${styles.chip} ${styles.chipAccent}`}>
															<i className="bi bi-check2-circle" /> {m.primary}
														</span>
													</td>
													<td>
														<span className={`${styles.chip} ${m.verified ? styles.chipAccent : styles.chipWarn}`}>
															{m.verified ? "Verified" : "Unverified"}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</>
					)}

					{/* ======================= KYC RECORDS & LOCATION ======================= */}
					<div className="row g-3 mt-4">
						<div className="col-lg-7">
							<div className={styles.card} style={{ height: "100%" }}>
								<div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 10 }}>
									<h3 className={styles.fwBold13} style={{ fontSize: 15, margin: 0 }}>
										<i className="bi bi-shield-check" style={{ color: "var(--pm-info)" }} /> KYC Queue &amp; Records
									</h3>
									<div className="d-flex" style={{ gap: 6 }}>
										<button
											type="button"
											className={`${styles.pill} ${kycTab === "pending" ? styles.pillActive : ""}`}
											onClick={() => setKycTab("pending")}
										>
											Pending ({scopedKyc.length})
										</button>
										<button
											type="button"
											className={`${styles.pill} ${kycTab === "all" ? styles.pillActive : ""}`}
											onClick={() => setKycTab("all")}
										>
											All Records
										</button>
									</div>
								</div>
								<div className="table-responsive mt-2">
									<table className={styles.tbl}>
										<thead>
											<tr>
												<th>Customer</th>
												<th>Business</th>
												<th>Submitted</th>
												<th>Documents</th>
												<th>Risk</th>
												<th />
											</tr>
										</thead>
										<tbody>
											{(kycTab === "pending" ? scopedKyc : scopedCustomers).map((k) => {
												const cust = k as Customer;
												const queue = k as (typeof config.kycQueue)[number];
												return (
													<tr key={cust.id ?? queue.customer}>
														<td style={{ fontWeight: 600 }}>{cust.name ?? queue.customer}</td>
														<td>{cust.business ?? queue.business}</td>
														<td>{queue.submitted ?? "Verified"}</td>
														<td>{(queue.docs ?? cust.kyc.docs.join(", "))}</td>
														<td>
															<span className={`${styles.badge} ${queue.tone ? styles[queue.tone] : styles.badgeS}`}>
																	{queue.risk ?? cust.kyc.status}
																</span>
														</td>
														<td>
															<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("kycReviewModal")}>
																Review
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>								<div className="d-flex flex-wrap align-items-center justify-content-between mt-2" style={{ gap: 8 }}>
									<small style={{ color: "var(--pm-muted)" }}>
										<i className="bi bi-info-circle" /> 201 customers at Level 2, 38 at Level 3.
									</small>
									<div className="d-flex flex-wrap" style={{ gap: 6 }}>
										<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("bulkKycApproveModal")}>
											<i className="bi bi-check2-all" /> Auto-approve 18 low-risk
										</button>
										<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("amlReviewModal")}>
											<i className="bi bi-shield-exclamation" /> AML Review
										</button>
										<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("kycHealthModal")}>
											View KYC health →
										</button>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={styles.kycBlock} style={{ height: "100%" }}>
								<h3 className={styles.fwBold13} style={{ fontSize: 15, marginBottom: 10 }}>
									<i className="bi bi-geo-alt" style={{ color: "var(--pm-accent)" }} /> Verified Location — {bizLabel}
								</h3>
								{scopedCustomers.slice(0, 3).map((c) => (
									<div key={c.id} className="mb-2">
										<div style={{ fontSize: 13, fontWeight: 700 }}>
											{c.name}
											<span className={`${styles.chip} ${styles.chipInfo}`} style={{ marginLeft: 8 }}>
												{c.county} · {c.town}
											</span>
										</div>
										<div className={styles.locRow}>
											<i className="bi bi-pin-map" />
											{c.address}
											<button
												type="button"
												className={`${styles.btnPm} ${styles.btnSm}`}
												style={{ marginLeft: "auto" }}
												onClick={() => openM("locationVerifyModal")}
											>
												Verify
											</button>
										</div>
									</div>
								))}
								<div className={styles.kycDoc} style={{ marginTop: 12 }}>
									<i className="bi bi-file-earmark-person" />
									<div>
										<div style={{ fontSize: 12.5, fontWeight: 700 }}>KYC documents on file</div>
										<div style={{ fontSize: 11.5, color: "var(--pm-muted)" }}>
											ID, Passport, CR12, Utility — 100% capture rate
										</div>
									</div>
									<button className={`${styles.btnPm} ${styles.btnSm}`} style={{ marginLeft: "auto" }} onClick={() => openM("kycRecordModal")}>
										Open
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= REMINDERS & COMMUNICATION ======================= */}
					<div className="row g-3 mt-1">
						<div className="col-lg-7">
							<div className={styles.card} style={{ height: "100%" }}>
								<h3 className={styles.fwBold13} style={{ fontSize: 15 }}>
									<i className="bi bi-bell" style={{ color: "var(--pm-warning)" }} /> Reminder Triggers
								</h3>
								<div className="mt-2">
									{config.remTriggers.map((r) => (
										<div className={styles.remCard} key={r.title} style={{ marginBottom: 8 }}>
											<div className={styles.remIcon} style={{ background: r.iconBg, color: r.iconColor }}>
												<i className={`bi ${r.icon}`} />
											</div>
											<div className={styles.remBody}>
												<p className={styles.remTitle}>{r.title}</p>
												<div className={styles.remSub}>{r.sub}</div>
											</div>
											<span className={`${styles.chip} ${styles.chipInfo}`}>{r.count}</span>
											<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM(r.modal)}>
												Compose
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={styles.card} style={{ height: "100%" }}>
								<div className="d-flex align-items-center justify-content-between" style={{ gap: 10 }}>
									<h3 className={styles.fwBold13} style={{ fontSize: 15, margin: 0 }}>
										<i className="bi bi-chat-dots" style={{ color: "var(--pm-accent)" }} /> Communication Log
									</h3>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("commModal")}>
										<i className="bi bi-sliders" /> Preferences
									</button>
								</div>
								<div className="mt-2">
									{config.commLog.map((l) => (
										<div className={styles.remCard} key={`${l.to}-${l.when}`} style={{ marginBottom: 8, padding: "10px 12px" }}>
											<div className={styles.remBody}>
												<p className={styles.remTitle} style={{ fontSize: 12.5 }}>
													{l.to} — {l.subject}
												</p>
												<div className={styles.remSub}>{l.when}</div>
											</div>
											<span className={`${styles.channelPill} ${l.channel === "SMS" ? styles.channelSms : l.channel === "WhatsApp" ? styles.channelWa : styles.channelMail}`}>
												<i className={`bi ${l.channel === "SMS" ? "bi-chat-left-text" : l.channel === "WhatsApp" ? "bi-whatsapp" : "bi-envelope"}`} /> {l.channel}
											</span>
											<span className={`${styles.chip} ${l.status === "Delivered" ? styles.chipAccent : styles.chipDanger}`}>
												{l.status}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ======================= REFUNDS ======================= */}
					<div className={styles.card} style={{ marginTop: 16 }}>
						<div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 10 }}>
							<h3 className={styles.fwBold13} style={{ fontSize: 15, margin: 0 }}>
								<i className="bi bi-arrow-counterclockwise" style={{ color: "var(--pm-purple)" }} /> Refunds — {bizLabel}
							</h3>
							<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("issueRefundModal")}>
								<i className="bi bi-plus" /> Issue Refund
							</button>
						</div>
						<div className="table-responsive mt-2">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Ref</th>
										<th>Customer</th>
										<th>Original Payment</th>
										<th>Amount</th>
										<th>Reason</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{scopedRefunds.map((r) => (
										<tr key={r.ref}>
											<td className={styles.refId}>{r.ref}</td>
											<td style={{ fontWeight: 600 }}>{r.customer}</td>
											<td>{r.payment}</td>
											<td style={{ fontWeight: 700 }}>{r.amount}</td>
											<td>{r.reason}</td>
											<td>
												<span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<small style={{ color: "var(--pm-muted)" }}>
							<i className="bi bi-info-circle" /> Refunds reduce your Fees-page profit by the refunded amount + PayMo fee.
						</small>
					</div>

					{/* ======================= PERMISSIONS & REPORTS ======================= */}
					<div className="row g-3 mt-1">
						<div className="col-lg-6">
							<div className={styles.card} style={{ height: "100%" }}>
								<h3 className={styles.fwBold13} style={{ fontSize: 15 }}>
									<i className="bi bi-shield-lock" style={{ color: "var(--pm-purple)" }} /> My Customer Permissions
								</h3>
								<div className="mt-2">
									{config.perms.map((p) => (
										<div className={styles.permItem} key={p.title}>
											<span className={`${styles.permDot} ${p.granted ? styles.permOk : styles.permPending}`} />
											<div style={{ minWidth: 0 }}>
												<div className={styles.permTitle} style={{ fontSize: 13 }}>{p.title}</div>
												<div className={styles.permSub}>{p.sub}</div>
											</div>
											{p.granted ? (
												<span className={`${styles.badge} ${styles.badgeS}`}>Granted</span>
											) : (
												<button type="button" className={styles.permReq} onClick={() => openM("permissionModal")}>
													Request
												</button>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-6">
							<div className={styles.card} style={{ height: "100%" }}>
								<h3 className={styles.fwBold13} style={{ fontSize: 15 }}>
									<i className="bi bi-file-earmark-bar-graph" style={{ color: "var(--pm-info)" }} /> Reports, Receipts &amp; Audit Trail
								</h3>
								<div className="mt-2">
									{["Per-customer statements", "Transaction receipts", "Billing & reminder reports", "Refund audit trail"].map((r) => (
										<div className={styles.permItem} key={r}>
											<span className={`${styles.permDot} ${styles.permOk}`} />
											<div className={styles.permTitle} style={{ fontSize: 13 }}>{r}</div>
											<span className={`${styles.chip} ${styles.chipInfo}`} style={{ marginLeft: "auto" }}>
												Ready
											</span>
										</div>
									))}
								</div>
								<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("customerReportModal")}>
										<i className="bi bi-file-earmark-text" /> Generate Receipt
									</button>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("statementModal")}>
										<i className="bi bi-receipt" /> Statement
									</button>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("reportModal")}>
										<i className="bi bi-bar-chart" /> Reports
									</button>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("caseExportModal")}>
										<i className="bi bi-box-arrow-down" /> Export
									</button>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("feeCalcModal")}>
										<i className="bi bi-calculator" /> Fee Preview
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* ======================= SUPPORT TICKETS ======================= */}
					<div className={styles.card} style={{ marginTop: 16 }}>
						<div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 10 }}>
							<h3 className={styles.fwBold13} style={{ fontSize: 15, margin: 0 }}>
								<i className="bi bi-headset" style={{ color: "var(--pm-warning)" }} /> Support Tickets
							</h3>
							<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("createTicketModal")}>
								<i className="bi bi-plus" /> New Ticket
							</button>
						</div>
						<div className="table-responsive mt-2">
							<table className={styles.tbl}>
								<thead>
									<tr>
										<th>Ticket</th>
										<th>Customer</th>
										<th>Subject</th>
										<th>Priority</th>
										<th>Status</th>
										<th>Updated</th>
									</tr>
								</thead>									<tbody>
										{config.tickets.map((t) => (
											<tr key={t.t} style={{ cursor: "pointer" }} onClick={() => openM("ticketDetailModal")}>
												<td className={styles.refId}>{t.t}</td>
												<td style={{ fontWeight: 600 }}>{t.c}</td>
												<td>{t.s}</td>
												<td>
													<span className={`${styles.badge} ${styles[priorityTone(t.p)]}`}>{t.p}</span>
												</td>
												<td>
													<span className={`${styles.chip} ${t.st === "Closed" ? styles.chipAccent : t.st === "Open" ? styles.chipInfo : styles.chipWarn}`}>
														{t.st}
													</span>
												</td>
												<td>{t.u}</td>
											</tr>
										))}
									</tbody>
							</table>
						</div>
					</div>

					{/* ======================= LINKED WALLETS ======================= */}
					<div className={`${styles.card} mt-4`}>
						<h3 className={styles.fwBold13} style={{ fontSize: 15 }}>
							<i className="bi bi-wallet2" style={{ color: "var(--pm-accent)" }} /> Linked Wallets &amp; Payouts
						</h3>
						<div className="row g-3 mt-1">
							{config.walletLinks.map((w) => (
								<div className="col-lg-4" key={w.name}>
									<div className={styles.kycDoc}>
										<i className="bi bi-wallet2" />
										<div>
											<div style={{ fontSize: 13, fontWeight: 700 }}>{w.name}</div>
											<div style={{ fontSize: 11.5, color: "var(--pm-muted)" }}>{w.sub}</div>
										</div>
										<span className={`${styles.badge} ${styles[w.tone]}`} style={{ marginLeft: "auto" }}>
											{w.status}
										</span>
									</div>
								</div>
							))}
						</div>
						<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
							<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("linkExternalModal")}>
								<i className="bi bi-plus-circle" /> Link Wallet
							</button>
							<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => openM("apiKeyModal")}>
								<i className="bi bi-key" /> Manage API Keys
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* ======================= MODAL LAYER ======================= */}
			<CustomersModals active={activeModal} onClose={closeM} onOpen={openM} />
		</div>
	);
}
