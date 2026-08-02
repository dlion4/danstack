'use client';

import styles from '../styles/walletActivation.module.css';

/* ------------------------------------------------------------------ */
/*  Management Hub — compact launcher grid.                             */
/*  Every long page section (20.1–20.7, attention, suggestions) is     */
/*  reduced to a brief tile that opens the full modal / wizard.         */
/* ------------------------------------------------------------------ */

interface HubTile {
	modal: string;
	icon: string;
	label: string;
	desc: string;
	color: string;
	bg: string;
}

interface HubGroup {
	title: string;
	icon: string;
	tiles: HubTile[];
}

const GROUPS: HubGroup[] = [

	{
		title: 'Dashboards & Activation',
		icon: 'bi bi-stars',
		tiles: [
			{ modal: 'activateDashboardModal', icon: 'bi bi-stars', label: 'Activate Dashboard', desc: 'Consent + PIN activation wizard', color: 'var(--acc)', bg: 'rgba(245,158,11,0.14)' },
			{ modal: 'tourGuideModal', icon: 'bi bi-signpost-2', label: 'Tour Guide', desc: '8-step guided onboarding', color: 'var(--pri)', bg: 'var(--success-bg)' },
		],
	},
	{
		title: 'Links & Permissions',
		icon: 'bi bi-link-45deg',
		tiles: [
			{ modal: 'linkAccountModal', icon: 'bi bi-plus-lg', label: 'Link Account', desc: 'Choose account + permission wizard', color: 'var(--success)', bg: 'var(--success-bg)' },
			{ modal: 'activeLinksModal', icon: 'bi bi-layout-three-columns', label: 'Manage Links', desc: 'All linked accounts & sync status', color: 'var(--info)', bg: 'var(--info-bg)' },
			{ modal: 'linkPermissionsModal', icon: 'bi bi-sliders', label: 'Permissions', desc: 'Presets & granular controls', color: 'var(--purple)', bg: 'var(--purple-bg)' },
			{ modal: 'linkNotificationsModal', icon: 'bi bi-bell', label: 'Alert Routing', desc: 'Channels, channels & quiet hours', color: 'var(--warning)', bg: 'var(--warning-bg)' },
			{ modal: 'unlinkAccountModal', icon: 'bi bi-unlink', label: 'Unlink', desc: 'Reason + PIN + 24h grace', color: 'var(--danger)', bg: 'var(--danger-bg)' },
			{ modal: 'relinkAccountModal', icon: 'bi bi-link-45deg', label: 'Relink', desc: 'Instant restore within 30 days', color: 'var(--pri)', bg: 'var(--success-bg)' },
			{ modal: 'revokeAllAccessModal', icon: 'bi bi-shield-exclamation', label: 'Revoke All', desc: 'PIN + OTP, 72h cooldown', color: 'var(--danger)', bg: 'var(--danger-bg)' },
		],
	},
	{
		title: 'Money Relocation',
		icon: 'bi bi-arrow-left-right',
		tiles: [
			{ modal: 'moneyRelocationModal', icon: 'bi bi-arrow-left-right', label: 'Relocation Wizard', desc: '8-step safe fund movement', color: 'var(--warning)', bg: 'var(--warning-bg)' },
			{ modal: 'relocationReceiptModal', icon: 'bi bi-receipt', label: 'Sample Receipt', desc: 'View a relocation receipt', color: 'var(--info)', bg: 'var(--info-bg)' },
		],
	},


];

interface ManagementHubProps {
	openModal: (id: string) => void;
}

export default function ManagementHub({ openModal }: ManagementHubProps) {
	return (
		<div className={styles.hubCard}>
			<div className={styles.hubHead}>
				<div>
					{/* <h3 className={styles.sectionTitle}>
						<i className="bi bi-grid-3x3-gap" style={{ color: 'var(--pri)' }}></i>
						Management Hub
					</h3> */}
					{/* <p className={styles.sectionSubtitle}>
						Every cross-dashboard task opens as a modal or guided wizard — pick one below and the full
						experience launches instantly. No scrolling needed.
					</p> */}
				</div>
			</div>

			<div className={styles.hubGroups}>
				{GROUPS.map((group) => (
					<div className={styles.hubGroup} key={group.title}>
						<div className={styles.hubGroupTitle}>
							<i className={group.icon}></i> {group.title}
						</div>
						<div className={styles.hubGrid}>
							{group.tiles.map((tile) => (
								<button
									className={styles.hubTile}
									key={tile.modal}
									onClick={() => openModal(tile.modal)}
								>
									<span className={styles.hubTileIcon} style={{ background: tile.bg, color: tile.color }}>
										<i className={tile.icon}></i>
									</span>
									<span className={styles.hubTileBody}>
										<span className={styles.hubTileLabel}>{tile.label}</span>
										<span className={styles.hubTileDesc}>{tile.desc}</span>
									</span>
									<i className={`bi bi-chevron-right ${styles.hubTileArrow}`}></i>
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
