import { ErrorCard } from './ErrorCard';

export function Tx40401MpesaNotRegistered() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-404-01"
				icon="phone-x"
				badgeText="M-Pesa • Not Registered • 404"
				title="Mobile Money Recipient Not Registered"
				subtitle="Number not on M-Pesa — M-Pesa API says not registered. Can't send airtime yet."
				reasonTitle="Why blocked?"
				reasonText="Safaricom API query 0745… returned NOT_REGISTERED — number not M-Pesa customer. Maybe Airtel?"
				boxes={[
					{ label: 'Number', value: '0745 123 456' },
					{ label: 'Provider', value: 'Safaricom' },
					{ label: 'Response', value: 'NOT_REGISTERED' },
					{ label: 'Alt', value: 'Try Airtel Money?' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Try Airtel Money', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Check Number', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Mobile Money Recipient Not Registered"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-404-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
