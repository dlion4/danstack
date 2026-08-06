import { ErrorCard } from './ErrorCard';

export function Card40304FrozenFraud() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-04"
				icon="shield-lock"
				logoText="DanStack • Card • RED"
				badgeText="Cards • Fraud • Auto-Frozen"
				title="Card Frozen Due To Fraud — Suspicious Spending"
				subtitle="$500 Amazon unusual spend flagged — card auto-frozen 12 min ago, vault safe."
				reasonTitle="Why blocked?"
				reasonText="Risk engine flagged $500 Amazon at 2am, new country, high amount — auto-freeze to prevent fraud. Legit? Unfreeze via OTP."
				boxes={[
					{ label: 'Transaction', value: '$500 • Amazon' },
					{ label: 'Time', value: '2:14 AM — unusual' },
					{ label: 'Location', value: 'US — new country' },
					{ label: 'Status', value: 'Frozen — auto' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Unfreeze — It Was Me', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Report Fraud — Not Me', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Frozen Due To Fraud — Suspicious Spending"
				modalSubtitle="Error — after fail"
				modalTrace="card-403-04_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
