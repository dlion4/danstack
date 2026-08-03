/* ============================================================================
 * CardsLeftDrawer.tsx — left-side slide-in drawer for Developers & Security.
 * ---------------------------------------------------------------------------
 * Opens from the LEFT (separate from the sidebar) when the API Keys or Security
 * Center header buttons are clicked. Contains two tabs:
 *   - Security: session info, authentication items, policy links
 *   - API Keys: placeholder with "Create Key" button
 * ========================================================================== */
import { useState } from "react";
import type { AsideKind } from "../data/cardsLayoutData";
import { cx, leftDrawerData } from "../data/cardsLayoutData";
import styles from "../styles/cardsLayout.module.css";

const s = styles as Record<string, string>;

type DrawerTab = "security" | "apiKeys";

interface CardsLeftDrawerProps {
	activePanel: AsideKind | null;
	onClose: () => void;
	onToast: (
		message: string,
		type: "success" | "danger" | "warning" | "info",
	) => void;
}

export default function CardsLeftDrawer({
	activePanel,
	onClose,
	onToast,
}: CardsLeftDrawerProps) {
	const isOpen = activePanel === "securityTab" || activePanel === "apiKeysTab";
	const initialTab: DrawerTab =
		activePanel === "apiKeysTab" ? "apiKeys" : "security";
	const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);

	const { session, authItems, policies } = leftDrawerData;

	return (
		<>
			{/* Backdrop */}
			<div
				className={cx(s.leftDrawerBackdrop, isOpen && s.show)}
				aria-hidden="true"
				onClick={onClose}
			/>

			{/* Drawer panel — slides from LEFT */}
			<aside
				className={cx(s.leftDrawer, isOpen && s.open)}
				aria-label="Developers & Security"
				aria-hidden={!isOpen}
			>
				{/* Header */}
				<div className={s.leftDrawerHeader}>
					<span className={s.leftDrawerTitle}>
						<i
							className="bi bi-code-slash"
							style={{ color: "var(--cl-primary)" }}
						/>
						Developers & Security
					</span>
					<button
						type="button"
						className={s.asideClose}
						onClick={onClose}
						aria-label="Close"
					>
						<i className="bi bi-x-lg" />
					</button>
				</div>

				{/* Tabs */}
				<div className={s.leftDrawerTabs}>
					<button
						type="button"
						className={cx(
							s.leftDrawerTab,
							activeTab === "security" && s.tabActive,
						)}
						onClick={() => setActiveTab("security")}
					>
						<i className="bi bi-shield-lock me-1" />
						Security
					</button>
					<button
						type="button"
						className={cx(
							s.leftDrawerTab,
							activeTab === "apiKeys" && s.tabActive,
						)}
						onClick={() => setActiveTab("apiKeys")}
					>
						<i className="bi bi-key me-1" />
						API Keys
					</button>
				</div>

				{/* Tab content */}
				<div className={s.leftDrawerBody}>
					{/* ============ SECURITY TAB ============ */}
					<div
						className={cx(
							s.leftDrawerPanel,
							activeTab === "security" && s.panelVisible,
						)}
					>
						{/* Session Info */}
						<div className={s.leftDrawerCard}>
							<h6>Session Information</h6>
							<div className={s.statusRow}>
								<span style={{ fontSize: "0.82rem", color: "var(--cl-muted)" }}>IP Address</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, fontFamily: "monospace", color: "var(--cl-text)" }}>{session.ip}</span>
							</div>
							<div className={s.statusRow}>
								<span style={{ fontSize: "0.82rem", color: "var(--cl-muted)" }}>Location</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--cl-text)" }}>{session.location}</span>
							</div>
							<div className={s.statusRow}>
								<span style={{ fontSize: "0.82rem", color: "var(--cl-muted)" }}>Device</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--cl-text)" }}>{session.device}</span>
							</div>
							<div className={s.statusRow}>
								<span style={{ fontSize: "0.82rem", color: "var(--cl-muted)" }}>Last Login</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--cl-text)" }}>{session.lastLogin}</span>
							</div>
						</div>

						{/* Authentication Items */}
						<div className={s.leftDrawerCard}>
							<h6>Authentication</h6>
							{authItems.map((item) => (
								<div className={s.authItem} key={item.key}>
									<div className={s.authItemInfo}>
										<i className={`bi ${item.icon} ${s.authItemIcon}`} />
										<div>
											<div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--cl-text)" }}>{item.label}</div>
											<span className={cx(s.authStatusBadge, item.status === "not-set" && s.authNotSet)}>{item.statusLabel}</span>
										</div>
									</div>
									<button
										type="button"
										className={cx(s.authActionBtn, item.status === "not-set" && s.authActionDanger)}
										onClick={() => onToast(`${item.label}: ${item.action}`, item.status === "not-set" ? "warning" : "info")}
									>
										{item.action}
									</button>
								</div>
							))}
						</div>

						{/* Policy Links */}
						<div className={s.leftDrawerCard}>
							<h6>Policies</h6>
							{policies.map((p) => (
								<div className={s.policyLink} key={p.key}>
									<i className={`bi ${p.icon}`} />
									<span>{p.label}</span>
									<i className={`bi bi-box-arrow-up-right ${s.policyExternal}`} />
								</div>
							))}
						</div>
					</div>

					{/* ============ API KEYS TAB ============ */}
					<div
						className={cx(
							s.leftDrawerPanel,
							activeTab === "apiKeys" && s.panelVisible,
						)}
					>
						<div className={s.leftDrawerCard}>
							<div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: "2.5rem 1rem", color: "var(--cl-muted)" }}>
								<i className="bi bi-key" style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }} />
								<p style={{ fontSize: "0.88rem", marginBottom: "1.25rem", textAlign: "center" }}>
									No API keys yet. Create your first key to start integrating with the Paymo Cards API.
								</p>
								<button
									type="button"
									className={cx(s.btnPrimary, "btn-sm")}
									style={{ padding: "0.55rem 1.4rem", fontSize: "0.85rem" }}
									onClick={() => onToast("API key creation dialog would open here", "info")}
								>
									<i className="bi bi-plus-lg me-1" />
									Create Key
								</button>
							</div>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
