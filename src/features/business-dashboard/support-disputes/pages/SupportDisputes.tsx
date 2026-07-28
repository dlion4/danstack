import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SupportDisputesModals from "../components/SupportDisputesModals";
import styles from "../styles/support-disputes.module.css";

/* ============================================================================
   PayMo BaaS — Support, Disputes & Refunds Center (legacy page 3.13)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
interface NavItem {
	icon: string;
	title: string;
	active?: boolean;
	dot?: boolean;
}
interface User {
	initials: string;
	name: string;
	role: string;
}
interface Ticket {
	id: string;
	type: string;
	party: string;
	subject: string;
	priority: string;
	status: string;
	age: string;
	modal: string;
}
interface Chargeback {
	caseId: string;
	card: string;
	merchant: string;
	amount: string;
	stage: string;
	stageTone: BadgeTone;
	due: string;
}
interface PipelineItem {
	label: string;
	detail: string;
	count: number;
	tone: BadgeTone;
}
interface RefundRow {
	refId: string;
	customer: string;
	txn: string;
	amount: string;
	status: string;
	statusTone: BadgeTone;
}
interface EvidenceRow {
	title: string;
	detail: string;
	size: string;
	status: string;
	statusTone: BadgeTone;
}
interface EvidenceType {
	label: string;
	count: number;
	tone: BadgeTone;
}
interface SLAPerf {
	label: string;
	value: string;
	bg: string;
	color: string;
	target: string;
}
interface BreachRow {
	label: string;
	count: number;
}
interface ActivityRow {
	time: string;
	action: string;
	caseRef: string;
	user: string;
	result: string;
	resultTone: BadgeTone;
}
interface AttentionItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	btnLabel: string;
	btnClass?: string;
	modal: string;
}
interface SuggestionItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	btnLabel: string;
	modal: string;
}
interface QuickAction {
	icon: string;
	iconColor: string;
	label: string;
	modal: string;
}

interface SupportConfig {
	nav: NavItem[];
	headerTitle: string;
	headerSub: string;
	searchPlaceholder: string;
	user: User;
	breadcrumb: { parent: string; mid: string; current: string };
	pageTitle: string;
	pageSub: string;
	tickets: Ticket[];
	chargebacks: Chargeback[];
	pipeline: PipelineItem[];
	refunds: RefundRow[];
	evidenceRows: EvidenceRow[];
	evidenceTypes: EvidenceType[];
	slaPerf: SLAPerf[];
	breaches: BreachRow[];
	activityRows: ActivityRow[];
	attentionItems: AttentionItem[];
	suggestions: SuggestionItem[];
	quickActions: QuickAction[];
}

const initialMockData: SupportConfig = {
	nav: [
		{ icon: "bi-house", title: "Dashboard" },
		{ icon: "bi-grid-3x3-gap", title: "Overview" },
		{ icon: "bi-lightning-charge", title: "Payments" },
		{ icon: "bi-headset", title: "Support", active: true, dot: true },
		{ icon: "bi-briefcase", title: "Services" },
		{ icon: "bi-bar-chart-line", title: "Analytics" },
		{ icon: "bi-gear", title: "Settings" },
	],
	headerTitle: "Support, Disputes & Refunds Center",
	headerSub:
		"Customer tickets, merchant disputes, chargebacks, refunds, evidence management and resolutions",
	searchPlaceholder:
		"Search tickets, disputes, refunds, customers, merchants...",
	user: { initials: "JK", name: "James K.", role: "Support Manager" },
	breadcrumb: {
		parent: "Business Portal",
		mid: "Support",
		current: "Disputes & Refunds",
	},
	pageTitle: "PAGE 3.13 — Support, Disputes & Refunds Center",
	pageSub:
		"Manage customer tickets, merchant disputes, chargebacks, refunds, evidence uploads, SLA performance and resolution workflows in one comprehensive hub.",
	tickets: [
		{
			id: "T-8821",
			type: "Customer",
			party: "Grace Wanjiku (VIP)",
			subject: "Failed delivery",
			priority: "Critical",
			status: "Open",
			age: "4h",
			modal: "ticketDetailModal",
		},
		{
			id: "T-8803",
			type: "Merchant",
			party: "TechHub KE",
			subject: "Settlement duplicate",
			priority: "High",
			status: "Open",
			age: "12h",
			modal: "ticketDetailModal",
		},
		{
			id: "T-8799",
			type: "Technical",
			party: "API Integration",
			subject: "Webhook timeout",
			priority: "Medium",
			status: "Open",
			age: "18h",
			modal: "ticketDetailModal",
		},
		{
			id: "CB-9912",
			type: "Chargeback",
			party: "Online Store XYZ",
			subject: "Fraud — KES 124,000",
			priority: "Critical",
			status: "Evidence",
			age: "8h",
			modal: "chargebackModal",
		},
		{
			id: "CB-9908",
			type: "Chargeback",
			party: "TechHub KE",
			subject: "Merchandise not received",
			priority: "High",
			status: "Network",
			age: "2d",
			modal: "chargebackModal",
		},
		{
			id: "RF-4421",
			type: "Refund",
			party: "Grace Wanjiku",
			subject: "Delivery failure",
			priority: "High",
			status: "Pending",
			age: "6h",
			modal: "refundModal",
		},
		{
			id: "RF-4408",
			type: "Refund",
			party: "David Kimani",
			subject: "Duplicate request",
			priority: "Medium",
			status: "Pending",
			age: "1d",
			modal: "duplicateCheckModal",
		},
	],
	chargebacks: [
		{
			caseId: "CB-9912",
			card: "Visa ****4521",
			merchant: "Online Store XYZ",
			amount: "KES 124,000",
			stage: "Evidence",
			stageTone: "badgeD",
			due: "8h",
		},
		{
			caseId: "CB-9908",
			card: "MC ****3392",
			merchant: "TechHub KE",
			amount: "KES 67,500",
			stage: "Network",
			stageTone: "badgeW",
			due: "2d",
		},
		{
			caseId: "CB-9901",
			card: "Visa ****6677",
			merchant: "Global Imports",
			amount: "KES 42,300",
			stage: "Arbitration",
			stageTone: "badgeI",
			due: "5d",
		},
		{
			caseId: "CB-9894",
			card: "MC ****1190",
			merchant: "Fashion Hub",
			amount: "KES 18,900",
			stage: "Won",
			stageTone: "badgeS",
			due: "—",
		},
	],
	pipeline: [
		{ label: "Received", detail: "This week: 8", count: 8, tone: "badgeD" },
		{
			label: "Evidence Submitted",
			detail: "Awaiting network: 12",
			count: 12,
			tone: "badgeW",
		},
		{
			label: "Under Arbitration",
			detail: "With network: 5",
			count: 5,
			tone: "badgeI",
		},
		{
			label: "Resolved (Won)",
			detail: "This month: 19",
			count: 19,
			tone: "badgeS",
		},
		{
			label: "Resolved (Lost)",
			detail: "This month: 7",
			count: 7,
			tone: "badgeD",
		},
	],
	refunds: [
		{
			refId: "RF-4421",
			customer: "Grace Wanjiku",
			txn: "TXN-884291",
			amount: "KES 47,800",
			status: "Pending approval",
			statusTone: "badgeW",
		},
		{
			refId: "RF-4419",
			customer: "Peter Mutua",
			txn: "TXN-883902",
			amount: "KES 12,500",
			status: "Processing",
			statusTone: "badgeI",
		},
		{
			refId: "RF-4412",
			customer: "Sarah Ochieng",
			txn: "TXN-883411",
			amount: "KES 8,900",
			status: "Completed",
			statusTone: "badgeS",
		},
		{
			refId: "RF-4408",
			customer: "David Kimani",
			txn: "TXN-883105",
			amount: "KES 23,400",
			status: "Pending approval",
			statusTone: "badgeW",
		},
	],
	evidenceRows: [
		{
			title: "CB-9912 — Receipt",
			detail: "Online Store XYZ",
			size: "2.4 MB",
			status: "Verified",
			statusTone: "badgeS",
		},
		{
			title: "CB-9908 — Delivery proof",
			detail: "TechHub KE",
			size: "1.8 MB",
			status: "Verified",
			statusTone: "badgeS",
		},
		{
			title: "T-8821 — Chat log",
			detail: "Grace Wanjiku",
			size: "0.3 MB",
			status: "Pending OCR",
			statusTone: "badgeW",
		},
		{
			title: "RF-4421 — Bank statement",
			detail: "Peter Mutua",
			size: "1.1 MB",
			status: "Processing",
			statusTone: "badgeI",
		},
	],
	evidenceTypes: [
		{ label: "Receipts / Invoices", count: 142, tone: "badgeS" },
		{ label: "Delivery Proof", count: 89, tone: "badgeS" },
		{ label: "Chat / Email Logs", count: 67, tone: "badgeS" },
		{ label: "Bank Statements", count: 41, tone: "badgeS" },
		{ label: "Police Reports", count: 12, tone: "badgeW" },
		{ label: "Other", count: 28, tone: "badgeI" },
	],
	slaPerf: [
		{
			label: "CUSTOMER",
			value: "97.2%",
			bg: "var(--pm-accent-soft)",
			color: "var(--pm-accent)",
			target: "98%",
		},
		{
			label: "MERCHANT",
			value: "93.4%",
			bg: "var(--pm-warning-soft)",
			color: "var(--pm-warning)",
			target: "95%",
		},
		{
			label: "CHARGEBACK",
			value: "89.1%",
			bg: "var(--pm-info-soft)",
			color: "var(--pm-info)",
			target: "90%",
		},
		{
			label: "REFUND",
			value: "96.8%",
			bg: "var(--pm-purple-soft)",
			color: "var(--pm-purple)",
			target: "97%",
		},
	],
	breaches: [
		{ label: "Customer SLA breaches", count: 11 },
		{ label: "Merchant SLA breaches", count: 19 },
		{ label: "Chargeback SLA breaches", count: 8 },
		{ label: "Refund SLA breaches", count: 4 },
	],
	activityRows: [
		{
			time: "14:32",
			action: "Refund approved",
			caseRef: "RF-4421",
			user: "Finance — Grace",
			result: "Success",
			resultTone: "badgeS",
		},
		{
			time: "14:18",
			action: "Evidence uploaded",
			caseRef: "CB-9912",
			user: "Merchant — TechHub",
			result: "Verified",
			resultTone: "badgeS",
		},
		{
			time: "13:45",
			action: "Ticket assigned",
			caseRef: "T-8821",
			user: "Support — James",
			result: "Assigned",
			resultTone: "badgeI",
		},
		{
			time: "13:22",
			action: "Chargeback submitted",
			caseRef: "CB-9908",
			user: "Network — Visa",
			result: "Pending",
			resultTone: "badgeW",
		},
		{
			time: "12:50",
			action: "Customer contacted",
			caseRef: "T-8803",
			user: "Support — Amina",
			result: "Resolved",
			resultTone: "badgeS",
		},
	],
	attentionItems: [
		{
			icon: "bi-exclamation-triangle",
			iconBg: "var(--pm-danger-soft)",
			iconColor: "var(--pm-danger)",
			title: "High-value chargeback #CB-9912",
			sub: "KES 124,000 · Evidence due in 8h",
			btnLabel: "Respond",
			btnClass: "btnPmD",
			modal: "chargebackModal",
		},
		{
			icon: "bi-receipt",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Refund request pending approval",
			sub: "#RF-4421 · KES 47,800",
			btnLabel: "Review",
			modal: "refundModal",
		},
		{
			icon: "bi-ticket-detailed",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "VIP customer ticket #T-8821",
			sub: "SLA breach risk · 4h left",
			btnLabel: "Open",
			modal: "ticketDetailModal",
		},
		{
			icon: "bi-arrow-repeat",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Duplicate refund detected",
			sub: "#RF-4408 & #RF-4419 · same customer",
			btnLabel: "Investigate",
			modal: "duplicateCheckModal",
		},
	],
	suggestions: [
		{
			icon: "bi-lightning-charge",
			iconBg: "var(--pm-accent-soft)",
			iconColor: "var(--pm-accent)",
			title: "Auto-approve 12 low-value refunds",
			sub: "Save 4.2 hours of manual review",
			btnLabel: "Auto-approve",
			modal: "bulkRefundModal",
		},
		{
			icon: "bi-graph-up",
			iconBg: "var(--pm-info-soft)",
			iconColor: "var(--pm-info)",
			title: "Escalate 3 tickets to senior tier",
			sub: "Complex fraud pattern detected",
			btnLabel: "Escalate",
			modal: "escalateModal",
		},
		{
			icon: "bi-file-earmark",
			iconBg: "var(--pm-warning-soft)",
			iconColor: "var(--pm-warning)",
			title: "Request evidence from 8 merchants",
			sub: "Prevent chargeback loss",
			btnLabel: "Send",
			modal: "evidenceRequestModal",
		},
		{
			icon: "bi-people",
			iconBg: "var(--pm-purple-soft)",
			iconColor: "var(--pm-purple)",
			title: "Assign 5 tickets to specialist team",
			sub: "Technical disputes cluster",
			btnLabel: "Assign",
			modal: "assignModal",
		},
	],
	quickActions: [
		{
			icon: "bi-ticket-detailed",
			iconColor: "var(--pm-primary)",
			label: "New Ticket",
			modal: "newTicketModal",
		},
		{
			icon: "bi-credit-card",
			iconColor: "var(--pm-danger)",
			label: "Chargeback",
			modal: "chargebackModal",
		},
		{
			icon: "bi-cash",
			iconColor: "var(--pm-accent)",
			label: "Refund",
			modal: "refundModal",
		},
		{
			icon: "bi-shield-exclamation",
			iconColor: "var(--pm-warning)",
			label: "Dispute",
			modal: "disputeModal",
		},
		{
			icon: "bi-collection",
			iconColor: "var(--pm-purple)",
			label: "Bulk Refund",
			modal: "bulkRefundModal",
		},
		{
			icon: "bi-upload",
			iconColor: "var(--pm-info)",
			label: "Upload Evidence",
			modal: "evidenceUploadModal",
		},
		{
			icon: "bi-clock-history",
			iconColor: "var(--pm-accent)",
			label: "SLA Health",
			modal: "slaHealthModal",
		},
		{
			icon: "bi-chat-dots",
			iconColor: "var(--pm-primary)",
			label: "Contact Customer",
			modal: "contactCustomerModal",
		},
	],
};

/**
 * Frontend-only demo: no /api/business/support-disputes backend exists yet. Try the real
 * endpoint so this page works unchanged once it ships, but fall back to the
 * bundled mock data on any failure (offline, 404, SSR origin-less fetch, bad
 * JSON) so the page always renders instead of surfacing an error state.
 */
async function fetchSupportContent(): Promise<SupportConfig> {
	try {
		const res = await fetch("/api/business/support-disputes", {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as SupportConfig;
	} catch {
		return initialMockData;
	}
}

export default function SupportDisputes() {
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [ticketFilter, setTicketFilter] = useState("all");

	const { data: apiData } = useQuery({
		queryKey: ["business-support-disputes"],
		queryFn: fetchSupportContent,
		staleTime: 5 * 60_000,
		retry: 1,
	});
	const config = apiData ?? initialMockData;

	const s = styles as Record<string, string>;
	const cx = (...cls: (string | false | undefined)[]) =>
		cls.filter(Boolean).join(" ");

	const filteredTickets = config.tickets.filter((t) => {
		if (ticketFilter === "all") return true;
		if (ticketFilter === "customer")
			return t.type === "Customer" || t.type === "Technical";
		if (ticketFilter === "merchant") return t.type === "Merchant";
		if (ticketFilter === "chargeback") return t.type === "Chargeback";
		if (ticketFilter === "refund") return t.type === "Refund";
		return true;
	});

	const priorityBadge = (p: string) => {
		if (p === "Critical") return cx(s.badge, s.badgeD);
		if (p === "High") return cx(s.badge, s.badgeW);
		return cx(s.badge, s.badgeI);
	};

	const statusBadge = (st: string) => {
		if (st === "Open" || st === "Pending") return cx(s.badge, s.badgeI);
		if (st === "Evidence" || st === "Network") return cx(s.badge, s.badgeW);
		return cx(s.badge, s.badgeS);
	};

	return (
		<>
			<div className={s.content}>
				{/* HERO STATS */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div
							className={cx(s.card, s.cardAccent)}
							style={{ minHeight: 170 }}
						>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									color: "rgba(255,255,255,.78)",
								}}
							>
								Support center is live{" "}
								<span style={{ color: "#86efac" }}>●</span>
							</p>
							<div className={s.sv} style={{ margin: "8px 0", color: "#fff" }}>
								187 open tickets
							</div>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									color: "rgba(255,255,255,.78)",
								}}
							>
								87 customer tickets, 52 merchant disputes, 31 chargebacks, 17
								refund requests — average resolution 26 hours.
							</p>
							<div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{
										background: "rgba(255,255,255,.12)",
										borderColor: "rgba(255,255,255,.22)",
										color: "#fff",
									}}
									onClick={() => setActiveModal("newTicketModal")}
								>
									New Ticket
								</button>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{
										background: "rgba(255,255,255,.12)",
										borderColor: "rgba(255,255,255,.22)",
										color: "#fff",
									}}
									onClick={() => setActiveModal("bulkRefundModal")}
								>
									Bulk Refund
								</button>
								<button
									className={cx(s.btnPm, s.btnSm)}
									style={{
										background: "rgba(255,255,255,.12)",
										borderColor: "rgba(255,255,255,.22)",
										color: "#fff",
									}}
									onClick={() => setActiveModal("slaHealthModal")}
								>
									SLA
								</button>
							</div>
						</div>
					</div>
					<div className="col-lg-2 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.sl} style={{ color: "var(--pm-accent)" }}>
								AVG RESOLUTION
							</p>
							<div className={s.sv} style={{ margin: "6px 0" }}>
								26h
							</div>
							<span className={cx(s.badge, s.badgeS)}>
								<i className="bi bi-clock-history" /> -4h vs last week
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
							>
								Customer: 18h
								<br />
								Merchant: 31h
								<br />
								Chargeback: 42h
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4 col-6">
						<div className={s.card} style={{ minHeight: 170 }}>
							<p className={s.sl} style={{ color: "var(--pm-info)" }}>
								SLA COMPLIANCE
							</p>
							<div className={s.sv} style={{ margin: "6px 0" }}>
								94.8%
							</div>
							<span className={cx(s.badge, s.badgeI)}>
								<i className="bi bi-graph-down-arrow" /> -1.2% this week
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
							>
								Target: 97%
								<br />
								Breached: 9 tickets
								<br />
								At risk: 14 tickets
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-4">
						<div
							className={s.card}
							style={{
								minHeight: 170,
								borderLeft: "3px solid var(--pm-warning)",
							}}
						>
							<p className={s.sl} style={{ color: "var(--pm-warning)" }}>
								PENDING ACTION
							</p>
							<div className={s.sv} style={{ margin: "6px 0" }}>
								41
							</div>
							<span className={cx(s.badge, s.badgeW)}>
								<i className="bi bi-exclamation-triangle" /> Requires review
							</span>
							<div
								className="mt-2"
								style={{ fontSize: 12, color: "var(--pm-ink-soft)" }}
							>
								Evidence pending: 18
								<br />
								Approval needed: 12
								<br />
								Escalation: 11
							</div>
						</div>
					</div>
				</div>

				{/* ATTENTION / SUGGESTIONS / QUICK ACTIONS */}
				<div className="row g-3">
					<div className="col-lg-4">
						<div className={s.card}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h3 className={s.st}>Attention Required</h3>
								<button
									className={cx(s.btnPm, s.btnSm)}
									onClick={() => setActiveModal("attentionFullModal")}
								>
									View all
								</button>
							</div>
							{config.attentionItems.map((item) => (
								<div key={item.title} className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: item.iconBg, color: item.iconColor }}
										>
											<i className={`bi ${item.icon}`} />
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{item.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{item.sub}
											</div>
										</div>
									</div>
									<button
										className={cx(
											s.btnPm,
											s.btnSm,
											item.btnClass && s[item.btnClass],
										)}
										onClick={() => setActiveModal(item.modal)}
									>
										{item.btnLabel}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h3 className={s.st}>Smart Suggestions</h3>
								<span className={cx(s.badge, s.badgeP)}>
									<i className="bi bi-stars" /> AI
								</span>
							</div>
							{config.suggestions.map((item) => (
								<div key={item.title} className={s.statusRow}>
									<div className="d-flex align-items-center gap-3">
										<div
											className={cx(s.iconCircle, s.iconCircleSm)}
											style={{ background: item.iconBg, color: item.iconColor }}
										>
											<i className={`bi ${item.icon}`} />
										</div>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>
												{item.title}
											</div>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{item.sub}
											</div>
										</div>
									</div>
									<button
										className={cx(s.btnPm, s.btnSm)}
										onClick={() => setActiveModal(item.modal)}
									>
										{item.btnLabel}
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="col-lg-4">
						<div className={s.card}>
							<div className="mb-3">
								<h3 className={s.st}>Quick Actions</h3>
								<p className={s.ss}>Frequent support workflows</p>
							</div>
							<div className={s.quickGrid}>
								{config.quickActions.map((qa) => (
									<button
										key={qa.label}
										className={s.quickBtn}
										onClick={() => setActiveModal(qa.modal)}
									>
										<i
											className={`bi ${qa.icon}`}
											style={{ color: qa.iconColor }}
										/>
										{qa.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.13.1: Ticket Management */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-ticket-detailed"
									style={{ color: "var(--pm-primary)" }}
								/>{" "}
								3.13.1 — Customer & Merchant Ticket Management
							</h3>
							<p className={s.ss}>
								Full lifecycle ticket management with priority routing,
								assignment, communication and resolution tracking.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("newTicketModal")}
							>
								<i className="bi bi-plus-lg" /> New
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("bulkAssignModal")}
							>
								Bulk Assign
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.utilityBlock}>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
										Open Tickets (187)
									</h4>
									<div className={cx(s.pills)}>
										{[
											"all",
											"customer",
											"merchant",
											"chargeback",
											"refund",
										].map((f) => (
											<button
												key={f}
												className={cx(
													s.pill,
													ticketFilter === f && s.pillActive,
												)}
												onClick={() => setTicketFilter(f)}
											>
												{f === "all"
													? "All"
													: f === "customer"
														? "Customer (87)"
														: f === "merchant"
															? "Merchant (52)"
															: f === "chargeback"
																? "Chargeback (31)"
																: "Refund (17)"}
											</button>
										))}
									</div>
								</div>
								<div className="table-responsive">
									<table className={s.tbl}>
										<thead>
											<tr>
												<th>ID</th>
												<th>Type</th>
												<th>Customer/Merchant</th>
												<th>Subject</th>
												<th>Priority</th>
												<th>Status</th>
												<th>Age</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{filteredTickets.map((t) => (
												<tr key={t.id}>
													<td>
														<code>{t.id}</code>
													</td>
													<td>{t.type}</td>
													<td>{t.party}</td>
													<td>{t.subject}</td>
													<td>
														<span className={priorityBadge(t.priority)}>
															{t.priority}
														</span>
													</td>
													<td>
														<span className={statusBadge(t.status)}>
															{t.status}
														</span>
													</td>
													<td>{t.age}</td>
													<td>
														<button
															className={cx(s.btnPm, s.btnSm)}
															onClick={() => setActiveModal(t.modal)}
														>
															Open
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Priority Queue
								</h4>
								<div className={s.statusRow}>
									<div>
										<strong>#T-8821 — VIP Customer</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Failed delivery — 4h to SLA breach
										</div>
									</div>
									<span className={cx(s.badge, s.badgeD)}>Critical</span>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>#CB-9912 — High-value chargeback</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											KES 124,000 — Evidence due in 8h
										</div>
									</div>
									<span className={cx(s.badge, s.badgeW)}>High</span>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>#RF-4421 — Refund approval</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											KES 47,800 — Awaiting finance
										</div>
									</div>
									<span className={cx(s.badge, s.badgeI)}>Medium</span>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>#T-8803 — Merchant settlement</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Duplicate settlement — 12h old
										</div>
									</div>
									<span className={cx(s.badge, s.badgeW)}>High</span>
								</div>
								<div className={s.statusRow}>
									<div>
										<strong>#T-8799 — API integration</strong>
										<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
											Webhook timeout — 18h old
										</div>
									</div>
									<span className={cx(s.badge, s.badgeI)}>Medium</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.13.2: Chargeback & Dispute Management */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-credit-card"
									style={{ color: "var(--pm-danger)" }}
								/>{" "}
								3.13.2 — Chargeback & Dispute Management
							</h3>
							<p className={s.ss}>
								End-to-end chargeback lifecycle from receipt through evidence
								gathering, network submission, arbitration and resolution.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("chargebackModal")}
							>
								<i className="bi bi-plus-lg" /> New
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("bulkEvidenceModal")}
							>
								Bulk Evidence
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Active Chargebacks (31)
								</h4>
								<div className="table-responsive">
									<table className={s.tbl}>
										<thead>
											<tr>
												<th>Case ID</th>
												<th>Card</th>
												<th>Merchant</th>
												<th>Amount</th>
												<th>Stage</th>
												<th>Due</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{config.chargebacks.map((cb) => (
												<tr key={cb.caseId}>
													<td>{cb.caseId}</td>
													<td>{cb.card}</td>
													<td>{cb.merchant}</td>
													<td>
														<strong>{cb.amount}</strong>
													</td>
													<td>
														<span className={cx(s.badge, s[cb.stageTone])}>
															{cb.stage}
														</span>
													</td>
													<td>{cb.due}</td>
													<td>
														<button
															className={cx(s.btnPm, s.btnSm)}
															onClick={() => setActiveModal("chargebackModal")}
														>
															{cb.stage === "Evidence"
																? "Respond"
																: cb.stage === "Won"
																	? "Close"
																	: cb.stage === "Network"
																		? "Track"
																		: "View"}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Chargeback Pipeline
								</h4>
								{config.pipeline.map((p) => (
									<div key={p.label} className={s.statusRow}>
										<div>
											<strong>{p.label}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{p.detail}
											</div>
										</div>
										<span className={cx(s.badge, s[p.tone])}>{p.count}</span>
									</div>
								))}
								<div
									className="p-3 rounded mt-3"
									style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
								>
									<i className="bi bi-lightbulb me-1" /> Win rate this month:{" "}
									<strong>73%</strong> (19/26)
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.13.3: Refund Processing */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-cash"
									style={{ color: "var(--pm-accent)" }}
								/>{" "}
								3.13.3 — Refund Processing & Management
							</h3>
							<p className={s.ss}>
								Full refund lifecycle including request intake, approval
								workflow, execution, reconciliation and customer communication.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("refundModal")}
							>
								<i className="bi bi-plus-lg" /> New
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("bulkRefundModal")}
							>
								Bulk
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Pending Refunds (17)
								</h4>
								<div className="table-responsive">
									<table className={s.tbl}>
										<thead>
											<tr>
												<th>Ref ID</th>
												<th>Customer</th>
												<th>Original Txn</th>
												<th>Amount</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{config.refunds.map((r) => (
												<tr key={r.refId}>
													<td>{r.refId}</td>
													<td>{r.customer}</td>
													<td>{r.txn}</td>
													<td>
														<strong>{r.amount}</strong>
													</td>
													<td>
														<span className={cx(s.badge, s[r.statusTone])}>
															{r.status}
														</span>
													</td>
													<td>
														<button
															className={cx(s.btnPm, s.btnSm)}
															onClick={() => setActiveModal("refundModal")}
														>
															{r.status === "Pending approval"
																? "Approve"
																: r.status === "Processing"
																	? "Track"
																	: "Receipt"}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Refund Summary
								</h4>
								<div className="row g-2">
									<div className="col-6">
										<div
											className="p-3 rounded"
											style={{ background: "var(--pm-accent-soft)" }}
										>
											<div
												style={{
													fontSize: 11,
													color: "#047857",
													fontWeight: 700,
												}}
											>
												THIS MONTH
											</div>
											<div
												style={{
													fontSize: 22,
													fontWeight: 700,
													color: "var(--pm-accent)",
												}}
											>
												KES 1.84M
											</div>
										</div>
									</div>
									<div className="col-6">
										<div
											className="p-3 rounded"
											style={{ background: "var(--pm-surface-2)" }}
										>
											<div
												style={{
													fontSize: 11,
													color: "var(--pm-muted)",
													fontWeight: 700,
												}}
											>
												AVG REFUND
											</div>
											<div style={{ fontSize: 22, fontWeight: 700 }}>
												KES 14,800
											</div>
										</div>
									</div>
								</div>
								<div className="mt-3">
									<div
										className="d-flex justify-content-between mb-1"
										style={{ fontSize: 12 }}
									>
										<span>Auto-approved</span>
										<span>68%</span>
									</div>
									<div className={s.progress}>
										<div
											className={s.progressBar}
											style={{ width: "68%", background: "var(--pm-accent)" }}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.13.4: Evidence Management */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-file-earmark-check"
									style={{ color: "var(--pm-info)" }}
								/>{" "}
								3.13.4 — Evidence Management & Documentation
							</h3>
							<p className={s.ss}>
								Central evidence repository with upload, OCR, versioning,
								network formatting and audit trail.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("evidenceUploadModal")}
							>
								<i className="bi bi-upload" /> Upload
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("bulkEvidenceModal")}
							>
								Bulk
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Recent Evidence Uploads
								</h4>
								{config.evidenceRows.map((e) => (
									<div key={e.title} className={s.statusRow}>
										<div>
											<strong>{e.title}</strong>
											<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
												{e.detail} · {e.size}
											</div>
										</div>
										<span className={cx(s.badge, s[e.statusTone])}>
											{e.status}
										</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Evidence Types
								</h4>
								{config.evidenceTypes.map((e) => (
									<div key={e.label} className={s.statusRow}>
										<div>
											<strong>{e.label}</strong>
										</div>
										<span className={cx(s.badge, s[e.tone])}>{e.count}</span>
									</div>
								))}
							</div>
						</div>
						<div className="col-lg-3">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Network Formats
								</h4>
								<div
									className="p-3 rounded mb-2"
									style={{ background: "var(--pm-info-soft)", fontSize: 12 }}
								>
									<i className="bi bi-check-circle me-1" /> Visa format ready:
									28 cases
								</div>
								<div
									className="p-3 rounded mb-2"
									style={{ background: "var(--pm-accent-soft)", fontSize: 12 }}
								>
									<i className="bi bi-check-circle me-1" /> Mastercard format
									ready: 19 cases
								</div>
								<div
									className="p-3 rounded"
									style={{ background: "var(--pm-warning-soft)", fontSize: 12 }}
								>
									<i className="bi bi-clock me-1" /> Pending formatting: 7 cases
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* SECTION 3.13.5: SLA Performance */}
				<div className={s.card}>
					<div
						className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
						style={{ gap: 8 }}
					>
						<div>
							<h3 className={s.st}>
								<i
									className="bi bi-clock-history"
									style={{ color: "var(--pm-purple)" }}
								/>{" "}
								3.13.5 — SLA Performance & Reporting
							</h3>
							<p className={s.ss}>
								Real-time SLA dashboards, performance metrics, breach alerts and
								automated reporting.
							</p>
						</div>
						<div className="d-flex" style={{ gap: 8 }}>
							<button
								className={cx(s.btnPm, s.btnSm)}
								onClick={() => setActiveModal("slaHealthModal")}
							>
								<i className="bi bi-graph-up" /> Dashboard
							</button>
							<button
								className={cx(s.btnPm, s.btnSm, s.btnPmP)}
								onClick={() => setActiveModal("slaReportModal")}
							>
								Report
							</button>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-lg-5">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									SLA Performance
								</h4>
								<div className="row g-2">
									{config.slaPerf.map((p) => (
										<div key={p.label} className="col-6">
											<div className="p-3 rounded" style={{ background: p.bg }}>
												<div
													style={{
														fontSize: 11,
														color: p.color,
														fontWeight: 700,
													}}
												>
													{p.label}
												</div>
												<div
													style={{
														fontSize: 24,
														fontWeight: 700,
														color: p.color,
													}}
												>
													{p.value}
												</div>
												<div style={{ fontSize: 11, color: p.color }}>
													Target: {p.target}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Breach Log (This Month)
								</h4>
								{config.breaches.map((b) => (
									<div key={b.label} className={s.statusRow}>
										<div>
											<strong>{b.label}</strong>
										</div>
										<span className={cx(s.badge, s.badgeD)}>{b.count}</span>
									</div>
								))}
								<div
									className="p-3 rounded mt-3"
									style={{ background: "var(--pm-danger-soft)", fontSize: 12 }}
								>
									<i className="bi bi-exclamation-triangle me-1" /> 9 tickets
									currently at risk of breach
								</div>
							</div>
						</div>
						<div className="col-lg-3">
							<div className={s.utilityBlock}>
								<h4
									style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}
								>
									Quick Reports
								</h4>
								<button
									className={cx(s.quickBtn, "w-100 mb-2")}
									onClick={() => setActiveModal("slaReportModal")}
								>
									Daily SLA Report
								</button>
								<button
									className={cx(s.quickBtn, "w-100 mb-2")}
									onClick={() => setActiveModal("slaReportModal")}
								>
									Weekly Performance
								</button>
								<button
									className={cx(s.quickBtn, "w-100 mb-2")}
									onClick={() => setActiveModal("slaReportModal")}
								>
									Monthly Trend
								</button>
								<button
									className={cx(s.quickBtn, "w-100")}
									onClick={() => setActiveModal("slaReportModal")}
								>
									Chargeback Win Rate
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Activity */}
				<div className={s.card}>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h3 className={s.st}>
							<i
								className="bi bi-clock-history"
								style={{ color: "var(--pm-muted)" }}
							/>{" "}
							Recent Activity
						</h3>
						<button
							className={cx(s.btnPm, s.btnSm)}
							onClick={() => setActiveModal("activityLogModal")}
						>
							Full Log
						</button>
					</div>
					<div className="table-responsive">
						<table className={s.tbl}>
							<thead>
								<tr>
									<th>Time</th>
									<th>Action</th>
									<th>Case</th>
									<th>User</th>
									<th>Result</th>
								</tr>
							</thead>
							<tbody>
								{config.activityRows.map((a) => (
									<tr key={a.time + a.caseRef}>
										<td>{a.time}</td>
										<td>{a.action}</td>
										<td>{a.caseRef}</td>
										<td>{a.user}</td>
										<td>
											<span className={cx(s.badge, s[a.resultTone])}>
												{a.result}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
	<SupportDisputesModals
		active={activeModal}
		onClose={() => setActiveModal(null)}
		onOpen={setActiveModal}
	/>
		</>
	)
}
