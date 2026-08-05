import { ErrorCard } from './ErrorCard';

export function Dev40303PartnerApprovalPending() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #F0F9FF, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-403-03"
				icon="shop-window"
				badgeText="Marketplace • Pending • Approval"
				title="Partner Marketplace — Approval Pending / Rejected"
				subtitle="App submitted to marketplace — pending approval 1-2 days, or rejected needs fixes."
				reasonTitle="What happens next?"
				reasonText="Your app DanStack Biz v1.0 submitted 2026-08-03 — status Pending Review. Average 1-2 days. If rejected, needs fixes."
				boxes={[
					{ label: 'App', value: 'DanStack Biz v1.0' },
					{ label: 'Submitted', value: '2026-08-03' },
					{ label: 'Status', value: 'Pending Review' },
					{ label: 'ETA', value: '1-2 days' },
				]}
				statusBadges={[
					{ text: 'Vault safe • Queued', icon: 'shield-check', variant: 'safe' },
					{ text: 'Pending • Info hold', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Review Checklist', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Contact Partnerships', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Partner Marketplace — Approval Pending / Rejected"
				modalSubtitle="Info Hold • Waiting"
				modalTrace="dev-403-03_xxx_KE"
				theme="blue"
			/>
		</div>
	);
}
