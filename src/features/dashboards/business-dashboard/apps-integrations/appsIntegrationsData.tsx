/* ============================================================================
   PayMo Business — Apps & Integrations Data
   TypeScript data structures for integrations, health status, and marketplace
   ========================================================================== */

export type IntegrationStatus = "connected" | "disconnected" | "error";
export type IntegrationCategory = "sell" | "deliver" | "accounting" | "analytics" | "automation";
export type HealthStatus = "healthy" | "warning" | "error";

export interface Integration {
	id: string;
	name: string;
	icon: string;
	iconColor: string;
	category: IntegrationCategory;
	status: IntegrationStatus;
	description: string;
	features?: string[];
	messagesPerMonth?: number;
	syncTime?: string;
	tokenExpiry?: string;
	errorMessage?: string;
}

export interface HealthCheck {
	id: string;
	name: string;
	status: HealthStatus;
	uptime?: string;
	lastSync?: string;
	tokenExpiry?: string;
	errorMessage?: string;
}

export interface InboxMessage {
	id: string;
	avatar: string;
	avatarColor: string;
	name: string;
	platform: string;
	platformColor: string;
	message: string;
	time: string;
}

export interface SyncLog {
	id: string;
	time: string;
	integration: string;
	type: string;
	status: "resolved" | "unresolved";
}

export interface Webhook {
	id: string;
	event: string;
	url: string;
	status: number;
}

export const INTEGRATIONS: Integration[] = [
	{
		id: "whatsapp",
		name: "WhatsApp Business",
		icon: "bi-whatsapp",
		iconColor: "#25D366",
		category: "sell",
		status: "connected",
		description: "Orders, chat, catalogs",
		features: ["Catalog Sync", "Order Notifications", "Chat"],
		messagesPerMonth: 142,
		syncTime: "2 min ago",
	},
	{
		id: "instagram",
		name: "Instagram Shop",
		icon: "bi-instagram",
		iconColor: "#E1306C",
		category: "sell",
		status: "connected",
		description: "Re-auth in 7 days",
		features: ["Product Sync", "Order Sync"],
		tokenExpiry: "7 days",
	},
	{
		id: "sendy",
		name: "Sendy",
		icon: "bi-scooter",
		iconColor: "#FF5A00",
		category: "deliver",
		status: "error",
		description: "Delivery fleet",
		errorMessage: "Authentication token expired",
	},
	{
		id: "quickbooks",
		name: "QuickBooks",
		icon: "bi-journal",
		iconColor: "#2CA01C",
		category: "accounting",
		status: "connected",
		description: "Ledger sync",
		syncTime: "2 min ago",
	},
	{
		id: "xero",
		name: "Xero",
		icon: "bi-journal-richtext",
		iconColor: "#13B5EA",
		category: "accounting",
		status: "disconnected",
		description: "Accounting",
	},
	{
		id: "google-analytics",
		name: "Google Analytics",
		icon: "bi-graph-up",
		iconColor: "#E37400",
		category: "analytics",
		status: "disconnected",
		description: "GA4 tracking",
	},
	{
		id: "zapier",
		name: "Zapier",
		icon: "bi-lightning",
		iconColor: "#FF4F00",
		category: "automation",
		status: "disconnected",
		description: "Automation",
	},
	{
		id: "glovo",
		name: "Glovo",
		icon: "bi-bicycle",
		iconColor: "#00A82D",
		category: "deliver",
		status: "disconnected",
		description: "Food & parcels",
	},
];

export const HEALTH_CHECKS: HealthCheck[] = [
	{
		id: "whatsapp-health",
		name: "WhatsApp",
		status: "healthy",
		uptime: "99.9%",
	},
	{
		id: "quickbooks-health",
		name: "QuickBooks",
		status: "healthy",
		lastSync: "2 min ago",
	},
	{
		id: "instagram-health",
		name: "Instagram",
		status: "warning",
		tokenExpiry: "7 days",
	},
	{
		id: "sendy-health",
		name: "Sendy",
		status: "error",
		errorMessage: "Sync error",
	},
];

export const INBOX_MESSAGES: InboxMessage[] = [
	{
		id: "msg-1",
		avatar: "JW",
		avatarColor: "var(--pm-info)",
		name: "John Mwangi",
		platform: "WhatsApp",
		platformColor: "var(--pm-warning)",
		message: "Do you have the Laptop Pro X in stock?",
		time: "2 min",
	},
	{
		id: "msg-2",
		avatar: "GN",
		avatarColor: "var(--pm-purple)",
		name: "Grace N.",
		platform: "Instagram",
		platformColor: "var(--pm-pink)",
		message: "How much for 2 headsets?",
		time: "1 hr",
	},
	{
		id: "msg-3",
		avatar: "SL",
		avatarColor: "var(--pm-accent)",
		name: "Safari Lodges",
		platform: "Facebook",
		platformColor: "var(--pm-info)",
		message: "Order #1035 delivered, thanks!",
		time: "3 hrs",
	},
];

export const SYNC_LOGS: SyncLog[] = [
	{
		id: "log-1",
		time: "Today 10:00",
		integration: "Sendy",
		type: "Auth failed",
		status: "unresolved",
	},
	{
		id: "log-2",
		time: "Today 09:00",
		integration: "QuickBooks",
		type: "Data validation",
		status: "resolved",
	},
	{
		id: "log-3",
		time: "Yesterday",
		integration: "Xero",
		type: "Rate limit",
		status: "resolved",
	},
];

export const WEBHOOKS: Webhook[] = [
	{
		id: "webhook-1",
		event: "payment.received",
		url: "api.paymo.co.ke/webhooks/mpesa",
		status: 200,
	},
	{
		id: "webhook-2",
		event: "order.created",
		url: "api.paymo.co.ke/webhooks/store",
		status: 200,
	},
];

export const DELIVERY_PROVIDERS = [
	{
		id: "sendy-delivery",
		name: "Sendy",
		icon: "bi-scooter",
		iconColor: "#FF5A00",
		status: "error",
		deliveriesThisMonth: 12,
	},
	{
		id: "glovo-delivery",
		name: "Glovo",
		icon: "bi-bicycle",
		iconColor: "#00A82D",
		status: "disconnected",
		description: "Food & parcels",
	},
	{
		id: "bolt-delivery",
		name: "Bolt Business",
		icon: "bi-truck",
		iconColor: "#2563EB",
		status: "disconnected",
		description: "Fleet & couriers",
	},
];

export const ACCOUNTING_EXPORTS = [
	{
		id: "quickbooks-export",
		name: "QuickBooks Online",
		icon: "bi-journal",
		iconColor: "var(--pm-accent)",
		schedule: "Daily batch",
		dataTypes: ["Customers", "Invoices", "Bills", "Journal"],
		lastSync: "2 min ago",
	},
];

export const ANALYTICS_PIXELS = [
	{
		id: "ga4",
		name: "Google Analytics (GA4)",
		icon: "bi-graph-up",
		iconColor: "var(--pm-warning)",
		measurementId: "G-XXXXXXXXXX",
		description: "GA4 script injected into storefront. Tracks views, add-to-cart, checkout.",
	},
	{
		id: "meta-pixel",
		name: "Meta Pixel (Facebook/Instagram)",
		icon: "bi-meta",
		iconColor: "var(--pm-info)",
		pixelId: "1234567890",
		description: "Retargeting on",
	},
];

/* ============================================================================
   Modal-layer data (port of apps-integrations.html modals M1–M25)
   ========================================================================== */

export interface NotificationAlert {
	id: string;
	tone: "danger" | "warning" | "info";
	title: string;
	desc: string;
}

export const NOTIFICATIONS: NotificationAlert[] = [
	{ id: "notif-1", tone: "danger", title: "Sendy sync error", desc: "auth expired" },
	{ id: "notif-2", tone: "warning", title: "Instagram token", desc: "expires in 7 days" },
	{ id: "notif-3", tone: "info", title: "QuickBooks synced", desc: "24 invoices pushed" },
	{ id: "notif-4", tone: "info", title: "New WhatsApp message", desc: "John Mwangi" },
];

/** Sync Now modal rows. */
export const SYNC_APPS = [
	{ id: "quickbooks", name: "QuickBooks", status: "ok" as const },
	{ id: "sendy", name: "Sendy", status: "error" as const },
	{ id: "xero", name: "Xero", status: "ok" as const },
	{ id: "shopify", name: "Shopify", status: "ok" as const },
];

export const ACCOUNT_MAPPING = [
	{ paymo: "M-Pesa Float", quickbooks: "Undeposited Funds" },
	{ paymo: "Bank — Equity", quickbooks: "Checking" },
	{ paymo: "Sales Revenue", quickbooks: "Sales Income" },
	{ paymo: "COGS", quickbooks: "Cost of Goods Sold" },
];

export const WEBHOOK_EVENTS = ["payment.received", "order.created", "invoice.overdue"];

/** Marketplace modal featured apps. */
export const MARKETPLACE_APPS = [
	{ id: "whatsapp", name: "WhatsApp", icon: "bi-whatsapp", iconColor: "#25D366", desc: "Sell & chat", popular: true },
	{ id: "sendy", name: "Sendy", icon: "bi-scooter", iconColor: "#FF5A00", desc: "Delivery", popular: false },
	{ id: "quickbooks", name: "QuickBooks", icon: "bi-journal", iconColor: "#2CA01C", desc: "Accounting", popular: false },
	{ id: "xero", name: "Xero", icon: "bi-journal-richtext", iconColor: "#13B5EA", desc: "Accounting", popular: false },
	{ id: "ga4", name: "GA4", icon: "bi-graph-up", iconColor: "#E37400", desc: "Analytics", popular: false },
	{ id: "zapier", name: "Zapier", icon: "bi-lightning", iconColor: "#FF4F00", desc: "Automation", popular: false },
];

/** Connect App wizard step 1 selectable apps. */
export const CONNECT_APPS = [
	{ id: "xero", name: "Xero", icon: "bi-journal-richtext", iconColor: "#13B5EA" },
	{ id: "zapier", name: "Zapier", icon: "bi-lightning", iconColor: "#FF4F00" },
	{ id: "glovo", name: "Glovo", icon: "bi-bicycle", iconColor: "#00A82D" },
];

/** Dispatch wizard step 2 selectable providers. */
export const DELIVERY_OPTIONS = [
	{ id: "sendy", name: "Sendy", icon: "bi-scooter", iconColor: "#FF5A00" },
	{ id: "glovo", name: "Glovo", icon: "bi-bicycle", iconColor: "#00A82D" },
	{ id: "bolt", name: "Bolt", icon: "bi-truck", iconColor: "#2563EB" },
];

export interface ChatMessage {
	id: string;
	sender: "customer" | "business";
	text: string;
}

export const CHAT_MESSAGES: ChatMessage[] = [
	{ id: "c1", sender: "customer", text: "Do you have the Laptop Pro X in stock?" },
	{ id: "b1", sender: "business", text: "Yes we do! KES 85,000. Would you like a payment link?" },
	{ id: "c2", sender: "customer", text: "Yes please" },
];
