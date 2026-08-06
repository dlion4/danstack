import { ErrorCard } from './ErrorCard';

export function Card40901AlreadyExistsEmployee() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-409-01"
				icon="people"
				logoText="DanStack • Card • RED"
				badgeText="Corporate Cards • Duplicate • Employee"
				title="Card Already Exists for Employee"
				subtitle="Corporate card duplicate for same staff email jane@ — already has active card."
				reasonTitle="Why blocked?"
				reasonText="Employee jane@company.co already has active corporate card •••• 4242 issued 2026-07-01. One card per employee policy."
				boxes={[
					{ label: 'Employee', value: 'jane@company.co' },
					{ label: 'Existing Card', value: '•••• 4242' },
					{ label: 'Issued', value: '2026-07-01' },
					{ label: 'Policy', value: '1 per employee' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Existing Card', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Revoke & Reissue', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card Already Exists for Employee"
				modalSubtitle="Error — after fail"
				modalTrace="card-409-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
