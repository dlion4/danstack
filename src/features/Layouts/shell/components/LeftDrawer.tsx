/* ============================================================================
 * LeftDrawer.tsx — left-side slide-in drawer for Developers & Security.
 * ---------------------------------------------------------------------------
 * Opens from the RIGHT when the API Keys or Security
 * Center header buttons are clicked. Contains two tabs:
 *   - Security: session info, authentication items, policy links
 *   - API Keys: placeholder with "Create Key" button
 * ========================================================================== */
import { useEffect, useState } from "react";
import type { AsideKind } from "../data/shellData";
import { cx, leftDrawerData } from "../data/shellData";
import styles from "../styles/shell.module.css";

const s = styles as Record<string, string>;

type DrawerTab = "security" | "apiKeys";

interface LeftDrawerProps {
	activePanel: AsideKind | null;
	onClose: () => void;
	onToast: (
		message: string,
		type: "success" | "danger" | "warning" | "info",
	) => void;
}

export default function LeftDrawer({
	activePanel,
	onClose,
	onToast,
}: LeftDrawerProps) {
	const isOpen = activePanel === "securityTab" || activePanel === "apiKeysTab";
	const initialTab: DrawerTab =
		activePanel === "apiKeysTab" ? "apiKeys" : "security";
	const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);

	useEffect(() => {
		if (isOpen) setActiveTab(initialTab);
	}, [initialTab, isOpen]);

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
							style={{ color: "var(--sh-accent-2)" }}
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
								<span
									style={{
										fontSize: "0.82rem",
										color: "var(--sh-ink-3)",
									}}
								>
									IP Address
								</span>
								<span
									style={{
										fontSize: "0.82rem",
										fontWeight: 600,
										fontFamily: "monospace",
										color: "var(--sh-ink-1)",
									}}
								>
									{session.ip}
								</span>
							</div>
							<div className={s.statusRow}>
								<span
									style={{
										fontSize: "0.82rem",
										color: "var(--sh-ink-3)",
									}}
								>
									Location
								</span>
								<span
									style={{
										fontSize: "0.82rem",
										fontWeight: 600,
										color: "var(--sh-ink-1)",
									}}
								>
									{session.location}
								</span>
							</div>
							<div className={s.statusRow}>
								<span
									style={{
										fontSize: "0.82rem",
										color: "var(--sh-ink-3)",
									}}
								>
									Device
								</span>
								<span
									style={{
										fontSize: "0.82rem",
										fontWeight: 600,
										color: "var(--sh-ink-1)",
									}}
								>
									{session.device}
								</span>
							</div>
							<div className={s.statusRow}>
								<span
									style={{
										fontSize: "0.82rem",
										color: "var(--sh-ink-3)",
									}}
								>
									Last Login
								</span>
								<span
									style={{
										fontSize: "0.82rem",
										fontWeight: 600,
										color: "var(--sh-ink-1)",
									}}
								>
									{session.lastLogin}
								</span>
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
											<div
												style={{
													fontSize: "0.85rem",
													fontWeight: 600,
													color: "var(--sh-ink-1)",
												}}
											>
												{item.label}
											</div>
											<span
												className={cx(
													s.authStatusBadge,
													item.status === "not-set" && s.authNotSet,
												)}
											>
												{item.statusLabel}
												</span>
										</div>
									</div>
									<button
										type="button"
										className={cx(
											s.authActionBtn,
											item.status === "not-set" && s.authActionDanger,
										)}
										onClick={() =>
											onToast(
												`${item.label}: ${item.action}`,
												item.status === "not-set" ? "warning" : "info",
											)
										}
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
							<div
								className="d-flex flex-column align-items-center justify-content-center"
								style={{
									padding: "2.5rem 1rem",
									color: "var(--sh-ink-3)",
								}}
							>
								<i
									className="bi bi-key"
									style={{
										fontSize: "2.5rem",
										marginBottom: "1rem",
										opacity: 0.4,
									}}
								/>
								<p
									style={{
										fontSize: "0.88rem",
										marginBottom: "1.25rem",
										textAlign: "center",
									}}
								>
									No API keys yet. Create your first key to start
									integrating with the Paymo BAAS API.
								</p>
								<button
									type="button"
									className="btn btn-primary btn-sm"
									style={{
										background:
											"linear-gradient(135deg, var(--sh-primary), var(--sh-primary-600))",
										border: "none",
										padding: "0.55rem 1.4rem",
										borderRadius: "var(--sh-radius-xs)",
										fontSize: "0.85rem",
									}}
									onClick={() =>
										onToast(
											"API key creation dialog would open here",
											"info",
										)
									}
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
