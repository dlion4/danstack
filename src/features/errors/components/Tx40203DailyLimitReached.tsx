import { ErrorCard } from './ErrorCard';

export function Tx40203DailyLimitReached() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-402-03"
				icon="graph-up-arrow"
				badgeText="Limits • Daily • 5M Reached"
				title="Daily Transaction Limit Reached"
				subtitle="Business daily limit KES 5M reached at 14:32. Reset midnight EAT — upgrade or wait. Warning before send."
				reasonTitle="Heads up — warning before send"
				reasonText="Your business Growth tier daily limit KES 5M. Today sent KES 5M across 82 txn. Next reset 00:00 EAT (~9h 28m)."
				boxes={[
					{ label: 'Limit', value: 'KES 5M / day' },
					{ label: 'Used Today', value: 'KES 5M • 100%' },
					{ label: 'Reset', value: '00:00 EAT • 9h 28m' },
					{ label: 'Pro Tier', value: 'KES 20M / day' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Upgrade Daily Limit', icon: 'lightning-charge', variant: 'colored' },
					{ label: "View Today's TXNs", icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Daily Transaction Limit Reached"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-402-03_xxx_KE"
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
