import { ErrorCard } from './ErrorCard';

export function Card40201FundingFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-402-01"
				icon="wallet2"
				logoText="DanStack • Card • RED"
				badgeText="Cards • Funding Failed • Float Low"
				title="Card Funding Failed — Source Insufficient"
				subtitle="KES float KES 8k, card needs KES 12k to fund — source insufficient after PIN."
				reasonTitle="Why blocked?"
				reasonText="Source KES Float 8k, funding amount 12k, shortfall 4k. Top up float or choose USD Nostro."
				boxes={[
					{ label: 'Float', value: 'KES 8,000' },
					{ label: 'Needed', value: 'KES 12,000' },
					{ label: 'Shortfall', value: 'KES 4,000' },
					{ label: 'Alt Source', value: 'USD Nostro 120' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Top Up Float', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Choose USD Source', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Funding Failed — Source Insufficient"
				modalSubtitle="Error — after fail"
				modalTrace="card-402-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
