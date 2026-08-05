import { ErrorCard } from './ErrorCard';

export function Dev40901DuplicateIdempotency() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-409-01"
				icon="copy"
				badgeText="Dev • Duplicate • Idempotent Safe"
				title="Duplicate Idempotency Key"
				subtitle="idem_KE_2024_9912 same key twice — original succeeded 42s ago, blocked double charge — safe."
				reasonTitle="Why blocked?"
				reasonText="Same idempotency key used twice — original txn txn_882199200xAL succeeded. Second blocked — good, no double charge."
				boxes={[
					{ label: 'Idem Key', value: 'idem_KE_2024_9912' },
					{ label: 'Original TXN', value: 'txn_882199200xAL' },
					{ label: 'When', value: '42s ago' },
					{ label: 'Status', value: 'Blocked duplicate' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Original TXN', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Use New Key', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Duplicate Idempotency Key"
				modalSubtitle="Error — after fail"
				modalTrace="dev-409-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
