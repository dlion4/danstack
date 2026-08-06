import { ErrorCard } from './ErrorCard';

export function Card40302MerchantBlocked() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-02"
				icon="shop"
				logoText="DanStack • Card • RED"
				badgeText="Cards • MCC Blocked • Policy"
				title="Card Transaction — Merchant Category Blocked"
				subtitle="Gambling/crypto MCC 7995 blocked by company policy — transaction declined after auth."
				reasonTitle="Why blocked?"
				reasonText="MCC 7995 Gambling flagged per company card policy — all gambling, crypto, adult blocked. Contact admin to allowlist."
				boxes={[
					{ label: 'Merchant', value: 'Stake • MCC 7995' },
					{ label: 'Category', value: 'Gambling' },
					{ label: 'Policy', value: 'Blocked — list' },
					{ label: 'Action', value: 'Request admin allowlist' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Request Allowlist', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Blocked Categories', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Transaction — Merchant Category Blocked"
				modalSubtitle="Error — after fail"
				modalTrace="card-403-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
