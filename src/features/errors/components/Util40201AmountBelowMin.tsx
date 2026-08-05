import { ErrorCard } from './ErrorCard';

export function Util40201AmountBelowMin() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-402-01"
				icon="currency-dollar"
				badgeText="Utility • Amount Below Min • KES 100"
				title="Utility Amount Below Minimum"
				subtitle="KPLC min KES 100 — you tried KES 50. Below minimum — fix before vend."
				reasonTitle="Heads up — warning before action"
				reasonText="KPLC prepaid min KES 100 per Kenya Power. Attempted KES 50 — below min, cannot vend token."
				boxes={[
					{ label: 'Attempted', value: 'KES 50' },
					{ label: 'Minimum', value: 'KES 100' },
					{ label: 'Provider', value: 'KPLC' },
					{ label: 'Max', value: 'KES 50k' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Set to KES 100 Min', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Provider Limits', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Utility Amount Below Minimum"
				modalSubtitle="Warning — before send"
				modalTrace="util-402-01_xxx_KE"
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
