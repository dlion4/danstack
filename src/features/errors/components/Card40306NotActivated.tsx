import { ErrorCard } from './ErrorCard';

export function Card40306NotActivated() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-06"
				icon="phone"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Not Activated • Activate"
				title="Card Not Activated"
				subtitle="Physical card not activated via app — activate before first use. Scan QR + set PIN."
				reasonTitle="Heads up — warning before action"
				reasonText="Card •••• 8888 delivered but not activated. Must activate via app scan QR + set PIN before ATM use."
				boxes={[
					{ label: 'Card', value: '•••• 8888 • Physical' },
					{ label: 'Delivered', value: '2026-08-02' },
					{ label: 'Status', value: 'Not activated' },
					{ label: 'Action', value: 'Activate in app' },
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
					{ label: 'Activate Card Now', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Activation Guide', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Not Activated"
				modalSubtitle="Warning — before send"
				modalTrace="card-403-06_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
