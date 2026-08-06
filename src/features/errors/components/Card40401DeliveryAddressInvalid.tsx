import { ErrorCard } from './ErrorCard';

export function Card40401DeliveryAddressInvalid() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-404-01"
				icon="geo-alt"
				logoText="DanStack • Card • RED"
				badgeText="Cards • Delivery Failed • DHL"
				title="Card Delivery Address Invalid — Physical"
				subtitle="DHL can't find address — Ruiru, Kiambu address invalid or incomplete."
				reasonTitle="Why blocked?"
				reasonText="DHL attempted delivery Ruiru, Kiambu — address missing building + phone off. Returned to depot."
				boxes={[
					{ label: 'Card', value: 'Physical • •••• 8888' },
					{ label: 'Courier', value: 'DHL • AWB 123' },
					{ label: 'Attempt', value: '2026-08-04 10:00' },
					{ label: 'Status', value: 'Returned to depot' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Update Delivery Address', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Pickup at Branch', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Delivery Address Invalid — Physical"
				modalSubtitle="Error — after fail"
				modalTrace="card-404-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
