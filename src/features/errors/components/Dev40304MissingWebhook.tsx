import { ErrorCard } from './ErrorCard';

export function Dev40304MissingWebhook() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-403-04"
				icon="bell-slash"
				badgeText="Compliance • Missing Webhook • Required"
				title="Compliance Audit — Missing Webhook for Critical Event"
				subtitle="Must subscribe to disputes.created webhook per compliance — audit failed. Subscribe before prod."
				reasonTitle="Heads up — warning before action"
				reasonText="Compliance audit requires webhook for critical events: disputes.created, fraud.detected. You only subscribed to transfer.success."
				boxes={[
					{ label: 'Required', value: 'disputes.created • fraud.detected' },
					{ label: 'You Have', value: 'transfer.success only' },
					{ label: 'Audit', value: 'Failed — needs critical' },
					{ label: 'Action', value: 'Subscribe' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Subscribe to Critical Webhooks', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Audit Report', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Compliance Audit — Missing Webhook for Critical Event"
				modalSubtitle="Warning — before send"
				modalTrace="dev-403-04_xxx_KE"
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
