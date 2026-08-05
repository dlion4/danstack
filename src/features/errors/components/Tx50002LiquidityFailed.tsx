import { ErrorCard } from './ErrorCard';

export function Tx50002LiquidityFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-500-02"
				icon="water"
				badgeText="Liquidity • Provider Fail • KCB Nostro"
				title="Liquidity Provider Failed to Fund"
				subtitle="KCB Nostro funding call failed — liquidity provider didn't fund. Retry or switch float."
				reasonTitle="Why blocked?"
				reasonText="KCB liquidity API call FundKES 50M returned 500 LIQUIDITY_PROVIDER_TIMEOUT. Nostro not funded, transaction fails but no charge."
				boxes={[
					{ label: 'Provider', value: 'KCB Nostro' },
					{ label: 'Requested', value: 'KES 50M fund' },
					{ label: 'Error', value: '500 • TIMEOUT' },
					{ label: 'Alt', value: 'Use Equity Float' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry Funding', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Switch to Equity Float', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Liquidity Provider Failed to Fund"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-500-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
