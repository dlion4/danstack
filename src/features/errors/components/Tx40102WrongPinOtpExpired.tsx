import { ErrorCard } from './ErrorCard';

export function Tx40102WrongPinOtpExpired() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-401-02"
				icon="shield-exclamation"
				badgeText="Auth • OTP Expired • Retry"
				title="Wrong PIN / 2FA Failed / OTP Expired"
				subtitle="OTP expired 2 min after send — or wrong PIN. Resend OTP before confirm. Warning before final fail."
				reasonTitle="Heads up — warning before send"
				reasonText="OTP sent 11:42, expired 11:44. You entered 11:45 — 1 min over. Or 2FA code 6 digits wrong."
				boxes={[
					{ label: 'OTP Sent', value: '11:42:10' },
					{ label: 'Expired', value: '11:44:10 • 2 min window' },
					{ label: 'Entered', value: '11:45 — late' },
					{ label: 'Attempts Left', value: '2/3' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Resend OTP', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try 2FA Code', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Wrong PIN / 2FA Failed / OTP Expired"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-401-02_xxx_KE"
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
