import { ErrorCard } from './ErrorCard';

export function Util40403AirtimeUnreachable() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-404-03"
				icon="phone-x"
				badgeText="Airtime • Network Unreachable • Timeout"
				title="Airtime — Mobile Network Unreachable"
				subtitle="Safaricom M-Pesa vending timeout 12s — airtime vend failed, retry."
				reasonTitle="Heads up — warning before action"
				reasonText="Safaricom airtime vending API timeout 12s, no response. Money not moved, safe to retry."
				boxes={[
					{ label: 'Number', value: '07xx 123 456' },
					{ label: 'Amount', value: 'KES 100 airtime' },
					{ label: 'Provider', value: 'Safaricom' },
					{ label: 'Error', value: 'Timeout 12s' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Pending • Info hold', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry Airtime', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try Different Network', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Airtime — Mobile Network Unreachable"
				modalSubtitle="Warning — before send"
				modalTrace="util-404-03_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
