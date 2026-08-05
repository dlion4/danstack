import { ErrorCard } from './ErrorCard';

export function Util40301AutomationFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-403-01"
				icon="robot"
				badgeText="Automation • Rule Failed • Condition"
				title="Automation Rule Failed — Condition Not Met"
				subtitle="Auto pay rule amount > balance check failed — condition not met, skipped."
				reasonTitle="Heads up — warning before action"
				reasonText="Automation rule: If balance >10k pay KPLC 2k. Balance 5k <10k, condition false — skipped execution 2026-08-05."
				boxes={[
					{ label: 'Rule', value: 'Auto KPLC 2k if bal >10k' },
					{ label: 'Balance Now', value: 'KES 5k' },
					{ label: 'Condition', value: '>10k — false' },
					{ label: 'Last Run', value: '2026-08-05 11:00' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Edit Rule Condition', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Run Manually Anyway', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Automation Rule Failed — Condition Not Met"
				modalSubtitle="Warning — before send"
				modalTrace="util-403-01_xxx_KE"
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
