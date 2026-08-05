import { ErrorCard } from './ErrorCard';

export function Tx42901Throttled() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-429-01"
				icon="speedometer2"
				badgeText="Rate Limit • 100/min • Slow Down"
				title="Transaction Throttled — Too Many Transfers"
				subtitle="100 per minute limit reached — throttled 42s. Queued, not dropped. Countdown live."
				reasonTitle="Why blocked?"
				reasonText="Your biz sent 127 txn in last 60s, limit 100/min for PesaLink rail. Protects ledger. Auto-retry after 42s."
				boxes={[
					{ label: 'Limit', value: '100 / min' },
					{ label: 'Sent', value: '127 in 60s' },
					{ label: 'Throttle', value: '42s' },
					{ label: 'Queue', value: '27 queued — auto retry' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Wait 42s Auto-Retry', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Rate Policy', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Transaction Throttled — Too Many Transfers"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-429-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
