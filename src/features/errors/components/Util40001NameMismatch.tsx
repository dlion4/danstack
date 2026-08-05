import { ErrorCard } from './ErrorCard';

export function Util40001NameMismatch() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-400-01"
				icon="person-bounding-box"
				badgeText="Utility • Name Mismatch • 70% Match"
				title="Wrong Customer Name vs Meter"
				subtitle="Customer name vs meter name mismatch — confirm before vend. Warning gate."
				reasonTitle="Heads up — warning before action"
				reasonText="Meter registered JOHN KAMAU vs input J KAMAU — 70% match. Confirm to avoid paying wrong meter."
				boxes={[
					{ label: 'Input', value: 'J KAMAU' },
					{ label: 'Registered', value: 'JOHN KAMAU' },
					{ label: 'Match', value: '70%' },
					{ label: 'Meter', value: '12345678' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Confirm — Correct Meter', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Edit Name', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Wrong Customer Name vs Meter"
				modalSubtitle="Warning — before send"
				modalTrace="util-400-01_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — details correct, want to proceed',
					subtext: 'No funds moved until Confirm. Cancel safe.',
				}}
			/>
		</div>
	);
}
