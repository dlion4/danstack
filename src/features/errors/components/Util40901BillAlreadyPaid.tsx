import { ErrorCard } from './ErrorCard';

export function Util40901BillAlreadyPaid() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-409-01"
				icon="check2-all"
				badgeText="Utility • Duplicate • Already Paid"
				title="Bill Already Paid / Duplicate Token Request"
				subtitle="Same meter + amount KES 1k within 1 hour — duplicate token request blocked."
				reasonTitle="Heads up — warning before action"
				reasonText="Meter 12345678 already received KES 1k token 22 min ago — duplicate within 1h window blocked to avoid double vend."
				boxes={[
					{ label: 'Meter', value: '12345678' },
					{ label: 'Amount', value: 'KES 1,000' },
					{ label: 'Last Token', value: '22 min ago' },
					{ label: 'Window', value: '1h duplicate block' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Pending • Info hold', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Last Token', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Force Re-vend Anyway', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Bill Already Paid / Duplicate Token Request"
				modalSubtitle="Warning — before send"
				modalTrace="util-409-01_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
