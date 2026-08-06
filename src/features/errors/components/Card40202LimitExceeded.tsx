import { ErrorCard } from './ErrorCard';

export function Card40202LimitExceeded() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-402-02"
				icon="graph-up-arrow"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Limit 200k Daily • Reached"
				title="Card Spending Limit Exceeded — Daily/Monthly"
				subtitle="KES 200k daily limit reached at 11:42 — reset midnight. Current KES 210k attempted."
				reasonTitle="Heads up — warning before action"
				reasonText="Daily limit 200k, used 200k today, attempted 210k total. Monthly 1M also 80% used. Upgrade or wait midnight."
				boxes={[
					{ label: 'Daily Limit', value: 'KES 200k' },
					{ label: 'Used Today', value: 'KES 200k • 100%' },
					{ label: 'Attempted', value: 'KES 210k' },
					{ label: 'Reset', value: '00:00' },
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
					{ label: 'Increase Daily Limit', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Spending', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Spending Limit Exceeded — Daily/Monthly"
				modalSubtitle="Warning — before send"
				modalTrace="card-402-02_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
