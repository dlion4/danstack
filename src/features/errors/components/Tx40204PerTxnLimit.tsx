import { ErrorCard } from './ErrorCard';

export function Tx40204PerTxnLimit() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-402-04"
				icon="person-check"
				badgeText="Limits • Per TXN • Maker-Checker"
				title="Per-Transaction Limit — Needs Higher Approval"
				subtitle="KES 2.4M transaction exceeds KES 1M per-txn limit — needs director approval before sending."
				reasonTitle="Heads up — warning before send"
				reasonText="Policy: >KES 1M requires 2 approvers. You're maker, need checker + director. Can't send instantly — will queue for approval."
				boxes={[
					{ label: 'Amount', value: 'KES 2.4M' },
					{ label: 'Per-TXN Limit', value: 'KES 1M' },
					{ label: 'Needs', value: 'Director approval' },
					{ label: 'Queue', value: 'Approval inbox' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Request Director Approval', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Split Into 2 TXNs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Per-Transaction Limit — Needs Higher Approval"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-402-04_xxx_KE"
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
