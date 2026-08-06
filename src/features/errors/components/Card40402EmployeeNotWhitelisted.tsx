import { ErrorCard } from './ErrorCard';

export function Card40402EmployeeNotWhitelisted() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-404-02"
				icon="person-dash"
				logoText="DanStack • Card • AMBER"
				badgeText="Corporate • Not Whitelisted • Policy"
				title="Employee Not Whitelisted for Corporate Card"
				subtitle="Not in allowed list for corporate card — HR policy restricts. Whitelist before issuance."
				reasonTitle="Heads up — warning before action"
				reasonText="Employee mark@ belongs to Contractors group not whitelisted for corporate cards — only Full-time allowed per policy."
				boxes={[
					{ label: 'Employee', value: 'mark@contractor.co' },
					{ label: 'Group', value: 'Contractors' },
					{ label: 'Allowed Groups', value: 'Full-time only' },
					{ label: 'Policy', value: 'HR — Corporate Cards' },
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
					{ label: 'Whitelist Employee', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Change Policy', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Employee Not Whitelisted for Corporate Card"
				modalSubtitle="Warning — before send"
				modalTrace="card-404-02_xxx_KE"
				theme="amber"
			/>
		</div>
	);
}
