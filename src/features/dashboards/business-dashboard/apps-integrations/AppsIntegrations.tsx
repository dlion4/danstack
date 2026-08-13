import { useState, type ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./appsIntegrations.module.css";
import {
	INTEGRATIONS,
	HEALTH_CHECKS,
	INBOX_MESSAGES,
	DELIVERY_PROVIDERS,
	ACCOUNTING_EXPORTS,
	ANALYTICS_PIXELS,
	type Integration,
	type IntegrationCategory,
	type IntegrationStatus,
} from "./appsIntegrationsData";
import AppsIntegrationsModals from "./AppsIntegrationsModals";

/* ============================================================================
   PayMo Business — Apps & Integrations
   React + TypeScript, emerald-glass dashboard theme.
   Enhanced UI/UX with seamless design, responsive layout, and improved functionality.
   ========================================================================== */

/* ---------- shared badge component ---------- */
function Badge({ tone, children, style }: { tone: "success" | "warning" | "danger" | "info" | "purple" | "dark"; children: ReactNode; style?: React.CSSProperties }) {
	const map: Record<string, string> = {
		success: styles.badgeS,
		warning: styles.badgeW,
		danger: styles.badgeD,
		info: styles.badgeI,
		purple: styles.badgeP,
		dark: styles.badgeK,
	};
	return <span className={`${styles.badge} ${map[tone]}`} style={style}>{children}</span>;
}

/* ---------- section header component ---------- */
function SectionHead({
	icon,
	iconColor,
	title,
	sub,
	actions,
	onOpen,
}: {
	icon: string;
	iconColor: string;
	title: string;
	sub: string;
	actions?: { label: string; icon?: string; modal: string; tone?: "primary" | "danger" }[];
	onOpen: (id: string) => void;
}) {
	return (
		<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
			<div>
				<h3 className={styles.st}>
					<i className={`bi ${icon}`} style={{ color: iconColor }} />
					{title}
				</h3>
				<p className={styles.ss}>{sub}</p>
			</div>
			{actions && (
				<div className="d-flex" style={{ gap: 8 }}>
					{actions.map((a) => (
						<button
							key={a.label}
							className={`${styles.btnPm} ${styles.btnSm} ${a.tone === "primary" ? styles.btnPmP : a.tone === "danger" ? styles.btnPmD : ""}`}
							onClick={() => onOpen(a.modal)}
						>
							{a.icon && <i className={`bi ${a.icon}`} />} {a.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

/* ---------- integration status badge ---------- */
function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
	const statusMap: Record<IntegrationStatus, { class: string; icon: string; label: string }> = {
		connected: { class: styles.integStatusConn, icon: "bi-check", label: "Connected" },
		disconnected: { class: styles.integStatusDisconn, icon: "", label: "Not connected" },
		error: { class: styles.integStatusErr, icon: "", label: "Error" },
	};

	const { class: statusClass, icon, label } = statusMap[status];
	const healthDotClass = status === "connected" ? styles.healthDotG : status === "error" ? styles.healthDotR : "";

	return (
		<span className={`${styles.integStatus} ${statusClass}`}>
			{healthDotClass && <span className={`${styles.healthDot} ${healthDotClass}`} />}
			{icon && <i className={`bi ${icon}`} />} {label}
		</span>
	);
}

/* ---------- health check card ---------- */
function HealthCheckCard({ health, onOpen }: { health: (typeof HEALTH_CHECKS)[0]; onOpen: (id: string) => void }) {
	const bgColor = health.status === "healthy" ? "var(--pm-accent-soft)" : health.status === "warning" ? "var(--pm-warning-soft)" : "var(--pm-danger-soft)";
	const dotClass = health.status === "healthy" ? styles.healthDotG : health.status === "warning" ? styles.healthDotA : styles.healthDotR;

	return (
		<div className="col-6 col-md-3">
			<div className="p-3 rounded text-center" style={{ background: bgColor }}>
				<span className={`${styles.healthDot} ${dotClass}`} />
				<div style={{ fontWeight: 700, marginTop: 4 }}>{health.name}</div>
				<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>
					{health.uptime || health.lastSync || health.tokenExpiry || health.errorMessage}
				</div>
				{health.status === "error" && (
					<button className={`${styles.btnPm} ${styles.btnSm} mt-1`} onClick={() => onOpen("syncLogModal")}>
						Retry
					</button>
				)}
			</div>
		</div>
	);
}

/* ---------- integration card ---------- */
/* Modal each marketplace card opens — mirrors apps-integrations.html buttons. */
const ACTION_MODAL: Record<string, string> = {
	whatsapp: "whatsappDetailModal",
	instagram: "instagramDetailModal",
	sendy: "sendyDetailModal",
	quickbooks: "quickbooksDetailModal",
	xero: "connectAppModal",
	"google-analytics": "analyticsModal",
	zapier: "connectAppModal",
	glovo: "connectAppModal",
};

function IntegrationCard({ integration, onOpen }: { integration: Integration; onOpen: (id: string) => void }) {
	const actionLabel = integration.status === "connected" ? "Manage" : integration.status === "error" ? "Fix" : "Connect";
	const actionModal = ACTION_MODAL[integration.id] ?? "connectAppModal";

	return (
		<div className="col-md-3" data-cat={integration.category}>
			<div className={styles.integCard} onClick={() => onOpen(actionModal)}>
				<div className="d-flex justify-content-between">
					<div className={styles.integIcon} style={{ background: integration.iconColor }}>
						<i className={`bi ${integration.icon}`} />
					</div>
					<IntegrationStatusBadge status={integration.status} />
				</div>
				<div style={{ fontWeight: 700, marginTop: 8 }}>{integration.name}</div>
				<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{integration.description}</div>
				<button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={(e) => { e.stopPropagation(); onOpen(actionModal); }}>
					{actionLabel}
				</button>
			</div>
		</div>
	);
}

/* ---------- inbox item ---------- */
function InboxItem({ message, onOpen }: { message: (typeof INBOX_MESSAGES)[0]; onOpen: (id: string) => void }) {
	return (
		<div className={styles.inboxItem} onClick={() => onOpen("chatModal")}>
			<div className={styles.avatar} style={{ background: message.avatarColor }}>
				{message.avatar}
			</div>
			<div className="flex-1">
				<div style={{ fontWeight: 600 }}>
					{message.name}{" "}
					<Badge tone="warning" style={{ background: message.platformColor === "var(--pm-pink)" ? "var(--pm-pink-soft)" : "" }}>
						{message.platform}
					</Badge>
				</div>
				<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>"{message.message}"</div>
			</div>
			<Badge tone={message.time === "2 min" ? "danger" : "warning"}>{message.time}</Badge>
		</div>
	);
}

/* ---------- delivery provider card ---------- */
function DeliveryProviderCard({ provider, onOpen }: { provider: (typeof DELIVERY_PROVIDERS)[0]; onOpen: (id: string) => void }) {
	return (
		<div className="col-lg-4">
			<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)", border: "1px solid var(--pm-border)" }}>
				<div className="d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center gap-2">
						<div className={styles.integIcon} style={{ width: 34, height: 34, fontSize: 16, background: provider.iconColor }}>
							<i className={`bi ${provider.icon}`} />
						</div>
						<strong>{provider.name}</strong>
					</div>
					<IntegrationStatusBadge status={provider.status as IntegrationStatus} />
				</div>
				<div style={{ fontSize: 11, color: "var(--pm-muted)", marginTop: 6 }}>
					{provider.deliveriesThisMonth ? `${provider.deliveriesThisMonth} deliveries this month` : provider.description}
				</div>
				<button
					className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`}
					onClick={() => onOpen(provider.status === "error" ? "sendyDetailModal" : "connectAppModal")}
				>
					{provider.status === "error" ? "Fix Connection" : "Connect"}
				</button>
			</div>
		</div>
	);
}

/* ---------- sync row ---------- */
function SyncRow({ icon, iconColor, title, subtitle, action, onClick }: {
	icon: string;
	iconColor: string;
	title: string;
	subtitle: string;
	action?: ReactNode;
	onClick?: () => void;
}) {
	return (
		<div className={styles.syncRow} onClick={onClick}>
			<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: iconColor === "var(--pm-accent)" ? "var(--pm-accent-soft)" : "var(--pm-info-soft)", color: iconColor }}>
				<i className={`bi ${icon}`} />
			</div>
			<div className="flex-1">
				<div style={{ fontWeight: 600 }}>{title}</div>
				<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{subtitle}</div>
			</div>
			{action}
		</div>
	);
}

/* ---------- main component ---------- */	export default function AppsIntegrations() {
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const open = (id: string) => setActiveModal(id);
	const close = () => setActiveModal(null);
	const toast = (msg: string) => {
		setToastMsg(msg);
		window.setTimeout(() => setToastMsg(null), 2800);
	};

	// Filter integrations by category and search
	const filteredIntegrations = INTEGRATIONS.filter((int) => {
		const matchesCategory = selectedCategory === "all" || int.category === selectedCategory;
		const matchesSearch = searchQuery === "" || int.name.toLowerCase().includes(searchQuery.toLowerCase()) || int.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	return (
		<div className={styles.appsIntegrations}>
			{/* Sidebar — rendered by BusinessShell, not the page */}

			{/* Main Content */}
			<div className={styles.main}>
				{/* Header — rendered by BusinessShell, not the page */}

				{/* Page Bar */}
				<div className={styles.pageBar}>
					<div>
						<div className={styles.breadcrumb}>
							<a href="/business-dashboard">Business Portal</a> / <strong>Apps & Integrations</strong>
						</div>
						<h2 style={{ fontFamily: "var(--pm-font-display)", fontSize: 22, fontWeight: 700, margin: 0 }}>
							Apps & Integrations
						</h2>
						<p className={styles.sectionSub}>Connect your tools so everything flows into PayMo — never leave the platform.</p>
					</div>
					<div className="d-flex gap-2 flex-wrap align-items-center">
						<div className={styles.headerSearch}>
							<i className="bi bi-search" />
							<input
								placeholder="Search apps, integrations, syncs..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) open("marketplaceModal"); }}
							/>
						</div>
						<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => open("marketplaceModal")}>
							<i className="bi bi-grid" /> Marketplace
						</button>
						<button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => open("syncNowModal")}>
							<i className="bi bi-arrow-repeat" /> Sync Now
						</button>
					</div>
				</div>

				{/* Content */}
				<div className={styles.content}>
					{/* Integration Health */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-heart-pulse"
							iconColor="var(--pm-danger)"
							title="Integration Health"
							sub="Monitoring & sync status"
							actions={[
								{ label: "Sync Logs", icon: "bi-list-check", modal: "syncLogModal" },
								{ label: "Webhooks", icon: "bi-broadcast", modal: "webhooksModal" },
							]}
							onOpen={open}
						/>
						<div className="row g-2">
							{HEALTH_CHECKS.map((health) => (
								<HealthCheckCard key={health.id} health={health} onOpen={open} />
							))}
						</div>
					</div>

					{/* Integration Marketplace */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-grid"
							iconColor="var(--pm-primary)"
							title="Integration Marketplace"
							sub="Discover & connect your tools"
							onOpen={open}
						/>
						<div className={styles.marketTabs}>
							{(["all", "sell", "deliver", "accounting", "analytics", "automation"] as const).map((cat) => (
								<button
									key={cat}
									className={`${styles.marketTab} ${selectedCategory === cat ? styles.active : ""}`}
									onClick={() => setSelectedCategory(cat)}
								>
									{cat === "all" ? "All" : cat === "sell" ? "Sell Everywhere" : cat === "deliver" ? "Deliver & Fulfill" : cat === "accounting" ? "Accounting & Tax" : cat === "analytics" ? "Analytics" : "Automation"}
								</button>
							))}
						</div>
						<div className="row g-3">
							{filteredIntegrations.map((integration) => (
								<IntegrationCard key={integration.id} integration={integration} onOpen={open} />
							))}
						</div>
					</div>

					{/* Social & Commerce */}
					<div className="row g-3">
						<div className="col-lg-7">
							<div className={`${styles.card} h-100`}>
								<SectionHead
									icon="bi-chat-dots"
									iconColor="var(--pm-info)"
									title="Unified Social Inbox"
									sub="All customer conversations, one feed"
									actions={[{ label: "Open", icon: "bi-arrow-up-right", modal: "socialInboxModal" }]}
									onOpen={open}
								/>
								{INBOX_MESSAGES.map((message) => (
									<InboxItem key={message.id} message={message} onOpen={open} />
								))}
							</div>
						</div>
						<div className="col-lg-5">
							<div className={`${styles.card} h-100`}>
								<SectionHead
									icon="bi-shop"
									iconColor="var(--pm-accent)"
									title="Social & Commerce Connectors"
									sub="Sell where customers are"
									onOpen={open}
								/>
								<div className={styles.statusRow}>
									<span>WhatsApp Business API</span>
									<IntegrationStatusBadge status="connected" />
								</div>
								<div className={styles.statusRow}>
									<span>Instagram Shop</span>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => open("instagramDetailModal")}>
										Manage
									</button>
								</div>
								<div className={styles.statusRow}>
									<span>Facebook Shop</span>
									<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => open("facebookDetailModal")}>
										Manage
									</button>
								</div>
								<div className={styles.statusRow}>
									<span>TikTok Shop</span>
									<Badge tone="warning">Phase 2</Badge>
								</div>
								<button className={`${styles.btnPm} ${styles.btnSm} w-100 mt-2`} onClick={() => open("socialInboxModal")}>
									<i className="bi bi-inbox" /> Unified Inbox
								</button>
							</div>
						</div>
					</div>

					{/* Logistics & Delivery */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-scooter"
							iconColor="var(--pm-warning)"
							title="Logistics & Delivery"
							sub="One-click dispatch with tracking"
							actions={[{ label: "Dispatch Order", icon: "bi-send", modal: "dispatchModal", tone: "primary" }]}
							onOpen={open}
						/>
						<div className="row g-3">
							{DELIVERY_PROVIDERS.map((provider) => (
								<DeliveryProviderCard key={provider.id} provider={provider} onOpen={open} />
							))}
						</div>
						<SyncRow
							icon="bi-box"
							iconColor="var(--pm-info)"
							title="Order #1042 — dispatch via Sendy"
							subtitle="Pickup: Nairobi · Drop: Westlands · Tracking URL sent to customer"
							action={<Badge tone="success">In Transit</Badge>}
							onClick={() => open("dispatchDetailModal")}
						/>
					</div>

					{/* Accounting & ERP Exports */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-journal-check"
							iconColor="var(--pm-accent)"
							title="Accounting & ERP Exports"
							sub="Keep your external accountant happy"
							actions={[
								{ label: "Export CSV", icon: "bi-download", modal: "exportModal" },
								{ label: "Mapping", icon: "bi-diagram-3", modal: "accountingMappingModal" },
							]}
							onOpen={open}
						/>
						{ACCOUNTING_EXPORTS.map((exportItem) => (
							<SyncRow
								key={exportItem.id}
								icon="bi-journal"
								iconColor="var(--pm-accent)"
								title={exportItem.name}
								subtitle={`${exportItem.schedule} · ${exportItem.dataTypes.join(", ")}`}
								action={<IntegrationStatusBadge status="connected" />}
							/>
						))}
						<SyncRow
							icon="bi-diagram-3"
							iconColor="var(--pm-info)"
							title="Account Mapping"
							subtitle="PayMo → QuickBooks · 24 accounts mapped"
							action={<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => open("accountingMappingModal")}>Edit</button>}
							onClick={() => open("accountingMappingModal")}
						/>
						<div className="p-3 rounded mt-2" style={{ background: "var(--pm-info-soft)", fontSize: 12 }}>
							<i className="bi bi-info-circle" /> PayMo's native Bookkeeping is real-time & superior. This is for compliance with external accountants. Export to KRA iTax format also available.
						</div>
					</div>

					{/* Analytics & Tracking Pixels */}
					<div className={styles.card}>
						<SectionHead
							icon="bi-bar-chart"
							iconColor="var(--pm-purple)"
							title="Analytics & Tracking Pixels"
							sub="Measure ad performance"
							onOpen={open}
						/>
						{ANALYTICS_PIXELS.map((pixel) => (
							<SyncRow
								key={pixel.id}
								icon={pixel.icon}
								iconColor={pixel.iconColor}
								title={pixel.name}
								subtitle={`Measurement ID: ${pixel.measurementId || pixel.pixelId} · ${pixel.description}`}
								action={<button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => open(pixel.id === "ga4" ? "analyticsModal" : "metaPixelModal")}>Configure</button>}
								onClick={() => open(pixel.id === "ga4" ? "analyticsModal" : "metaPixelModal")}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Quick Actions Bar */}
			<div className={styles.quickBar}>
				<div className={styles.qb} onClick={() => open("marketplaceModal")}>
					<i className="bi bi-grid text-primary" /> Connect App
				</div>
				<div className={styles.qb} onClick={() => open("dispatchModal")}>
					<i className="bi bi-send text-success" /> Dispatch
				</div>
				<div className={`${styles.qb} position-relative`} onClick={() => open("syncNowModal")}>
					<i className="bi bi-arrow-repeat text-info" /> Sync Now <span className={styles.qbadge}>1</span>
				</div>
				<div className={styles.qb} onClick={() => open("syncLogModal")}>
					<i className="bi bi-heart-pulse text-warning" /> Health
				</div>
				<div className={styles.qb} onClick={() => open("socialInboxModal")}>
					<i className="bi bi-chat-dots text-danger" /> Inbox
				</div>
				<div className={styles.qb} onClick={() => open("exportModal")}>
					<i className="bi bi-download text-purple" style={{ color: "var(--pm-purple)" }} /> Export
				</div>
				<div className={styles.qb} onClick={() => toast("Opening developer docs — api.paymo.biz/docs (demo)")}>
					<i className="bi bi-code-slash text-secondary" /> API Docs
				</div>
			</div>

			{/* Modals (port of apps-integrations.html M1–M25) */}
			<AppsIntegrationsModals active={activeModal} onClose={close} onOpen={open} onToast={toast} />

			{/* Toast */}
			{toastMsg && (
				<div className={styles.toast}>
					<i className="bi bi-check-circle-fill" />
					<span>{toastMsg}</span>
				</div>
			)}
		</div>
	);
}
