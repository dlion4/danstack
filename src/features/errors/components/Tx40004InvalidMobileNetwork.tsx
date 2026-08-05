import { ErrorCard } from './ErrorCard';

export function Tx40004InvalidMobileNetwork() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-400-04"
				icon="phone"
				badgeText="Mobile Money • Wrong Network • Warning"
				title="Invalid Mobile Network"
				subtitle="You selected M-Pesa but number is Airtel — network mismatch. Choose correct network before send."
				reasonTitle="Heads up — warning before send"
				reasonText="Phone 0745xxxxxx is Airtel Money prefix, not Safaricom M-Pesa. Auto-detect says Airtel."
				boxes={[
					{ label: 'Number', value: '0745 123 456' },
					{ label: 'Selected', value: 'M-Pesa' },
					{ label: 'Detected', value: 'Airtel Money' },
					{ label: 'Action', value: 'Switch network' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Switch to Airtel Money', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Edit Number', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Invalid Mobile Network"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-400-04_xxx_KE"
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
