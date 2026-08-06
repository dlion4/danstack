import { ErrorCard } from './ErrorCard';

export function Card41001Expired() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-410-01"
				icon="calendar-x"
				logoText="DanStack • Card • RED"
				badgeText="Cards • Expired • 12/25"
				title="Card Expired"
				subtitle="Virtual card expired Dec 2025 — cannot fund. Create new card or renew."
				reasonTitle="Why blocked?"
				reasonText="Card •••• 4242 expired 2025-12-31, today 2026-08-05 — 8 months expired. Auto archived."
				boxes={[
					{ label: 'Card', value: '•••• 4242' },
					{ label: 'Expired', value: '2025-12-31' },
					{ label: 'Today', value: '2026-08-05' },
					{ label: 'Action', value: 'Create new virtual' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Create New Card', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Expired List', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Expired"
				modalSubtitle="Error — after fail"
				modalTrace="card-410-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
