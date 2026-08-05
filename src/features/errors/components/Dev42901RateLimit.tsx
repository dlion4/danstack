import { ErrorCard } from './ErrorCard';

export function Dev42901RateLimit() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-429-01"
				icon="speedometer2"
				badgeText="Dev • 429 • 100/sec Limit"
				title="Rate Limit Exceeded — 100 req/sec"
				subtitle="100 req/sec limit exceeded — throttled 42s. Countdown live like we built."
				reasonTitle="Why blocked?"
				reasonText="100/sec sliding window — you sent 127/sec. Protects ledger. Retry after 42s, queued not dropped."
				boxes={[
					{ label: 'Limit', value: '100 / sec' },
					{ label: 'Sent', value: '127 / sec' },
					{ label: 'Retry After', value: '42s' },
					{ label: 'Queue', value: '27 queued' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Wait 42s Retry', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Rate Policy', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Rate Limit Exceeded — 100 req/sec"
				modalSubtitle="Error — after fail"
				modalTrace="dev-429-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
