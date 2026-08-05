import { ErrorCard } from './ErrorCard';

export function Util40203ProviderNotSupported() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-402-03"
				icon="droplet"
				badgeText="Water • Not Supported • County"
				title="Water Bill — Provider Not Supported in County"
				subtitle="Water vendor NOT supported in Kiambu county — vendor only Nairobi. Choose different provider."
				reasonTitle="Heads up — warning before action"
				reasonText="Nairobi Water vendor doesn't serve Kiambu county — provider not supported. Need Ruiru Water."
				boxes={[
					{ label: 'County', value: 'Kiambu — Ruiru' },
					{ label: 'Provider', value: 'Nairobi Water' },
					{ label: 'Supported Counties', value: 'Nairobi only' },
					{ label: 'Alt', value: 'Ruiru Water' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Switch to Ruiru Water', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Supported Counties', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Water Bill — Provider Not Supported in County"
				modalSubtitle="Warning — before send"
				modalTrace="util-402-03_xxx_KE"
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
