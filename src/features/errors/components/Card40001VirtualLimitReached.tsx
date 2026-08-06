import { ErrorCard } from './ErrorCard';

export function Card40001VirtualLimitReached() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-400-01"
				icon="credit-card"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Virtual Limit • Reached"
				title="Virtual Card Creation Limit Reached"
				subtitle="Monthly virtual card limit 5 reached at 11:42 — reset next month. Current 5 active."
				reasonTitle="Heads up — warning before action"
				reasonText="Monthly virtual card limit 5, currently 5 active cards. Need to deactivate one or wait for monthly reset on 1st."
				boxes={[
					{ label: 'Monthly Limit', value: '5 cards' },
					{ label: 'Active Cards', value: '5 • 100%' },
					{ label: 'Attempted', value: '6th card' },
					{ label: 'Reset', value: '1st of month' },
				]}
				permissionBox={{
					checkbox: true,
					text: 'I confirm — details correct, want to proceed',
					subtext: 'No funds moved until Confirm. Cancel safe.',
				}}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'safe' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Deactivate Old Card', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Active Cards', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Virtual Card Creation Limit Reached"
				modalSubtitle="Warning — before send"
				modalTrace="card-400-01_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
