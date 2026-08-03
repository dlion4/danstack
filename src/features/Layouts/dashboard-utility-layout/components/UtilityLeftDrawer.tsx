/* ============================================================================
 * UtilityLeftDrawer.tsx — left-side slide-in drawer for Developers & Security.
 * ---------------------------------------------------------------------------
 * Opens from the LEFT (separate from the sidebar) when the API Keys or Security
 * Center header buttons are clicked. Contains two tabs:
 *   - Security: session info, authentication items, policy links
 *   - API Keys: placeholder with "Create Key" button
 * ========================================================================== */
import { useState } from "react";
import type { AsideKind } from "../data/utilityLayoutData";
import { cx, leftDrawerData } from "../data/utilityLayoutData";
import styles from "../styles/utilityLayout.module.css";

const s = styles as Record<string, string>;

type DrawerTab = "security" | "apiKeys";

interface UtilityLeftDrawerProps {
	activePanel: AsideKind | null;
	onClose: () => void;
	onToast: (
		message: string,
		type: "success" | "danger" | "warning" | "info",
	) => void;
}

export default function UtilityLeftDrawer({
	activePanel,
	onClose,
	onToast,
}: UtilityLeftDrawerProps) {
	const isOpen = activePanel === "securityTab" || activePanel === "apiKeysTab";
	const initialTab: DrawerTab = activePanel === "apiKeysTab" ? "apiKeys" : "security";
	const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);

	const { session, authItems, policies } = leftDrawerData;

	return (
		<>
			{/* Backdrop */}
			<div
				className={cx(s["left-drawer-backdrop"], isOpen && s.show)}
				aria-hidden="true"
				onClick={onClose}
			/>

			{/* Drawer panel — slides from LEFT */}
			<aside
				className={cx(s["left-drawer"], isOpen && s.open)}
				aria-label="Developers & Security"
				aria-hidden={!isOpen}
			>
				{/* Header */}
				<div className={s["left-drawer-header"]}>
					<span className={s["left-drawer-title"]}>
						<i
							className="bi bi-code-slash"
							style={{ color: "var(--paymo-primary)" }}
						/>
						Developers & Security
					</span>
					<button
						type="button"
						className={s["aside-close"]}
						onClick={onClose}
						aria-label="Close"
					>
						<i className="bi bi-x-lg" />
					</button>
				</div>

				{/* Tabs */}
				<div className={s["left-drawer-tabs"]}>
					<button
						type="button"
						className={cx(s["left-drawer-tab"], activeTab === "security" && s["tab-active"])}
						onClick={() => setActiveTab("security")}
					>
						<i className="bi bi-shield-lock me-1" />
						Security
					</button>
					<button
						type="button"
						className={cx(s["left-drawer-tab"], activeTab === "apiKeys" && s["tab-active"])}
						onClick={() => setActiveTab("apiKeys")}
					>
						<i className="bi bi-key me-1" />
						API Keys
					</button>
				</div>

				{/* Tab content */}
				<div className={s["left-drawer-body"]}>
					{/* ============ SECURITY TAB ============ */}
					<div className={cx(s["left-drawer-panel"], activeTab === "security" && s["panel-visible"])}>
						{/* Session Info */}
						<div className={s["left-drawer-card"]}>
							<h6>Session Information</h6>
							<div className={s["status-row"]}>
								<span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>IP Address</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, fontFamily: "monospace", color: "var(--text)" }}>{session.ip}</span>
							</div>
							<div className={s["status-row"]}>
								<span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Location</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{session.location}</span>
							</div>
							<div className={s["status-row"]}>
								<span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Device</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{session.device}</span>
							</div>
							<div className={s["status-row"]}>
								<span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Last Login</span>
								<span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{session.lastLogin}</span>
							</div>
						</div>

						{/* Authentication Items */}
						<div className={s["left-drawer-card"]}>
							<h6>Authentication</h6>
							{authItems.map((item) => (
								<div className={s["auth-item"]} key={item.key}>
									<div className={s["auth-item-info"]}>
										<i className={`bi ${item.icon} ${s["auth-item-icon"]}`} />
										<div>
											<div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{item.label}</div>
											<span className={cx(s["auth-status-badge"], item.status === "not-set" && s["auth-not-set"])}>{item.statusLabel}</span>
										</div>
									</div>
									<button
										type="button"
										className={cx(s["auth-action-btn"], item.status === "not-set" && s["auth-action-danger"])}
										onClick={() => onToast(`${item.label}: ${item.action}`, item.status === "not-set" ? "warning" : "info")}
									>
										{item.action}
									</button>
								</div>
							))}
						</div>

						{/* Policy Links */}
						<div className={s["left-drawer-card"]}>
							<h6>Policies</h6>
							{policies.map((p) => (
								<div className={s["policy-link"]} key={p.key}>
									<i className={`bi ${p.icon}`} />
									<span>{p.label}</span>
									<i className={`bi bi-box-arrow-up-right ${s["policy-external"]}`} />
								</div>
							))}
						</div>
					</div>

					{/* ============ API KEYS TAB ============ */}
					<div className={cx(s["left-drawer-panel"], activeTab === "apiKeys" && s["panel-visible"])}>
						<div className={s["left-drawer-card"]}>
							<div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: "2.5rem 1rem", color: "var(--muted)" }}>
								<i className="bi bi-key" style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }} />
								<p style={{ fontSize: "0.88rem", marginBottom: "1.25rem", textAlign: "center" }}>
									No API keys yet. Create your first key to start integrating with the Paymo Utility API.
								</p>
								<button
									type="button"
									className={s.btnPrimary}
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
