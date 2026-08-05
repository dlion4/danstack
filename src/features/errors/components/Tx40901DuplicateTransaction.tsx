import { ErrorCard } from './ErrorCard';

export function Tx40901DuplicateTransaction() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-409-01"
				icon="copy"
				badgeText="Duplicate • Blocked • Safe"
				title="Duplicate Transaction — Idempotency Guard"
				subtitle="Same amount + recipient + idem key within 5 min — we blocked double pay to protect customer."
				reasonTitle="Why blocked?"
				reasonText="idem_KE_12x9 same KES 12k to John yesterday 14:02 and now 14:04 — duplicate. Original txn txn_abc succeeded."
				boxes={[
					{ label: 'Idem Key', value: 'idem_KE_12x9' },
					{ label: 'Original', value: 'txn_abc • 2 min ago' },
					{ label: 'Amount', value: 'KES 12k' },
					{ label: 'Guard', value: 'No double charge' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Original TXN', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Use New Idem Key', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Duplicate Transaction — Idempotency Guard"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-409-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
