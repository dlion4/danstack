/* ============================================================================
 * DevAside.tsx — slide-in context panel for the Paymo BAAS Developer Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-dev-aside.*
 * LEGACY BRIDGE: panel visibility is derived from `activePanel` (instead of
 *   toggling .active on DOM nodes). The three dev panels (systemStatus,
 *   apiExplorer, apiKeys) fire toasts on their primary actions.
 * ========================================================================== */
import type { AsideKind } from "../data/devLayoutData";
import { cx } from "../data/devLayoutData";
import styles from "../styles/devLayout.module.css";

const s = styles as Record<string, string>;

interface DevAsideProps {
	activePanel: AsideKind | null;
	onClose: () => void;
	onToast: (
		message: string,
		type: "success" | "danger" | "warning" | "info",
	) => void;
}

export default function DevAside({
	activePanel,
	onClose,
	onToast,
}: DevAsideProps) {
	return (
		<>
			<div
				className={cx(s["aside-backdrop"], activePanel && s.show)}
				aria-hidden="true"
				onClick={onClose}
			/>
			<aside
				className={cx(s["right-aside"], activePanel && s.open)}
				aria-label="Context panel"
				aria-hidden={!activePanel}
			>
				{/* ============ SYSTEM STATUS ============ */}
				<div
					className={cx(
						s["aside-panel-content"],
						activePanel === "systemStatus" && s.active,
					)}
				>
					<div className={s["aside-header"]}>
						<span className={s["aside-title"]}>
							<i className="bi bi-activity text-primary" /> System Status
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
					<div className={s["aside-body"]}>
						<div className={s["aside-card"]}>
							<h6>Service Health</h6>
							<div className={s["status-row"]}>
								<div className="d-flex align-items-center">
									<span className={cx(s["status-dot"], s.active)} />
									<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
										Core Payments API
									</span>
								</div>
								<span
									style={{ fontSize: "0.72rem", color: "var(--paymo-accent)" }}
								>
									Operational
								</span>
							</div>
							<div className={s["status-row"]}>
								<div className="d-flex align-items-center">
									<span className={cx(s["status-dot"], s.warning)} />
									<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
										Webhook Delivery
									</span>
								</div>
								<span
									style={{ fontSize: "0.72rem", color: "var(--paymo-warning)" }}
								>
									Degraded
								</span>
							</div>
							<div className={s["status-row"]}>
								<div className="d-flex align-items-center">
									<span className={cx(s["status-dot"], s.active)} />
									<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
										Card Issuance
									</span>
								</div>
								<span
									style={{ fontSize: "0.72rem", color: "var(--paymo-accent)" }}
								>
									Operational
								</span>
							</div>
							<div className={s["status-row"]}>
								<div className="d-flex align-items-center">
									<span className={cx(s["status-dot"], s.active)} />
									<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
										KYC Verification
									</span>
								</div>
								<span
									style={{ fontSize: "0.72rem", color: "var(--paymo-accent)" }}
								>
									Operational
								</span>
							</div>
						</div>
						<div className={s["aside-card"]}>
							<h6>API Latency (ms)</h6>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									p50
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									67ms
								</span>
							</div>
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									p95
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									189ms
								</span>
							</div>
							<div className="d-flex justify-content-between">
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									p99
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									342ms
								</span>
							</div>
						</div>
						<button
							type="button"
							className="btn btn-primary w-100"
							onClick={() => onToast("Status refreshed", "success")}
						>
							Refresh Services
						</button>

				<div className={s["aside-card"]}>
					<h6>Recent Incidents</h6>
					{[
						{ severity: "#ef4444", title: "Webhook Delivery Failure", desc: "api.client.com/hooks — timeout after 30s", time: "5m ago" },
						{ severity: "#f59e0b", title: "Rate Limit Approaching", desc: "Sandbox at 80% of 10K req/min", time: "30m ago" },
						{ severity: "#ef4444", title: "Deploy Rollback", desc: "SDK v4.1.9 rolled back due to auth regression", time: "2h ago" },
					].map((inc, idx) => (
						<div className={s.incidentItem} key={idx}>
							<span className={s.incidentSeverity} style={{ background: inc.severity }} />
							<div className="flex-grow-1" style={{ minWidth: 0 }}>
								<div className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text)" }}>{inc.title}</div>
								<div className="text-truncate" style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{inc.desc}</div>
							</div>
							<span className="text-muted flex-shrink-0" style={{ fontSize: "0.68rem" }}>{inc.time}</span>
						</div>
					))}
				</div>
					</div>
				</div>

				{/* ============ API EXPLORER ============ */}
				<div
					className={cx(
						s["aside-panel-content"],
						activePanel === "apiExplorer" && s.active,
					)}
				>
					<div className={s["aside-header"]}>
						<span className={s["aside-title"]}>
							<i className="bi bi-terminal text-primary" /> API Explorer
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
					<div className={s["aside-body"]}>
						<div className={s["aside-card"]}>
							<h6>Test Request</h6>
							<div className="mb-2">
								<label
									className="form-label fw-semibold"
									style={{ fontSize: "0.82rem" }}
								>
									Method
								</label>
								<select
									className="form-select form-select-sm"
									defaultValue="GET"
								>
									<option>GET</option>
									<option>POST</option>
									<option>PUT</option>
									<option>DELETE</option>
								</select>
							</div>
							<div className="mb-2">
								<label
									className="form-label fw-semibold"
									style={{ fontSize: "0.82rem" }}
								>
									Endpoint
								</label>
								<input
									type="text"
									className="form-control form-control-sm"
									defaultValue="/v1/accounts"
								/>
							</div>
							<div className="mb-2">
								<label
									className="form-label fw-semibold"
									style={{ fontSize: "0.82rem" }}
								>
									Body (JSON)
								</label>
								<textarea
									className="form-control form-control-sm"
									rows={3}
									style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
									placeholder='{"key": "value"}'
								/>
							</div>
							<button
								type="button"
								className="btn btn-primary w-100"
								onClick={() => onToast("Request sent — 200 OK", "success")}
							>
								<i className="bi bi-play me-2" /> Send Request
							</button>

				<div className={s["aside-card"]}>
					<h6>Saved Snippets</h6>
					{[
						{ lang: "cURL", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", title: "List accounts", code: "GET /v1/accounts" },
						{ lang: "Node", color: "#10b981", bg: "rgba(16,185,129,0.1)", title: "Create transfer", code: "POST /v1/transfers" },
						{ lang: "Py", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", title: "Issue card", code: "POST /v1/cards" },
					].map((snip, idx) => (
						<div
							className={s.snippetItem}
							key={idx}
							onClick={() => onToast(`Copied ${snip.lang} snippet`, "success")}>
						<span className={s.snippetLang} style={{ background: snip.bg, color: snip.color }}>{snip.lang}</span>
						<div className="flex-grow-1" style={{ minWidth: 0 }}>
							<div className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text)" }}>{snip.title}</div>
							<div className="text-truncate" style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{snip.code}</div>
						</div>
						<i className="bi bi-clipboard" style={{ fontSize: "0.8rem", color: "var(--muted)" }} />
						</div>
					))}
				</div>
						</div>
					</div>
				</div>

				{/* ============ API KEYS ============ */}
				<div
					className={cx(
						s["aside-panel-content"],
						activePanel === "apiKeys" && s.active,
					)}
				>
					<div className={s["aside-header"]}>
						<span className={s["aside-title"]}>
							<i className="bi bi-key text-primary" /> Manage API Keys
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
					<div className={s["aside-body"]}>
						<div className={s["aside-card"]}>
							<h6>Key Management</h6>
							<div className="mb-3">
								<label
									className="form-label fw-semibold"
									style={{ fontSize: "0.82rem" }}
								>
									Key Name
								</label>
								<input
									type="text"
									className="form-control form-control-sm"
									defaultValue="Production Key"
								/>
							</div>
							<div className="mb-3">
								<label
									className="form-label fw-semibold"
									style={{ fontSize: "0.82rem" }}
								>
									Permissions
								</label>
								<div className="form-check mb-1">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="dev-perm-read"
									/>
									<label
										className="form-check-label"
										htmlFor="dev-perm-read"
										style={{ fontSize: "0.82rem" }}
									>
										Read accounts
									</label>
								</div>
								<div className="form-check mb-1">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked
										id="dev-perm-transfer"
									/>
									<label
										className="form-check-label"
										htmlFor="dev-perm-transfer"
										style={{ fontSize: "0.82rem" }}
									>
										Create transfers
									</label>
								</div>
								<div className="form-check">
									<input
										className="form-check-input"
										type="checkbox"
										id="dev-perm-webhooks"
									/>
									<label
										className="form-check-label"
										htmlFor="dev-perm-webhooks"
										style={{ fontSize: "0.82rem" }}
									>
										Manage webhooks
									</label>
								</div>
							</div>
						</div>
						<button
							type="button"
							className="btn btn-primary w-100"
							onClick={() => onToast("Key permissions updated", "success")}
						>
							Save Permissions
						</button>

				<div className={s["aside-card"]}>
					<h6>Key Activity (24h)</h6>
					{[
						{ name: "prod-key-001", requests: 18420, pct: 92, color: "var(--paymo-primary)" },
						{ name: "sandbox-test", requests: 3210, pct: 16, color: "var(--paymo-accent)" },
						{ name: "webhook-svc", requests: 890, pct: 4, color: "var(--paymo-warning)" },
					].map((k, idx) => (
						<div className={s.keyActivityRow} key={idx}>
							<div style={{ minWidth: 0, flex: 1 }}>
								<div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", color: "var(--text)" }}>{k.name}</div>
								<div className="text-muted" style={{ fontSize: "0.7rem" }}>{k.requests.toLocaleString()} req</div>
							</div>
							<div className={s.keyActivityBar}>
								<div className={s.keyActivityFill} style={{ width: `${k.pct}%`, background: k.color }} />
							</div>
						</div>
					))}
				</div>
					</div>
				</div>
			</aside>
		</>
	);
}
