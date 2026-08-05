import { ErrorCard } from './ErrorCard';

export function Tx41001TxnExpired() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-410-01"
				icon="hourglass-bottom"
				badgeText="Transaction • Expired • Auto-Reversed"
				title="Transaction Expired — Pending Too Long"
				subtitle="Pending 24h in PENDING — auto-reversed to source float. No money lost, needs re-send."
				reasonTitle="Why blocked?"
				reasonText="TXN pending 24h without PSP final ACK, auto-reversed per policy. PSP never confirmed. Safe reversal."
				boxes={[
					{ label: 'TXN ID', value: 'txn_8841_KE' },
					{ label: 'Pending Since', value: '24h ago' },
					{ label: 'Status', value: 'Auto-reversed' },
					{ label: 'Refund', value: 'KES 45k → float' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Re-send Transaction', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Reversal Receipt', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Transaction Expired — Pending Too Long"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-410-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
