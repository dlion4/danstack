import { ErrorCard } from './ErrorCard';

export function Dev50001WebhookDeliveryFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-500-01"
				icon="webhook"
				badgeText="Webhooks • Delivery Failed • Retry"
				title="Webhook Delivery Failed — Endpoint Down 5xx"
				subtitle="Webhook URL returned 500 — delivery failed. Retry schedule 1h, 3h, 6h."
				reasonTitle="Why blocked?"
				reasonText="Your webhook https://your.app/webhook returned 500 Internal Server Error — 3 retries. Next retry 1h."
				boxes={[
					{ label: 'URL', value: 'https://your.app/webhook' },
					{ label: 'Response', value: '500 • Internal Error' },
					{ label: 'Retries', value: '3/6' },
					{ label: 'Next Retry', value: '1h' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry Now', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Webhook Logs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Webhook Delivery Failed — Endpoint Down 5xx"
				modalSubtitle="Error — after fail"
				modalTrace="dev-500-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
