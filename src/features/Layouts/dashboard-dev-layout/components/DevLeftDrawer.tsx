/* ============================================================================
 * DevLeftDrawer.tsx — left slide-in drawer for Security & Environments.
 * ========================================================================== */
import { useState } from "react";
import { cx } from "../data/devLayoutData";
import styles from "../styles/devLayout.module.css";

const s = styles as Record<string, string>;

interface DevLeftDrawerProps {
	open: boolean;
	activeTab: "security" | "env";
	onClose: () => void;
	onToast: (msg: string, type: "success" | "danger" | "warning" | "info") => void;
}

export default function DevLeftDrawer({ open, activeTab, onClose, onToast }: DevLeftDrawerProps) {
	const [tab, setTab] = useState(activeTab);

	const handleTabChange = (t: "security" | "env") => {
		setTab(t);
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className={cx(s["leftDrawerBackdrop"], open && s.show)}
				aria-hidden="true"
				onClick={onClose}
			/>
			{/* Drawer panel */}
			<aside
				className={cx(s["leftDrawer"], open && s.open)}
				aria-label="Security & Environments"
				aria-hidden={!open}
			>
				<div className={s["leftDrawerHeader"]}>
					<span className={s["leftDrawerTitle"]}>
						<i className="bi bi-shield-lock" /> Security & Access
					</span>
					<button type="button" className={s["aside-close"]} onClick={onClose} aria-label="Close">
						<i className="bi bi-x-lg" />
					</button>
				</div>

				{/* Tabs */}
				<div className={s["leftDrawerTabs"]}>
					<button
						type="button"
						className={cx(s["leftDrawerTab"], tab === "security" && s.tabActive)}
						onClick={() => handleTabChange("security")}
					>
						<i className="bi bi-shield-check" /> Security
					</button>
					<button
						type="button"
						className={cx(s["leftDrawerTab"], tab === "env" && s.tabActive)}
						onClick={() => handleTabChange("env")}
					>
						<i className="bi bi-globe2" /> Environments
					</button>
					<div
						className={s["tabIndicator"]}
						style={{ transform: tab === "env" ? "translateX(100%)" : "translateX(0)" }}
					/>
				</div>

				<div className={s["leftDrawerBody"]}>
					{/* ============ SECURITY TAB ============ */}
					<div className={cx(s["leftDrawerPanel"], tab === "security" && s.panelVisible)}>
						{/* Session Info */}
						<div className={s["leftDrawerCard"]}>
							<h6><i className="bi bi-terminal" /> Current Session</h6>
							<div className={s["sessionItem"]}>
								<span className="text-muted" style={{ fontSize: "0.78rem" }}>IP Address</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>192.168.1.42</span>
							</div>
							<div className={s["sessionItem"]}>
								<span className="text-muted" style={{ fontSize: "0.78rem" }}>Location</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>San Francisco, CA</span>
							</div>
							<div className={s["sessionItem"]}>
								<span className="text-muted" style={{ fontSize: "0.78rem" }}>IDE / Terminal</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>VS Code + Tabby</span>
							</div>
							<div className={s["sessionItem"]}>
								<span className="text-muted" style={{ fontSize: "0.78rem" }}>Last API Call</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>2 min ago</span>
							</div>
						</div>

						{/* Authentication */}
						<div className={s["leftDrawerCard"]}>
							<h6><i className="bi bi-lock" /> Authentication</h6>
							{[
								{ key: "2fa", label: "Two-Factor Auth", icon: "bi-shield-check", status: "set" as const, action: "Manage", statusLabel: "Enabled" },
								{ key: "ip-allowlist", label: "IP Allowlist", icon: "bi-geo-alt", status: "not-set" as const, action: "Configure", statusLabel: "Not configured" },
								{ key: "webhook-signing", label: "Webhook Signing", icon: "bi-pen", status: "set" as const, action: "Rotate", statusLabel: "Active" },
								{ key: "api-scopes", label: "API Scopes", icon: "bi-braces", status: "set" as const, action: "Edit scopes", statusLabel: "4 active" },
							].map((item) => (
								<div className={s["authItem"]} key={item.key}>
									<div className={s["authItemInfo"]}>
										<span className={s["authItemIcon"]}><i className={`bi ${item.icon}`} /></span>
										<div>
											<div className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text)" }}>{item.label}</div>
											<div className="text-muted" style={{ fontSize: "0.72rem" }}>{item.statusLabel}</div>
										</div>
									</div>
									<div className="d-flex align-items-center gap-2">
										<span className={cx(s["authStatusBadge"], item.status === "not-set" && s.authNotSet)}>
											{item.status === "set" ? "Active" : "Off"}
										</span>
										<button
												type="button"
												className={cx(s["authActionBtn"], item.key === "ip-allowlist" && s["authActionDanger"])}
												onClick={() => onToast(`${item.label}: ${item.action}`, "info")}
											>
												{item.action}
											</button>
										</div>
								</div>
							))}
						</div>

						{/* Policies */}
						<div className={s["leftDrawerCard"]}>
							<h6><i className="bi bi-journal-text" /> Developer Policies</h6>
							{[
								{ key: "rate-limits", label: "Rate Limiting Policy", icon: "bi-speedometer2" },
								{ key: "webhook-retry", label: "Webhook Retry Policy", icon: "bi-arrow-repeat" },
								{ key: "api-versioning", label: "API Versioning Guide", icon: "bi-code-slash" },
								{ key: "data-retention", label: "Data Retention Policy", icon: "bi-database" },
							].map((p) => (
								<a
									href="#"
									className={s["policyLink"]}
									key={p.key}
									onClick={(e) => { e.preventDefault(); onToast(`Opening ${p.label}`, "info"); }}
								>
									<i className={`bi ${p.icon}`} style={{ fontSize: "0.9rem" }} />
									<span className="flex-grow-1">{p.label}</span>
									<i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.75rem", color: "var(--muted)" }} />
								</a>
							))}
						</div>
					</div>

					{/* ============ ENVIRONMENTS TAB ============ */}
					<div className={cx(s["leftDrawerPanel"], tab === "env" && s.panelVisible)}>
						{/* Environment Cards */}
						{[
							{
								key: "sandbox",
								name: "Sandbox",
								url: "api.sandbox.paymo.dev",
								status: "active" as const,
								statusLabel: "Active",
								lastDeploy: "12 min ago",
								color: "#10b981",
								desc: "Full test environment with mock data and reset capability.",
							},
							{
								key: "staging",
								name: "Staging",
								url: "api.staging.paymo.dev",
								status: "ready" as const,
								statusLabel: "Ready",
								lastDeploy: "2h ago",
								color: "#f59e0b",
								desc: "Pre-production mirror with live data (anonymized).",
							},
							{
								key: "production",
								name: "Production",
								url: "api.paymo.dev",
								status: "locked" as const,
								statusLabel: "Approval required",
								lastDeploy: "5d ago",
								color: "#ef4444",
								desc: "Live environment. Deployments require team lead approval.",
							},
						].map((env) => (
							<div className={s["leftDrawerCard"]} key={env.key}>
								<div className="d-flex align-items-center justify-content-between mb-2">
									<div className="d-flex align-items-center gap-2">
										<span
											className={cx(s["status-dot"], env.status === "active" && s.active, env.status === "ready" && s.warning)}
											style={env.status === "locked" ? { background: env.color, boxShadow: `0 0 0 3px ${env.color}33` } : undefined}
										/>
										<span className="fw-bold" style={{ fontSize: "0.9rem" }}>{env.name}</span>
									</div>
									<span
										className={s["authStatusBadge"]}
										style={env.status === "locked" ? { background: "rgba(239,68,68,0.1)", color: "#ef4444" } : undefined}
									>
										{env.statusLabel}
									</span>
								</div>
								<div className={s["sessionItem"]}>
									<span className="text-muted" style={{ fontSize: "0.78rem" }}>Endpoint</span>
									<span className="fw-semibold" style={{ fontSize: "0.82rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", color: "var(--paymo-primary)" }}>{env.url}</span>
								</div>
								<div className={s["sessionItem"]}>
									<span className="text-muted" style={{ fontSize: "0.78rem" }}>Last Deploy</span>
									<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>{env.lastDeploy}</span>
								</div>
								<div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>{env.desc}</div>
								{env.status !== "locked" && (
									<button
										type="button"
										className="btn btn-sm w-100 mt-2"
										style={{
											fontSize: "0.8rem",
											fontWeight: 600,
											background: "linear-gradient(135deg, var(--paymo-primary), var(--paymo-primary-600))",
											color: "#fff",
											border: "none",
										}}
										onClick={() => onToast(`Switched to ${env.name} environment`, "success")}
									>
										<i className="bi bi-arrow-repeat me-1" /> Switch to {env.name}
									</button>
								)}
								{env.status === "locked" && (
									<button
										type="button"
										className={cx(s["authActionBtn"], s["authActionDanger"], "w-100 mt-2")}
										onClick={() => onToast("Request sent to team lead for approval", "warning")}
									>
										<i className="bi bi-lock me-1" /> Request Access
									</button>
								)}
							</div>
						))}

						{/* API Base URLs */}
						<div className={s["leftDrawerCard"]}>
							<h6><i className="bi bi-link-45deg" /> Quick Copy</h6>
							{[
								{ label: "Sandbox Base URL", value: "https://api.sandbox.paymo.dev/v1" },
								{ label: "Staging Base URL", value: "https://api.staging.paymo.dev/v1" },
								{ label: "Production Base URL", value: "https://api.paymo.dev/v1" },
							].map((u) => (
								<div className={s["sessionItem"]} key={u.label} style={{ cursor: "pointer" }} onClick={() => onToast(`Copied: ${u.value}`, "success")}>
									<span className="text-muted" style={{ fontSize: "0.75rem" }}>{u.label}</span>
									<span className="d-flex align-items-center gap-1">
										<span className="fw-semibold" style={{ fontSize: "0.78rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", color: "var(--paymo-primary)" }}>{u.value}</span>
										<i className="bi bi-clipboard" style={{ fontSize: "0.7rem", color: "var(--muted)" }} />
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
