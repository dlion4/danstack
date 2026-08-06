import { ErrorCard } from './ErrorCard';

export function Card40305ProgramInactive() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="CARD-403-05"
				icon="pause-circle"
				logoText="DanStack • Card • RED"
				badgeText="BAAS • Program Inactive • Config"
				title="BAAS Card Program Inactive / Suspended"
				subtitle="Your card program not active — suspended for compliance review. Cannot issue cards."
				reasonTitle="Why blocked?"
				reasonText="Card program Prog_001 status = Suspended, reason: Compliance review — missing cardholder agreement. Contact admin."
				boxes={[
					{ label: 'Program', value: 'Prog_001 • DanStack Cards' },
					{ label: 'Status', value: 'Suspended' },
					{ label: 'Since', value: '2026-08-01' },
					{ label: 'Reason', value: 'Missing cardholder agreement' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Upload Cardholder Agreement', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Contact Admin', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="BAAS Card Program Inactive / Suspended"
				modalSubtitle="Error — after fail"
				modalTrace="card-403-05_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
