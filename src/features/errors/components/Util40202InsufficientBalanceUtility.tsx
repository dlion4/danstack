import { ErrorCard } from './ErrorCard';

export function Util40202InsufficientBalanceUtility() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-402-02"
				icon="wallet2"
				badgeText="Utility • Insufficient Float • Critical"
				title="Insufficient Balance for Utility Payment"
				subtitle="Float KES 5k need KES 10k for electricity + internet — insufficient. Top up before utility pay."
				reasonTitle="Why blocked?"
				reasonText="KES float 5k, utility basket 10k (KPLC 1k + Zuku 3k + Airtime 6k) — shortfall 5k. Need top-up."
				boxes={[
					{ label: 'Float', value: 'KES 5,000' },
					{ label: 'Needed', value: 'KES 10,000' },
					{ label: 'Shortfall', value: 'KES 5,000' },
					{ label: 'Bills', value: 'KPLC 1k + Zuku 3k + Airtime 6k' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Top Up Float', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Remove Some Bills', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Insufficient Balance for Utility Payment"
				modalSubtitle="Error — after fail"
				modalTrace="util-402-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
