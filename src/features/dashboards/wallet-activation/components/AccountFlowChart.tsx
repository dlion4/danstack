import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/walletActivation.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlowLinkAccount {
	id: number;
	name: string;
	origin: string;
	icon: string;
	bg: string;
	color: string;
	number: string;
	balance: string;
	permission: string;
	status: 'Active' | 'Paused';
}

interface AccountFlowChartProps {
	links: FlowLinkAccount[];
	openModal: (id: string) => void;
}

interface HoverState {
	visible: boolean;
	linkId: number | null;
	x: number;
	y: number;
}

/* ------------------------------------------------------------------ */
/*  Permission metadata — color + what flows through the link          */
/* ------------------------------------------------------------------ */

const PERM_META: Record<string, { short: string; color: string; desc: string; chip: string; features: string[] }> = {
	'Full Control': {
		short: 'Full Access',
		color: '#10b981',
		desc: 'Money in the Primary Wallet can be used inside this dashboard in both directions.',
		chip: 'wallet funds usable here',
		features: ['Send money from wallet', 'Receive money to wallet', 'Full transaction history', 'Balance management', 'Transfer limits apply'],
	},
	'View + Transfer In': {
		short: 'Transfer In',
		color: '#3b82f6',
		desc: 'Primary Wallet funds can be moved INTO this dashboard when you transact.',
		chip: 'receives wallet funds',
		features: ['Receive money to wallet', 'View transaction history', 'View balance', 'Limited transfers'],
	},
	'One-Way In': {
		short: 'One-Way In',
		color: '#f59e0b',
		desc: 'Funds flow one direction only — into this account from the Primary Wallet.',
		chip: 'funds flow one-way in',
		features: ['One-way transfers only', 'View balance', 'Limited access'],
	},
	'View Only': {
		short: 'View Only',
		color: '#94a3b8',
		desc: 'Balance is visible but no money moves across this link.',
		chip: 'balance visible only',
		features: ['View balance only', 'Read-only access'],
	},
};

const FLOW_COLORS = ['10b981', '3b82f6', 'f59e0b', '8b5cf6'];

/* ------------------------------------------------------------------ */
/*  Lane status (animation state machine)                              */
/* ------------------------------------------------------------------ */

type LaneStatus = 'active' | 'revoking' | 'revoked';

const LANE_H = 96;
const PAD_Y = 26;
const WALLET_W = 188;
const WALLET_LEFT = 18;
const WALLET_RIGHT = WALLET_LEFT + WALLET_W;
const LANE_LEFT = WALLET_RIGHT + 80;

/* ------------------------------------------------------------------ */
/*  AccountFlowChart                                                   */
/* ------------------------------------------------------------------ */

export default function AccountFlowChart({ links, openModal }: AccountFlowChartProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(760);
	const [statuses, setStatuses] = useState<Record<number, LaneStatus>>({});
	const [justLinked, setJustLinked] = useState<number | null>(null);
	const [hoverState, setHoverState] = useState<HoverState>({ visible: false, linkId: null, x: 0, y: 0 });
	const [viewMode, setViewMode] = useState<'flow' | 'table'>('flow');

	const initial = useMemo(
		() =>
			links.reduce<Record<number, LaneStatus>>((acc, l) => {
				acc[l.id] = l.status === 'Active' ? 'active' : 'revoked';
				return acc;
			}, {}),
		[links]
	);

	useEffect(() => {
		setStatuses(initial);
	}, [initial]);

	useEffect(() => {
		if (!stageRef.current) return;
		const observer = new ResizeObserver((entries) => {
			const w = entries[0].contentRect.width;
			if (w > 0) setWidth(w);
		});
		observer.observe(stageRef.current);
		return () => observer.disconnect();
	}, []);

	const laneCount = links.length;
	const stageH = PAD_Y * 2 + laneCount * LANE_H;
	const walletCY = stageH / 2;
	const laneStart = PAD_Y + LANE_H / 2;
	const narrow = width < 700;

	const relink = (id: number) => {
		setStatuses((s) => ({ ...s, [id]: 'active' }));
		setJustLinked(id);
		window.setTimeout(() => setJustLinked(null), 1400);
	};

	const revoke = (id: number) => {
		setStatuses((s) => ({ ...s, [id]: 'revoking' }));
		window.setTimeout(() => {
			setStatuses((s) => ({ ...s, [id]: 'revoked' }));
		}, 900);
	};

	const addLink = () => {
		openModal('linkAccountModal');
	};

	const manageLinks = () => {
		openModal('activeLinksModal');
	};

	const handleHover = (linkId: number | null, event: React.MouseEvent | null) => {
		// Suppress tooltip when hovering over buttons, links, or interactive elements
		if (event) {
			const target = event.target as HTMLElement;
			if (target.closest('button, a, [role="button"]')) {
				setHoverState({ visible: false, linkId: null, x: 0, y: 0 });
				return;
			}
		}
		if (event && linkId !== null) {
			const rect = stageRef.current?.getBoundingClientRect();
			if (rect) {
				setHoverState({
					visible: true,
					linkId,
					x: event.clientX - rect.left,
					y: event.clientY - rect.top,
				});
			}
		} else {
			setHoverState({ visible: false, linkId: null, x: 0, y: 0 });
		}
	};

	const paths = links.map((link, i) => {
		const laneCY = laneStart + i * LANE_H;
		const x1 = WALLET_RIGHT;
		const y1 = walletCY;
		const x2 = LANE_LEFT; // Stop exactly at the edge of lane cards
		const y2 = laneCY;
		// Shorter, more direct path with tighter control points
		const cx1 = x1 + (x2 - x1) * 0.4;
		const cy1 = y1;
		const cx2 = x1 + (x2 - x1) * 0.6;
		const cy2 = y2;
		return {
			id: link.id,
			path: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
			x2,
			y2,
		};
	});

	return (
		<div className={styles.flowChartCard}>
			{/* ---- Header ---- */}
			<div className={styles.flowChartHead}>
				<div>
					<h3 className={styles.flowChartTitle}>
						<i className="bi bi-diagram-3" style={{ color: 'var(--pri)' }}></i>
						Account Flow — Live Linkage
					</h3>
					<p className={styles.flowChartSub}>
						Fund flows between your Primary Wallet and linked dashboards
					</p>
				</div>
				<div className={styles.flowChartTabs}>
					<button
						className={`${styles.flowChartTab} ${viewMode === 'flow' ? styles.flowChartTabActive : ''}`}
						onClick={() => setViewMode('flow')}
					>
						<i className="bi bi-diagram-3"></i> Flow Chart
					</button>
					<button
						className={`${styles.flowChartTab} ${viewMode === 'table' ? styles.flowChartTabActive : ''}`}
						onClick={() => setViewMode('table')}
					>
						<i className="bi bi-table"></i> Table View
					</button>
				</div>
			</div>

			{/* ---- Stage ---- */}
			{viewMode === 'flow' ? (
				<>
					{narrow ? (
						<div
							className={`${styles.flowChartStage} ${styles.flowChartStageNarrow}`}
							ref={stageRef}
							style={{ maxWidth: '100%' }}
						>
							<div className={styles.flowChartGrid} />

							{/* Wallet on top */}
							<div className={styles.flowWalletNodeTop}>
								<div className={styles.flowWalletTopBrand}>
									<div className={styles.flowWalletIcon}>
										<i className="bi bi-wallet2"></i>
									</div>
									<div>
										<div className={styles.flowWalletLabel}>Primary PayMo Wallet</div>
										<div className={styles.flowWalletName}>Oscar Kasongo</div>
									</div>
								</div>
								<div className={styles.flowWalletNum}>PM-4521-8830-1024</div>
								<div className={styles.flowWalletBalance}>KES 1,284,300</div>
								<div className={styles.flowWalletChips}>
									<span className={styles.flowWalletChip}>
										<i className="bi bi-check-circle"></i> Active
									</span>
									<span className={styles.flowWalletChip}>Verified KYC</span>
								</div>
							</div>

							{/* Connector line */}
							<div className={styles.flowMobileConnector}>
								<span className={styles.flowMobileConnectorLine}>
									<i className="bi bi-arrow-down"></i>
								</span>
							</div>

							{/* Horizontally scrollable lane strip */}
							<div className={styles.flowLanesStrip}>
								{links.map((link, i) => {
									const status = statuses[link.id] ?? 'active';
									const meta = PERM_META[link.permission] || PERM_META['View Only'];
									const linkedNow = justLinked === link.id;
									return (
										<div
											className={`${styles.flowLaneStripItem} ${status === 'revoked' ? styles.flowLaneCardBroken : ''}`}
											key={link.id}
											style={{ boxShadow: `0 0 0 0px ${meta.color}22` }}
										>
											<div className={styles.flowLaneStripHead}>
												<div className={styles.flowLaneIcon} style={{ background: link.bg, color: link.color }}>
													<i className={link.icon}></i>
												</div>
												<div className={styles.flowLaneBody}>
													<div className={styles.flowLaneName}>{link.name}</div>
													<div className={styles.flowLaneOrigin}>
														<i className={link.icon} style={{ color: link.color, fontSize: 10 }}></i>
														{link.origin}
													</div>
												</div>
												<span
													className={styles.flowLanePerm}
													style={{ color: meta.color, borderColor: `${meta.color}55` }}
												>
													{status === 'active' ? (
														<>
															<i className="bi bi-shield-check"></i> {meta.short}
														</>
													) : (
														<>
															<i className="bi bi-x-circle"></i> Link Lost
														</>
													)}
												</span>
											</div>
											<div className={styles.flowLaneBalance}>{link.balance}</div>
											<div className={styles.flowLaneStripChip}>
												{status === 'active' || status === 'revoking' ? (
													status === 'revoking' ? (
														<>
															<i className="bi bi-unlink"></i> Link breaking…
														</>
													) : linkedNow ? (
														<>
															<i className="bi bi-link-45deg"></i> Linked — {meta.chip}
														</>
													) : (
														<>
															<i className="bi bi-arrow-right"></i> {meta.chip}
														</>
													)
												) : (
													<>
														<i className="bi bi-x-circle"></i> {meta.chip} paused
													</>
												)}
											</div>
											<div className={styles.flowLaneStripCtl}>
												{status === 'active' ? (
													<button
														className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
														onClick={() => revoke(link.id)}
													>
														<i className="bi bi-unlink"></i> Unlink
													</button>
												) : (
													<button
														className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
														onClick={() => relink(link.id)}
													>
														<i className="bi bi-link-45deg"></i> Relink
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					) : (
						<div
							className={styles.flowChartStage}
							ref={stageRef}
							style={{ minHeight: stageH, maxWidth: '100%' }}
						>
							<div className={styles.flowChartGrid} />

							<svg
								className={styles.flowSvg}
								viewBox={`0 0 ${width} ${stageH}`}
								preserveAspectRatio="xMinYMin meet"
							>
								<defs>
									{FLOW_COLORS.map((hex) => (
										<filter key={hex} id={`flowGlow-${hex}`} x="-60%" y="-60%" width="220%" height="220%">
											<feGaussianBlur stdDeviation={4} result="blur" />
											<feFlood floodColor={`#${hex}`} floodOpacity={0.5} result="color" />
											<feComposite in="color" in2="blur" operator="in" result="glow" />
											<feMerge>
												<feMergeNode in="glow" />
												<feMergeNode in="SourceGraphic" />
											</feMerge>
										</filter>
									))}

									{paths.map((p, i) => {
										const link = links[i];
										const meta = PERM_META[link.permission] || PERM_META['View Only'];
										const hex = meta.color.replace('#', '');
										return (
											<path
												key={p.id}
												id={`flowPath-${p.id}`}
												d={p.path}
												fill="none"
												stroke={meta.color}
												strokeWidth={2}
											>
												<animate id={`flowDraw-${p.id}`} attributeName="stroke-dasharray" values="1 9999;1600 0" dur="0.9s" fill="freeze" />
											</path>
										);
									})}
								</defs>

								{/* connection lines */}
								{paths.map((p, i) => {
									const link = links[i];
									const status = statuses[link.id] ?? 'active';
									const meta = PERM_META[link.permission] || PERM_META['View Only'];
									const active = status === 'active';
									const hex = meta.color.replace('#', '');

									return (
										<g key={p.id}>
											{/* glow base */}
											<path
												d={p.path}
												fill="none"
												stroke={meta.color}
												strokeWidth={active ? 7 : 2}
												opacity={active ? 0.16 : 0.06}
												strokeLinecap="round"
												style={{ filter: `url(#flowGlow-${hex})` }}
											/>
											{/* main line */}
											<path
												d={p.path}
												fill="none"
												stroke={status === 'revoking' ? '#ef4444' : meta.color}
												strokeWidth={active ? 2.4 : 1.4}
												strokeDasharray={active ? '6 7' : status === 'revoking' ? '4 5' : '3 6'}
												strokeLinecap="round"
												opacity={active ? 0.95 : status === 'revoking' ? 0.8 : 0.35}
											>
												{active && (
													<animate
														attributeName="stroke-dashoffset"
														from="13"
														to="0"
														dur="1.2s"
														repeatCount="indefinite"
													/>
												)}
											</path>
											{/* flowing money dot */}
											{active && (
												<circle r="4" fill={meta.color}>
													<animateMotion dur="1.2s" repeatCount="indefinite">
														<mpath href={`#flowPath-${p.id}`} />
													</animateMotion>
												</circle>
											)}
										</g>
									);
								})}
							</svg>

							{/* Wallet node */}
							<div className={styles.flowWalletNode} style={{ left: WALLET_LEFT, top: walletCY - 30 }}>
								<div className={styles.flowWalletIcon}>
									<i className="bi bi-wallet2"></i>
								</div>
								<div className={styles.flowWalletBody}>
									<div className={styles.flowWalletLabel}>Primary PayMo Wallet</div>
									<div className={styles.flowWalletName}>Oscar Kasongo</div>
									<div className={styles.flowWalletNum}>PM-4521-8830-1024</div>
									<div className={styles.flowWalletBalance}>KES 1,284,300</div>
									<div className={styles.flowWalletChips}>
										<span className={styles.flowWalletChip}>
											<i className="bi bi-check-circle"></i> Active
										</span>
										<span className={styles.flowWalletChip}>Verified KYC</span>
									</div>
								</div>
							</div>

							{/* ---- Account lanes ---- */}
							<div className={styles.flowLanes} style={{ left: LANE_LEFT }}>
								{links.map((link, i) => {
									const status = statuses[link.id] ?? 'active';
									const meta = PERM_META[link.permission] || PERM_META['View Only'];
									const top = PAD_Y + i * LANE_H;
									const linkedNow = justLinked === link.id;
									return (
										<div
											className={styles.flowLane}
											key={link.id}
											style={{ top, height: LANE_H - 18 }}										onMouseEnter={(e) => {
											const target = e.target as HTMLElement;
											if (target.closest('button, a, [role="button"]')) {
												setHoverState({ visible: false, linkId: null, x: 0, y: 0 });
											} else {
												handleHover(link.id, e);
											}
										}}
									onMouseLeave={() => handleHover(null, null)}
										>
											<div
												className={`${styles.flowLaneCard} ${status === 'revoked' ? styles.flowLaneCardBroken : ''} ${styles.flowLaneCardHoverable}`}
												style={{ boxShadow: `0 0 0 0px ${meta.color}22` }}
											>
												<div
													className={styles.flowLaneIcon}
													style={{ background: link.bg, color: link.color }}
												>
													<i className={link.icon}></i>
												</div>
												<div className={styles.flowLaneBody}>
													<div className={styles.flowLaneName}>{link.name}</div>
													<div className={styles.flowLaneOrigin}>
														<i className={link.icon} style={{ color: link.color, fontSize: 10 }}></i>
														{link.origin}
													</div>
													<div className={styles.flowLaneBalance}>{link.balance}</div>
												</div>
												<span
													className={styles.flowLanePerm}
													style={{ color: meta.color, borderColor: `${meta.color}55` }}
												>
													{status === 'active' ? (
														<>
															<i className="bi bi-shield-check"></i> {meta.short}
														</>
													) : (
														<>
															<i className="bi bi-x-circle"></i> Link Lost
														</>
													)}
												</span>
											</div>

											{/* Feature badges for active accounts */}
											{status === 'active' && (
												<div className={styles.flowLaneFeatures}>
													{meta.features.slice(0, 2).map((feature, idx) => (
														<span key={idx} className={styles.flowFeatureBadge} style={{ borderColor: `${meta.color}40`, color: meta.color }}>
															{feature}
														</span>
													))}
													{meta.features.length > 2 && (
														<span className={styles.flowFeatureBadge} style={{ borderColor: `${meta.color}40`, color: meta.color }}>
															+{meta.features.length - 2} more
														</span>
													)}
												</div>
											)}

											{/* per-lane actions */}
											<div className={styles.flowLaneCtl}>
												{status === 'active' ? (
													<button
														className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
														onClick={() => revoke(link.id)}
													>
														<i className="bi bi-unlink"></i> Unlink
													</button>
												) : (
													<button
														className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
														onClick={() => relink(link.id)}
													>
														<i className="bi bi-link-45deg"></i> Relink
													</button>
												)}
											</div>

											{/* info chip: what flows through this link */}
											{(status === 'active' || status === 'revoking') && (
												<div
													className={`${styles.flowInfoChip} ${status === 'revoking' ? styles.flowInfoChipBroken : ''}`}
													style={{
														left: LANE_LEFT,
														top: top + LANE_H / 2 - 18,
													}}
												>
													{status === 'revoking' ? (
														<>
															<i className="bi bi-unlink"></i> Link breaking…
														</>
													) : linkedNow ? (
														<>
															<i className="bi bi-link-45deg"></i> Linked — {meta.chip}
														</>
													) : (
														meta.chip
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* ---- Legend ---- */}
					<div className={styles.flowLaneLegend}>
						<span>
							<span className={styles.flowLegendDot} style={{ background: '#10b981' }}></span>
							Full Access — money moves both ways
						</span>
						<span>
							<span className={styles.flowLegendDot} style={{ background: '#3b82f6' }}></span>
							Transfer In — wallet funds received
						</span>
						<span>
							<span className={styles.flowLegendDot} style={{ background: '#f59e0b' }}></span>
							One-Way In
						</span>
						<span>
							<span className={styles.flowLegendDot} style={{ background: '#94a3b8' }}></span>
							View Only
						</span>
						<span>
							<span className={styles.flowLegendFlow}>
								<span style={{ background: '#10b981' }}></span>
							</span>
							Money flowing
						</span>
						<span>
							<i className="bi bi-x-circle" style={{ color: 'var(--danger)' }}></i> Link lost
						</span>
					</div>
				</>
			) : (
				<div className={styles.flowTableContainer}>
					<div className={styles.flowTableHeader}>
						<div className={styles.flowTableTitle}>Linked Accounts Overview</div>
						<button
							className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
							onClick={addLink}
						>
							<i className="bi bi-plus-lg"></i> Link New Account
						</button>
					</div>
					<div className={styles.flowTableWrapper}>
						<table className={styles.flowTable}>
							<thead>
								<tr>
									<th>Account</th>
									<th>Origin</th>
									<th>Balance</th>
									<th>Permission</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{links.map((link) => {
									const status = statuses[link.id] ?? 'active';
									const meta = PERM_META[link.permission] || PERM_META['View Only'];
									return (
										<tr key={link.id} className={status === 'revoked' ? styles.flowTableRowDisabled : ''}>
											<td>
												<div className={styles.flowTableCellAccount}>
													<div className={styles.flowTableIcon} style={{ background: link.bg, color: link.color }}>
														<i className={link.icon}></i>
													</div>
													<div>
														<div className={styles.flowTableAccountName}>{link.name}</div>
														<div className={styles.flowTableAccountNum}>{link.number}</div>
													</div>
												</div>
											</td>
											<td>
												<div className={styles.flowTableCellOrigin}>
													<i className={link.icon} style={{ color: link.color, fontSize: 10 }}></i>
													{link.origin}
												</div>
											</td>
											<td>
												<div className={styles.flowTableBalance}>{link.balance}</div>
											</td>
											<td>
												<span
													className={styles.flowTablePermission}
													style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}11` }}
												>
													<i className="bi bi-shield-check"></i> {meta.short}
												</span>
											</td>
											<td>
												<span className={`${styles.flowTableStatus} ${status === 'active' ? styles.flowTableStatusActive : styles.flowTableStatusRevoked}`}>
													{status === 'active' ? (
														<>
															<i className="bi bi-check-circle"></i> Active
														</>
													) : (
														<>
															<i className="bi bi-x-circle"></i> Revoked
														</>
													)}
												</span>
											</td>
											<td>
												<div className={styles.flowTableActions}>
													<button
														className={`${styles.button} ${styles.buttonSmall}`}
														onClick={() => openModal('linkPermissionsModal')}
														title="Manage Permissions"
													>
														<i className="bi bi-sliders"></i>
													</button>
													<button
														className={`${styles.button} ${styles.buttonSmall}`}
														onClick={() => openModal('linkNotificationsModal')}
														title="Configure Alerts"
													>
														<i className="bi bi-bell"></i>
													</button>
													{status === 'active' ? (
														<button
															className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
															onClick={() => revoke(link.id)}
															title="Unlink Account"
														>
															<i className="bi bi-unlink"></i>
														</button>
													) : (
														<button
															className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
															onClick={() => relink(link.id)}
															title="Relink Account"
														>
															<i className="bi bi-link-45deg"></i>
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					<div className={styles.flowTableFooter}>
						<div className={styles.flowTableStats}>
							<span className={styles.flowTableStat}>
								<i className="bi bi-link-45deg"></i> {links.length} linked accounts
							</span>
							<span className={styles.flowTableStat}>
								<i className="bi bi-check-circle"></i> {Object.values(statuses).filter(s => s === 'active').length} active
							</span>
						</div>
					</div>
				</div>
			)}

			{/* ---- Hover Info Card ---- */}
			{hoverState.visible && hoverState.linkId !== null && (
				<div
					className={styles.flowHoverCard}
					style={{
						left: hoverState.x + 20,
						top: hoverState.y + 20,
					}}
				>
					{(() => {
						const link = links.find((l) => l.id === hoverState.linkId);
						if (!link) return null;
						const meta = PERM_META[link.permission] || PERM_META['View Only'];
						const status = statuses[link.id] ?? 'active';
						return (
							<>
								<div className={styles.flowHoverCardHeader}>
									<div className={styles.flowHoverCardIcon} style={{ background: link.bg, color: link.color }}>
										<i className={link.icon}></i>
									</div>
									<div className={styles.flowHoverCardTitle}>
										<div className={styles.flowHoverCardName}>{link.name}</div>
										<div className={styles.flowHoverCardOrigin}>{link.origin}</div>
									</div>
								</div>
								<div className={styles.flowHoverCardDivider}></div>
								<div className={styles.flowHoverCardBody}>
									<div className={styles.flowHoverCardSection}>
										<div className={styles.flowHoverCardLabel}>Permission</div>
										<div className={styles.flowHoverCardValue} style={{ color: meta.color }}>
											<i className="bi bi-shield-check"></i> {meta.short}
										</div>
									</div>
									<div className={styles.flowHoverCardSection}>
										<div className={styles.flowHoverCardLabel}>Balance</div>
										<div className={styles.flowHoverCardValue}>{link.balance}</div>
									</div>
									<div className={styles.flowHoverCardSection}>
										<div className={styles.flowHoverCardLabel}>Status</div>
										<div className={styles.flowHoverCardValue} style={{ color: status === 'active' ? '#10b981' : '#ef4444' }}>
											{status === 'active' ? (
												<>
													<i className="bi bi-check-circle"></i> Active
												</>
											) : (
												<>
													<i className="bi bi-x-circle"></i> {status === 'revoking' ? 'Breaking...' : 'Revoked'}
												</>
											)}
										</div>
									</div>
									{status === 'active' && (
										<>
											<div className={styles.flowHoverCardDivider}></div>
											<div className={styles.flowHoverCardSection}>
												<div className={styles.flowHoverCardLabel}>Features Enabled</div>
												<div className={styles.flowHoverCardFeatures}>
													{meta.features.map((feature, idx) => (
														<span key={idx} className={styles.flowHoverFeatureItem}>
															<i className="bi bi-check2" style={{ color: meta.color }}></i> {feature}
														</span>
													))}
												</div>
											</div>
											{link.permission === 'Full Control' && (
												<div className={styles.flowHoverCardFullAccess}>
													<i className="bi bi-stars"></i>
													<span>Full Access: Complete bidirectional wallet control</span>
												</div>
											)}
										</>
									)}
								</div>
							</>
						);
					})()}
				</div>
			)}
		</div>
	);
}
