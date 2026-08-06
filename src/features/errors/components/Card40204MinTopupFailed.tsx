import { ErrorCard } from './ErrorCard';

export function Card40204MinTopupFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-402-04"
				icon="plus-circle"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Min Top-up • KES 500"
				title="Card Minimum Top-up Failed"
				subtitle="Needs KES 500 min top-up — you tried KES 100. Below minimum — fix amount."
				reasonTitle="Heads up — warning before action"
				reasonText="Virtual card min top-up KES 500 per program. Attempted KES 100 — below min. Either top up 500 or more."
				boxes={[
					{ label: 'Attempted', value: 'KES 100' },
					{ label: 'Minimum', value: 'KES 500' },
					{ label: 'Program', value: 'Prog_001' },
					{ label: 'Max', value: 'KES 500k' },
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
					{ label: 'Top Up KES 500', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Limits', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Minimum Top-up Failed"
				modalSubtitle="Warning — before send"
				modalTrace="card-402-04_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
