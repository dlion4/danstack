import { ErrorCard } from './ErrorCard';

export function Tx42202BeneficiaryBlacklisted() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-422-02"
				icon="slash-circle"
				badgeText="Compliance • Beneficiary Blocked • Sanctioned"
				title="Beneficiary Blacklisted"
				subtitle="Recipient on internal blacklist / OFAC sanctioned — payment blocked. Compliance review 24h."
				reasonTitle="Why blocked?"
				reasonText="Recipient GlobalTech Ltd flagged OFAC 92% + internal fraud list. Blocked per compliance, no override without compliance head."
				boxes={[
					{ label: 'Recipient', value: 'GlobalTech Ltd' },
					{ label: 'Flag', value: 'OFAC 92%' },
					{ label: 'List', value: 'Internal fraud 2025' },
					{ label: 'Review', value: '24h manual' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Escalate to Compliance', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Cancel Transaction', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Beneficiary Blacklisted"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-422-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
