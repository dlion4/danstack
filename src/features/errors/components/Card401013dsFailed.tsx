import { ErrorCard } from './ErrorCard';

export function Card401013dsFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-401-01"
				icon="shield-check"
				logoText="DanStack • Card • RED"
				badgeText="Cards • 3DS Failed • OTP 3x"
				title="Card 3D Secure Failed / OTP Wrong"
				subtitle="3D Secure 2.0 OTP 3x wrong — authentication failed after 2s wait, transaction declined."
				reasonTitle="Why blocked?"
				reasonText="3DS OTP sent 11:42, you entered 000000, 111111, 123456 — all wrong. Locked 3DS for 15 min."
				boxes={[
					{ label: '3DS Method', value: 'OTP SMS' },
					{ label: 'Attempts', value: '3/3 failed' },
					{ label: 'Locked Until', value: '15:42' },
					{ label: 'Amount', value: 'KES 12k — not charged' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Retry 3DS', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Use Different Card', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Card 3D Secure Failed / OTP Wrong"
				modalSubtitle="Error — after fail"
				modalTrace="card-401-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
