/**
 * PaymentRailsModals — every dialog reachable from Payment Rails & Routing.
 *
 * All workflows are data-driven from the page payload (banks, routing rules,
 * rail configs, nostro accounts, performance, audit trail and health-check
 * summary) and share the PayMo modal primitives (SimpleModal / FlowModal /
 * TabbedModal / ModalShell) with their navy/emerald design tokens.
 */
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { cx } from "../../../../Layouts/shell/data/shellData";
import {
	FlowModal,
	ModalShell,
	SimpleModal,
	TabbedModal,
} from "../../shared/components/modals";
import s from "../../shared/styles/appPage.module.css";
import type { PaymentRailsContent } from "../pages/PaymentRails";

const styles = s as Record<string, string>;

const kickerStyle = {
	display: "block",
	color: "#0b8f52",
	fontSize: "0.62rem",
	fontWeight: 750,
	letterSpacing: "0.09em",
	textTransform: "uppercase",
} as const;

function Kicker({ children }: { children: ReactNode }) {
	return <span style={kickerStyle}>{children}</span>;
}

/** Order rail tabs: requested rail first, then enabled rails, then disabled. */
function useMemoTabOrder(
	rails: PaymentRailsContent["rails"],
	activeRail: string | null,
) {
	return useMemo(() => {
		const sorted = [...rails].sort(
			(a, b) => Number(b.enabled) - Number(a.enabled),
		);
		if (!activeRail) return sorted;
		const target = sorted.find((r) => r.id === activeRail);
		return target
			? [target, ...sorted.filter((r) => r.id !== activeRail)]
			: sorted;
	}, [rails, activeRail]);
}

export type PaymentRailsData = PaymentRailsContent & {
	activeModal: string | null;
	setActiveModal: (modal: string | null) => void;
	activeBank: string | null;
	setActiveBank: (bank: string | null) => void;
	activeRail: string | null;
	setActiveRail: (rail: string | null) => void;
	onToast?: (message: string, variant?: "success" | "danger") => void;
};

export function PaymentRailsModals({
	data,
}: {
	data: PaymentRailsData;
	offline?: boolean;
}) {
	const close = () => data.setActiveModal(null);
	const is = (modal: string) => data.activeModal === modal;
	const notify = (message: string) => data.onToast?.(message);
	const navigate = (modal: string) => data.setActiveModal(modal);

	return (
		<>
			<AddBankModal
				show={is("addBankModal")}
				onClose={close}
				onDone={() =>
					notify("Bank connection request submitted for compliance review.")
				}
			/>

			<RoutingRulesModal
				show={is("routingRulesModal")}
				onClose={close}
				data={data}
				onSaved={() =>
					notify("Routing rules updated and published to the engine.")
				}
			/>

			<RailConfigModal
				show={is("railConfigModal")}
				onClose={close}
				data={data}
				onDone={() => notify("Rail configuration saved.")}
			/>

			<NostroModal show={is("nostroModal")} onClose={close} data={data} />

			<FxRebalanceModal
				show={is("fxRebalanceModal")}
				onClose={close}
				data={data}
				onDone={() =>
					notify("FX rebalance executed — nostro positions updated.")
				}
			/>

			<HealthCheckModal
				show={is("healthCheckModal")}
				onClose={close}
				data={data}
				onDone={() => notify("Rail health check complete.")}
			/>

			<BankHealthModal
				show={is("bankHealthModal")}
				onClose={close}
				data={data}
			/>

			<PerformanceModal
				show={is("performanceModal")}
				onClose={close}
				data={data}
			/>

			<ReconcileModal
				show={is("reconcileModal")}
				onClose={close}
				onDone={() =>
					notify("Nostro reconciliation complete — all balances matched.")
				}
			/>

			<ExportReportModal
				show={is("exportReportModal")}
				onClose={close}
				onDone={() => notify("Payment rails report exported.")}
			/>

			<AbTestModal
				show={is("abTestModal")}
				onClose={close}
				onDone={() => notify("A/B test configuration saved.")}
			/>

			<AttentionModal
				show={is("attentionModal")}
				onClose={close}
				data={data}
				onNavigate={(modal) => {
					navigate(modal);
				}}
			/>

			<AuditLogModal show={is("auditLogModal")} onClose={close} data={data} />
		</>
	);
}

/* --------------------------------------------------------------------------
 * Add bank connection
 * ------------------------------------------------------------------------ */
function AddBankModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	const [bankName, setBankName] = useState("");
	const [contact, setContact] = useState("");

	useEffect(() => {
		if (show) {
			setBankName("");
			setContact("");
		}
	}, [show]);

	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-bank2"
			title="Add bank connection"
			successMsg="Connection request submitted"
			onSubmit={() => onDone()}
			submitLabel="Submit request"
		>
			<p className={styles.hintBox}>
				<i className="bi bi-info-circle" aria-hidden="true" /> New banks go
				through a compliance and integration review before rails are enabled.
				Treasury ops will contact the bank's integration team.
			</p>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="pr-add-bank-name">
					Bank / financial institution{" "}
					<span aria-hidden="true" style={{ color: "#f04438" }}>
						*
					</span>
					<input
						id="pr-add-bank-name"
						className={styles.field}
						value={bankName}
						onChange={(e) => setBankName(e.target.value)}
						placeholder="e.g. Standard Chartered Kenya"
						required
					/>
				</label>
				<label className={styles.fieldLabel} htmlFor="pr-add-bank-contact">
					Integration contact email
					<input
						id="pr-add-bank-contact"
						className={styles.field}
						type="email"
						value={contact}
						onChange={(e) => setContact(e.target.value)}
						placeholder="integrations@bank.com"
					/>
				</label>
				<fieldset
					style={{
						border: "1px solid var(--border, #e6e9f0)",
						borderRadius: 12,
						padding: 14,
					}}
				>
					<legend style={{ ...kickerStyle, padding: "0 6px" }}>
						Rails to request
					</legend>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 8,
							marginTop: 4,
						}}
					>
						{["PesaLink", "RTGS", "ACH", "SWIFT"].map((rail) => (
							<label
								key={rail}
								className="form-check"
								style={{
									display: "flex",
									gap: 8,
									alignItems: "center",
									fontWeight: 500,
								}}
							>
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked={rail === "PesaLink"}
								/>
								<span className="form-check-label">{rail}</span>
							</label>
						))}
					</div>
				</fieldset>
			</div>
		</SimpleModal>
	);
}

/* --------------------------------------------------------------------------
 * Routing rules — tabbed editor
 * ------------------------------------------------------------------------ */
function RoutingRulesModal({
	show,
	onClose,
	data,
	onSaved,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
	onSaved: () => void;
}) {
	const [rules, setRules] = useState(data.routingRules);
	useEffect(() => {
		if (show) setRules(data.routingRules.map((r) => ({ ...r })));
	}, [show, data.routingRules]);

	const toggle = (id: string) =>
		setRules((prev) =>
			prev.map((r) =>
				r.id === id
					? { ...r, status: r.status === "active" ? "paused" : "active" }
					: r,
			),
		);

	return (
		<TabbedModal
			show={show}
			onClose={onClose}
			iconCls="bi-signpost-split"
			title="Smart routing rules"
			size="xl"
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={() => {
							onSaved();
							onClose();
						}}
					>
						<i className="bi bi-check-lg" aria-hidden="true" /> Publish rules
					</button>
				</>
			}
			tabs={[
				{
					key: "rules",
					label: "Rules",
					render: () => (
						<div style={{ display: "grid", gap: 10 }}>
							<p className={styles.hintBox}>
								<i className="bi bi-info-circle" aria-hidden="true" /> Rules are
								evaluated in priority order — the first match wins. Toggle a
								rule to pause it without deleting.
							</p>
							{rules
								.slice()
								.sort((a, b) => a.priority - b.priority)
								.map((rule) => (
									<div key={rule.id} className={styles.switchRow}>
										<div className={styles.switchLabel}>
											<strong>
												<span
													aria-hidden="true"
													style={{
														display: "inline-grid",
														placeItems: "center",
														minWidth: 22,
														height: 22,
														padding: "0 6px",
														marginRight: 8,
														borderRadius: 99,
														background: "#101828",
														color: "#fff",
														fontSize: "0.62rem",
														verticalAlign: "middle",
													}}
												>
													{rule.priority}
												</span>
												{rule.name}
											</strong>
											<span className={styles.switchDescription}>
												If {rule.condition} → route via{" "}
												<strong className="text-primary">
													{rule.preferredRail}
												</strong>{" "}
												· {rule.monthlyVolume} / month
											</span>
										</div>
										<div className="form-check form-switch">
											<input
												id={`pr-rule-switch-${rule.id}`}
												className="form-check-input"
												type="checkbox"
												role="switch"
												checked={rule.status === "active"}
												aria-checked={rule.status === "active"}
												onChange={() => toggle(rule.id)}
											/>
											<label
												className="form-check-label"
												htmlFor={`pr-rule-switch-${rule.id}`}
											>
												{rule.status === "active" ? "Active" : "Paused"}
											</label>
										</div>
									</div>
								))}
						</div>
					),
				},
				{
					key: "engine",
					label: "Engine settings",
					render: () => (
						<div style={{ display: "grid", gap: 10 }}>
							{[
								{
									label: "Cost-aware routing",
									desc: "Prefer the cheapest eligible rail within SLA",
									on: true,
								},
								{
									label: "Automatic failover",
									desc: "Reroute to a healthy bank when latency exceeds 2s",
									on: true,
								},
								{
									label: "Nostro-aware limits",
									desc: "Hold payments that would breach nostro utilization limits",
									on: true,
								},
								{
									label: "AI routing suggestions",
									desc: "Let the routing copilot propose rule changes",
									on: false,
								},
							].map((setting) => (
								<div key={setting.label} className={styles.switchRow}>
									<div className={styles.switchLabel}>
										<strong>{setting.label}</strong>
										<span className={styles.switchDescription}>
											{setting.desc}
										</span>
									</div>
									<div className="form-check form-switch">
										<input
											id={`pr-engine-${setting.label
												.replace(/\s+/g, "-")
												.toLowerCase()}`}
											className="form-check-input"
											type="checkbox"
											role="switch"
											defaultChecked={setting.on}
											aria-checked={setting.on}
											aria-label={setting.label}
										/>
									</div>
								</div>
							))}
						</div>
					),
				},
			]}
		/>
	);
}

/* --------------------------------------------------------------------------
 * Rail configuration — tabbed per-rail editor
 * ------------------------------------------------------------------------ */
function RailConfigModal({
	show,
	onClose,
	data,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
	onDone: () => void;
}) {
	// Rails are shown as tabs; when a specific rail was requested from the
	// page (e.g. the SWIFT credential alert), surface that tab first.
	const ordered = useMemoTabOrder(data.rails, data.activeRail);

	return (
		<TabbedModal
			show={show}
			onClose={onClose}
			iconCls="bi-train-front"
			title="Rail configuration"
			size="xl"
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={() => {
							onDone();
							onClose();
						}}
					>
						<i className="bi bi-check-lg" aria-hidden="true" /> Save
						configuration
					</button>
				</>
			}
			tabs={ordered.map((r) => ({
				key: r.id,
				label: r.rail,
				render: () => (
					<div style={{ display: "grid", gap: 14 }}>
						<div
							className={cx(
								styles.badge,
								r.enabled ? styles.badgeSuccess : styles.badgeDanger,
							)}
							style={{ justifySelf: "start" }}
						>
							<i
								className={`bi ${r.enabled ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
								aria-hidden="true"
							/>
							{r.enabled ? "Enabled" : "Disabled"} — {r.statusNote}
						</div>
						{!r.enabled && r.id === "swift" && (
							<p
								className={styles.hintBox}
								style={{ borderLeftColor: "#f04438" }}
							>
								<i className="bi bi-shield-exclamation" aria-hidden="true" />{" "}
								MT103 API credentials expire in 3 days. Rotate credentials in
								the security vault and re-enable SWIFT to resume international
								USD routing.
							</p>
						)}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12,
							}}
						>
							<label
								className={styles.fieldLabel}
								htmlFor={`pr-${r.id}-cutoff`}
							>
								Cutoff / availability
								<input
									id={`pr-${r.id}-cutoff`}
									className={styles.field}
									defaultValue={r.cutoff}
								/>
							</label>
							<label className={styles.fieldLabel} htmlFor={`pr-${r.id}-sla`}>
								SLA target (minutes)
								<input
									id={`pr-${r.id}-sla`}
									className={styles.field}
									type="number"
									defaultValue={r.slaMinutes}
								/>
							</label>
							<label className={styles.fieldLabel} htmlFor={`pr-${r.id}-cost`}>
								Cost per transaction (KES)
								<input
									id={`pr-${r.id}-cost`}
									className={styles.field}
									type="number"
									defaultValue={r.costPerTx}
								/>
							</label>
							<label className={styles.fieldLabel} htmlFor={`pr-${r.id}-limit`}>
								Transaction limit
								<input
									id={`pr-${r.id}-limit`}
									className={styles.field}
									defaultValue={r.limit}
								/>
							</label>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: 10,
							}}
						>
							<Stat
								label="Current latency"
								value={r.latencyMs ? `${r.latencyMs.toLocaleString()}ms` : "—"}
							/>
							<Stat
								label="Failure rate"
								value={`${r.failureRate}%`}
								warn={r.failureRate >= 2}
							/>
							<Stat label="Type" value={r.type} />
						</div>
						<div className={styles.switchRow}>
							<div className={styles.switchLabel}>
								<strong>Rail enabled</strong>
								<span className={styles.switchDescription}>
									Disable to stop routing new payments through this rail
								</span>
							</div>
							<div className="form-check form-switch">
								<input
									id={`pr-rail-enabled-${r.id}`}
									className="form-check-input"
									type="checkbox"
									role="switch"
									defaultChecked={r.enabled}
									aria-checked={r.enabled}
									aria-label={`${r.rail} enabled`}
								/>
							</div>
						</div>
					</div>
				),
			}))}
		/>
	);
}

/* --------------------------------------------------------------------------
 * Nostro / vostro accounts
 * ------------------------------------------------------------------------ */
function NostroModal({
	show,
	onClose,
	data,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-wallet2"
			title="Nostro & vostro accounts"
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={() => data.setActiveModal("fxRebalanceModal")}
					>
						<i className="bi bi-cash-coin" aria-hidden="true" /> FX rebalance
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={onClose}
					>
						Done
					</button>
				</>
			}
		>
			<p className={styles.hintBox}>
				<i className="bi bi-info-circle" aria-hidden="true" /> Utilization above
				80% triggers a rebalance recommendation; nostro positions fund outbound
				SWIFT and card settlements, vostro accounts hold inbound partner funds.
			</p>
			<div style={{ overflowX: "auto" }}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Account</th>
							<th>Correspondent</th>
							<th>Balance</th>
							<th>Utilization</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{data.nostro.map((account) => (
							<tr key={account.id}>
								<td>
									<strong>{account.accountName}</strong>
								</td>
								<td>
									{account.bank}
									<div className="text-muted" style={{ fontSize: "0.72rem" }}>
										{account.currency}
									</div>
								</td>
								<td style={{ fontWeight: 700 }}>{account.balance}</td>
								<td style={{ minWidth: 140 }}>
									<div
										style={{ display: "flex", alignItems: "center", gap: 8 }}
									>
										<div className={styles.progressTrack} style={{ flex: 1 }}>
											<div
												style={{
													height: "100%",
													borderRadius: 99,
													width: `${account.utilization}%`,
													background:
														account.utilization >= 80 ? "#f79009" : "#12b76a",
												}}
											/>
										</div>
										<span style={{ fontWeight: 650, fontSize: "0.72rem" }}>
											{account.utilization}%
										</span>
									</div>
								</td>
								<td>
									<span
										className={cx(
											styles.badge,
											account.status === "healthy"
												? styles.badgeSuccess
												: account.status === "paused"
													? styles.badgeNeutral
													: styles.badgeWarn,
										)}
									>
										{account.status === "healthy"
											? "Healthy"
											: account.status === "paused"
												? "Paused"
												: account.status === "low"
													? "Low balance"
													: "Investigate"}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * FX rebalance — FlowModal
 * ------------------------------------------------------------------------ */
function FxRebalanceModal({
	show,
	onClose,
	data,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
	onDone: () => void;
}) {
	const accounts = data.nostro;
	const [from, setFrom] = useState(accounts[1]?.id ?? "");
	const [to, setTo] = useState(accounts[0]?.id ?? "");
	const [amount, setAmount] = useState("2,000,000");

	useEffect(() => {
		if (show) {
			setFrom(accounts[1]?.id ?? "");
			setTo(accounts[0]?.id ?? "");
			setAmount("2,000,000");
		}
	}, [show, accounts[0]?.id]);

	const fromAccount = accounts.find((a) => a.id === from);
	const toAccount = accounts.find((a) => a.id === to);

	return (
		<FlowModal
			show={show}
			onClose={() => {
				onDone();
				onClose();
			}}
			iconCls="bi-cash-coin"
			title="FX rebalance"
			steps={["Source & amount", "Confirm & execute"]}
			confirmLabel="Execute rebalance"
		>
			{(step) =>
				step === 1 ? (
					<div style={{ display: "grid", gap: 14 }}>
						<p className={styles.hintBox}>
							<i className="bi bi-info-circle" aria-hidden="true" /> Move funds
							between nostro accounts to relieve high-utilization currencies.
							The treasury desk rate is applied automatically.
						</p>
						<label className={styles.fieldLabel} htmlFor="pr-fx-from">
							Debit account
							<select
								id="pr-fx-from"
								className={styles.field}
								value={from}
								onChange={(e) => setFrom(e.target.value)}
							>
								{accounts.map((a) => (
									<option key={a.id} value={a.id}>
										{a.accountName} — {a.balance} ({a.utilization}% used)
									</option>
								))}
							</select>
						</label>
						<label className={styles.fieldLabel} htmlFor="pr-fx-to">
							Credit account
							<select
								id="pr-fx-to"
								className={styles.field}
								value={to}
								onChange={(e) => setTo(e.target.value)}
							>
								{accounts
									.filter((a) => a.id !== from)
									.map((a) => (
										<option key={a.id} value={a.id}>
											{a.accountName} — {a.balance} ({a.utilization}% used)
										</option>
									))}
							</select>
						</label>
						<label className={styles.fieldLabel} htmlFor="pr-fx-amount">
							Amount ({fromAccount?.currency ?? "USD"})
							<input
								id="pr-fx-amount"
								className={styles.field}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
						</label>
					</div>
				) : (
					<div style={{ display: "grid", gap: 12 }}>
						<ConfirmRow
							label="Debit"
							value={`${fromAccount?.accountName} · ${fromAccount?.bank}`}
						/>
						<ConfirmRow
							label="Credit"
							value={`${toAccount?.accountName} · ${toAccount?.bank}`}
						/>
						<ConfirmRow
							label="Amount"
							value={`${fromAccount?.currency ?? ""} ${amount}`}
							strong
						/>
						<ConfirmRow
							label="Estimated rate"
							value={`Treasury mid-rate ± 0.15%`}
						/>
						<p className={styles.hintBox}>
							<i className="bi bi-shield-check" aria-hidden="true" /> Rebalances
							above the equivalent of USD 1M require a second treasury approver
							— this request will be routed for approval.
						</p>
					</div>
				)
			}
		</FlowModal>
	);
}

/* --------------------------------------------------------------------------
 * Rail health check — FlowModal
 * ------------------------------------------------------------------------ */
function HealthCheckModal({
	show,
	onClose,
	data,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
	onDone: () => void;
}) {
	const [scanned, setScanned] = useState(0);
	const [reported, setReported] = useState(false);
	const total = data.healthCheck.total;

	useEffect(() => {
		if (!show) {
			setScanned(0);
			setReported(false);
			return;
		}
		setScanned(0);
		setReported(false);
		const timer = window.setInterval(() => {
			setScanned((prev) => {
				if (prev >= total) {
					window.clearInterval(timer);
					return prev;
				}
				return prev + 1;
			});
		}, 220);
		return () => window.clearInterval(timer);
	}, [show, total]);

	useEffect(() => {
		if (show && scanned >= total && !reported) {
			setReported(true);
			onDone();
		}
	}, [show, scanned, total, reported, onDone]);

	const bankNames = Object.keys(data.healthCheck.banks);
	const done = scanned >= total;

	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-heart-pulse"
			title="Rail health check"
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						disabled={!done}
						onClick={() => {
							setScanned(0);
							setReported(false);
						}}
					>
						<i className="bi bi-arrow-repeat" aria-hidden="true" />{" "}
						{done ? "Re-run check" : "Scanning…"}
					</button>
				</>
			}
		>
			<div style={{ display: "grid", gap: 12 }}>
				<p className={styles.hintBox}>
					<i className="bi bi-activity" aria-hidden="true" /> Testing
					connectivity, credentials and latency across {total} bank connections
					{done ? " — scan complete." : "…"}
				</p>
				<div
					className={styles.progressTrack}
					role="progressbar"
					aria-valuenow={scanned}
					aria-valuemin={0}
					aria-valuemax={total}
				>
					<div
						style={{
							height: "100%",
							borderRadius: 99,
							width: `${(scanned / total) * 100}%`,
							background: "#12b76a",
							transition: "width 200ms ease",
						}}
					/>
				</div>
				{bankNames.slice(0, scanned).map((name) => {
					const status = data.healthCheck.banks[name];
					return (
						<div
							key={name}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: 10,
								padding: "8px 12px",
								border: "1px solid #e6e9f0",
								borderRadius: 10,
							}}
						>
							<span style={{ fontWeight: 600, fontSize: "0.8rem" }}>
								{name}
							</span>
							<span
								className={cx(
									styles.badge,
									status === "active"
										? styles.badgeSuccess
										: status === "degraded"
											? styles.badgeWarn
											: styles.badgeNeutral,
								)}
							>
								<i
									className={`bi ${status === "active" ? "bi-check-circle-fill" : status === "degraded" ? "bi-exclamation-triangle-fill" : "bi-pause-circle-fill"}`}
									aria-hidden="true"
								/>
								{status === "active"
									? "Reachable"
									: status === "degraded"
										? "Degraded"
										: "Paused"}
							</span>
						</div>
					);
				})}
				{done && (
					<>
						<div
							className={cx(
								styles.badge,
								data.healthCheck.issues
									? styles.badgeWarn
									: styles.badgeSuccess,
							)}
							style={{ justifySelf: "start" }}
						>
							<i
								className={`bi ${data.healthCheck.issues ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}
								aria-hidden="true"
							/>
							{total - data.healthCheck.issues} of {total} connections healthy ·{" "}
							{data.healthCheck.issues} issue needs attention
						</div>
						{Object.entries(data.healthCheck.banks)
							.filter(([, status]) => status !== "active")
							.map(([name, status]) => (
								<div key={name} className={styles.switchRow}>
									<div className={styles.switchLabel}>
										<strong>{name}</strong>
										<span className={styles.switchDescription}>
											{status === "degraded"
												? "Latency above 800ms — traffic partially failed over to backup banks."
												: "Connection paused — certificate renewal pending; traffic rerouted."}
										</span>
									</div>
									<button
										type="button"
										className={cx(styles.btn, styles.btnSecondary)}
										onClick={() => {
											data.setActiveBank(name);
											data.setActiveModal("bankHealthModal");
										}}
									>
										Inspect
									</button>
								</div>
							))}
						<p
							className="text-muted"
							style={{ fontSize: "0.74rem", margin: 0 }}
						>
							Last scheduled run: {data.healthCheck.lastRun}.
						</p>
					</>
				)}
			</div>
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * Bank health drill-down
 * ------------------------------------------------------------------------ */
function BankHealthModal({
	show,
	onClose,
	data,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
}) {
	const bank =
		data.banks.find((b) => b.name === data.activeBank) ?? data.banks[0];

	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-heart-pulse"
			title={`${bank?.name ?? "Bank"} — connection health`}
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={() => {
							data.onToast?.("Health re-test queued for this bank.");
							onClose();
						}}
					>
						<i className="bi bi-arrow-repeat" aria-hidden="true" /> Re-test
						connection
					</button>
				</>
			}
		>
			{bank && (
				<div style={{ display: "grid", gap: 14 }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: 10,
						}}
					>
						<Stat
							label="Health score"
							value={bank.status === "paused" ? "—" : `${bank.health}%`}
							warn={bank.status === "degraded"}
						/>
						<Stat
							label="Avg latency"
							value={bank.status === "paused" ? "—" : `${bank.latencyMs}ms`}
							warn={bank.latencyMs > 600}
						/>
						<Stat
							label="Monthly cost"
							value={`KES ${bank.monthlyCost.toLocaleString()}`}
						/>
					</div>
					<div>
						<strong style={{ ...kickerStyle, marginBottom: 8 }}>
							Rails enabled
						</strong>
						<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
							{bank.rails.map((rail) => (
								<span
									key={rail}
									className={cx(styles.badge, styles.badgeNeutral)}
								>
									{rail}
								</span>
							))}
						</div>
					</div>
					<div>
						<strong style={{ ...kickerStyle, marginBottom: 8 }}>
							Last 5 health events
						</strong>
						<div style={{ display: "grid", gap: 6 }}>
							{healthEventsFor(bank.status).map((event) => (
								<div
									key={event.message}
									style={{
										display: "flex",
										justifyContent: "space-between",
										gap: 10,
										padding: "8px 12px",
										border: "1px solid #e6e9f0",
										borderRadius: 10,
										fontSize: "0.78rem",
									}}
								>
									<span>{event.message}</span>
									<span className="text-muted" style={{ whiteSpace: "nowrap" }}>
										{event.time}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</ModalShell>
	);
}

function healthEventsFor(status: string) {
	if (status === "paused") {
		return [
			{
				message: "Connection paused — TLS certificate expired",
				time: "Today 05:12",
			},
			{
				message: "Automatic failover routed traffic to Equity Bank",
				time: "Today 05:13",
			},
			{
				message: "Renewal ticket OPS-4821 opened with bank integrations",
				time: "Today 06:40",
			},
			{
				message: "Last successful heartbeat before pause",
				time: "Yesterday 23:58",
			},
			{ message: "Scheduled health check passed", time: "Yesterday 06:00" },
		];
	}
	if (status === "degraded") {
		return [
			{
				message: "Latency spike detected (842ms avg, SLA 500ms)",
				time: "Today 08:15",
			},
			{
				message: "12% of PesaLink calls failed over to KCB",
				time: "Today 08:16",
			},
			{
				message: "Bank status page reported maintenance window",
				time: "Today 07:30",
			},
			{
				message: "Latency recovered to 410ms for 40 minutes",
				time: "Today 06:50",
			},
			{
				message: "Scheduled health check passed with warnings",
				time: "Today 06:00",
			},
		];
	}
	return [
		{ message: "Heartbeat OK — 245ms latency", time: "Today 09:40" },
		{ message: "Credential vault sync successful", time: "Today 06:05" },
		{ message: "Scheduled health check passed", time: "Today 06:00" },
		{ message: "RTGS settlement window opened", time: "Yesterday 08:00" },
		{ message: "Daily reconciliation matched", time: "Yesterday 05:30" },
	];
}

/* --------------------------------------------------------------------------
 * Performance report
 * ------------------------------------------------------------------------ */
function PerformanceModal({
	show,
	onClose,
	data,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="xl"
			iconCls="bi-file-earmark-bar-graph"
			title="Rail performance — last 30 days"
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={() => data.setActiveModal("exportReportModal")}
					>
						<i className="bi bi-file-earmark-spreadsheet" aria-hidden="true" />{" "}
						Export report
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						onClick={onClose}
					>
						Done
					</button>
				</>
			}
		>
			<div style={{ overflowX: "auto" }}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Rail</th>
							<th>SLA target</th>
							<th>Uptime</th>
							<th>Transactions</th>
							<th>Avg latency</th>
							<th>Failure rate</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{data.performance.map((perf) => {
							const meetsSla = perf.uptime >= perf.slaTarget;
							return (
								<tr key={perf.id}>
									<td>
										<strong>{perf.rail}</strong>
									</td>
									<td>{perf.slaTarget}%</td>
									<td style={{ fontWeight: 700 }}>{perf.uptime}%</td>
									<td>{perf.txs}</td>
									<td>{perf.avgLatency}</td>
									<td
										className={perf.failureRate >= 2 ? "text-danger" : ""}
										style={{ fontWeight: 650 }}
									>
										{perf.failureRate}%
									</td>
									<td>
										<span
											className={cx(
												styles.badge,
												meetsSla ? styles.badgeSuccess : styles.badgeWarn,
											)}
										>
											{meetsSla ? "Within SLA" : "SLA watch"}
										</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<p className={styles.hintBox}>
				<i className="bi bi-lightbulb" aria-hidden="true" /> Card-to-bank uptime
				(98.9%) sits just above its 98.5% SLA but below other rails — monitor
				after the threshold widening suggested by the routing copilot.
			</p>
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * Reconciliation — FlowModal
 * ------------------------------------------------------------------------ */
function ReconcileModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	const accounts = [
		{ label: "USD Nostro — Equity", count: "1,284 entries" },
		{ label: "EUR Nostro — Stanbic", count: "642 entries" },
		{ label: "GBP Nostro — Absa", count: "318 entries" },
		{ label: "Vostro KES — Stanbic", count: "9,610 entries" },
	];
	return (
		<FlowModal
			show={show}
			onClose={() => {
				onDone();
				onClose();
			}}
			iconCls="bi-clipboard2-check"
			title="Nostro reconciliation"
			steps={["Match & review", "Post entries"]}
			confirmLabel="Post reconciliation"
		>
			{(step) =>
				step === 1 ? (
					<div style={{ display: "grid", gap: 10 }}>
						<p className={styles.hintBox}>
							<i className="bi bi-info-circle" aria-hidden="true" /> Matching
							nostro ledger entries against bank statements for the last 24
							hours across all currencies.
						</p>
						{accounts.map((account) => (
							<div key={account.label} className={styles.switchRow}>
								<div className={styles.switchLabel}>
									<strong>{account.label}</strong>
									<span className={styles.switchDescription}>
										{account.count} matched
									</span>
								</div>
								<span className={cx(styles.badge, styles.badgeSuccess)}>
									<i className="bi bi-check-circle-fill" aria-hidden="true" />{" "}
									Matched
								</span>
							</div>
						))}
						<div
							style={{
								padding: 12,
								border: "1px solid #fedf89",
								borderRadius: 12,
								background: "#fffaeb",
							}}
						>
							<strong style={{ display: "block", color: "#93370d" }}>
								1 pending break — SWIFT MT103 $250,000
							</strong>
							<span style={{ color: "#b54708", fontSize: "0.78rem" }}>
								Inbound credit appears on the Equity statement; the nostro entry
								is pending cutoff posting and will auto-match at the next sweep.
							</span>
						</div>
					</div>
				) : (
					<div style={{ display: "grid", gap: 12 }}>
						<ConfirmRow
							label="Entries matched"
							value="11,853 of 11,854"
							strong
						/>
						<ConfirmRow
							label="Pending breaks"
							value="1 (auto-match at next sweep)"
						/>
						<ConfirmRow label="Value date" value="2026-08-29" />
						<p className={styles.hintBox}>
							<i className="bi bi-shield-check" aria-hidden="true" /> Posting
							locks the reconciled entries and records the action in the audit
							trail.
						</p>
					</div>
				)
			}
		</FlowModal>
	);
}

/* --------------------------------------------------------------------------
 * Export report
 * ------------------------------------------------------------------------ */
function ExportReportModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-file-earmark-spreadsheet"
			title="Export payment rails report"
			successMsg="Report queued for export"
			onSubmit={() => onDone()}
			submitLabel="Export report"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<label className={styles.fieldLabel} htmlFor="pr-export-range">
					Reporting period
					<select
						id="pr-export-range"
						className={styles.field}
						defaultValue="30"
					>
						<option value="7">Last 7 days</option>
						<option value="30">Last 30 days</option>
						<option value="90">Last quarter</option>
					</select>
				</label>
				<fieldset
					style={{
						border: "1px solid var(--border, #e6e9f0)",
						borderRadius: 12,
						padding: 14,
					}}
				>
					<legend style={{ ...kickerStyle, padding: "0 6px" }}>
						Include sections
					</legend>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 8,
							marginTop: 4,
						}}
					>
						{[
							"Bank directory",
							"Routing rules",
							"Rail config",
							"Performance",
							"Nostro positions",
							"Audit trail",
						].map((section) => (
							<label
								key={section}
								className="form-check"
								style={{
									display: "flex",
									gap: 8,
									alignItems: "center",
									fontWeight: 500,
								}}
							>
								<input
									className="form-check-input"
									type="checkbox"
									defaultChecked
								/>
								<span className="form-check-label">{section}</span>
							</label>
						))}
					</div>
				</fieldset>
				<label className={styles.fieldLabel} htmlFor="pr-export-format">
					Format
					<select
						id="pr-export-format"
						className={styles.field}
						defaultValue="xlsx"
					>
						<option value="xlsx">Excel (.xlsx)</option>
						<option value="csv">CSV</option>
						<option value="pdf">PDF summary</option>
					</select>
				</label>
			</div>
		</SimpleModal>
	);
}

/* --------------------------------------------------------------------------
 * A/B routing test
 * ------------------------------------------------------------------------ */
function AbTestModal({
	show,
	onClose,
	onDone,
}: {
	show: boolean;
	onClose: () => void;
	onDone: () => void;
}) {
	return (
		<SimpleModal
			show={show}
			onClose={onClose}
			iconCls="bi-bar-chart"
			title="Routing A/B test"
			successMsg="A/B test started"
			onSubmit={() => onDone()}
			submitLabel="Launch test"
		>
			<div style={{ display: "grid", gap: 14 }}>
				<p className={styles.hintBox}>
					<i className="bi bi-info-circle" aria-hidden="true" /> Split a share
					of live traffic between two rails and compare cost, latency and
					success rate.
				</p>
				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
				>
					<label className={styles.fieldLabel} htmlFor="pr-ab-control">
						Control rail
						<select
							id="pr-ab-control"
							className={styles.field}
							defaultValue="PesaLink"
						>
							<option>PesaLink</option>
							<option>RTGS</option>
							<option>ACH</option>
							<option>Card-to-Bank</option>
						</select>
					</label>
					<label className={styles.fieldLabel} htmlFor="pr-ab-variant">
						Variant rail
						<select
							id="pr-ab-variant"
							className={styles.field}
							defaultValue="RTGS"
						>
							<option>RTGS</option>
							<option>PesaLink</option>
							<option>Card-to-Bank</option>
						</select>
					</label>
				</div>
				<label className={styles.fieldLabel} htmlFor="prab-split">
					Traffic split to variant
					<input
						id="prab-split"
						className={styles.field}
						type="number"
						defaultValue={10}
						min={1}
						max={50}
					/>
				</label>
				<div className={styles.switchRow}>
					<div className={styles.switchLabel}>
						<strong>Auto-rollback on SLA breach</strong>
						<span className={styles.switchDescription}>
							End the test automatically if variant failure rate exceeds 2%
						</span>
					</div>
					<div className="form-check form-switch">
						<input
							id="pr-ab-rollback"
							className="form-check-input"
							type="checkbox"
							role="switch"
							defaultChecked
							aria-checked
							aria-label="Auto-rollback on SLA breach"
						/>
					</div>
				</div>
			</div>
		</SimpleModal>
	);
}

/* --------------------------------------------------------------------------
 * Attention summary
 * ------------------------------------------------------------------------ */
function AttentionModal({
	show,
	onClose,
	data,
	onNavigate,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
	onNavigate: (modal: string) => void;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-exclamation-triangle"
			title="Items requiring attention"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Done
				</button>
			}
		>
			<div style={{ display: "grid", gap: 10 }}>
				{data.attention.map((item) => (
					<div key={item.id} className={styles.switchRow}>
						<div className={styles.switchLabel}>
							<strong>
								<span
									className={cx(
										styles.badge,
										item.severity === "danger"
											? styles.badgeDanger
											: item.severity === "warn"
												? styles.badgeWarn
												: styles.badgeInfo,
									)}
									style={{ marginRight: 8 }}
								>
									{item.severity === "danger"
										? "Critical"
										: item.severity === "warn"
											? "Warning"
											: "Info"}
								</span>
								{item.title}
							</strong>
							<span className={styles.switchDescription}>{item.detail}</span>
						</div>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={() => {
								if (item.action === "bankHealthModal" && item.bank) {
									data.setActiveBank(item.bank);
									onNavigate("bankHealthModal");
								} else if (item.action === "nostroModal") {
									onNavigate("nostroModal");
								} else if (item.action === "railConfigModal") {
									data.setActiveRail("swift");
									onNavigate("railConfigModal");
								}
							}}
						>
							Resolve <i className="bi bi-arrow-right" aria-hidden="true" />
						</button>
					</div>
				))}
			</div>
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * Audit log
 * ------------------------------------------------------------------------ */
function AuditLogModal({
	show,
	onClose,
	data,
}: {
	show: boolean;
	onClose: () => void;
	data: PaymentRailsData;
}) {
	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls="bi-journal-text"
			title="Configuration audit log"
			footer={
				<button
					type="button"
					className={cx(styles.btn, styles.btnPrimary)}
					onClick={onClose}
				>
					Close
				</button>
			}
		>
			<div style={{ overflowX: "auto" }}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Action</th>
							<th>Rail / bank</th>
							<th>Actor</th>
							<th>Timestamp</th>
						</tr>
					</thead>
					<tbody>
						{data.auditTrail.map((entry) => (
							<tr key={entry.id}>
								<td style={{ whiteSpace: "normal" }}>{entry.action}</td>
								<td>
									<span className={cx(styles.badge, styles.badgeNeutral)}>
										{entry.rail}
									</span>
								</td>
								<td>{entry.user}</td>
								<td className="text-muted">{entry.timestamp}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ModalShell>
	);
}

/* ── Shared small presentational helpers ───────────────────────────────── */

function Stat({
	label,
	value,
	warn,
}: {
	label: string;
	value: string;
	warn?: boolean;
}) {
	return (
		<div
			style={{
				padding: 12,
				border: "1px solid #e6e9f0",
				borderRadius: 12,
				background: "#fafbfd",
			}}
		>
			<Kicker>{label}</Kicker>
			<strong
				style={{
					display: "block",
					marginTop: 4,
					fontSize: "1.05rem",
					color: warn ? "#b42318" : "#101828",
				}}
			>
				{value}
			</strong>
		</div>
	);
}

function ConfirmRow({
	label,
	value,
	strong,
}: {
	label: string;
	value: string;
	strong?: boolean;
}) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				gap: 12,
				padding: "10px 12px",
				border: "1px solid #e6e9f0",
				borderRadius: 10,
			}}
		>
			<span className="text-muted" style={{ fontSize: "0.78rem" }}>
				{label}
			</span>
			<strong style={strong ? { color: "#067647" } : undefined}>{value}</strong>
		</div>
	);
}
