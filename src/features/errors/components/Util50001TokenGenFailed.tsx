import { ErrorCard } from './ErrorCard';

export function Util50001TokenGenFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-500-01"
				icon="wifi-off"
				badgeText="KPLC • Offline • Vending Down"
				title="Token Generation Failed — KPLC Offline"
				subtitle="KPLC vending down 503 — token generation failed. Money not moved, retry in 5 min."
				reasonTitle="Why blocked?"
				reasonText="KPLC vending gateway returned 503 VENDING_MAINTENANCE, ETR 15 min. Transaction safe, no charge."
				boxes={[
					{ label: 'Meter', value: '12345678' },
					{ label: 'Amount', value: 'KES 1,000' },
					{ label: 'Error', value: '503 • VENDING_MAINTENANCE' },
					{ label: 'ETR', value: '~15 min' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry in 15 min', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View KPLC Status', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Token Generation Failed — KPLC Offline"
				modalSubtitle="Error — after fail"
				modalTrace="util-500-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
