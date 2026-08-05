import { ErrorCard } from './ErrorCard';

export function Tx40003BankOffline() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-400-03"
				icon="wifi-off"
				badgeText="Transfer • Rail Down • Retry M-Pesa"
				title="Receiver Bank Offline — Rail Down"
				subtitle="PesaLink rail for Equity offline 18 min — maintenance. Your funds safe, choose M-Pesa rail."
				reasonTitle="Heads up — warning before send"
				reasonText="Equity Bank PesaLink gateway returned 503 BANK_RAIL_MAINTENANCE, ETR 25 min. Money not moved."
				boxes={[
					{ label: 'Bank', value: 'Equity Bank Kenya' },
					{ label: 'Rail', value: 'PesaLink — 503' },
					{ label: 'ETR', value: '~25 min' },
					{ label: 'Alt Rail', value: 'M-Pesa STK — 2.1s live' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Pending • Polling', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Switch to M-Pesa Rail', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Retry PesaLink', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Receiver Bank Offline — Rail Down"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-400-03_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
