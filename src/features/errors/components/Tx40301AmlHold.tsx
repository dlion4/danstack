import { ErrorCard } from './ErrorCard';

export function Tx40301AmlHold() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #F0F9FF, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-403-01"
				icon="shield-exclamation"
				badgeText="Compliance • Risk 87 • Hold 1-4h"
				title="AML / Fraud Risk Score High — Compliance Hold"
				subtitle="Risk score 87/100 — large night transfer KES 120k flagged. Moved to manual review 1-4h — vault safe."
				reasonTitle="What happens next?"
				reasonText="Night transfer 23:14, large amount 120k, new recipient, risk 87. AML engine flagged — human reviews source of funds."
				boxes={[
					{ label: 'Risk Score', value: '87/100 — high' },
					{ label: 'Amount', value: 'KES 120k' },
					{ label: 'Time', value: '23:14 — night' },
					{ label: 'Review', value: '1-4h • Manual' },
				]}
				statusBadges={[
					{ text: 'Vault safe • Queued', icon: 'shield-check', variant: 'safe' },
					{ text: 'Pending • Polling', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Risk Breakdown', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Contact Compliance', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="AML / Fraud Risk Score High — Compliance Hold"
				modalSubtitle="Info Hold • Waiting / Polling"
				modalTrace="tx-403-01_xxx_KE"
				theme="blue"
			/>
		</div>
	);
}
