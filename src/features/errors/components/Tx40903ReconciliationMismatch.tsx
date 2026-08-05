import { ErrorCard } from './ErrorCard';

export function Tx40903ReconciliationMismatch() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-409-03"
				icon="calculator"
				badgeText="Reconciliation • Mismatch • Ops Review"
				title="Reconciliation Mismatch — Amount Sent ≠ Settled"
				subtitle="Ledger KES 45k but bank settled KES 44,950 — KES 50 fee diff. Flagged for ops review before final."
				reasonTitle="Heads up — warning before send"
				reasonText="Sent 45k, bank settled 44,950 with fee 50 not accounted. Ledger vs bank mismatch — needs manual reconcile. Funds already sent though."
				boxes={[
					{ label: 'Sent', value: 'KES 45,000' },
					{ label: 'Settled', value: 'KES 44,950' },
					{ label: 'Diff', value: 'KES 50 — fee' },
					{ label: 'Status', value: 'Pending ops — queued' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Accept Fee Diff', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Escalate to Ops', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Reconciliation Mismatch — Amount Sent ≠ Settled"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-409-03_xxx_KE"
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
