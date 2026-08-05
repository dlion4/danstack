import { ErrorCard } from './ErrorCard';

export function Tx42301RtgsCutoff() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-423-01"
				icon="clock-history"
				badgeText="RTGS • Closed • Settles Mon"
				title="Weekend / Cutoff — RTGS Closed"
				subtitle="RTGS closes 3pm Fri, now 16:22 Fri — will settle Mon 9am. Offer PesaLink now for instant."
				reasonTitle="Heads up — warning before send"
				reasonText="RTGS cut-off 15:00 EAT weekdays, closed weekends. Your TXN submitted 16:22 Fri — queued to Mon 9am."
				boxes={[
					{ label: 'Now', value: 'Fri 16:22 EAT' },
					{ label: 'Cutoff', value: '15:00 EAT' },
					{ label: 'Settle', value: 'Mon 9:00 AM' },
					{ label: 'Alt', value: 'PesaLink instant 3.4s' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Switch to PesaLink Now', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Queue for Monday', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Weekend / Cutoff — RTGS Closed"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-423-01_xxx_KE"
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
