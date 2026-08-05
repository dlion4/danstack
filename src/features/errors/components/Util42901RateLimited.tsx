import { ErrorCard } from './ErrorCard';

export function Util42901RateLimited() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-429-01"
				icon="speedometer2"
				badgeText="Utility • Rate Limited • 10/min"
				title="Utility Rate Limited — Too Many Vending Calls"
				subtitle="10 per minute limit to KPLC — throttled 30s. Slow down."
				reasonTitle="Why blocked?"
				reasonText="10/min KPLC vending limit — you sent 18 in 60s. Throttled 30s to protect KPLC."
				boxes={[
					{ label: 'Limit', value: '10 / min' },
					{ label: 'Sent', value: '18 in 60s' },
					{ label: 'Throttle', value: '30s' },
					{ label: 'Queue', value: '8 queued' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Wait 30s Auto-Retry', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Rate Policy', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Utility Rate Limited — Too Many Vending Calls"
				modalSubtitle="Error — after fail"
				modalTrace="util-429-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
