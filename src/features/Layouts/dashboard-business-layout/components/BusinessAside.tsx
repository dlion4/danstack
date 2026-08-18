/* ============================================================================
 * BusinessAside.tsx — slide-in context panel for the Business Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-business-aside.*
 * LEGACY BRIDGE: panel visibility is derived from `activePanel`. The three
 *   business panels (compliance, entity, payroll) fire toasts on actions.
 * ========================================================================== */
import type { AsideKind } from "../data/businessLayoutData";
import { cx } from "../data/businessLayoutData";
import styles from "../styles/businessLayout.module.css";

const ORDER = ["techsol", "java", "savannah"] as const;
const BUSINESSES: Record<
	string,
	{
		name: string;
		initials: string;
		color: string;
		sector: string;
		type: string;
		kpi: { cash: number };
	}
> = {
	techsol: {
		name: "TS Retail Ltd",
		initials: "TS",
		color: "#10b981",
		sector: "Retail",
		type: "online",
		kpi: { cash: 1245000 },
	},
	java: {
		name: "Nairobi Java Roasters",
		initials: "JR",
		color: "#f59e0b",
		sector: "F&B",
		type: "physical",
		kpi: { cash: 810000 },
	},
	savannah: {
		name: "Savannah Crafts Ltd",
		initials: "SC",
		color: "#6366f1",
		sector: "Export",
		type: "hybrid",
		kpi: { cash: 2250000 },
	},
};
const shortM = (n: number) =>
	n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;

const s = styles as Record<string, string>;

interface BusinessAsideProps {
	activePanel: AsideKind | null;
	onClose: () => void;
	onToast: (
		message: string,
		type: "success" | "danger" | "warning" | "info",
	) => void;
	onSwitchBiz?: (id: string) => void;
	currentBusinessKey?: string;
}

export default function BusinessAside({
	activePanel,
	onClose,
	onToast,
	onSwitchBiz,
	currentBusinessKey = "techsol",
}: BusinessAsideProps) {
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
				{/* ============ BUSINESS CENTER ============ */}
				<div
					className={cx(
						s["aside-panel-content"],
						activePanel === "compliance" && s.active,
					)}
				>
					<div className={s["aside-header"]}>
						<span className={s["aside-title"]}>
							<i className="bi bi-diagram-3 text-primary" /> Business
							Center
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
						<div className={s["business-search"]}>
							<i className="bi bi-search" />
							<input type="text" placeholder="Search businesses..." />
						</div>
						<div className={s["aside-card"]}>
							<h6>Your Businesses</h6>
							{ORDER.map((id) => {
								const x = BUSINESSES[id];
								const cur = id === currentBusinessKey;
								return (
									<div
										key={id}
										className={`${s["business-card-item"]} ${cur ? s["current"] : ""}`}
										onClick={() => {
											if (!cur && onSwitchBiz) {
												onSwitchBiz(id);
												onClose();
												onToast(
													`Switched to ${x.name}`,
													"success",
												);
											}
										}}
									>
										<div
											className={s["avatar"]}
											style={{
												width: 40,
												height: 40,
												fontSize: 14,
												background: x.color,
											}}
										>
											{x.initials}
										</div>
										<div style={{ flex: 1 }}>
											<div className={s["business-name"]}>
												{x.name}
												{cur && (
													<span className={`${s["viewing-badge"]} ms-2`}>
														Viewing
													</span>
												)}
											</div>
											<div className={s["business-meta"]}>
												{x.sector} ·
												<span
													className={`${s["business-type-badge"]} ${s[x.type]} ms-1`}
												>
													{x.type}
												</span>
												· <span className={s["business-cash"]}>KES {shortM(x.kpi.cash)}</span>
											</div>
										</div>
										{cur ? (
											<i className={`bi bi-check-circle-fill text-success ${s["business-indicator"]}`} />
										) : (
											<i className={`bi bi-chevron-right text-muted ${s["business-indicator"]}`} />
										)}
									</div>
								);
							})}
						</div>
						<div className={`${s["aside-card"]} ${s["group-overview-card"]}`}>
							<h6>Group Overview</h6>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Total Businesses
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									{ORDER.length}
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Consolidated Cash
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									KES 14.6M
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ============ ENTITY ============ */}
				<div
					className={cx(
						s["aside-panel-content"],
						activePanel === "entity" && s.active,
					)}
				>
					<div className={s["aside-header"]}>
						<span className={s["aside-title"]}>
							<i className="bi bi-building text-primary" /> Entity Details
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
							<h6>Business Information</h6>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Entity Name
								</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
									Modern Retail Ltd
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Registration
								</span>
								<span
									className="fw-semibold"
									style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
								>
									PVT-2019-04821
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									KRA PIN
								</span>
								<span
									className="fw-semibold"
									style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
								>
									A002849102X
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Industry
								</span>
								<span className="fw-semibold" style={{ fontSize: "0.82rem" }}>
									Retail &amp; E-Commerce
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ============ PAYROLL ============ */}
				<div
					className={cx(
						s["aside-panel-content"],
						activePanel === "payroll" && s.active,
					)}
				>
					<div className={s["aside-header"]}>
						<span className={s["aside-title"]}>
							<i className="bi bi-people text-primary" /> Payroll
							Manager
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
							<h6>Current Batch</h6>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Employees
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									42
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Total Amount
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									KES 3,200,000
								</span>
							</div>
							<div className={s["status-row"]}>
								<span className="text-muted" style={{ fontSize: "0.82rem" }}>
									Next Run
								</span>
								<span className="fw-bold" style={{ fontSize: "0.82rem" }}>
									25 Jul 2026
								</span>
							</div>
						</div>
						<div className="d-grid gap-2">
							<button
								type="button"
								className="btn btn-success w-100"
								onClick={() => onToast("Payroll execution started", "success")}
							>
								<i className="bi bi-play me-2" /> Run Payroll Now
							</button>
							<button
								type="button"
								className="btn btn-outline-secondary w-100"
								onClick={() => onToast("Payslips downloaded", "success")}
							>
								<i className="bi bi-file-earmark-spreadsheet me-2" /> Download
								Payslips
							</button>
						</div>
					</div>
				</div>

			</aside>
		</>
	);
}
