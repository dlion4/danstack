import { ErrorCard } from './ErrorCard';

export function Tx40801MpesaStkTimeout() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-408-01"
				icon="phone-vibrate"
				badgeText="M-Pesa • STK Timeout • User Action"
				title="M-Pesa STK Push Timeout / Cancelled"
				subtitle="User didn't enter M-Pesa PIN in 30s or pressed cancel — STK expired. Retry push."
				reasonTitle="Heads up — warning before send"
				reasonText="STK push to 07xx 123 456 sent, user didn't enter PIN within 30s timeout, or pressed Cancel on phone. Money not moved."
				boxes={[
					{ label: 'Phone', value: '07xx 123 456' },
					{ label: 'STK Sent', value: '11:44:12' },
					{ label: 'Timeout', value: '30s — expired 11:44:42' },
					{ label: 'User Action', value: 'No PIN / Cancel' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Pending • Polling', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry STK Push', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Switch to Bank Transfer', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="M-Pesa STK Push Timeout / Cancelled"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-408-01_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
