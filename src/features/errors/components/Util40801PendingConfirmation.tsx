import { ErrorCard } from './ErrorCard';

export function Util40801PendingConfirmation() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #F0F9FF, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-408-01"
				icon="hourglass-split"
				badgeText="Utility • Pending • Polling"
				title="Utility Payment Pending — Awaiting Confirmation"
				subtitle="Token pending 30s polling — KPLC hasn't confirmed token yet. Live polling status."
				reasonTitle="What happens next?"
				reasonText="KPLC token vending pending — sent 30s ago, KPLC hasn't returned token yet. Polling every 3s, usually 10s."
				boxes={[
					{ label: 'Meter', value: '12345678' },
					{ label: 'Sent', value: '30s ago' },
					{ label: 'Status', value: 'Pending — KPLC' },
					{ label: 'Polling', value: 'Every 3s' },
				]}
				statusBadges={[
					{ text: 'Vault safe • Queued', icon: 'shield-check', variant: 'safe' },
					{ text: 'Pending • Info hold', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Keep Polling', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Cancel & Refund', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Utility Payment Pending — Awaiting Confirmation"
				modalSubtitle="Info Hold • Waiting"
				modalTrace="util-408-01_xxx_KE"
				theme="blue"
			/>
		</div>
	);
}
