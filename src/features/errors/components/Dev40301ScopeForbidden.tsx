import { ErrorCard } from './ErrorCard';

export function Dev40301ScopeForbidden() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-403-01"
				icon="shield-lock"
				badgeText="Dev • Scope Forbidden • Upgrade"
				title="API Scope Forbidden — Insufficient Tier"
				subtitle="Need cards:write but on Starter — read-only. Upgrade tier or request scope before call."
				reasonTitle="Heads up — warning before action"
				reasonText="Starter tier read-only cards. Trying /v2/virtual-cards POST needs cards:write scope — Growth+ required."
				boxes={[
					{ label: 'Your Tier', value: 'Starter — read-only' },
					{ label: 'Needed', value: 'Growth + cards:write' },
					{ label: 'Endpoint', value: '/v2/virtual-cards' },
					{ label: 'Action', value: 'Upgrade tier' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Upgrade to Growth', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Request Scope', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="API Scope Forbidden — Insufficient Tier"
				modalSubtitle="Warning — before send"
				modalTrace="dev-403-01_xxx_KE"
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
