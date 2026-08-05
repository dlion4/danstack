import { ErrorCard } from './ErrorCard';

export function Tx40005CurrencyNotAllowed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-400-05"
				icon="currency-dollar"
				badgeText="Transfer • Currency • Config"
				title="Currency Conversion Not Allowed"
				subtitle="Trying to send KES to USD account without FX enabled — corridor blocked. Convert first."
				reasonTitle="Heads up — warning before send"
				reasonText="Recipient account is USD Nostro, you're sending KES without FX quote. Need USD→KES or enable auto-FX."
				boxes={[
					{ label: 'From', value: 'KES Float' },
					{ label: 'To', value: 'USD Nostro •••• 5678' },
					{ label: 'FX Quote', value: 'None' },
					{ label: 'Auto-FX', value: 'Off' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Get FX Quote USD→KES', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Enable Auto-FX', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Currency Conversion Not Allowed"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-400-05_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — recipient & amount correct, I want to proceed',
					subtext: 'No funds moved until Confirm. Reversible 30 min. You can cancel now.',
				}}
			/>
		</div>
	);
}
