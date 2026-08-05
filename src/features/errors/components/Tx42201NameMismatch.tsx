import { ErrorCard } from './ErrorCard';

export function Tx42201NameMismatch() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-422-01"
				icon="person-bounding-box"
				badgeText="Transfer • Name Mismatch • 78% Match"
				title="Recipient Name Mismatch"
				subtitle="Account name JOHN DOE LTD vs provided J DOE LTD — 78% match. Confirm override before send — permission modal."
				reasonTitle="Heads up — warning before send"
				reasonText="Penny drop name check returned JOHN DOE LIMITED vs input J DOE LTD — 78% similarity. Requires confirmation to avoid mis-pay."
				boxes={[
					{ label: 'Provided', value: 'J DOE LTD' },
					{ label: 'Bank Returned', value: 'JOHN DOE LIMITED' },
					{ label: 'Match', value: '78%' },
					{ label: 'Action', value: 'Confirm to override' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: "Confirm — It's Correct", icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Edit Name', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Recipient Name Mismatch"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-422-01_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — recipient & amount correct, I want to proceed',
					subtext: 'No funds moved until Confirm. Reversible 30 min. You can cancel now.',
				}}
			/>
		</div>
	);
}
