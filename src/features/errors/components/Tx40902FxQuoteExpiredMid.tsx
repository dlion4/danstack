import { ErrorCard } from './ErrorCard';

export function Tx40902FxQuoteExpiredMid() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-409-02"
				icon="currency-exchange"
				badgeText="FX • Quote Expired Mid-TX • Re-quote"
				title="FX Quote Expired Mid-Transfer"
				subtitle="Quote USD→KES 129.45 expired after PIN entry — rate moved during 42s confirmation. Need re-quote."
				reasonTitle="Heads up — warning before send"
				reasonText="Quote valid 30s, you confirmed in 42s — 12s over. Rate now 129.62. Need accept new rate."
				boxes={[
					{ label: 'Quoted', value: '129.45 • 30s' },
					{ label: 'Confirmed', value: '42s — 12s over' },
					{ label: 'New Rate', value: '129.62' },
					{ label: 'Diff', value: '+0.17' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Pending • Polling', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Accept New Rate 129.62', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Cancel TXN', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="FX Quote Expired Mid-Transfer"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-409-02_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
