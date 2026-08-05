import { ErrorCard } from './ErrorCard';

export function Util40902AutomationConflict() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-409-02"
				icon="diagram-2"
				badgeText="Automation • Conflict • Duplicate"
				title="Automation Conflict — Two Rules Same Bill"
				subtitle="Duplicate auto-pay rules for same meter 12345678 — conflict, both would pay double."
				reasonTitle="Heads up — warning before action"
				reasonText="Two rules for same meter 12345678: Rule A pays 2k on 5th, Rule B pays 1k on 5th — both trigger same day = double pay risk."
				boxes={[
					{ label: 'Meter', value: '12345678' },
					{ label: 'Rule A', value: '2k on 5th' },
					{ label: 'Rule B', value: '1k on 5th' },
					{ label: 'Risk', value: 'Double pay KES 3k' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Disable One Rule', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Merge Rules', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Automation Conflict — Two Rules Same Bill"
				modalSubtitle="Warning — before send"
				modalTrace="util-409-02_xxx_KE"
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
