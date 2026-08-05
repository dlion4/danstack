import { ErrorCard } from './ErrorCard';

export function Dev40201OverageBilling() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-402-01"
				icon="receipt"
				badgeText="Billing • Overage • Upgrade"
				title="Billing — API Calls Over Overage, Upgrade Required"
				subtitle="1M calls included, used 1.2M — overage KES 4k + throttled to 10 req/s. Upgrade to Pro."
				reasonTitle="Heads up — warning before action"
				reasonText="Growth tier 1M API calls/month included. You used 1.2M (120%). Overage KES 4k billed + rate throttled 10 req/s until upgrade."
				boxes={[
					{ label: 'Included', value: '1M calls' },
					{ label: 'Used', value: '1.2M • 120%' },
					{ label: 'Overage', value: 'KES 4,000' },
					{ label: 'Rate Now', value: '10 req/s vs 100' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Upgrade to Pro 5M calls', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Pay Overage Now', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Billing — API Calls Over Overage, Upgrade Required"
				modalSubtitle="Warning — before send"
				modalTrace="dev-402-01_xxx_KE"
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
