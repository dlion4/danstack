import { ErrorCard } from './ErrorCard';

export function Dev40801WebhookTimeout() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-408-01"
				icon="hourglass-split"
				badgeText="Webhooks • Timeout • Receiver Slow"
				title="Webhook Timeout — Receiver Slow"
				subtitle="Endpoint took >10s to respond — webhook timeout. Receiver slow, optimize."
				reasonTitle="Heads up — warning before action"
				reasonText="Your endpoint took 12.3s vs 10s timeout — too slow. Must respond <2s optimal. Consider async processing."
				boxes={[
					{ label: 'Your Endpoint', value: '12.3s response' },
					{ label: 'Timeout', value: '10s' },
					{ label: 'Optimal', value: '<2s' },
					{ label: 'Action', value: 'Optimize endpoint' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Optimize Endpoint', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Timeout Policy', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Webhook Timeout — Receiver Slow"
				modalSubtitle="Warning — before send"
				modalTrace="dev-408-01_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — details correct, want to proceed',
					subtext: 'No funds moved until Confirm. Cancel safe.',
				}}
			/>
		</div>
	);
}
