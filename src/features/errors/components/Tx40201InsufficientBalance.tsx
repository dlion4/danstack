import { ErrorCard } from './ErrorCard';

export function Tx40201InsufficientBalance() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-402-01"
				icon="wallet2"
				badgeText="Transfer • Insufficient • Critical"
				title="Insufficient Balance — Source Account"
				subtitle="KES float KES 12k, need KES 45k. Top up source account — payment failed after PIN."
				reasonTitle="Why blocked?"
				reasonText="Source PayMo KES Float (M-Pesa) balance KES 12,000, attempted transfer KES 45,000 + fee 50 = 45,050. Shortfall 33,050."
				boxes={[
					{ label: 'Float', value: 'KES 12,000' },
					{ label: 'Needed', value: 'KES 45,050 incl fee' },
					{ label: 'Shortfall', value: 'KES 33,050' },
					{ label: 'USD Nostro', value: 'USD 120 available — convert?' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Top Up Float', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Convert USD → KES', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Insufficient Balance — Source Account"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-402-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
