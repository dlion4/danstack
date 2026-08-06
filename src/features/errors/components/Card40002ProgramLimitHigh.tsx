import { ErrorCard } from './ErrorCard';

export function Card40002ProgramLimitHigh() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-400-02"
				icon="exclamation-diamond"
				logoText="DanStack • Card • AMBER"
				badgeText="Cards • Program Limit • Too High"
				title="Card Program Limit — Single Card Limit Too High"
				subtitle="Trying to set $50k but max $10k per program policy — reduce limit before create."
				reasonTitle="Heads up — warning before action"
				reasonText="Program limit single card max $10k, you tried $50k. Policy to limit fraud. Need program admin to increase."
				boxes={[
					{ label: 'Attempted', value: '$50,000' },
					{ label: 'Program Max', value: '$10,000' },
					{ label: 'Program', value: 'Prog_001' },
					{ label: 'Action', value: 'Reduce or request increase' },
				]}
				permissionBox={{
					checkbox: true,
					text: 'I confirm — details correct, want to proceed',
					subtext: 'No funds moved until Confirm. Cancel safe.',
				}}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'safe' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Set to $10k Max', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Request Limit Increase', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Program Limit — Single Card Limit Too High"
				modalSubtitle="Warning — before send"
				modalTrace="card-400-02_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
