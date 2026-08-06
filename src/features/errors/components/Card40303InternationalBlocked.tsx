import { ErrorCard } from './ErrorCard';

export function Card40303InternationalBlocked() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-03"
				icon="globe"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Intl Off • Enable"
				title="International Transaction Blocked"
				subtitle="Card not enabled for international — toggle off. Attempted USD 50 Amazon flagged."
				reasonTitle="Heads up — warning before action"
				reasonText="Card international toggle OFF per settings — transaction USD 50 Amazon US blocked. Turn on intl to allow."
				boxes={[
					{ label: 'Attempt', value: 'USD 50 • Amazon US' },
					{ label: 'Intl Toggle', value: 'OFF' },
					{ label: 'Domestic', value: 'ON — KES only' },
					{ label: 'Action', value: 'Turn ON intl' },
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
					{ label: 'Enable International', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Allow One-Time', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="International Transaction Blocked"
				modalSubtitle="Warning — before send"
				modalTrace="card-403-03_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
