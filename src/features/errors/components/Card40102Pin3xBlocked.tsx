import { ErrorCard } from './ErrorCard';

export function Card40102Pin3xBlocked() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-401-02"
				icon="keypad"
				logoText="DanStack • Card • RED"
				badgeText="Cards • PIN 3x • Blocked"
				title="Physical Card PIN Attempts Exceeded — Blocked"
				subtitle="ATM PIN 3x wrong — card blocked needs reset via app. Physical card locked."
				reasonTitle="Why blocked?"
				reasonText="ATM PIN attempts 0000, 1111, 0000 — all wrong at NCBA ATM Ruiru. Card blocked per Visa rules, needs app unblock."
				boxes={[
					{ label: 'Card', value: '•••• 4242 • Physical' },
					{ label: 'ATM', value: 'NCBA Ruiru' },
					{ label: 'Attempts', value: '3/3 failed' },
					{ label: 'Unblock', value: 'Via app + OTP' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Unblock Card via OTP', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Reset PIN', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Physical Card PIN Attempts Exceeded — Blocked"
				modalSubtitle="Error — after fail"
				modalTrace="card-401-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
