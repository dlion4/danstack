import { ErrorCard } from './ErrorCard';

export function Tx50001SettlementDelayed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #F0F9FF, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-500-01"
				icon="hourglass-split"
				badgeText="Settlement • Delayed • Pending >60s"
				title="Settlement Delayed — PSP Acknowledged Late"
				subtitle="PSP acknowledged late — TXN pending >60s in PENDING. Live polling status."
				reasonTitle="What happens next?"
				reasonText="KCB PSP took 68s vs expected 4s. TXN in PENDING — might settle or timeout. We're polling every 3s."
				boxes={[
					{ label: 'TXN ID', value: 'txn_8841_KE' },
					{ label: 'Pending', value: '68s — expected 4s' },
					{ label: 'PSP', value: 'KCB — slow ACK' },
					{ label: 'Polling', value: 'Every 3s' },
				]}
				statusBadges={[
					{ text: 'Vault safe • Queued', icon: 'shield-check', variant: 'safe' },
					{ text: 'Pending • Polling', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Keep Polling Status', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View PSP Logs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Settlement Delayed — PSP Acknowledged Late"
				modalSubtitle="Info Hold • Waiting / Polling"
				modalTrace="tx-500-01_xxx_KE"
				theme="blue"
			/>
		</div>
	);
}
