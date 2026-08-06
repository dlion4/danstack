import { ErrorCard } from './ErrorCard';

export function Card50001ProcessorDown() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-500-01"
				icon="cpu"
				logoText="DanStack • Card • RED"
				badgeText="Cards • Visa Down • Maintenance"
				title="Card Processor Down — Scheme Maintenance"
				subtitle="Visa/Mastercard processor maintenance — card transactions fail 503, ETR 45 min."
				reasonTitle="Why blocked?"
				reasonText="Visa scheme processor returned 503 SCHEME_MAINTENANCE, ETR 45 min per status page. All card auth failing."
				boxes={[
					{ label: 'Scheme', value: 'Visa' },
					{ label: 'Error', value: '503 • MAINTENANCE' },
					{ label: 'ETR', value: '~45 min' },
					{ label: 'Alt', value: 'Try M-Pesa' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry Later', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Scheme Status', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Processor Down — Scheme Maintenance"
				modalSubtitle="Error — after fail"
				modalTrace="card-500-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
