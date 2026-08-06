import { ErrorCard } from './ErrorCard';

export function Card40103CvvAttemptsExceeded() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-401-03"
				icon="lock"
				logoText="DanStack • Card • RED"
				badgeText="Cards • CVV 5x • Locked"
				title="CVV Attempts Exceeded — Security Lock"
				subtitle="CVV tried 5x wrong online — security lock 30 min, card temporarily blocked online."
				reasonTitle="Why blocked?"
				reasonText="Online checkout CVV 000,111,222,333,444 — all wrong. Security lock 30 min prevents brute force."
				boxes={[
					{ label: 'Merchant', value: 'Jumia • Online' },
					{ label: 'CVV Attempts', value: '5/5 failed' },
					{ label: 'Locked Until', value: '12:30' },
					{ label: 'Card', value: '•••• 4242' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Unlock via OTP', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Contact Support', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="CVV Attempts Exceeded — Security Lock"
				modalSubtitle="Error — after fail"
				modalTrace="card-401-03_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
