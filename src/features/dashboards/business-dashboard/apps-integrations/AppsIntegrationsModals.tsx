import { Fragment, useEffect, useState, type ReactNode } from "react";
import styles from "./appsIntegrations.module.css";
import {
	ACCOUNT_MAPPING,
	CHAT_MESSAGES,
	CONNECT_APPS,
	DELIVERY_OPTIONS,
	MARKETPLACE_APPS,
	NOTIFICATIONS,
	SYNC_APPS,
	SYNC_LOGS,
	WEBHOOKS,
	WEBHOOK_EVENTS,
} from "./appsIntegrationsData";

/* ============================================================================
   PayMo Business — Apps & Integrations
   Modal layer — port of the 25 modals from consolidated/apps-integrations.html
   (M1 integration detail, M2 marketplace, M3 connect wizard, M4 dispatch
   wizard, M5 sync now, M6 sync logs, M7 webhooks, M8 social inbox, M9 chat,
   M10 export, M11 mapping, M12 analytics, M13 meta pixel, M14–M20 app
   details + webhook + dispatch, M21 health, M22 alerts, M23 profile,
   M24 success, M25 support).
   ========================================================================== */

interface ModalsProps {
	active: string | null;
	onClose: () => void;
	onOpen: (id: string) => void;
	onToast: (msg: string) => void;
}

type Size = "md" | "lg" | "xl";

/* ---------- modal shell (Bootstrap look, React state driven) ---------- */
function MBox({ id, active, title, size = "md", onClose, children, footer }: {
	id: string;
	active: string | null;
	title: ReactNode;
	size?: Size;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
}) {
	if (active !== id) return null;
	return (
		<>
			<div className={styles.backdrop} onClick={onClose} />
			<div className={styles.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
				<div className={`${styles.modalBox} ${size === "lg" ? styles.modalBoxLg : ""} ${size === "xl" ? styles.modalBoxXl : ""}`}>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>{title}</h5>
						<button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
					</div>
					<div className={styles.modalBody}>{children}</div>
					{footer && <div className={styles.modalFooter}>{footer}</div>}
				</div>
			</div>
		</>
	);
}

/* ---------- badge ---------- */
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

/* ---------- action receipt (busy → success, port of successModal) ---------- */
function Receipt({ msg, onClose, ref }: { msg: string; onClose: () => void; ref?: string }) {
	return (
		<div className="text-center py-3">
			<div className={`${styles.iconCircle} ${styles.round} mx-auto mb-2`} style={{ width: 56, height: 56, fontSize: 24, background: "var(--pm-accent-soft)", color: "var(--pm-accent)" }}>
				<i className="bi bi-check-lg" />
			</div>
			<p style={{ fontSize: 13, color: "var(--pm-muted)", marginBottom: ref ? 4 : 14 }}>
				{msg}
				{ref && <><br /><span className={styles.codeChip}>{ref}</span></>}
			</p>
			<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>
		</div>
	);
}

/* ---------- stepper (wizard progress) ---------- */
function Stepper({ labels, current }: { labels: string[]; current: number }) {
	return (
		<div className={styles.stepper}>
			{labels.map((lab, i) => {
				const n = i + 1;
				return (
					<Fragment key={lab}>
						{i > 0 && <div className={styles.stepLine} />}
						<div className={`${styles.step} ${n < current ? styles.stepDone : n === current ? styles.stepActive : ""}`}>
							<div className={styles.stepN}>{n < current ? <i className="bi bi-check" /> : n}</div>
							<div className={styles.stepL}>{lab}</div>
						</div>
					</Fragment>
				);
			})}
		</div>
	);
}

/* ---------- status row ---------- */
function StatusRow({ label, value }: { label: ReactNode; value: ReactNode }) {
	return (
		<div className={styles.statusRow}>
			<span>{label}</span>
			{value}
		</div>
	);
}

/* ============================================================================ */
export default function AppsIntegrationsModals({ active, onClose, onOpen, onToast }: ModalsProps) {
	/* ---------- state ---------- */
	const [results, setResults] = useState<Record<string, string>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({ con: 1, disp: 1 });
	const [tabs, setTabs] = useState<Record<string, string>>({ integ: "ov" });
	const [conApp, setConApp] = useState<string>("xero");
	const [prov, setProv] = useState<string>("sendy");
	const [synced, setSynced] = useState<Record<string, boolean>>({});
	const [perms, setPerms] = useState({ read: true, customers: true, write: false });
	const [pickup, setPickup] = useState("Nairobi Shop — Westlands");
	const [drop, setDrop] = useState("John Mwangi — Kilimani");
	const [ga4Id, setGa4Id] = useState("G-XXXXXXXXXX");
	const [pixelId, setPixelId] = useState("1234567890");
	const [pixelPurchase, setPixelPurchase] = useState(true);
	const [pixelRetarget, setPixelRetarget] = useState(true);
	const [webhookUrl, setWebhookUrl] = useState("");
	const [webhookEvent, setWebhookEvent] = useState(WEBHOOK_EVENTS[0]);

	useEffect(() => {
		if (active === null) {
			setResults({});
			setBusy(null);
			setFlows({ con: 1, disp: 1 });
			setTabs({ integ: "ov" });
			setSynced({});
			setPerms({ read: true, customers: true, write: false });
			setPickup("Nairobi Shop — Westlands");
			setDrop("John Mwangi — Kilimani");
			setGa4Id("G-XXXXXXXXXX");
			setPixelId("1234567890");
			setPixelPurchase(true);
			setPixelRetarget(true);
			setWebhookUrl("");
			setWebhookEvent(WEBHOOK_EVENTS[0]);
		}
	}, [active]);

	/* ---------- simulate: busy overlay → receipt + toast ---------- */
	const simulate = (id: string, msg: string) => {
		setBusy(id);
		window.setTimeout(() => {
			setResults(prev => ({ ...prev, [id]: msg }));
			setBusy(null);
			onToast(msg);
		}, 1200);
	};
	const overlay = (id: string) => (
		<>{busy === id && <div className={styles.loadingOv}><div className={styles.spinner} /><p className={styles.loadingLabel}>Processing...</p></div>}</>
	);
	const actionBody = (id: string, children: ReactNode) => (
		<>
			{overlay(id)}
			{results[id] ? <Receipt msg={results[id]} onClose={onClose} /> : children}
		</>
	);
	const actionFooter = (id: string, label: string, msg: string, tone: "primary" | "danger" | "success" = "primary") =>
		results[id]
			? null
			: (
				<>
					<button type="button" className={styles.btnPm} onClick={onClose}>Cancel</button>
					<button
						type="button"
						className={`${styles.btnPm} ${tone === "danger" ? styles.btnPmD : tone === "success" ? styles.btnPmP : styles.btnPmP}`}
						disabled={busy === id}
						onClick={() => simulate(id, msg)}
					>
						{label}
					</button>
				</>
			);

	/* ---------- wizard engine (connect / dispatch) ---------- */
	const CON_LABELS = ["Select App", "Authorize", "Permissions", "Done"];
	const DISP_LABELS = ["Order", "Provider", "Pickup/Drop", "Track"];
	const nextFlow = (key: "con" | "disp", finishMsg: string) => {
		const current = flows[key];
		if (current >= 4) {
			onClose();
			return;
		}
		if (current === 3) {
			setBusy(key);
			window.setTimeout(() => {
				setFlows(prev => ({ ...prev, [key]: 4 }));
				setBusy(null);
				onToast(finishMsg);
			}, 1300);
			return;
		}
		setFlows(prev => ({ ...prev, [key]: current + 1 }));
	};
	const wizardFooter = (key: "con" | "disp") =>
		flows[key] >= 4 ? (
			<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>
		) : (
			<>
				<button type="button" className={styles.btnPm} onClick={onClose}>Cancel</button>
				<button
					type="button"
					className={`${styles.btnPm} ${key === "con" ? styles.btnPmP : styles.btnPmP}`}
					disabled={busy === key}
					onClick={() =>
						nextFlow(key, key === "con" ? `${CONNECT_APPS.find(a => a.id === conApp)?.name ?? "App"} connected! Initial sync started.` : "Sendy rider requested! Tracking link sent to customer.")
					}
				>
					Continue <i className="bi bi-arrow-right" />
				</button>
			</>
		);

	const conSelected = CONNECT_APPS.find(a => a.id === conApp);
	const provName = DELIVERY_OPTIONS.find(p => p.id === prov)?.name ?? "Sendy";

	/* ============================ RENDER ============================ */
	return (
		<>
			{/* M1: Integration Detail (large, tabbed) */}
			<MBox id="integrationDetailModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-plug me-2" />Integration — WhatsApp Business</>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						{!results.integrationDetailModal && (
							<button type="button" className={`${styles.btnPm} ${styles.btnPmD}`} disabled={busy === "integrationDetailModal"} onClick={() => simulate("integrationDetailModal", "Integration disconnected")}>
								Disconnect
							</button>
						)}
					</>
				}>
				{overlay("integrationDetailModal")}
				{results.integrationDetailModal ? (
					<Receipt msg={results.integrationDetailModal} onClose={onClose} />
				) : (
					<>
						<div className={styles.tabRow}>
							{(["ov", "config", "pricing", "faq"] as const).map(t => (
								<button key={t} type="button" className={`${styles.tabPill} ${tabs.integ === t ? styles.tabPillActive : ""}`} onClick={() => setTabs(prev => ({ ...prev, integ: t }))}>
									{t === "ov" ? "Overview" : t === "config" ? "Setup" : t === "pricing" ? "Pricing" : "FAQ"}
								</button>
							))}
						</div>
						{tabs.integ === "ov" && (
							<>
								<StatusRow label="Status" value={<span className={`${styles.integStatus} ${styles.integStatusConn}`}><i className="bi bi-check" /> Connected</span>} />
								<StatusRow label="Features" value={<strong>Catalog Sync · Order Notifications · Chat</strong>} />
								<StatusRow label="Messages this month" value={<strong>142</strong>} />
							</>
						)}
						{tabs.integ === "config" && (
							<div className="p-3 rounded" style={{ background: "var(--pm-surface-2)" }}>
								<StatusRow label="Linked number" value={<strong>+254 700 000 000</strong>} />
								<StatusRow label="Auto-reply" value={<Badge tone="success">On</Badge>} />
							</div>
						)}
						{tabs.integ === "pricing" && (
							<>
								<StatusRow label="Base" value={<strong>Free</strong>} />
								<StatusRow label="Per message" value={<strong>KES 1.50</strong>} />
							</>
						)}
						{tabs.integ === "faq" && (
							<div className="p-2 rounded mb-2" style={{ background: "var(--pm-surface-2)", fontSize: 12 }}>
								<strong>Q: How do I connect?</strong><br />Via Meta Business Manager OAuth.
							</div>
						)}
					</>
				)}
			</MBox>

			{/* M2: Marketplace (xl) */}
			<MBox id="marketplaceModal" active={active} size="xl" onClose={onClose}
				title={<><i className="bi bi-grid me-2" />Integration Marketplace</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className={`${styles.headerSearch} mb-3`} style={{ maxWidth: "100%" }}>
					<i className="bi bi-search" />
					<input placeholder="Search 'delivery', 'accounting'..." />
				</div>
				<div className="row g-2">
					{MARKETPLACE_APPS.map(app => (
						<div className="col-md-4" key={app.id}>
							<div className={styles.integCard} style={{ cursor: "pointer" }} onClick={() => onOpen("connectAppModal")}>
								<div className={styles.integIcon} style={{ background: app.iconColor }}><i className={`bi ${app.icon}`} /></div>
								<div style={{ fontWeight: 700, marginTop: 6 }}>
									{app.name} {app.popular && <Badge tone="success">Popular</Badge>}
								</div>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>{app.desc}</div>
							</div>
						</div>
					))}
				</div>
			</MBox>

			{/* M3: Connect App (multistep 4) */}
			<MBox id="connectAppModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-plug me-2" />Connect App</>}
				footer={wizardFooter("con")}>
				{overlay("con")}
				<Stepper labels={CON_LABELS} current={flows.con} />
				{flows.con === 1 && (
					<>
						<label className={styles.formLabel}>Select App</label>
						<div className="row g-2">
							{CONNECT_APPS.map(app => (
								<div className="col-4" key={app.id}>
									<div
										className={`${styles.integCard} text-center ${conApp === app.id ? styles.selectCardSel : styles.selectCard}`}
										onClick={() => setConApp(app.id)}
									>
										<div className={`${styles.integIcon} mx-auto`} style={{ background: app.iconColor }}><i className={`bi ${app.icon}`} /></div>
										<div style={{ fontWeight: 600, marginTop: 6 }}>{app.name}</div>
									</div>
								</div>
							))}
						</div>
					</>
				)}
				{flows.con === 2 && (
					<div className="p-3 rounded text-center" style={{ background: "var(--pm-surface-2)", border: "1px dashed var(--pm-border-2)" }}>
						<i className="bi bi-shield-lock" style={{ fontSize: 36, color: "var(--pm-primary)" }} />
						<div style={{ fontWeight: 600, marginTop: 8 }}>Authorize via OAuth</div>
						<div style={{ fontSize: 12, color: "var(--pm-muted)" }}>You'll be redirected to the app's secure login.</div>
					</div>
				)}
				{flows.con === 3 && (
					<>
						<label className={styles.formLabel}>Permissions</label>
						<div className="form-check mb-1">
							<input className="form-check-input" type="checkbox" checked={perms.read} onChange={e => setPerms(prev => ({ ...prev, read: e.target.checked }))} id="permRead" />
							<label className="form-check-label" htmlFor="permRead">Read invoices &amp; payments</label>
						</div>
						<div className="form-check mb-1">
							<input className="form-check-input" type="checkbox" checked={perms.customers} onChange={e => setPerms(prev => ({ ...prev, customers: e.target.checked }))} id="permCustomers" />
							<label className="form-check-label" htmlFor="permCustomers">Sync customers</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" checked={perms.write} onChange={e => setPerms(prev => ({ ...prev, write: e.target.checked }))} id="permWrite" />
							<label className="form-check-label" htmlFor="permWrite">Write to ledger</label>
						</div>
					</>
				)}
				{flows.con >= 4 && (
					<div className="text-center py-2">
						<div className={`${styles.iconCircle} ${styles.round} mx-auto mb-2`} style={{ width: 56, height: 56, fontSize: 24, background: "var(--pm-accent-soft)", color: "var(--pm-accent)" }}>
							<i className="bi bi-check-lg" />
						</div>
						<h5 style={{ fontWeight: 700 }}>App Connected!</h5>
						<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>{conSelected?.name ?? "App"} is now syncing your data.</p>
					</div>
				)}
			</MBox>

			{/* M4: Dispatch (multistep 4) */}
			<MBox id="dispatchModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-send me-2" />Dispatch Order</>}
				footer={wizardFooter("disp")}>
				{overlay("disp")}
				<Stepper labels={DISP_LABELS} current={flows.disp} />
				{flows.disp === 1 && (
					<div className="p-2 border rounded">
						<div className="d-flex justify-content-between">
							<span><strong>Order #1042</strong> · John Mwangi</span>
							<strong>KES 85K</strong>
						</div>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>Laptop Pro X ×1 · Paid</div>
					</div>
				)}
				{flows.disp === 2 && (
					<>
						<label className={styles.formLabel}>Delivery Provider</label>
						<div className="row g-2">
							{DELIVERY_OPTIONS.map(p => (
								<div className="col-4" key={p.id}>
									<div
										className={`${styles.integCard} text-center ${prov === p.id ? styles.selectCardSel : styles.selectCard}`}
										onClick={() => setProv(p.id)}
									>
										<div className={`${styles.integIcon} mx-auto`} style={{ background: p.iconColor }}><i className={`bi ${p.icon}`} /></div>
										<div style={{ fontWeight: 600, marginTop: 6 }}>{p.name}</div>
									</div>
								</div>
							))}
						</div>
					</>
				)}
				{flows.disp === 3 && (
					<>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="pickup">Pickup</label>
							<input id="pickup" className={styles.formControl} value={pickup} onChange={e => setPickup(e.target.value)} />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="drop">Drop-off</label>
							<input id="drop" className={styles.formControl} value={drop} onChange={e => setDrop(e.target.value)} />
						</div>
						<div className="p-2 rounded" style={{ background: "var(--pm-info-soft)", fontSize: 12 }}>Package: Laptop Pro X · 2kg · small box</div>
					</>
				)}
				{flows.disp >= 4 && (
					<div className="text-center py-2">
						<div className={`${styles.iconCircle} ${styles.round} mx-auto mb-2`} style={{ width: 56, height: 56, fontSize: 24, background: "var(--pm-accent-soft)", color: "var(--pm-accent)" }}>
							<i className="bi bi-scooter" />
						</div>
						<h5 style={{ fontWeight: 700 }}>Rider Dispatched!</h5>
						<p style={{ fontSize: 12, color: "var(--pm-muted)" }}>Tracking URL sent to customer via SMS. Order: In Transit. Provider: {provName}.</p>
					</div>
				)}
			</MBox>

			{/* M5: Sync Now */}
			<MBox id="syncNowModal" active={active} onClose={onClose}
				title={<><i className="bi bi-arrow-repeat me-2" />Sync Now</>}
				footer={
					results["syncNowModal-all"]
						? null
						: (
							<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === "syncNowModal-all"} onClick={() => simulate("syncNowModal-all", "All available syncs completed! 1 error skipped.")}>
								<i className="bi bi-arrow-repeat" /> Sync All
							</button>
						)
				}>
				{overlay("syncNowModal-all")}
				{results["syncNowModal-all"] ? (
					<Receipt msg={results["syncNowModal-all"]} onClose={onClose} />
				) : (
					SYNC_APPS.map(app => (
						<div className={styles.statusRow} key={app.id}>
							<span>{app.name}</span>
							{app.status === "error" ? (
								<Badge tone="danger">Error</Badge>
							) : synced[app.id] ? (
								<Badge tone="success"><i className="bi bi-check" /> Synced</Badge>
							) : (
								<button
									type="button"
									className={`${styles.btnPm} ${styles.btnSm}`}
									disabled={busy === `sync-${app.id}`}
									onClick={() => {
										setBusy(`sync-${app.id}`);
										window.setTimeout(() => {
											setSynced(prev => ({ ...prev, [app.id]: true }));
											setBusy(null);
											onToast(`${app.name} synced!`);
										}, 1100);
									}}
								>
									{busy === `sync-${app.id}` ? <span className={styles.spinner} style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle", marginRight: 6 }} /> : <i className="bi bi-arrow-repeat" />} Sync
								</button>
							)}
						</div>
					))
				)}
			</MBox>

			{/* M6: Sync Logs */}
			<MBox id="syncLogModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-list-check me-2" />Sync &amp; Error Logs</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{overlay("syncLogModal")}
				{results.syncLogModal ? (
					<Receipt msg={results.syncLogModal} onClose={onClose} />
				) : (
					<div className="table-responsive">
						<table className={styles.table}>
							<thead>
								<tr><th>Time</th><th>Integration</th><th>Type</th><th>Status</th><th /></tr>
							</thead>
							<tbody>
								{SYNC_LOGS.map(log => (
									<tr key={log.id}>
										<td>{log.time}</td>
										<td>{log.integration}</td>
										<td>{log.type}</td>
										<td><Badge tone={log.status === "unresolved" ? "danger" : "success"}>{log.status === "unresolved" ? "Unresolved" : "Resolved"}</Badge></td>
										<td>
											{log.status === "unresolved" ? (
												<button type="button" className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onToast("Sendy retried — connected!")}>Retry</button>
											) : (
												<button type="button" className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onToast(`Viewing ${log.integration} log (demo)`)}>View</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</MBox>

			{/* M7: Webhooks */}
			<MBox id="webhooksModal" active={active} onClose={onClose}
				title={<><i className="bi bi-broadcast me-2" />Webhooks</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{WEBHOOKS.map(w => (
					<div className="p-2 border rounded mb-1 d-flex justify-content-between" key={w.id}>
						<div>
							<strong>{w.event}</strong>
							<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>→ {w.url}</div>
						</div>
						<Badge tone="success">{w.status}</Badge>
					</div>
				))}
				<div className="d-flex gap-2 mt-2">
					<button type="button" className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onToast("Test payload sent!")}><i className="bi bi-lightning" /> Test Webhook</button>
					<button type="button" className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen("addWebhookModal")}><i className="bi bi-plus-lg" /> Add</button>
				</div>
			</MBox>

			{/* M8: Social Inbox */}
			<MBox id="socialInboxModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-chat-dots me-2" />Unified Social Inbox</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{CHAT_MESSAGES.map((m, i) => {
					const names = ["John Mwangi", "Grace N."];
					const initials = ["JW", "GN"];
					const colors = ["var(--pm-info)", "var(--pm-purple)"];
					const platforms = ["WhatsApp", "Instagram"];
					return (
						<div className={styles.inboxItem} key={m.id} onClick={() => onOpen("chatModal")}>
							<div className={styles.avatar} style={{ background: colors[i % 2] }}>{initials[i % 2]}</div>
							<div className="flex-1">
								<strong>{names[i % 2]}</strong>{" "}
								<Badge tone={platforms[i % 2] === "WhatsApp" ? "warning" : "purple"} style={platforms[i % 2] === "Instagram" ? { background: "var(--pm-pink-soft)", color: "#BE185D" } : undefined}>
									{platforms[i % 2]}
								</Badge>
								<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>"{m.text}"</div>
							</div>
							<Badge tone={i === 0 ? "danger" : "warning"}>{i === 0 ? "2 min" : "1 hr"}</Badge>
						</div>
					);
				})}
			</MBox>

			{/* M9: Chat */}
			<MBox id="chatModal" active={active} onClose={onClose}
				title={<><i className="bi bi-chat-dots me-2" />John Mwangi <Badge tone="warning">WhatsApp</Badge></>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				{overlay("chatModal")}
				{results.chatModal ? (
					<Receipt msg={results.chatModal} onClose={onClose} />
				) : (
					<>
						{CHAT_MESSAGES.map(m => (
							<div
								key={m.id}
								className="p-2 rounded mb-2"
								style={{ background: m.sender === "customer" ? "var(--pm-surface-2)" : "var(--pm-primary)", color: m.sender === "customer" ? "inherit" : "#fff", maxWidth: "80%", marginLeft: m.sender === "business" ? "auto" : 0, fontSize: 13 }}
							>
								{m.text}
							</div>
						))}
						<div className="d-flex gap-2 mt-3">
							<button type="button" className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} disabled={busy === "chatModal"} onClick={() => simulate("chatModal", "Payment link sent to John via WhatsApp!")}>
								<i className="bi bi-link-45deg" /> Send Payment Link
							</button>
							<button type="button" className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onToast("Reply sent")}>Reply</button>
						</div>
					</>
				)}
			</MBox>

			{/* M10: Export */}
			<MBox id="exportModal" active={active} onClose={onClose}
				title={<><i className="bi bi-download me-2" />Export Data</>}
				footer={actionFooter("exportModal", "Export", "ZIP with 4 CSVs downloaded!")}>
				{actionBody("exportModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="expFormat">Format</label>
							<select id="expFormat" className={styles.formControl} defaultValue="Excel/CSV">
								<option>Excel/CSV</option>
								<option>KRA iTax format</option>
								<option>PDF</option>
							</select>
						</div>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="expData">Data</label>
							<select id="expData" className={styles.formControl} defaultValue="All (Invoices, Payments, Expenses, Accounts)">
								<option>All (Invoices, Payments, Expenses, Accounts)</option>
								<option>Invoices only</option>
								<option>Payments only</option>
							</select>
						</div>
						<div className="row g-2 mb-3">
							<div className="col-6">
								<label className={styles.formLabel} htmlFor="expFrom">From</label>
								<input id="expFrom" type="date" className={styles.formControl} />
							</div>
							<div className="col-6">
								<label className={styles.formLabel} htmlFor="expTo">To</label>
								<input id="expTo" type="date" className={styles.formControl} />
							</div>
						</div>
					</>
				))}
			</MBox>

			{/* M11: Accounting Mapping */}
			<MBox id="accountingMappingModal" active={active} size="lg" onClose={onClose}
				title={<><i className="bi bi-diagram-3 me-2" />Account Mapping — PayMo → QuickBooks</>}
				footer={actionFooter("accountingMappingModal", "Save", "Account mapping saved!")}>
				{actionBody("accountingMappingModal", (
					<div className="table-responsive">
						<table className={styles.table}>
							<thead>
								<tr><th>PayMo Account</th><th>QuickBooks Account</th></tr>
							</thead>
							<tbody>
								{ACCOUNT_MAPPING.map(row => (
									<tr key={row.paymo}>
										<td>{row.paymo}</td>
										<td>
											<select className={styles.formControl} defaultValue={row.quickbooks}>
												<option>{row.quickbooks}</option>
												<option>Unassigned</option>
											</select>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				))}
			</MBox>

			{/* M12: Analytics (GA4) */}
			<MBox id="analyticsModal" active={active} onClose={onClose}
				title={<><i className="bi bi-graph-up me-2" />Google Analytics (GA4)</>}
				footer={actionFooter("analyticsModal", "Save", "GA4 tracking enabled on store!")}>
				{actionBody("analyticsModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="ga4Id">Measurement ID</label>
							<input id="ga4Id" className={styles.formControl} value={ga4Id} onChange={e => setGa4Id(e.target.value)} />
						</div>
						<div className="p-3 rounded" style={{ background: "var(--pm-info-soft)", fontSize: 12 }}>
							GA4 script injected into storefront. Tracks views, add-to-cart, checkout.
						</div>
					</>
				))}
			</MBox>

			{/* M13: Meta Pixel */}
			<MBox id="metaPixelModal" active={active} onClose={onClose}
				title={<><i className="bi bi-meta me-2" />Meta Pixel</>}
				footer={actionFooter("metaPixelModal", "Save", "Meta Pixel enabled! Retargeting active.")}>
				{actionBody("metaPixelModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="pixelId">Pixel ID</label>
							<input id="pixelId" className={styles.formControl} value={pixelId} onChange={e => setPixelId(e.target.value)} />
						</div>
						<div className="form-check mb-1">
							<input className="form-check-input" type="checkbox" checked={pixelPurchase} onChange={e => setPixelPurchase(e.target.checked)} id="pixelPurchase" />
							<label className="form-check-label" htmlFor="pixelPurchase">Track Purchase (revenue)</label>
						</div>
						<div className="form-check">
							<input className="form-check-input" type="checkbox" checked={pixelRetarget} onChange={e => setPixelRetarget(e.target.checked)} id="pixelRetarget" />
							<label className="form-check-label" htmlFor="pixelRetarget">Track AddToCart (retargeting)</label>
						</div>
					</>
				))}
			</MBox>

			{/* M14: WhatsApp detail */}
			<MBox id="whatsappDetailModal" active={active} onClose={onClose}
				title={<><i className="bi bi-whatsapp me-2" />WhatsApp Business</>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen("integrationDetailModal")}><i className="bi bi-gear" /> Settings</button>
					</>
				}>
				<StatusRow label="Status" value={<span className={`${styles.integStatus} ${styles.integStatusConn}`}><i className="bi bi-check" /> Connected</span>} />
				<StatusRow label="Number" value={<strong>+254 700 000 000</strong>} />
				<StatusRow label="Messages (mo)" value={<strong>142</strong>} />
				<StatusRow label="Catalog" value={<strong>Synced · 4 products</strong>} />
			</MBox>

			{/* M15: Instagram detail */}
			<MBox id="instagramDetailModal" active={active} onClose={onClose}
				title={<><i className="bi bi-instagram me-2" />Instagram Shop</>}
				footer={
					results.instagramDetailModal
						? null
						: (
							<>
								<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
								<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === "instagramDetailModal"} onClick={() => simulate("instagramDetailModal", "Instagram re-authenticated!")}>
									{busy === "instagramDetailModal" ? <span className={styles.spinner} style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle", marginRight: 6 }} /> : "Re-auth"}
								</button>
							</>
						)
				}>
				{overlay("instagramDetailModal")}
				{results.instagramDetailModal ? (
					<Receipt msg={results.instagramDetailModal} onClose={onClose} />
				) : (
					<>
						<StatusRow label="Status" value={<span className={`${styles.integStatus} ${styles.integStatusConn}`}><i className="bi bi-check" /> Connected</span>} />
						<StatusRow label="Token expiry" value={<Badge tone="warning">7 days</Badge>} />
						<StatusRow label="Shop link" value={<strong>paymo.biz/techsol</strong>} />
					</>
				)}
			</MBox>

			{/* M16: Sendy fix */}
			<MBox id="sendyDetailModal" active={active} onClose={onClose}
				title={<><i className="bi bi-scooter me-2" />Sendy — Fix Connection</>}
				footer={
					results.sendyDetailModal
						? null
						: (
							<>
								<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
								<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === "sendyDetailModal"} onClick={() => simulate("sendyDetailModal", "Sendy re-authorized! Rider dispatch restored.")}>
									<i className="bi bi-scooter" /> Re-authorize
								</button>
							</>
						)
				}>
				{overlay("sendyDetailModal")}
				{results.sendyDetailModal ? (
					<Receipt msg={results.sendyDetailModal} onClose={onClose} />
				) : (
					<div className="p-3 rounded mb-3" style={{ background: "var(--pm-danger-soft)", fontSize: 13 }}>
						<i className="bi bi-exclamation-triangle" /> <strong>Error:</strong> Authentication token expired. Re-authorize to resume dispatch.
					</div>
				)}
			</MBox>

			{/* M17: QuickBooks detail */}
			<MBox id="quickbooksDetailModal" active={active} onClose={onClose}
				title={<><i className="bi bi-journal me-2" />QuickBooks</>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen("accountingMappingModal")}><i className="bi bi-diagram-3" /> Mapping</button>
					</>
				}>
				<StatusRow label="Status" value={<span className={`${styles.integStatus} ${styles.integStatusConn}`}><i className="bi bi-check" /> Connected</span>} />
				<StatusRow label="Sync" value={<strong>Daily batch · 2 min ago</strong>} />
				<StatusRow label="Mapped accounts" value={<strong>24</strong>} />
				<StatusRow label="Conflict rule" value={<strong>Skip if exists</strong>} />
			</MBox>

			{/* M18: Facebook detail */}
			<MBox id="facebookDetailModal" active={active} onClose={onClose}
				title={<><i className="bi bi-facebook me-2" />Facebook Shop</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<StatusRow label="Status" value={<span className={`${styles.integStatus} ${styles.integStatusConn}`}><i className="bi bi-check" /> Connected</span>} />
				<StatusRow label="Products synced" value={<strong>4</strong>} />
				<StatusRow label="Shop page" value={<strong>facebook.com/techsol</strong>} />
			</MBox>

			{/* M19: Add Webhook */}
			<MBox id="addWebhookModal" active={active} onClose={onClose}
				title={<><i className="bi bi-broadcast me-2" />Add Webhook</>}
				footer={actionFooter("addWebhookModal", "Add", "Webhook endpoint added!")}>
				{actionBody("addWebhookModal", (
					<>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="webhookUrl">URL</label>
							<input id="webhookUrl" className={styles.formControl} placeholder="https://..." value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
						</div>
						<div className="mb-3">
							<label className={styles.formLabel} htmlFor="webhookEvent">Event</label>
							<select id="webhookEvent" className={styles.formControl} value={webhookEvent} onChange={e => setWebhookEvent(e.target.value)}>
								{WEBHOOK_EVENTS.map(ev => <option key={ev}>{ev}</option>)}
							</select>
						</div>
					</>
				))}
			</MBox>

			{/* M20: Dispatch detail */}
			<MBox id="dispatchDetailModal" active={active} onClose={onClose}
				title={<><i className="bi bi-scooter me-2" />Dispatch #DSP-9900</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<StatusRow label="Order" value={<strong>#1042 · Laptop Pro X</strong>} />
				<StatusRow label="Provider" value={<strong>Sendy</strong>} />
				<StatusRow label="Status" value={<Badge tone="info">In Transit</Badge>} />
				<StatusRow label="Tracking" value={<strong style={{ color: "var(--pm-info)" }}>sendy.co/track/abc123</strong>} />
				<StatusRow label="Delivery fee" value={<strong>KES 500 · logged as expense</strong>} />
			</MBox>

			{/* M21: Health Check */}
			<MBox id="healthCheckModal" active={active} onClose={onClose}
				title={<><i className="bi bi-activity text-success me-2" />Business Health</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="d-flex justify-content-center mb-3">
					<div style={{ width: 110, height: 110, borderRadius: "50%", border: "7px solid var(--pm-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
						<span style={{ fontSize: 28, fontWeight: 700 }}>92</span>
						<span style={{ fontSize: 10, color: "var(--pm-muted)" }}>SCORE</span>
					</div>
				</div>
				<StatusRow label="Integrations" value={<Badge tone="success">8 active</Badge>} />
				<StatusRow label="Syncs" value={<Badge tone="success">Healthy</Badge>} />
				<StatusRow label="Needs attention" value={<Badge tone="warning">2</Badge>} />
			</MBox>

			{/* M22: Notifications */}
			<MBox id="notificationsModal" active={active} onClose={onClose}
				title={<><i className="bi bi-bell me-2" />Alerts <Badge tone="danger">5 new</Badge></>}
				footer={
					<>
						<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>
						<button type="button" className={`${styles.btnPm} ${styles.btnPmP} ${styles.btnSm}`} onClick={() => onToast("All marked read")}>Mark all read</button>
					</>
				}>
				<div className={styles.notifyScroll}>
					{NOTIFICATIONS.map(n => (
						<div key={n.id} className="p-3 rounded mb-2" style={{ background: n.tone === "danger" ? "var(--pm-danger-soft)" : n.tone === "warning" ? "var(--pm-warning-soft)" : "var(--pm-info-soft)", fontSize: 13 }}>
							<strong>{n.title}</strong> — {n.desc}
						</div>
					))}
				</div>
			</MBox>

			{/* M23: Profile */}
			<MBox id="profileModal" active={active} onClose={onClose}
				title={<><i className="bi bi-person-badge me-2" />My Profile</>}
				footer={<button type="button" className={`${styles.btnPm} ${styles.btnPmD}`} onClick={onClose}>Log Out</button>}>
				<div className="text-center">
					<div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24, background: "var(--pm-primary)" }}>AD</div>
					<h4 style={{ fontWeight: 700 }}>Amina D.</h4>
					<p style={{ fontSize: 13, color: "var(--pm-muted)" }}>Director (Admin) · TechSolutions Ltd</p>
					<div className="p-3 border rounded text-start mt-3">
						<StatusRow label="Approval Limit" value={<strong>Unlimited</strong>} />
						<StatusRow label="Security" value={<Badge tone="success">MFA Active</Badge>} />
					</div>
				</div>
			</MBox>

			{/* M24: Success (generic) */}
			<MBox id="successModal" active={active} onClose={onClose}
				title={<><i className="bi bi-check-circle text-success me-2" />Success</>}
				footer={<button type="button" className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>Done</button>}>
				<div className="text-center">
					<i className="bi bi-check2-circle" style={{ fontSize: 48, color: "var(--pm-accent)" }} />
					<p style={{ marginTop: 8, color: "var(--pm-muted)", fontSize: 13 }}>Operation successful.</p>
				</div>
			</MBox>

			{/* M25: Support */}
			<MBox id="supportModal" active={active} onClose={onClose}
				title={<><i className="bi bi-headset me-2" />Help &amp; Support</>}
				footer={<button type="button" className={styles.btnPm} onClick={onClose}>Close</button>}>
				<div className="p-3 border rounded mb-2 d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => onToast("Chat opened (demo)")}>
					<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-primary)", color: "#fff" }}><i className="bi bi-chat-dots" /></div>
					<div>
						<strong>Live Chat</strong>
						<div style={{ fontSize: 11, color: "var(--pm-muted)" }}>avg reply 2 min</div>
					</div>
				</div>
				<div className="p-3 border rounded d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => onToast("Developer docs (demo)")}>
					<div className={`${styles.iconCircle} ${styles.round}`} style={{ background: "var(--pm-info)", color: "#fff" }}><i className="bi bi-code-slash" /></div>
					<div><strong>Developer Docs</strong></div>
				</div>
			</MBox>
		</>
	);
}
