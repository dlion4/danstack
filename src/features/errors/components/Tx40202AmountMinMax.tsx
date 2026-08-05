import { ErrorCard } from './ErrorCard';

export function Tx40202AmountMinMax() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-402-02"
				icon="currency-dollar"
				badgeText="Transfer • Amount Limits • Warning"
				title="Amount Below Minimum / Above Maximum"
				subtitle="KES rail min KES 10, max KES 999,999. RTGS needs >150k. Amount KES 5 violates min — fix before send."
				reasonTitle="Heads up — warning before send"
				reasonText="PesaLink min KES 10, max 999,999. You entered KES 5. Or if RTGS, min 150k. Amount outside rail limits."
				boxes={[
					{ label: 'Entered', value: 'KES 5' },
					{ label: 'PesaLink Min', value: 'KES 10' },
					{ label: 'PesaLink Max', value: 'KES 999,999' },
					{ label: 'RTGS Min', value: 'KES 150,000' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Fix Amount', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Switch Rail to RTGS', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Amount Below Minimum / Above Maximum"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-402-02_xxx_KE"
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
