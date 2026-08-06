import { ErrorCard } from './ErrorCard';

export function Card40801PersonalizationFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-408-01"
				icon="printer"
				logoText="DanStack • Card • RED"
				badgeText="Cards • Print Error • Re-order"
				title="Card Personalization Failed — Print Error"
				subtitle="Physical card printer error — chip encoding failed. Re-order with same details, no charge."
				reasonTitle="Why blocked?"
				reasonText="Card printer HP-001 chip encoding failed — ATR mismatch. Card damaged, need re-order. Free re-order."
				boxes={[
					{ label: 'Card', value: '•••• 8888 • Physical' },
					{ label: 'Printer', value: 'HP-001 • Line 2' },
					{ label: 'Error', value: 'Chip ATR mismatch' },
					{ label: 'Cost', value: 'Free re-order' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Re-order Card Free', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Contact Card Ops', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Personalization Failed — Print Error"
				modalSubtitle="Error — after fail"
				modalTrace="card-408-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
