import { ErrorCard } from './ErrorCard';

export function Util41001ProviderMaintenance() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-410-01"
				icon="tools"
				badgeText="Utility • Maintenance • 2-4am"
				title="Utility Provider Maintenance Window"
				subtitle="KPLC maintenance 2-4am — token vending paused. Schedule for later."
				reasonTitle="Heads up — warning before action"
				reasonText="KPLC scheduled maintenance window 2-4am daily — vending paused, tokens queue post maintenance."
				boxes={[
					{ label: 'Provider', value: 'KPLC' },
					{ label: 'Window', value: '2:00-4:00 AM EAT' },
					{ label: 'Now', value: '2:42 AM' },
					{ label: 'ETR', value: '~18 min' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Schedule for 4:10 AM', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try Different Provider', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Utility Provider Maintenance Window"
				modalSubtitle="Warning — before send"
				modalTrace="util-410-01_xxx_KE"
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
