import { ErrorCard } from './ErrorCard';

export function Card40307SettingsConflict() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-07"
				icon="gear"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Settings Conflict • Policy"
				title="Card Settings Conflict — Cannot Enable Both"
				subtitle="Can't enable ATM + Ecomm off — settings conflict. Choose compatible combo."
				reasonTitle="Heads up — warning before action"
				reasonText="Trying to enable ATM withdrawal but disable E-commerce — but ATM needs online PIN which needs e-comm on. Conflict."
				boxes={[
					{ label: 'Tried', value: 'ATM ON + Ecomm OFF' },
					{ label: 'Conflict', value: 'ATM requires Ecomm ON' },
					{ label: 'Allowed', value: 'Both ON or Both OFF' },
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
					{ label: 'Enable Both ON', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Fix Settings', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Settings Conflict — Cannot Enable Both"
				modalSubtitle="Warning — before send"
				modalTrace="card-403-07_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
