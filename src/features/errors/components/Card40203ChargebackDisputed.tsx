import { ErrorCard } from './ErrorCard';

export function Card40203ChargebackDisputed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #F0F9FF, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-402-03"
				icon="flag"
				logoText="DanStack • Card • BLUE"
				badgeText="Cards • Chargeback • Disputed"
				title="Chargeback Initiated / Disputed Transaction"
				subtitle="Customer disputes $120 transaction — card hold KES 15k pending dispute 7-14 days."
				reasonTitle="What happens next?"
				reasonText="Dispute DIS_9012 filed 2026-08-01 for $120 Amazon — customer says not received. Amount held pending 7-14 day scheme review."
				boxes={[
					{ label: 'Dispute ID', value: 'DIS_9012' },
					{ label: 'Amount Held', value: 'KES 15,000' },
					{ label: 'Filed', value: '2026-08-01' },
					{ label: 'ETA', value: '7-14 days' },
				]}
				statusBadges={[
					{ text: 'Vault safe • Queued', icon: 'shield-check', variant: 'safe' },
					{ text: 'Pending • Info hold', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Submit Evidence', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Accept Chargeback', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Chargeback Initiated / Disputed Transaction"
				modalSubtitle="Info Hold • Waiting"
				modalTrace="card-402-03_xxx_KE"
				theme="blue"
			/>
		</div>
	);
}
