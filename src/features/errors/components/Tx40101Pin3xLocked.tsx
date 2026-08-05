import { ErrorCard } from './ErrorCard';

export function Tx40101Pin3xLocked() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-401-01"
				icon="keyboard"
				badgeText="Security • PIN 3x • Locked 15 min"
				title="Multiple PIN Entered — Wrong PIN 3x Locked"
				subtitle="You entered wrong PIN 3 times — account locked 15 min per security. Most requested error."
				reasonTitle="Why blocked?"
				reasonText="PIN attempts: 0000, 1111, 1234 — all wrong. Auto-lock 15 min prevents brute force. Use OTP to unlock early."
				boxes={[
					{ label: 'Attempts', value: '3/3 failed' },
					{ label: 'Locked Until', value: '15:42 EAT • 12 min left' },
					{ label: 'Last Attempt', value: '1234' },
					{ label: 'Unlock', value: 'OTP or wait' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Unlock via OTP', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Reset PIN', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Multiple PIN Entered — Wrong PIN 3x Locked"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-401-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
