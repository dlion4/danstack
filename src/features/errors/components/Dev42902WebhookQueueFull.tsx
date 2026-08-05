import { ErrorCard } from './ErrorCard';

export function Dev42902WebhookQueueFull() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-429-02"
				icon="stack"
				badgeText="Webhooks • Queue Full • Throttled"
				title="Webhook Queue Full"
				subtitle="Too many pending webhooks — queue full 1000/1000 — throttled, retry later."
				reasonTitle="Heads up — warning before action"
				reasonText="Webhook queue 1000 pending for your endpoint — endpoint slow/down causing backlog. Drain queue before new events."
				boxes={[
					{ label: 'Queue', value: '1000/1000 • full' },
					{ label: 'Endpoint', value: 'Slow — 12s avg' },
					{ label: 'Oldest', value: '2h ago' },
					{ label: 'Action', value: 'Fix endpoint to drain' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Fix Endpoint to Drain Queue', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Purge Queue', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Webhook Queue Full"
				modalSubtitle="Warning — before send"
				modalTrace="dev-429-02_xxx_KE"
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
