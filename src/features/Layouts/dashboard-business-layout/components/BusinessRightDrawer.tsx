/* ============================================================================
 * BusinessRightDrawer.tsx — right-side slide-in drawer for Security & API Keys.
 * ---------------------------------------------------------------------------
 * Opens from the RIGHT (alongside the existing right aside panel) when the API Keys or Security
 * Center header buttons are clicked. Contains two tabs:
 *   - Security: session info, authentication items, policy links
 *   - API Keys: placeholder with "Create Key" button
 * ========================================================================== */
import { useState } from "react";
import type { AsideKind } from "../data/businessLayoutData";
import { cx, securityDrawerData } from "../data/businessLayoutData";
import styles from "../styles/businessLayout.module.css";

const s = styles as Record<string, string>;

type DrawerTab = "security" | "apiKeys";

interface BusinessRightDrawerProps {
	activePanel: AsideKind | null;
	onClose: () => void;
	onToast: (
		message: string,
		type: "success" | "danger" | "warning" | "info",
	) => void;
}

export default function BusinessRightDrawer({
	activePanel,
	onClose,
	onToast,
}: BusinessRightDrawerProps) {
	const isOpen = activePanel === "security" || activePanel === "apiKeys";
	const initialTab: DrawerTab =
		activePanel === "apiKeys" ? "apiKeys" : "security";
	const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);

	/* Sync tab when panel is (re-)opened */
	const handleTabSwitch = (tab: DrawerTab) => {
		setActiveTab(tab);
	};

	const { session, authItems, policies } = securityDrawerData;

	return (
		<>
			{/* Backdrop */}
			<div
				className={cx(s["right-drawer-backdrop"], isOpen && s.show)}
				aria-hidden="true"
				onClick={onClose}
			/>

			{/* Drawer panel — slides from LEFT */}
			<aside
				className={cx(s["right-drawer"], isOpen && s.open)}
				aria-label="Developers & Security"
				aria-hidden={!isOpen}
			>
				{/* Header */}
				<div className={s["right-drawer-header"]}>
					<span className={s["right-drawer-title"]}>
						<i className="bi bi-code-slash" style={{ color: "var(--paymo-primary)" }} />
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
				<div className={s["right-drawer-tabs"]}>
					<button
						type="button"
						className={cx(
							s["right-drawer-tab"],
							activeTab === "security" && s["tab-active"],
						)}
						onClick={() => handleTabSwitch("security")}
					>
						<i className="bi bi-shield-lock me-1" />
						Security
					</button>
					<button
						type="button"
						className={cx(
							s["right-drawer-tab"],
							activeTab === "apiKeys" && s["tab-active"],
						)}
						onClick={() => handleTabSwitch("apiKeys")}
					>
						<i className="bi bi-key me-1" />
						API Keys
					</button>
				</div>

				{/* Tab content */}
				<div className={s["right-drawer-body"]}>
					{/* ============ SECURITY TAB ============ */}
					<div
						className={cx(
							s["right-drawer-panel"],
							activeTab === "security" && s["panel-visible"],
						)}
					>
						{/* Session Info */}
						<div className={s["right-drawer-card"]}>
							<h6>Session Information</h6>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									IP Address
								</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>
									{session.ip}
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Location
								</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
									{session.location}
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Device
								</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
									{session.device}
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Last Login
								</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
									{session.lastLogin}
								</span>
							</div>
						</div>

						{/* Authentication Items */}
						<div className={s["right-drawer-card"]}>
							<h6>Authentication</h6>
							{authItems.map((item) => (
								<div className={s["auth-item"]} key={item.key}>
									<div className={s["auth-item-info"]}>
										<i className={`bi ${item.icon} ${s["auth-item-icon"]}`} />
										<div>
											<div className="fw-semibold" style={{ fontSize: "0.85rem" }}>
												{item.label}
											</div>
											<span
												className={cx(
													s["auth-status-badge"],
													item.status === "not-set" && s["auth-not-set"],
												)}
											>
												{item.statusLabel}
											</span>
										</div>
									</div>
									<button
										type="button"
										className={cx(
											s["auth-action-btn"],
											item.status === "not-set" && s["auth-action-danger"],
										)}
										onClick={() => onToast(`${item.label}: ${item.action}`, item.status === "not-set" ? "warning" : "info")}
									>
										{item.action}
									</button>
								</div>
							))}
						</div>

						{/* Policy Links */}
						<div className={s["right-drawer-card"]}>
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
					<div
						className={cx(
							s["right-drawer-panel"],
							activeTab === "apiKeys" && s["panel-visible"],
						)}
					>
						<div className={s["right-drawer-card"]}>
							<div
								className="d-flex flex-column align-items-center justify-content-center"
								style={{
									padding: "2.5rem 1rem",
									color: "var(--muted)",
								}}
							>
								<i
									className="bi bi-key"
									style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }}
								/>
								<p style={{ fontSize: "0.88rem", marginBottom: "1.25rem", textAlign: "center" }}>
									No API keys yet. Create your first key to start
									integrating with the Paymo BAAS API.
								</p>
								<button
									type="button"
									className="btn btn-primary btn-sm"
									style={{
										background: "linear-gradient(135deg, var(--paymo-primary), var(--paymo-primary-600))",
										border: "none",
										padding: "0.55rem 1.4rem",
										borderRadius: "var(--radius-xs)",
										fontSize: "0.85rem",
									}}
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
