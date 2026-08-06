import { ErrorCard } from './ErrorCard';

export function Card40301KycTierInsufficient() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-01"
				icon="shield-exclamation"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Tier 1 • Need Tier 2"
				title="KYC Tier Insufficient for Card Issuance"
				subtitle="Personal KYC tier 1, need tier 2 for USD virtual cards — upgrade KYC before issuance."
				reasonTitle="Heads up — warning before action"
				reasonText="Tier 1 limit USD 500 virtual, Tier 2 needed for USD cards >500. Complete address + source of income."
				boxes={[
					{ label: 'Your Tier', value: 'Tier 1 — USD 500 max' },
					{ label: 'Needed', value: 'Tier 2 — USD 5k' },
					{ label: 'Missing', value: 'Proof of address + income' },
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
					{ label: 'Upgrade KYC to Tier 2', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Tier Limits', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="KYC Tier Insufficient for Card Issuance"
				modalSubtitle="Warning — before send"
				modalTrace="card-403-01_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
