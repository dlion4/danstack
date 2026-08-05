import { ErrorCard } from './ErrorCard';

export function Tx40205FeeCalculationFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-402-05"
				icon="calculator"
				badgeText="Fee Calc Failed • Tier Mismatch"
				title="Fee Calculation Failed — Tier / Corridor Mismatch"
				subtitle="Your tier Growth fee for USD→KES corridor not configured — system cannot calculate fee. Before send warning."
				reasonTitle="Heads up — warning before send"
				reasonText="Fee table missing for USD→KES 129.45 with your tier Growth + amount USD 15k. Need Pro tier or custom pricing. No fee = cannot proceed."
				boxes={[
					{ label: 'Corridor', value: 'USD→KES • 129.45 rate' },
					{ label: 'Amount', value: 'USD 15,000 → KES 1,941,750' },
					{ label: 'Your Tier', value: 'Growth — fee missing' },
					{ label: 'Pro Tier Fee', value: 'KES 1,500 • 0.08%' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Use Pro Fee Temporarily', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Request Custom Pricing', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Fee Calc Failed"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-402-05_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — use Pro fee temporarily',
					subtext: 'No funds moved until Confirm. Reversible 30 min. Can cancel now.',
				}}
			/>
		</div>
	);
}
